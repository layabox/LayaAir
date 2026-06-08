import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NativeMemory } from "../../RenderModuleData/RuntimeModuleData/NativeMemory";

/**
 * LayaX Transform3D —— 三端同源方案（world 计算回 JS）。
 *
 * 设计（见 Plan/Transform-三端同源最优方案.md）：
 *   - local TRS 唯一源 = Rust pool（`local_pos/rot/scale` 列）。JS 写 local 经零拷贝视图
 *     **直写 pool + 标 pool dirty bit**，0 跨语言调用（V8）；OHOS 无 external ArrayBuffer，
 *     降级为「写共享内存 + 一发 C++ setter 推 pool」。
 *   - world 读写 / 懒求值 **完全复用基类纯 TS `Transform3D`**（与 WebGL 同一套算法），
 *     数据源是基类 `_localPosition/_localRotation/_localScale` 字段——这些字段由本类 5 个
 *     local setter 在写 pool 的同时一并维护，故基类 world 计算取到的恒是最新 local。
 *     **JS↔C++ 读写 world 0 跨边界。**（故本类不再 override world get/set、_onWorldXxx、
 *     translate/rotate、flag 读写——全部回落基类纯 TS。）
 *   - 路②（高频只读）：`getWorldPositionLastFrame` 直读 Rust 上帧已算的 `pool.world_mat`，
 *     免 JS 矩阵自算、0 跨边界，容忍 1 帧延迟。
 *   - Rust 仍独立从 pool.local 算 world_mat 给 GPU（渲染链路不变）。
 *
 * **零拷贝视图按 slot 粒度，不映射整个池**：每个 transform 在 createEntity 后向 C++ 取
 * 「只覆盖自己 slot 那几个 float」的 ArrayBuffer（pos 3 / rot 4 / scale 3 / dirty 1 word /
 * worldMat 16），建成定长 Float32Array/Uint32Array 直写自己 slot。因 Rust pool 运行期
 * append-only（block 地址稳定、不 compact），这些视图绑定一次后**终身有效，无需 version 重绑**；
 * destroyEntity 时丢弃（slot 被 Rust 回收）。
 *
 * ⚠ 构造时序铁律（见 memory project_layax_transform_init_order）：基类 ctor 在 `super()`
 * 期间调 `this._initProperty()`，子类字段初始化器在 `super()` 返回后才执行、会覆盖 `_initProperty`
 * 里赋的值。故①不重声明 `_localPosition` 等基类字段；②在 `_initProperty` 赋值的子类字段
 * （`_nativeFloat32Buffer`/`_nativeObj`）不能带 `= 初值`。
 *
 * Native class: `conchLayaXTransform`.
 */
export class LayaXTransform3D extends Transform3D {

    // ---- 共享内存布局（OHOS 降级写 + 构造期 C++ 同步用；与 JSRTTransform 一致）----
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

    // ---- flag 独立共享内存（不进 pool）：[0]=ChangeFlag 脏标记，[1]=SyncFlag（native 改 pool 后置位）----
    static FLAG_CHANGE_IDX: number = 0;
    static FLAG_SYNC_IDX: number = 1;
    static FLAG_MEMORY_SIZE: number = 2;

    /** 进程级一次性探测：V8 平台 external ArrayBuffer 可用 = true；OHOS = false。 */
    private static _zeroCopyProbed: boolean = false;
    private static _hasZeroCopy: boolean = false;
    /** 临时诊断计数（定位 bind 是否成功后删） */
    private static _diagN: number = 0;

    /**
     * @internal 进程级共享 marshalling scratch（OHOS / 构造期降级路径用）。
     * plan A 下这块共享内存只作「JS 写一发 → C++ 同步读一发」的瞬时中转，不持任何跨调用的
     * per-transform 状态（local 唯一源在 pool、world/flag 全在 JS），故全进程一份即可——
     * 省掉每 transform 240B；V8 绑定后根本不碰它（local 走 _posView、world 走 JS 自算）。
     */
    private static _sharedNativeMemory: NativeMemory = null;
    /**
     * @internal 指向共享 scratch 的 float32 视图（仅未绑定 / OHOS 降级写 local 用）。
     * ⚠ 不能带 `= null` 初始化器：本字段在 `_initProperty`（基类构造期间调用）里赋值，
     * 子类字段初始化器在 `super()` 返回后才执行，会把构造期赋的值覆盖回 null，
     * 导致后续 fallback 写 `f[7]` 崩 "Cannot set property of null"。
     */
    private _nativeFloat32Buffer: Float32Array;

    /**
     * @internal flag 独立共享内存（不进 pool），C++/JS 共维护。⚠ 不能带初值（_initProperty 里赋值）。
     */
    private _flagMemory: NativeMemory;
    private _flagU32: Uint32Array;

    /** @internal */
    _nativeObj: any;

    /**@internal RTAnimatorFactory._notifyJsTransformChanged 的帧去重标记，整数比对替代 Set 去重 */
    _notifyFrame: number = 0;

    // ---- 本 slot 零拷贝视图（createEntity 后由 _bindPool 填充；OHOS 恒为未绑定）----
    /** @internal 是否已绑定 pool 零拷贝视图（仅 V8 且分配到 slot 时为 true） */
    private _poolBound: boolean = false;
    /** @internal 本 slot 的列视图（定长：pos=3 / rot=4 / scale=3），直接写下标 0.. */
    private _posView: Float32Array = null;
    private _rotView: Float32Array = null;
    private _scaleView: Float32Array = null;
    /** @internal 本 slot 的 world_mat 视图（16，路②只读，懒建——多数节点不读 world） */
    private _worldView: Float32Array = null;
    /** @internal 本 slot 所属的 1 个脏位字视图（与同字 31 个邻居共享），只 |= 自己那 bit */
    private _dirtyWordView: Uint32Array = null;
    /** @internal 本 slot 在脏字内的位掩码 = 1 << (idx & 31) */
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
        // 时 push 进 pool。此刻未绑定 pool，setter 走未绑定降级分支（写共享内存 + C++）。
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
    // ECS Entity / pool 绑定
    // ------------------------------------------------------------------

    /**
     * 在 Rust ECS 创建 entity + 分配 pool slot（C++ 内部完成），随后绑定本 slot 的零拷贝视图。
     */
    createEntity(): void {
        this._nativeObj.createEntity();
        this._bindPool();
    }

    /**
     * 递归销毁子 entity 后销毁自身，并丢弃本 slot 视图（slot 被 Rust 回收、gen 递增，旧视图禁止再写）。
     */
    destroyEntity(): void {
        this._nativeObj.destroyEntity();
        this._poolBound = false;
        this._posView = this._rotView = this._scaleView = this._worldView = null;
        this._dirtyWordView = null;
    }

    /**
     * 绑定本实例到「自己 slot」的零拷贝视图——只取自己那几个 float，不映射整个池。
     * OHOS（无零拷贝）保持未绑定，写 local 走 C++ 推。
     */
    private _bindPool(): void {
        const idx: number = this._nativeObj.getPoolIdx();
        if (idx === 0xFFFFFFFF) {
            if (LayaXTransform3D._diagN < 5) { LayaXTransform3D._diagN++; console.warn("[LayaXTransform] bind FAIL: getPoolIdx()==UINT32_MAX，entity/slot 未分配"); }
            return; // 未分配 slot
        }
        if (!LayaXTransform3D._zeroCopyProbed) {
            const probe: ArrayBuffer = this._nativeObj.getOwnLocalPos();
            LayaXTransform3D._hasZeroCopy = !!probe && probe.byteLength > 0; // OHOS: 空 buffer → false
            LayaXTransform3D._zeroCopyProbed = true;
            console.warn("[LayaXTransform] zeroCopy probe: hasZeroCopy=" + LayaXTransform3D._hasZeroCopy +
                " probeBytes=" + (probe ? probe.byteLength : "null"));
        }
        if (!LayaXTransform3D._hasZeroCopy) {
            if (LayaXTransform3D._diagN < 5) { LayaXTransform3D._diagN++; console.warn("[LayaXTransform] bind FAIL: hasZeroCopy=false → 全程走 C++ 降级"); }
            return; // OHOS 降级
        }
        // 每个视图只覆盖本 slot：pos[3] / rot[4] / scale[3] / dirtyWord[1]
        this._posView = new Float32Array(this._nativeObj.getOwnLocalPos());
        this._rotView = new Float32Array(this._nativeObj.getOwnLocalRot());
        this._scaleView = new Float32Array(this._nativeObj.getOwnLocalScale());
        this._dirtyWordView = new Uint32Array(this._nativeObj.getOwnDirtyWord());
        this._dirtyMask = (1 << (idx & 31)) >>> 0; // slot 在脏字内的位 = idx 低 5 位
        this._poolBound = true;
        if (LayaXTransform3D._diagN < 5) {
            LayaXTransform3D._diagN++;
            console.warn("[LayaXTransform] bind OK: idx=" + idx + " mask=" + this._dirtyMask +
                " posLen=" + this._posView.length + " rotLen=" + this._rotView.length +
                " scaleLen=" + this._scaleView.length + " dirtyLen=" + this._dirtyWordView.length);
        }
        // C++ createEntity 已把 m_localXxx push 进 pool；JS 字段与之同源（构造期同步），无需重复写。
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
     * RTAnimatorFactory 派发 TRANSFORM_CHANGED 时读取的脏标志。plan A 下 flag 在 JS 内（基类字段）。
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

    /** SyncFlag 置位时把 pool 的整组 local 拉回 JS 镜像并清 SyncFlag（共享内存读，0 跨界）。 */
    private _pullLocalFromPool(): void {
        if (this._poolBound) {
            this._localPosition.setValue(this._posView[0], this._posView[1], this._posView[2]);
            this._localRotation.setValue(this._rotView[0], this._rotView[1], this._rotView[2], this._rotView[3]);
            this._localScale.setValue(this._scaleView[0], this._scaleView[1], this._scaleView[2]);
            // 拉回的 quat 是 source，euler 待重算
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALEULER, true);
            this._setTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION, false);
        }
        this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] = 0; // OHOS（未绑定 pool）数据拉取走 C++，待补
    }

    // ------------------------------------------------------------------
    // local TRS 写：基类纯 TS 维护字段/flag/父子链脏传播，本类额外把 local 落自己 slot
    // ------------------------------------------------------------------

    set localPosition(value: Vector3) {
        super.localPosition = value;     // 基类：cloneTo _localPosition + 标 flag + 纯 TS 父子链传播
        this._pushLocalPos();            // 落自己 slot（V8 零拷贝直写 / OHOS C++ 推）
    }
    get localPosition(): Vector3 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localPosition;
    }

    set localRotation(value: Quaternion) {
        super.localRotation = value;     // 基类：normalize 进 _localRotation + 标 flag + 传播
        this._pushLocalRot();
    }
    get localRotation(): Quaternion {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localRotation;      // 基类懒求值（euler→quat）
    }

    set localScale(value: Vector3) {
        super.localScale = value;
        this._pushLocalScale();
    }
    get localScale(): Vector3 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localScale;
    }

    set localRotationEuler(value: Vector3) {
        super.localRotationEuler = value; // 基类：写 _localRotationEuler，标 LOCALQUATERNION 待求值
        this._pushLocalRot();             // _pushLocalRot 经 localRotation getter 触发 euler→quat
    }
    get localRotationEuler(): Vector3 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localRotationEuler;
    }

    set localMatrix(value: Matrix4x4) {
        super.localMatrix = value;        // 基类：分解到 _localPosition/_localRotation/_localScale
        this._pushLocalPos();
        this._pushLocalRot();
        this._pushLocalScale();
    }
    get localMatrix(): Matrix4x4 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localMatrix;
    }

    // 基类「位置/缩放分量」「position/getWorldLossyScale 无父分支」直读字段、不经已挂 getter，
    // 故在此补挂 SyncFlag 同步；旋转/欧拉分量、rotation、worldMatrix 等经已挂 getter 自动覆盖。

    get localPositionX(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localPositionX;
    }
    set localPositionX(x: number) { super.localPositionX = x; }

    get localPositionY(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localPositionY;
    }
    set localPositionY(y: number) { super.localPositionY = y; }

    get localPositionZ(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localPositionZ;
    }
    set localPositionZ(z: number) { super.localPositionZ = z; }

    get localScaleX(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localScaleX;
    }
    set localScaleX(value: number) { super.localScaleX = value; }

    get localScaleY(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localScaleY;
    }
    set localScaleY(value: number) { super.localScaleY = value; }

    get localScaleZ(): number {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.localScaleZ;
    }
    set localScaleZ(value: number) { super.localScaleZ = value; }

    get position(): Vector3 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.position;
    }
    set position(value: Vector3) { super.position = value; }

    getWorldLossyScale(): Vector3 {
        if (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX]) this._pullLocalFromPool();
        return super.getWorldLossyScale();
    }

    // world rotation/rotationEuler/worldMatrix/setWorldLossyScale、_onWorldXxxTransform、
    // translate/rotate、isDefaultMatrix 全部回落基类纯 TS——基类 world setter 内部最终调本类
    // local setter（落 pool），基类 world getter 沿 _parent 链用 _localXxx 字段即时算，0 跨边界。

    // ---- local→自己 slot 落库（V8 零拷贝直写 + 标自己 dirty bit；未绑定/OHOS 经 C++ 推）----

    private _pushLocalPos(): void {
        const lp = this._localPosition;
        if (this._poolBound) {
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
        const lr = this.localRotation;    // 经基类 getter 懒求值，保证四元数最新（与 WebGL bit-exact）
        if (this._poolBound) {
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
        const ls = this._localScale;
        if (this._poolBound) {
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
    // 路②：高频只读直读自己 slot 的 pool.world_mat（Rust 上帧 world，免 JS 矩阵自算、0 跨边界）
    // 容忍 1 帧延迟；未绑定 pool（OHOS / 未入场景）回落基类即时自算。world 视图懒建。
    // ------------------------------------------------------------------

    getWorldPositionLastFrame(out: Vector3): Vector3 {
        if (this._poolBound) {
            let m = this._worldView;
            if (!m) m = this._worldView = new Float32Array(this._nativeObj.getOwnWorldMat());
            out.x = m[12]; out.y = m[13]; out.z = m[14]; // 列主序，平移在 [12,13,14]
            return out;
        }
        return super.getWorldPositionLastFrame(out);
    }

    getWorldMatrixLastFrame(out: Matrix4x4): Matrix4x4 {
        if (this._poolBound) {
            let m = this._worldView;
            if (!m) m = this._worldView = new Float32Array(this._nativeObj.getOwnWorldMat());
            const e = out.elements;
            for (let i = 0; i < 16; i++) e[i] = m[i];
            return out;
        }
        return super.getWorldMatrixLastFrame(out);
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
