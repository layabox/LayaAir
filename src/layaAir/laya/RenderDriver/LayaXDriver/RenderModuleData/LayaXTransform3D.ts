import { Sprite3D } from "../../../d3/core/Sprite3D";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { Stat } from "../../../utils/Stat";
import { NativeMemory } from "../../RenderModuleData/RuntimeModuleData/NativeMemory";
import { LayaXChunkPages } from "./LayaXChunkPages";

/** world 五量 flag 全集(链校验判脏时保守置全量,各 getter 消费各自位) */
const ALL_WORLD_FLAGS =
    Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION |
    Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER |
    Transform3D.TRANSFORM_WORLDSCALE;

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
    /**
     * 全局动画写代数共享视图(4 字节,C++ _syncLocalToBackend 每次 ++;新 conch 接口
     * getSyncEpochView 提供,旧 dll 无此接口时为 null → _syncLocal 退化为每次探测
     * SyncFlag(旧行为,正确但每读多 1 次共享访问))。
     */
    private static _syncEpochView: Uint32Array = null;
    private static _syncEpochProbed: boolean = false;

    /**
     * @internal 结构操作代数：任何 JS 发起的 createEntity/destroyEntity/setParent 后自增。
     * 与帧号(Stat.loopCount)共同构成 _checkViewStale 的快检门——VIEW_STALE/epoch 只在
     * 结构事件(实体增删触发的 swap-remove、tick 内迁移)时变化,为它们在 90k 次/帧的
     * 热路径上逐访问查共享内存是付费错位;快检门把成本降为 2 次字段比较,同时保证:
     *   ① JS 帧中结构操作(useSkill 式特效增删)→ _structGen++ → 所有实例下次访问慢检一次;
     *   ② Rust tick 内迁移 → 下一帧 Stat.loopCount 变化 → 每实例每帧至少慢检一次(帧界兜底)。
     */
    private static _structGen: number = 1;

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
    _dirtyWordView: Uint32Array = null;
    /** @internal 本 slot 在脏字内的位掩码 = 1 << (slot & 31) */
    _dirtyMask: number = 0;

    /** @internal _checkViewStale 快检门:上次慢检时的结构代数/帧号 */
    private _checkGen: number = 0;
    private _checkFrame: number = -1;
    /**
     * @internal _syncLocal 三键门(帧号/动画写代数/结构代数):三者都未变 => 本帧已确认
     * SyncFlag 为 0 且视图新鲜,直接短路——90k/帧热读的 SyncFlag/epoch 共享内存探测
     * 降为 3 次 JS 字段比较(conch V8 上共享内存访问是主要逐次成本,见性能模型)。
     */
    private _syncGateFrame: number = -1;
    private _syncGateEpoch: number = -1;
    private _syncGateStruct: number = -1;
    /**
     * @internal 本节点 local 写代数:JS 写(_push*)、pull(化入 C++ 写)、重挂、实体重建时 ++。
     * 读侧以"自己+祖先链写代数和"(_chainGenSum)作 world 缓存判据——相同则本次读与上次
     * 重算之间无任何可见变化,直接用缓存;避免"slot 脏(tick 未消费)期间重复读重复级联"
     * (300 monster 避障场景:已写过的 monster 被其余 299 个重复读)。纯 JS 私有推导判据,
     * 不构成新真相源。
     */
    private _writeGen: number = 1;
    /** @internal 上次 world 重算/直读时的链写代数和 */
    private _worldGenSum: number = -1;
    /** @internal 上次记录 _worldGenSum 时的结构代数(见 _worldNeedRefresh 碰撞防护) */
    private _worldGenStruct: number = -1;
    /**
     * @internal 子树(不含自己)内 TRANSFORM_CHANGED 订阅者总数。写路径的事件派发只深入
     * `自身有监听 || _subtreeListenerTotal>0` 的分支(订阅剪枝)。与 _hasTransformChangedListener
     * 同为保守只增语义(off 不减,空派发无害);重挂/销毁按子树总量迁移(_setParent)。
     */
    _subtreeListenerTotal: number = 0;

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
     * EventDispatcher 钩子：首次注册 TRANSFORM_CHANGED 时沿祖先链登记订阅计数,
     * 供写路径订阅剪枝(_notifySubscribedChildren)使用。保守只增(与
     * _hasTransformChangedListener 语义一致,off 不减)。
     */
    protected onStartListeningToType(type: string): void {
        super.onStartListeningToType(type);
        if (type === Event.TRANSFORM_CHANGED) {
            this._hasTransformChangedListener = true;
            let p: any = this._parent;
            while (p) {
                if (p._subtreeListenerTotal !== undefined) p._subtreeListenerTotal++;
                p = p._parent;
            }
        }
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
        // 重建路径(destroy→create,节点移出场景再加回)修复(对拍器用例6+9组合发现):
        // C++ createEntity 从 m_localXxx 推入新行,但零拷贝写不经 C++,m_localXxx 可能
        // 停在更早值——以 JS 字段为权威重推。先清残留 SyncFlag 分量位(实体已重生,旧
        // pending 无意义;且 _pushLocalRot 内的 localRotation getter 会按 pending pull,
        // 残留位会把权威字段覆盖成新行默认值)。
        this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] = 0;
        this._pushLocalPos();
        this._pushLocalRot();
        this._pushLocalScale();
        // 结构操作可能引发页扩展/行分配,让所有实例下次访问做一次慢检(快检门失效)
        LayaXTransform3D._structGen++;
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
        this._writeGen++;
        // swap-remove 会搬第三方实体的行(INV-6):bump 代数,受影响实例下次访问经慢检发现 VIEW_STALE
        LayaXTransform3D._structGen++;
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
        if (!LayaXTransform3D._syncEpochProbed) {
            LayaXTransform3D._syncEpochProbed = true;
            if (this._nativeObj.getSyncEpochView) {
                const sb: ArrayBuffer = this._nativeObj.getSyncEpochView();
                if (sb && sb.byteLength >= 4) LayaXTransform3D._syncEpochView = new Uint32Array(sb);
            }
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

    // ChangeFlag 私有化(方案 Phase 2b,性能模型驱动提前):flag 回归基类 JS 私有字段。
    // 跨语言判据已不依赖共享 ChangeFlag —— C++ tier-1 改为 slotClean+祖先链 slot 校验
    // (任何 JS 写含 setWorldMatrix 都置 slot 脏);动画方向由 SyncFlag+syncEpoch 覆盖。
    // _flagU32 保留仅作 SyncFlag/VIEW_STALE 通道([FLAG_SYNC_IDX])。

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

    /**
     * @internal Rebind only when this entity's row moved.
     * 快检门:VIEW_STALE/epoch 只随结构事件变化——同一(结构代数,帧号)内重复访问
     * 直接短路(2 次字段比较,无共享内存读)。结构事件两来源都会使门失效:
     * JS 结构操作 → _structGen++(操作返回点语义);Rust tick 内迁移 → 下帧
     * Stat.loopCount 变化(帧界兜底)。tick 与 JS 帧互斥(tick timing contract),
     * 帧中无 JS 结构操作时行不可能被搬,门短路是安全的。
     */
    private _checkViewStale(): void {
        if (this._checkGen === LayaXTransform3D._structGen && this._checkFrame === Stat.loopCount)
            return;
        this._checkGen = LayaXTransform3D._structGen;
        this._checkFrame = Stat.loopCount;
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
     * @internal 祖先链 dirtyWord 校验(层2"推改拉"的读侧判据,O(depth))。
     * "祖先链上存在未消费写" ⇔ "我的 world 缓存可能过期"——与旧写时递归推下来的
     * world flag 信息严格等价(dirtyWord 由任何语言写 local 置位、tick 末 clear_all_dirty
     * 统一清)。未绑定视图的祖先(降级实例/非实体)跳过:它们的写仍走基类递归推送,
     * 会直接置本节点 flag,不需要链校验发现。
     */
    private _ancestorChainDirty(): boolean {
        let p: any = this._parent;
        while (p) {
            // 祖先视图可能因第三方 swap-remove 而 stale(惰性重绑只在"自己被访问"时发生,
            // 祖先可能长期未被直接访问)——读位前先过其快检门(结构代数+帧号未变时 2 次
            // 字段比较短路),防止读到旧行的 dirty 位造成漏检(对拍器发现)。
            if (p._checkViewStale) p._checkViewStale();
            const dw = p._dirtyWordView;
            if (dw && (dw[0] & p._dirtyMask) !== 0) return true;
            p = p._parent;
        }
        return false;
    }

    /**
     * @internal 根节点是否为平凡变换(TRS 全默认 => world == local 直通)。
     * 不用 isDefaultMatrix:它依赖 localMatrix 曾被重组(LM 脏过),从未被写过的
     * scene root 上永远返回 false(cap15 实测剪枝零命中的根因)。直接比对 TRS 字段;
     * 根的 _localRotation 若 LQ 脏(euler 为源)则保守判非平凡,慢路径兜底。
     */
    private static _isTrivialRoot(par: any): boolean {
        const lp = par._localPosition, lr = par._localRotation, ls = par._localScale;
        return lp.x === 0 && lp.y === 0 && lp.z === 0
            && !par._getTransformFlag(Transform3D.TRANSFORM_LOCALQUATERNION)
            && lr.x === 0 && lr.y === 0 && lr.z === 0 && lr.w === 1
            && ls.x === 1 && ls.y === 1 && ls.z === 1;
    }

    /** @internal worldPositionView 的懒建缓存 */
    private _worldPosView: Float32Array = null;

    /**
     * @en Read-only zero-copy view of the world position (chunk WorldMat translation,
     * updated by the native propagate each tick; up to one frame behind mid-frame writes).
     * Intended for high-frequency approximate reads (avoidance/LOD/aggro scans):
     * N-squared getter reads become raw typed-array reads. Returns null before the
     * entity is spawned or when the WorldMat view is unavailable — fall back to
     * `position` in that case. Do NOT write through this view.
     * @zh 世界坐标的只读零拷贝视图(chunk WorldMat 平移分量,由 native propagate 每
     * tick 更新;对帧中写有至多一帧延迟)。用于高频模糊读(避障/LOD/仇恨扫描等):
     * N² 次 getter 读可降为裸 typed-array 读。实体未 spawn 或 WorldMat 视图不可用时
     * 返回 null,请回落 `position`。禁止经此视图写入。
     */
    get worldPositionView(): Float32Array | null {
        const w = this._worldView;
        if (!w) return null;
        let v = this._worldPosView;
        if (!v || v.buffer !== w.buffer || v.byteOffset !== w.byteOffset + 48)
            v = this._worldPosView = new Float32Array(w.buffer, w.byteOffset + 48, 3);
        return v;
    }

    /** @internal 自己 slot 有未消费写(本帧写过 local,tick 尚未消费) */
    private _selfSlotDirty(): boolean {
        return this._viewsBound && this._dirtyWordView != null
            && (this._dirtyWordView[0] & this._dirtyMask) !== 0;
    }

    /**
     * @internal 自己+祖先链写代数和(O(depth))。沿链顺带消化各节点 SyncFlag pending
     * (C++ 动画写经 pull 化入该节点 gen),使 gen 覆盖全部可见变化源:
     * JS 写/C++ 写(pull)/重挂/重建。tick 不改 JS local,不影响该判据。
     */
    private _chainGenSum(): number {
        this._syncLocal(LayaXTransform3D.SYNC_ALL);
        let sum = this._writeGen;
        let p: any = this._parent;
        while (p) {
            if (p._syncLocal) p._syncLocal(LayaXTransform3D.SYNC_ALL);
            sum += (p._writeGen | 0);
            p = p._parent;
        }
        return sum;
    }

    /**
     * @internal world 读统一入口判据:链写代数变化 => 缓存不可信,置全量走重算
     * (直读快路径仍按 dirtyWord 三条件独立判断,在 super 之前)。返回是否发生变化。
     */
    private _worldNeedRefresh(): boolean {
        // 判据复合结构代数:重挂会换祖先链,新旧链 gen 和可能恰好碰撞(对拍器抓到
        // 23+96 == 26+93 的实例)。同一结构代内链形状固定且 sum 严格单调(写只增),
        // 不可能回撞;跨代(重挂/实体增删,低频)强制刷新一次,严格正确。
        const sum = this._chainGenSum();
        if (sum === this._worldGenSum && this._worldGenStruct === LayaXTransform3D._structGen)
            return false;
        this._worldGenSum = sum;
        this._worldGenStruct = LayaXTransform3D._structGen;
        this._markChainDirtyAll();
        return true;
    }

    /**
     * @internal 链脏时置自身全量 world flags,并保持 TRANSFORM_CHANGED 边缘语义:
     * 原 flag 未全脏 → 本次置脏构成一次"变脏边缘",若自身有监听则派发(把写时递归
     * 丢失的边缘恢复为首读边缘;BaseRender.boundsChange 等消费者为水平触发语义,
     * 通知时刻漂移无影响,不漏通知是底线)。
     */
    private _markChainDirtyAll(): void {
        if ((this._getTransformChangeFlag() & ALL_WORLD_FLAGS) !== ALL_WORLD_FLAGS) {
            this._setTransformFlag(ALL_WORLD_FLAGS, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
    }

    /**
     * 读 world 消除双算：flag 干净 → 直读 chunk WorldMat（Rust propagate 的产物，
     * 容忍 1 帧），免去 JS 沿父链的矩阵乘；本帧写过 local（flag 脏）→ 回落基类
     * 自算，结果只落 JS 堆（propagate 仍是组件唯一写者）。
     */
    get worldMatrix(): Matrix4x4 {
        // 两个独立判据,不可混用(对拍器发现):
        //   gen(_worldNeedRefresh)   —— "缓存/级联结果是否仍可复用"(JS 侧写代数闭环);
        //   dirtyWord(自己+祖先链) —— "chunk WorldMat 是否新鲜"(未消费写 => chunk 落后)。
        // 同一逻辑刻内嵌套 getter 会看到 needRefresh=false,此时若误走直读会拿到
        // 未含最新写的 chunk 旧矩阵。
        const changed = this._worldNeedRefresh();
        if (!changed && !this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX))
            return super.worldMatrix; // 缓存有效,零拷贝返回
        // 需要物化:chunk 新鲜(无任何未消费写)则直读,否则级联(flag 已置)
        if (this._worldView && this._dirtyWordView
            && !this._selfSlotDirty() && !this._ancestorChainDirty()) {
            (this._worldMatrix.elements as Float32Array).set(this._worldView);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX, false);
            return this._worldMatrix;
        }
        return super.worldMatrix;
    }
    set worldMatrix(value: Matrix4x4) {
        super.worldMatrix = value;
    }

    private _syncLocal(need: number): void {
        // 三键门:同帧 + 动画写代数未变 + 结构代数未变 => SyncFlag 必为 0 且视图新鲜,
        // 短路后仅剩 1 次共享读(sev[0],门键本身)——相比逐次探测省去 per-entity
        // SyncFlag/epoch 访问(旧 dll 无 syncEpochView 时不启用门,退化为逐次探测)。
        const sev = LayaXTransform3D._syncEpochView;
        if (sev !== null
            && this._syncGateFrame === Stat.loopCount
            && this._syncGateEpoch === sev[0]
            && this._syncGateStruct === LayaXTransform3D._structGen)
            return;
        this._checkViewStale();
        const pending = this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] & need;
        if (pending === 0) {
            if (sev !== null && (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] & LayaXTransform3D.SYNC_ALL) === 0) {
                this._syncGateFrame = Stat.loopCount;
                this._syncGateEpoch = sev[0];
                this._syncGateStruct = LayaXTransform3D._structGen;
            }
            return;
        }
        if (pending & LayaXTransform3D.SYNC_POS) this._pullPos();
        if (pending & LayaXTransform3D.SYNC_ROT) this._pullRot();
        if (pending & LayaXTransform3D.SYNC_SCALE) this._pullScale();
        this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] &= ~pending;
        this._writeGen++; // C++ 写化入本节点写代数
        this._setTransformFlag(Transform3D.TRANSFORM_LOCALMATRIX, true);
        // 按分量选择性置脏(对拍器精化):与 WebGL 侧等效写的递归类型对齐——
        // 统一 _onWorldTransform() 全量置脏会改变 TRANSFORM_CHANGED 的边缘触发时刻
        // (flag 已脏则跳过派发),造成与 WebGL 事件次数不一致。
        if (pending & LayaXTransform3D.SYNC_POS) this._onWorldPositionTransform();
        if (pending & LayaXTransform3D.SYNC_ROT) this._onWorldRotationTransform();
        if (pending & LayaXTransform3D.SYNC_SCALE) this._onWorldScaleTransform();
        if (sev !== null && (this._flagU32[LayaXTransform3D.FLAG_SYNC_IDX] & LayaXTransform3D.SYNC_ALL) === 0) {
            this._syncGateFrame = Stat.loopCount;
            this._syncGateEpoch = sev[0];
            this._syncGateStruct = LayaXTransform3D._structGen;
        }
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
    // 分量 SETTER 写前也必须 pull(既有缺口修复):基类分量 setter 直改字段的单分量后整体推送,
    // 若 C++ 刚写过该组件且未 pull,其余分量会用 JS 旧值覆盖 chunk 新值。

    get localPositionX(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionX;
    }
    set localPositionX(x: number) { this._syncLocal(LayaXTransform3D.SYNC_POS); super.localPositionX = x; }

    get localPositionY(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionY;
    }
    set localPositionY(y: number) { this._syncLocal(LayaXTransform3D.SYNC_POS); super.localPositionY = y; }

    get localPositionZ(): number {
        this._syncLocal(LayaXTransform3D.SYNC_POS);
        return super.localPositionZ;
    }
    set localPositionZ(z: number) { this._syncLocal(LayaXTransform3D.SYNC_POS); super.localPositionZ = z; }

    get localScaleX(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleX;
    }
    set localScaleX(value: number) { this._syncLocal(LayaXTransform3D.SYNC_SCALE); super.localScaleX = value; }

    get localScaleY(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleY;
    }
    set localScaleY(value: number) { this._syncLocal(LayaXTransform3D.SYNC_SCALE); super.localScaleY = value; }

    get localScaleZ(): number {
        this._syncLocal(LayaXTransform3D.SYNC_SCALE);
        return super.localScaleZ;
    }
    set localScaleZ(value: number) { this._syncLocal(LayaXTransform3D.SYNC_SCALE); super.localScaleZ = value; }

    // ------------------------------------------------------------------
    // world 五量 getter:统一"_worldNeedRefresh(gen 判据) → 基类懒求值"两段式。
    //
    // 跨 tick 缓存失效(对拍器发现,方案 §3.2(i) 第三分支是正确性必需):写时递归删除后,
    // "祖先写 → tick 消费(dirtyWord 清)"不会在本节点留下任何 flag 痕迹——链干净 + flag
    // 干净 ≠ 缓存有效。解法 = 链写代数(gen)判据,它同时解决了"祖先脏未消费期间重复读
    // 重复级联"的退化(方案披露项):
    //   - gen 未变(且各自分量 flag 干净)→ 上次重算以来无任何可见变化,缓存可信,
    //     同帧/跨帧重复读均零成本返回;
    //   - gen 变 → _markChainDirtyAll 置全量(带边缘事件),position/worldMatrix 先试
    //     chunk 直读(dirtyWord 三条件独立判新鲜:changed=true 时直读可达的唯一通路是
    //     "写已被 tick 消费",此时 chunk 恰为权威),否则基类级联(JS local 链,权威)。
    // gen 覆盖全部可见变化源:JS 写(_push*)、C++ 写(_syncLocal pull 化入)、重挂、
    // 实体重建;复合 _structGen 防重挂后新旧链 gen 和碰撞。

    get position(): Vector3 {
        // 热路径手动内联(90k 次/帧;conch 老 V8 不内联 getter→needRefresh→chainGenSum→
        // syncLocal 的多层调用链,每层调用帧 ~15ns 是主要残余成本)。逻辑与
        // _worldNeedRefresh + 缓存分支严格等价:全链 sync 门命中 => SyncFlag 必 0、视图
        // 新鲜,gen 和与上次一致且结构代未变 => 无任何可见变化 => 私有 WP flag 干净时
        // 直接返回缓存。任一条件不满足 => 回落通用慢路径。
        const sev = LayaXTransform3D._syncEpochView;
        if (sev !== null) {
            const frame = Stat.loopCount, sg = LayaXTransform3D._structGen, se = sev[0];
            let sum = 0;
            let n: any = this;
            do {
                if (n._syncGateFrame !== frame || n._syncGateEpoch !== se || n._syncGateStruct !== sg) { sum = -1; break; }
                sum += n._writeGen;
                n = n._parent;
            } while (n !== null);
            if (sum >= 0 && sum === this._worldGenSum && this._worldGenStruct === sg
                && (this._transformFlag & Transform3D.TRANSFORM_WORLDPOSITION) === 0)
                return this._position;
        }
        // 慢路径(与内联前完全一致)
        const changed = this._worldNeedRefresh();
        if (!changed && !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION))
            return super.position; // 缓存有效
        if (this._parent !== null && this._worldView && this._dirtyWordView
            && !this._selfSlotDirty() && !this._ancestorChainDirty()) {
            const w = this._worldView;
            this._position.setValue(w[12], w[13], w[14]);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
            return this._position;
        }
        return super.position;
    }
    set position(value: Vector3) {
        // 写路径剪枝(基类 isDefaultMatrix 思想在写侧的对称):父为平凡根时 world==local,
        // 跳过 parent.worldMatrix.invert + transformCoordinate。实测注记(cap15/16):该项
        // 占写路径 <5%(大头是三角函数与 setter 链固有成本),保留因其零风险且慢路径兜底。
        const par: any = this._parent;
        if (par !== null && par._parent === null && LayaXTransform3D._isTrivialRoot(par)) {
            value.cloneTo(this._localPosition);
            this.localPosition = this._localPosition;   // 走本类 setter:标脏+push+gen
            if (this._position !== value) value.cloneTo(this._position);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
            return;
        }
        super.position = value;
    }

    get rotation(): Quaternion {
        this._worldNeedRefresh();
        return super.rotation;
    }
    set rotation(value: Quaternion) { super.rotation = value; }

    get rotationEuler(): Vector3 {
        this._worldNeedRefresh();
        return super.rotationEuler;
    }
    set rotationEuler(value: Vector3) {
        // 同 position setter 的剪枝:父链全 identity 时 world 旋转==local 旋转,跳过
        // parent.rotation.invert + Quaternion.multiply。euler->quat 由 localRotationEuler
        // setter 的懒求值路径处理(与基类语义一致:LOCALQUATERNION 置脏延后计算)。
        const par: any = this._parent;
        if (par !== null && par._parent === null && LayaXTransform3D._isTrivialRoot(par)) {
            this.localRotationEuler = value;            // 本类 setter:懒 euler->quat+push+gen
            if (this._rotationEuler !== value) value.cloneTo(this._rotationEuler);
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDEULER, false);
            return;
        }
        super.rotationEuler = value;
    }

    getWorldLossyScale(): Vector3 {
        this._worldNeedRefresh();
        return super.getWorldLossyScale();
    }

    // setWorldLossyScale、translate/rotate、isDefaultMatrix 回落基类纯 TS——基类 world setter
    // 内部最终调本类 local setter（落 chunk），基类 world getter 沿 _parent 链经本类覆写 getter
    // 即时算(链校验逐级生效)，0 跨边界。

    // ------------------------------------------------------------------
    // 写路径子树标脏:推改拉(方案层2)。
    // 绑定实体分支:只置自身 flag + dirtyWord(local setter 已标),不再 walk 整棵子树
    // ——子孙的失效由其读侧 _ancestorChainDirty() 拉取发现(信息与递归推严格等价);
    // 事件派发只深入含订阅者的分支(订阅剪枝,demo 中 renderer 订阅路径 ~2-4 节点)。
    // 未绑定(降级实例/非实体游离树)分支:回落基类全递归(保守正确;createEntity 递归
    // 创建保证"实体节点的子孙皆实体",混合链只有游离树整体一种形态)。
    // 与 C++ LayaXTransform_JS 的空 _onWorldXxx override(LayaXTransform.h:144-149)对称。
    // ------------------------------------------------------------------

    protected _onWorldPositionTransform(): void {
        if (!this._viewsBound) { super._onWorldPositionTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(0);
    }

    protected _onWorldRotationTransform(): void {
        if (!this._viewsBound) { super._onWorldRotationTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(1);
    }

    protected _onWorldScaleTransform(): void {
        if (!this._viewsBound) { super._onWorldScaleTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDSCALE, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(2);
    }

    protected _onWorldPositionRotationTransform(): void {
        if (!this._viewsBound) { super._onWorldPositionRotationTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDEULER, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(1);
    }

    protected _onWorldPositionScaleTransform(): void {
        if (!this._viewsBound) { super._onWorldPositionScaleTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX | Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDSCALE, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(2);
    }

    _onWorldTransform(): void {
        if (!this._viewsBound) { super._onWorldTransform(); return; }
        if (!this._getTransformFlag(Transform3D.TRANSFORM_WORLDMATRIX) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDEULER) || !this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
            this._setTransformFlag(ALL_WORLD_FLAGS, true);
            if (this._hasTransformChangedListener)
                this.event(Event.TRANSFORM_CHANGED, this._getTransformChangeFlag());
        }
        this._notifySubscribedChildren(3);
    }

    /**
     * @internal 订阅剪枝派发:只深入"自身有监听 或 子树含监听 或 非本类/未绑定(保守全递归)"
     * 的子分支。mode 对齐基类的子级传播形态:0=Position,1=PositionRotation,2=PositionScale,3=All。
     * 子节点若为绑定实体,进入其覆写版继续剪枝;若为降级/非实体,进入基类全递归(保守正确)。
     */
    private _notifySubscribedChildren(mode: number): void {
        if (this._subtreeListenerTotal <= 0) return;
        const cs = this._children;
        for (let i = 0, n = cs.length; i < n; i++) {
            const c: any = cs[i];
            if (!(c instanceof LayaXTransform3D) || !c._viewsBound
                || c._hasTransformChangedListener || c._subtreeListenerTotal > 0) {
                switch (mode) {
                    case 0: c._onWorldPositionTransform(); break;
                    case 1: c._onWorldPositionRotationTransform(); break;
                    case 2: c._onWorldPositionScaleTransform(); break;
                    default: c._onWorldTransform(); break;
                }
            }
        }
    }

    // ---- local→自己 slot 落库（零拷贝直写 + 标自己 dirty bit；未绑定经 C++ 推）----

    private _pushLocalPos(): void {
        this._writeGen++;
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
        this._writeGen++;
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
        this._writeGen++;
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
        // 订阅计数迁移:重挂带走的是整棵子树的订阅总量(只迁移监听者本人是错的——
        // 中间节点重挂会带走含订阅者的子树)。须在 super 改链前按旧链减、按新链加。
        const delta = this._subtreeListenerTotal + (this._hasTransformChangedListener ? 1 : 0);
        if (delta > 0 && this._parent !== value) {
            let p: any = this._parent;
            while (p) {
                if (p._subtreeListenerTotal !== undefined) p._subtreeListenerTotal -= delta;
                p = p._parent;
            }
            let q: any = value;
            while (q) {
                if (q._subtreeListenerTotal !== undefined) q._subtreeListenerTotal += delta;
                q = q._parent;
            }
        }
        super._setParent(value);
        this._nativeObj.setParent(value ? (value as any)._nativeObj : null);
        this._writeGen++; // 链形状变化,等价于一次写
        // setParent 触发 archetype 迁移(ffi 内 re-mark dirty),行可能搬家:bump 结构代数
        LayaXTransform3D._structGen++;
    }
}
