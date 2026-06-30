import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../RenderModuleData/RuntimeModuleData/NativeMemory";
import { LayaXChunkPages } from "./LayaXChunkPages";

/**
 * LayaX Transform3D —— chunk 共享存储上的三端同源方案（world 计算回 JS）。
 *
 * 存储模型（stable_row_chunk_design.md）：local TRS 唯一源 = ECS chunk 的
 * Transform 组件；WorldMat 组件由 Rust propagate 独家产出。本类是基类纯 TS
 * `Transform3D` 之上的薄壳：
 *   - JS 写 local：经本 slot 零拷贝视图**直写 chunk + 标 slot 脏位**，
 *     0 跨语言调用；视图不可用（native 页 + 沙箱/OHOS）则降级
 *     「写共享 scratch + 一发 C++ setter 推 chunk」。
 *   - world 读写 / 懒求值完全复用基类纯 TS（与 WebGL 同一套算法），数据源是
 *     基类 `_localPosition/_localRotation/_localScale` 字段——由本类 local
 *     setter 在写 chunk 的同时一并维护。**JS↔C++ 读写 world 0 跨边界。**
 *   - 读 world 消除双算：flag 干净且 slot 脏位已被消费时直读 chunk WorldMat
 *     （容忍 1 帧），否则回落基类自算（见 worldMatrix getter）。
 *
 * 视图绑定（_bindViews，按 slot 粒度，不映射整列）：
 *   - 路径①（全平台，含沙箱）：chunk 住在 JS 供页（LayaXChunkPages）内 →
 *     用 (pageId, offset) 在自家页 buffer 上建普通 TypedArray；
 *   - 路径②（native 页回退）：external ArrayBuffer（仅非沙箱可用）；
 *   - 路径③：两者都不可用 → 不绑定，写 local 走 C++ 推。
 *   失效协议：只有 VIEW_STALE 表示本实体 row moved，需要重绑；普通 epoch 变化只刷新快照。
 *
 * ⚠ 构造时序铁律（见 memory project_layax_transform_init_order）：基类 ctor 在 `super()`
 * 期间调 `this._initProperty()`，子类字段初始化器在 `super()` 返回后才执行、会覆盖 `_initProperty`
 * 里赋的值。故①不重声明 `_localPosition` 等基类字段；②在 `_initProperty` 赋值的子类字段
 * （`_nativeFloat32Buffer`/`_nativeObj`）不能带 `= 初值`。
 *
 * Native class: `conchLayaXTransform`.
 */
export class LayaXTransform3D extends Transform3D {

    // ---- 共享内存布局（降级写 + 构造期 C++ 同步用；与 JSRTTransform 一致）----
    static TRANSFORM_LOCALQUATERNION_DATAOFFSET: number = 0;
    static TRANSFORM_LOCALEULER_DATAOFFSET: number = 4;
    static TRANSFORM_LOCALPOS_DATAOFFSET: number = 7;
    static TRANSFORM_LOCALSCALE_DATAOFFSET: number = 10;
    static TRANSFORM_LOCALMATRIX_DATAOFFSET: number = 13;
    static TRANSFORM_WORLDQUATERNION_DATAOFFSET: number = 29;
    static TRANSFORM_WORLDEULER_DATAOFFSET: number = 33;
    static TRANSFORM_WORLDPOS_DATAOFFSET: number = 36;
    static TRANSFORM_WORLDSCALE_DATAOFFSET: number = 39;
    static TRANSFORM_WORLDMATRIX_DATAOFFSET: number = 42;
    static TRANSFORM_CHANGEFLAG_DATAOFFSET: number = 58;
    static TRANSFORM_RT_SYNC_FLAG_DATAOFFSET: number = 59;
    static TRANSFORM_SHARE_MEMORY_SIZE: number = 60;

    // ---- flag 独立共享内存（不进 chunk）：[0]=ChangeFlag 脏标记，[1]=SyncFlag（native 改 chunk 后按分量置位）----
    static FLAG_CHANGE_IDX: number = 0;
    static FLAG_SYNC_IDX: number = 1;
    static FLAG_MEMORY_SIZE: number = 2;

    // SyncFlag 按分量置位（与 C++ _syncLocalToBackend(component) 的 component 对齐：0=pos,1=rot,2=scale）。
    // C++ 用 `|= (1<<component)` 标位，JS 读时只拉「被需要 ∩ 仍待拉」的分量、拉一个清一个 bit。
    static SYNC_POS: number = 1 << 0;
    static SYNC_ROT: number = 1 << 1;
    static SYNC_SCALE: number = 1 << 2;
    static SYNC_ALL: number = (1 << 0) | (1 << 1) | (1 << 2);
    /** chunk 行搬家（swap-remove）后 native 置位：本实体所有零拷贝视图已失效，须重绑（§8.2） */
    static VIEW_STALE: number = 0x80000000;
    /** 全局结构 epoch 的共享视图（4 字节，所有 wrapper 共用一份；首次绑定视图时取） */
    private static _epochView: Uint32Array = null;

    /** 进程级一次性探测：external ArrayBuffer 可用 = true；沙箱/OHOS = false。 */
    private static _zeroCopyProbed: boolean = false;
    private static _hasZeroCopy: boolean = false;

    /**
     * @internal 进程级共享 marshalling scratch（降级路径用）。
     * 这块共享内存只作「JS 写一发 → C++ 同步读一发」的瞬时中转，不持任何跨调用的
     * per-transform 状态（local 唯一源在 chunk、world/flag 全在 JS），故全进程一份即可——
     * 省掉每 transform 240B；视图绑定后根本不碰它。
     */
    private static _sharedNativeMemory: NativeMemory = null;
    /**
     * @internal 指向共享 scratch 的 float32 视图（仅未绑定视图的降级写 local 用）。
     * ⚠ 不能带 `= null` 初始化器：本字段在 `_initProperty`（基类构造期间调用）里赋值，
     * 子类字段初始化器在 `super()` 返回后才执行，会把构造期赋的值覆盖回 null，
     * 导致后续 fallback 写 `f[7]` 崩 "Cannot set property of null"。
     */
    private _nativeFloat32Buffer: Float32Array;

    /**
     * @internal flag 独立共享内存（不进 chunk），C++/JS 共维护。⚠ 不能带初值（_initProperty 里赋值）。
     */
    private _flagMemory: NativeMemory;
    private _flagU32: Uint32Array;

    /** @internal */
    _nativeObj: any;

    /**@internal RTAnimatorFactory._notifyJsTransformChanged 的帧去重标记，整数比对替代 Set 去重 */
    _notifyFrame: number = 0;

    // ---- 本 slot 零拷贝视图（createEntity 后由 _bindViews 填充）----
    /** @internal 是否已绑定 chunk 零拷贝视图（路径①/②任一成功） */
    private _viewsBound: boolean = false;
    /** @internal 视图解析时的结构 epoch；与全局 epoch 失配=行可能已搬家，写前必须重绑（§6.3） */
    private _boundEpoch: number = -1;
    /** @internal 本 slot 的列视图（定长：pos=3 / rot=4 / scale=3），直接写下标 0.. */
    private _posView: Float32Array = null;
    private _rotView: Float32Array = null;
    private _scaleView: Float32Array = null;
    /** @internal 本 slot 的 WorldMat 视图（16，只读——propagate 是组件唯一写者） */
    private _worldView: Float32Array = null;
    /** @internal 本 slot 所属脏位半字视图（与同字 31 个邻居共享），只 |= 自己那 bit */
    private _dirtyWordView: Uint32Array = null;
    /** @internal 本 slot 在脏字内的位掩码 = 1 << (slot & 31) */
    private _dirtyMask: number = 0;

    constructor(owner: Sprite3D) {
        super(owner);
    }

    protected _initProperty(): void {
        // 全进程共享一块 scratch（见字段注释）。所有 transform 的 C++ 对象都拿它当 m_float32Array：
        // 降级写是「写一发→C++ 同步读一发」的瞬时操作，单 JS 线程下不会跨 transform 串味。
        let mem = LayaXTransform3D._sharedNativeMemory;
        if (!mem)
            mem = LayaXTransform3D._sharedNativeMemory =
                new NativeMemory(LayaXTransform3D.TRANSFORM_SHARE_MEMORY_SIZE * 4, false);
        this._nativeFloat32Buffer = mem.float32Array;
        this._nativeObj = new (window as any).conchLayaXTransform(mem._buffer);
        // flag 独立共享内存：须在任何 _setTransformFlag 之前建好，并交给 C++（缺接口则仅 JS 自用）。
        this._flagMemory = new NativeMemory(LayaXTransform3D.FLAG_MEMORY_SIZE * 4, false);
        this._flagU32 = this._flagMemory.Uint32Array;
        if (this._nativeObj.bindChangeFlagBuffer) this._nativeObj.bindChangeFlagBuffer(this._flagMemory._buffer);
        // flag 初值（与基类一致：local 干净、world 脏）。
        this._setTransformFlag(
            Transform3D.TRANSFORM_LOCALQUATERNION | Transform3D.TRANSFORM_LOCALEULER | Transform3D.TRANSFORM_LOCALMATRIX,
            false
        );
        this._setTransformFlag(
            Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION |
            Transform3D.TRANSFORM_WORLDEULER | Transform3D.TRANSFORM_WORLDSCALE | Transform3D.TRANSFORM_WORLDMATRIX,
            true
        );
        // 把构造期默认 local（pos=0/rot=identity/scale=1）推给 C++ m_localXxx，供 createEntity
        // 时 push 进 chunk。此刻未绑定视图，setter 走降级分支（写共享内存 + C++）。
        this.localPosition = this._localPosition;
        this.localRotation = this._localRotation;
        this.localScale = this._localScale;
    }

    /**
     * @internal
     * EventDispatcher 钩子：基类已实现（记录 TRANSFORM_CHANGED 监听者）。这里仅保留以兼容旧引用。
     */
    protected onStartListeningToType(type: string): void {
        super.onStartListeningToType(type);
        if (type === Event.TRANSFORM_CHANGED) this._hasTransformChangedListener = true;
    }

    // ------------------------------------------------------------------
    // ECS Entity / 视图绑定
    // ------------------------------------------------------------------

    /**
     * 在 Rust ECS 创建 entity（chunk 行随 spawn 分配），随后绑定本 slot 的零拷贝视图。
     * 创建前补足 JS 供页储备（§7.1）。
     */
    createEntity(): void {
        LayaXChunkPages.ensureForEntityCreate(this._nativeObj);
        this._nativeObj.createEntity();
        this._bindViews();
    }

    /**
     * 递归销毁子 entity 后销毁自身，并丢弃本 slot 视图（行被 swap-remove 回收，旧视图禁止再写）。
     */
    destroyEntity(): void {
        this._nativeObj.destroyEntity();
        this._dropViews();
        // world 矩阵脱离 chunk：换回独立堆并标脏，待下次入场景重算。
        this._worldMatrix.elements = new Float32Array(16);
        this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, true);
    }

    /** @internal 丢弃全部 slot 视图（销毁 / 失效重绑前） */
    private _dropViews(): void {
        this._viewsBound = false;
        this._posView = this._rotView = this._scaleView = this._worldView = null;
        this._dirtyWordView = null;
    }

    /**
     * 绑定本实例到「自己 slot」的零拷贝视图——只取自己那几个 float，不映射整列。
     * 路径①（页内普通 TypedArray）→ 路径②（external AB 回退）→ 不绑定（C++ 推）。
     */
    private _bindViews(): void {
        const idx: number = this._nativeObj.getSlotIndex();
        if (idx === 0xFFFFFFFF) return; // entity 未创建
        if (this._bindPageViews(idx)) return;
        this._bindExternalViews(idx);
    }

    /**
     * 路径①（全平台，含 V8 沙箱/OHOS——必须在 external-AB 探测之前）：chunk 在
     * JS 供页内 → 用 (pageId, offset) 在自家页 buffer 上建普通 TypedArray，
     * 零 external-ArrayBuffer API（§7.1/§8.1）。
     * Transform 布局（repr(C)）：pos f32×3 @+0 / rot f32×4 @+12 / scale f32×3 @+28。
     */
    private _bindPageViews(idx: number): boolean {
        const tLoc: number = this._nativeObj.getChunkViewLoc(0);
        const wLoc: number = this._nativeObj.getChunkViewLoc(2);
        if (tLoc < 0 || wLoc < 0) return false; // native 页 / 不可定位
        const tPid = Math.floor(tLoc / 0x100000000), tOff = tLoc - tPid * 0x100000000;
        const wPid = Math.floor(wLoc / 0x100000000), wOff = wLoc - wPid * 0x100000000;
        const tBuf = LayaXChunkPages.page(tPid);
        const wBuf = LayaXChunkPages.page(wPid);
        if (!tBuf || !wBuf) return false;
        this._posView = new Float32Array(tBuf, tOff, 3);
        this._rotView = new Float32Array(tBuf, tOff + 12, 4);
        this._scaleView = new Float32Array(tBuf, tOff + 28, 3);
        this._dirtyWordView = new Uint32Array(wBuf, wOff, 1);
        // WorldMat 只读视图（propagate 产物，容忍 1 帧；禁写——见 worldMatrix getter）
        const mLoc: number = this._nativeObj.getChunkViewLoc(1);
        if (mLoc >= 0) {
            const mPid = Math.floor(mLoc / 0x100000000), mOff = mLoc - mPid * 0x100000000;
            const mBuf = LayaXChunkPages.page(mPid);
            if (mBuf) this._worldView = new Float32Array(mBuf, mOff, 16);
        }
        this._dirtyMask = (1 << (idx & 31)) >>> 0;
        this._viewsBound = true;
        this._bindEpoch();
        return true;
    }

    /**
     * 路径②（回退：native fallback 页 / 异常）：external ArrayBuffer——仅非沙箱可用；
     * 探测失败保持未绑定，写 local 走 C++ 推（路径③）。
     */
    private _bindExternalViews(idx: number): void {
        if (!LayaXTransform3D._zeroCopyProbed) {
            const probe: ArrayBuffer = this._nativeObj.getOwnLocalPos();
            LayaXTransform3D._hasZeroCopy = !!probe && probe.byteLength > 0; // 沙箱/OHOS: 空 buffer → false
            LayaXTransform3D._zeroCopyProbed = true;
        }
        if (!LayaXTransform3D._hasZeroCopy) return;
        // 每个视图只覆盖本 slot：pos[3] / rot[4] / scale[3] / dirtyWord[1]
        this._posView = new Float32Array(this._nativeObj.getOwnLocalPos());
        this._rotView = new Float32Array(this._nativeObj.getOwnLocalRot());
        this._scaleView = new Float32Array(this._nativeObj.getOwnLocalScale());
        this._dirtyWordView = new Uint32Array(this._nativeObj.getOwnDirtyWord());
        this._dirtyMask = (1 << (idx & 31)) >>> 0; // slot 在脏字内的位 = 低 5 位
        this._viewsBound = true;
        this._bindEpoch();
        // WorldMat 只读视图（禁写禁换绑 elements——TS 写穿组件会让 propagate
        // 误判"值未变"漏标脏，断 Changed<WorldMat> 链）
        const wbuf: ArrayBuffer = this._nativeObj.getOwnWorldMat();
        if (wbuf && wbuf.byteLength > 0) {
            this._worldView = new Float32Array(wbuf);
        }
        // C++ createEntity 已把 m_localXxx push 进 chunk；JS 字段与之同源（构造期同步），无需重复写。
    }

    /** @internal 记录解析时的结构 epoch；写前与全局值比对，失配即重绑（行可能已搬家） */
    private _bindEpoch(): void {
        if (!LayaXTransform3D._epochView) {
            const eb: ArrayBuffer = this._nativeObj.getEpochView();
            if (eb && eb.byteLength >= 4) LayaXTransform3D._epochView = new Uint32Array(eb);
        }
        this._boundEpoch = LayaXTransform3D._epochView ? LayaXTransform3D._epochView[0] : -1;
    }

    /** @internal */
    activeInScene(): void {
        this.createEntity();
    }

    /** @internal */
    inActiveInScene(): void {
        this.destroyEntity();
    }

    /**
     * Rust ECS entity 是否已创建且存活。
     */
    get isEntityValid(): boolean {
        return this._nativeObj.isEntityValid();
    }

    /**
     * @internal
     * RTAnimatorFactory 派发 TRANSFORM_CHANGED 时读取的脏标志（flag 在共享 flag 内存里）。
     */
    get _RTtransformFlag(): number {
        return this._getTransformChangeFlag();
    }

    // flag 改读写独立共享内存（C++/JS 共维护一份），取代基类 JS 私有 _transformFlag。
    protected _setTransformFlag(type: number, value: boolean): void {
        let flag = this._flagU32[LayaXTransform3D.FLAG_CHANGE_IDX];
        if (value) flag |= type; else flag &= ~type;
        this._flagU32[LayaXTransform3D.FLAG_CHANGE_IDX] = flag;
    }

    protected _getTransformFlag(type: number): boolean {
        return (this._flagU32[LayaXTransform3D.FLAG_CHANGE_IDX] & type) != 0;
    }

    protected _getTransformChangeFlag(): number {
        return this._flagU32[LayaXTransform3D.FLAG_CHANGE_IDX];
    }

    // 按分量从 chunk/native 拉回单个 local 分量到 JS 镜像。降级路径（!_viewsBound）下每个分量
    // 各一次 FFI getLocalXxx；零拷贝路径只读本 slot 视图。善后由 _syncLocal 统一处理（rot 的
    // euler/quat 善后例外，放在 _pullRot 内，因为只在拉 rot 时才成立）。
    private _pullPos(): void {
        if (this._viewsBound) {
            this._localPosition.setValue(this._posView[0], this._posView[1], this._posView[2]);
        } else {
            this._nativeObj.getLocalPosition();
            let i = LayaXTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET;
            this._localPosition.setValue(
                this._nativeFloat32Buffer[i], this._nativeFloat32Buffer[i + 1], this._nativeFloat32Buffer[i + 2]);
        }
    }

    private _pullRot(): void {
        if (this._viewsBound) {
            this._localRotation.setValue(this._rotView[0], this._rotView[1], this._rotView[2], this._rotView[3]);
        } else {
            this._nativeObj.getLocalRotation();
            let i = LayaXTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET;
            this._localRotation.setValue(
                this._nativeFloat32Buffer[i], this._nativeFloat32Buffer[i + 1],
                this._nativeFloat32Buffer[i + 2], this._nativeFloat32Buffer[i + 3]);
        }
        // 拉回的 quat 是 source：euler 待重算、quat 不脏。仅在拉 rot 时做此善后（拉 pos/scale 不得碰旋转标志）。
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, true);
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
    }

    private _pullScale(): void {
        if (this._viewsBound) {
            this._localScale.setValue(this._scaleView[0], this._scaleView[1], this._scaleView[2]);
        } else {
            this._nativeObj.getLocalScale();
            let i = LayaXTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET;
            this._localScale.setValue(
                this._nativeFloat32Buffer[i], this._nativeFloat32Buffer[i + 1], this._nativeFloat32Buffer[i + 2]);
        }
    }

    /** @internal Rebind only when this entity's row moved. */
    private _checkViewStale(): void {
        const ev = LayaXTransform3D._epochView;
        const staleBit = this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] & LayaXTransform3D.VIEW_STALE;
        const epochChanged = !!ev && ev[0] !== (this._boundEpoch >>> 0);
        if (staleBit === 0) {
            // Other structure changes do not invalidate this slot view.
            if (epochChanged) this._boundEpoch = ev[0];
            return;
        }
        this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] &= ~LayaXTransform3D.VIEW_STALE;
        this._dropViews();
        this._bindViews(); // re-resolve views at the new row
    }

    /**
     * 读 world 消除双算：flag 干净 → 直读 chunk WorldMat（Rust propagate 的产物，
     * 容忍 1 帧），免去 JS 沿父链的矩阵乘；本帧写过 local（flag 脏）→ 回落基类
     * 自算，结果只落 JS 堆（propagate 仍是组件唯一写者）。
     */
    get worldMatrix(): Matrix4x4 {
        this._checkViewStale();
        // 直读 chunk 的前提（两个都要）：
        // ① WORLDMATRIX flag 干净——但 set worldMatrix 也会清它（堆值即新值），
        //    所以单独不充分；
        // ② 自家 slot 脏位已被清——位图由 tick 末清零，"位干净"=上次 local 写
        //    已被 propagate 消费 => chunk WorldMat 新鲜。写后同帧读（位仍置）
        //    回落基类：自算或直接返回 setter 留在堆里的新值，保持基类语义。
        if (this._worldView && this._dirtyWordView
            && !this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX)
            && (this._dirtyWordView[0] & this._dirtyMask) === 0) {
            (this._worldMatrix.elements as Float32Array).set(this._worldView);
            return this._worldMatrix;
        }
        return super.worldMatrix;
    }
    set worldMatrix(value: Matrix4x4) {
        super.worldMatrix = value;
    }

    private _syncLocal(need: number): void {
        this._checkViewStale();
        const pending = this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] & need;
        if (pending === 0) return;
        if (pending & LayaXTransform3D.SYNC_POS) this._pullPos();
        if (pending & LayaXTransform3D.SYNC_ROT) this._pullRot();
        if (pending & LayaXTransform3D.SYNC_SCALE) this._pullScale();
        this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] &= ~pending;
        // 任一 local 分量变更都使 local/world 矩阵失效；本次一并拉的多个分量只触发一次。
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        this._onWorldTransform();
    }

    // ------------------------------------------------------------------
    // local TRS 写：基类纯 TS 维护字段/flag/父子链脏传播，本类额外把 local 落自己 slot
    // ------------------------------------------------------------------

    set localPosition(value: Vector3) {
        super.localPosition = value;     // 基类：cloneTo _localPosition + 标 flag + 纯 TS 父子链传播
        this._pushLocalPos();            // 落自己 slot（零拷贝直写 / 降级 C++ 推）
    }
    get localPosition(): Vector3 {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPosition;
    }

    set localRotation(value: Quaternion) {
        super.localRotation = value;     // 基类：normalize 进 _localRotation + 标 flag + 传播
        this._pushLocalRot();
    }
    get localRotation(): Quaternion {
        this._syncLocal(LayaXTransform3D.SYNC_ROT);
        return super.localRotation;      // 基类懒求值（euler→quat）
    }

    set localScale(value: Vector3) {
        super.localScale = value;
        this._pushLocalScale();
    }
    get localScale(): Vector3 {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScale;
    }

    set localRotationEuler(value: Vector3) {
        super.localRotationEuler = value; // 基类：写 _localRotationEuler，标 LOCALQUATERNION 待求值
        this._pushLocalRot();             // _pushLocalRot 经 localRotation getter 触发 euler→quat
    }
    get localRotationEuler(): Vector3 {
        this._syncLocal(LayaXTransform3D.SYNC_ROT);
        return super.localRotationEuler;
    }

    set localMatrix(value: Matrix4x4) {
        super.localMatrix = value;        // 基类：分解到 _localPosition/_localRotation/_localScale
        this._pushLocalPos();
        this._pushLocalRot();
        this._pushLocalScale();
    }
    get localMatrix(): Matrix4x4 {
        this._syncLocal(LayaXTransform3D.SYNC_ALL);
        return super.localMatrix;
    }

    // 基类「位置/缩放分量」「position/getWorldLossyScale 无父分支」直读字段、不经已挂 getter，
    // 故在此补挂 SyncFlag 同步；旋转/欧拉分量、rotation、worldMatrix 等经已挂 getter 自动覆盖。

    get localPositionX(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionX;
    }
    set localPositionX(x: number) { super.localPositionX = x; }

    get localPositionY(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionY;
    }
    set localPositionY(y: number) { super.localPositionY = y; }

    get localPositionZ(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionZ;
    }
    set localPositionZ(z: number) { super.localPositionZ = z; }

    get localScaleX(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleX;
    }
    set localScaleX(value: number) { super.localScaleX = value; }

    get localScaleY(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleY;
    }
    set localScaleY(value: number) { super.localScaleY = value; }

    get localScaleZ(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleZ;
    }
    set localScaleZ(value: number) { super.localScaleZ = value; }

    get position(): Vector3 {
        this._syncLocal(LayaXTransform3D.SYNC_ALL);   // world 位置经父链/世界矩阵算，保守拉齐全部待拉分量
        return super.position;
    }
    set position(value: Vector3) { super.position = value; }

    getWorldLossyScale(): Vector3 {
        this._syncLocal(LayaXTransform3D.SYNC_ALL);   // world lossy scale 经父链算，保守拉齐全部待拉分量
        return super.getWorldLossyScale();
    }

    // world rotation/rotationEuler/setWorldLossyScale、_onWorldXxxTransform、
    // translate/rotate、isDefaultMatrix 全部回落基类纯 TS——基类 world setter 内部最终调本类
    // local setter（落 chunk），基类 world getter 沿 _parent 链用 _localXxx 字段即时算，0 跨边界。

    // ---- local→自己 slot 落库（零拷贝直写 + 标自己 dirty bit；未绑定经 C++ 推）----

    private _pushLocalPos(): void {
        this._checkViewStale();
        const lp = this._localPosition;
        if (this._viewsBound) {
            const p = this._posView;
            p[0] = lp.x; p[1] = lp.y; p[2] = lp.z;
            this._dirtyWordView[0] |= this._dirtyMask;
        } else {
            const i = LayaXTransform3D.TRANSFORM_LOCALPOS_DATAOFFSET, f = this._nativeFloat32Buffer;
            f[i] = lp.x; f[i + 1] = lp.y; f[i + 2] = lp.z;
            this._nativeObj.setLocalPosition();
        }
    }

    private _pushLocalRot(): void {
        this._checkViewStale();
        const lr = this.localRotation;    // 经基类 getter 懒求值，保证四元数最新（与 WebGL bit-exact）
        if (this._viewsBound) {
            const p = this._rotView;
            p[0] = lr.x; p[1] = lr.y; p[2] = lr.z; p[3] = lr.w;
            this._dirtyWordView[0] |= this._dirtyMask;
        } else {
            const i = LayaXTransform3D.TRANSFORM_LOCALQUATERNION_DATAOFFSET, f = this._nativeFloat32Buffer;
            f[i] = lr.x; f[i + 1] = lr.y; f[i + 2] = lr.z; f[i + 3] = lr.w;
            this._nativeObj.setLocalRotation();
        }
    }

    private _pushLocalScale(): void {
        this._checkViewStale();
        const ls = this._localScale;
        if (this._viewsBound) {
            const p = this._scaleView;
            p[0] = ls.x; p[1] = ls.y; p[2] = ls.z;
            this._dirtyWordView[0] |= this._dirtyMask;
        } else {
            const i = LayaXTransform3D.TRANSFORM_LOCALSCALE_DATAOFFSET, f = this._nativeFloat32Buffer;
            f[i] = ls.x; f[i + 1] = ls.y; f[i + 2] = ls.z;
            this._nativeObj.setLocalScale();
        }
    }

    // ------------------------------------------------------------------
    // Hierarchy —— 父子链结构由基类维护，额外通知 Rust ECS（propagate 依赖 Parent 组件）
    // ------------------------------------------------------------------

    /** @internal */
    _setParent(value: Transform3D): void {
        super._setParent(value);
        this._nativeObj.setParent(value ? (value as any)._nativeObj : null);
    }
}
