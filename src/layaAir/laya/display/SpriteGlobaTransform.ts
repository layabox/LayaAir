import { ILaya } from "../../ILaya";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Stat } from "../utils/Stat";
import { Sprite } from "./Sprite";
import { SpriteConst, TransformKind } from "./SpriteConst";
import { Transform2DStore } from "./transform2d/Transform2DStore";
import { SlotConst } from "./transform2d/Transform2DLayout";

/**
 * @en Facade over {@link Transform2DStore}: exposes the legacy global-transform API while the
 * actual world matrix is computed by the SoA store. local 值仍存在 Sprite 上(写穿到 store)。
 * @zh {@link Transform2DStore} 的门面：对外保持原有全局变换 API 不变，世界矩阵的计算与传播
 * 改由 SoA store 负责(写入只标脏、帧末统一 mark/sweep)。local 值仍存在 Sprite 上并写穿到 store。
 */
export class SpriteGlobalTransform {
    private _sp: Sprite;
    private _matrix: Matrix;
    private _cache: boolean;

    /**
     * @internal
     * @zh 本节点在 Transform2DStore(SoA) 中的 slot 下标(worldMatrix/globalAlpha/culling 透传数据句柄)。
     * 由本组件持有：构造时 alloc、destroy 时 free；渲染底层经 struct.transSlot 拿到同一个值。
     */
    slot: number = SlotConst.None;

    /** @internal */
    _modifiedFrame: number = 0;

    /** @internal Whether a {@link SpriteGlobalTransform.CHANGED} listener has ever been registered. */
    _hasChangedListener: boolean = false;
    /**
     * @en An event constant for when the global transformation information changes.
     * @zh 全局变换信息发生改变时的事件常量。
     */
    static readonly CHANGED = "globalTransChanged";

    constructor(sp: Sprite) {
        this._sp = sp;
        this._cache = true;
        const store = Transform2DStore.instance;
        this.slot = store.alloc();
        store.setOwner(this.slot, sp);
        this._notifyRenderSpriteTransChange();
    }

    /**
     * @en Whether the global transformation information is cached.
     * @zh 是否缓存了全局变换信息。
     */
    get cache() {
        return this._cache;
    }

    set cache(value: boolean) {
        this._cache = value;
    }

    /**
     * @en Get the global matrix of the sprite.
     * @zh 获取精灵的全局矩阵。
     */
    getMatrix(): Matrix {
        const m = this._matrix || (this._matrix = new Matrix());
        const store = Transform2DStore.instance;
        const slot = this.slot;
        // 帧中该通道仍有未结账写入 → 慢路径沿父链现算；否则直读 store world(已结账)。
        if (store.dirtyM)
            store.computeWorldMatrix(slot, _m6);
        else
            store.readWorldMatrix(slot, _m6);
        m.a = _m6[0]; m.b = _m6[1]; m.c = _m6[2]; m.d = _m6[3]; m.tx = _m6[4]; m.ty = _m6[5];
        m._checkTransform();
        return m;
    }

    /**
     * @en return the invert Matrix of the sprite.
     * @zh 返回逆矩阵
     */
    getMatrixInv(out: Matrix): Matrix {
        this.getMatrix().copyTo(out);
        out.invert();
        return out;
    }

    /**
     * @en The X-axis position in global coordinates.
     * @zh 全局坐标中的 X 轴位置。
     */
    get x(): number {
        return this.getPos(tmpPoint).x;
    }

    /**
     * @en The Y-axis position in global coordinates.
     * @zh 全局坐标中的 Y 轴位置。
     */
    get y(): number {
        return this.getPos(tmpPoint).y;
    }

    /**
     * 获取基于Scene的变换矩阵
     * @param out
     */
    getSceneMatrix(out: Matrix) {
        if (!this._sp.scene)
            return this.getMatrix();

        this._sp.scene.globalTrans.getMatrixInv(tmpMarix).copyTo(out);
        Matrix.mul(this.getMatrix(), out, out);
        return out;
    }

    /**
     * @en get the scene position of the node.
     * @zh 获取节点对象在相应scene坐标系中的位置。
     * @param out
     */
    getScenePos(out: Point) {
        if (!this._sp.scene)
            return this.getPos(out);
        return this._sp.scene.globalTrans.getMatrixInv(tmpMarix).transformPoint(this.getPos(out));
    }

    /**
     * @en get the scene scale of the node.
     * @zh 获取节点对象在相应scene坐标系中的放缩值。
     * @param out
     */
    getSceneScale(out: Point) {
        out.x = this.scaleX;
        out.y = this.scaleY;
        if (this._sp.scene) {
            const mat = this._sp.scene.globalTrans.getMatrix();
            out.x /= mat.getScaleX();
            out.y /= mat.getScaleY();
        }
        return out;
    }

    /**
     * @en get the scene rotation of the node.
     * @zh 获取节点对象在相应scene坐标系中的旋转值。
     */
    getSceneRotation() {
        let angle = this.rotation;
        if (this._sp.scene)
            angle -= this._sp.scene.globalTrans.rotation;
        return angle;
    }

    /**
     * @en get the global position of the node.
     * @zh 获取节点对象在全局坐标系中的位置。
     * @param out
     */
    getPos(out: Point): Point {
        if (this._cache) {
            return this.getMatrix().transformPoint(out.setTo(this._sp.pivotX, this._sp.pivotY));
        } else {
            this._sp.localToGlobal(out.setTo(0, 0), false, null);
            return out;
        }
    }

    /**
     * @en Sets the global position of the node.
     * @zh 设置节点对象在全局坐标系中的位置。
     */
    setPos(x: number, y: number) {
        let sp = this._sp;
        if (this._cache && sp._parent instanceof Sprite) {
            let point = sp._parent.globalTrans.getMatrix().invertTransformPoint(tmpPoint.setTo(x, y));
            sp.pos(point.x, point.y);
        }
        else {
            tmpPoint.setTo(x, y);
            let point = sp.globalToLocal(tmpPoint, false, null);
            point = sp.toParentPoint(point);
            sp.pos(point.x, point.y);
        }
    }

    /**
     * @en global rotation value relative to the stage (this value includes the rotation of parent nodes).
     * @zh 相对于stage的全局旋转值（会叠加父亲节点的旋转值）。
     */
    get rotation(): number {
        let sp = this._sp;
        if (!sp._parent || sp._parent === sp._scene)
            return sp._rotation;
        return sp._rotation + (sp._parent as Sprite).globalTrans.rotation;
    }

    set rotation(value: number) {
        if (value == this.rotation)
            return;
        let sp = this._sp;
        if (!sp._parent || sp._parent === sp._scene) {
            sp.rotation = value;
        } else {
            sp.rotation = value - (sp._parent as Sprite).globalTrans.rotation;
        }
    }

    /**
     * @en Gets the global X-axis scale relative to the stage.
     * @zh 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     */
    get scaleX(): number {
        return this.getMatrix().getScaleX();
    }

    /**
     * @en Gets the global Y-axis scale relative to the stage.
     * @zh 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     */
    get scaleY(): number {
        return this.getMatrix().getScaleY();
    }

    /**
     * @en The global (cascaded) alpha, read directly from Transform2DStore by slot (no extra layer).
     * @zh 全局(级联) alpha，按 slot 直读 Transform2DStore(不再经中间层)。本帧 alpha 未结账时走慢路径现算。
     */
    get globalAlpha(): number {
        const store = Transform2DStore.instance;
        const slot = this.slot;
        return store.dirtyA ? store.computeWorldAlpha(slot) : store.getWorldAlpha(slot);
    }

    /**
     * @en The reciprocal of globalAlpha (1/globalAlpha), analogous to the inverse matrix.
     * @zh globalAlpha 的倒数(1/globalAlpha)，与逆矩阵类比。用于缓存子树(cacheAs/RT)按 cache 根隔离 alpha：
     * 内容 alpha = 自身 globalAlpha × cache根.invertGlobalAlpha，合成时再施加 cache根 globalAlpha。
     */
    get invertGlobalAlpha(): number {
        const a = this.globalAlpha;
        return a > 1e-6 ? 1 / a : 0;
    }

    /**
     * @internal
     * @en Adds the sprite to the stage's per-frame transform update list so its render struct refreshes.
     * @zh 把精灵加入舞台每帧的变换更新列表，使其渲染结构(renderMatrix 等)刷新。
     */
    _notifyRenderSpriteTransChange() {
        if ((this._sp._renderType & SpriteConst.UPDATETRANS)) {
            ILaya.stage._tranMatrixUpdateList.add(this._sp);
            this._modifiedFrame = Stat.loopCount;
        }
    }

    /**
     * @internal
     * @en Notify that the sprite's local transform changed: push the current local TRS into the store
     * (marks the Matrix channel dirty). 子树的世界矩阵由帧末 store.update() 的 mark/sweep 统一传播。
     * @zh 通知本节点 local 变换已改变：把当前 local TRS 写入 store(标 Matrix 通道脏)。
     * 子树世界矩阵由帧末 store.update() 的 mark/sweep 统一传播，不再在此递归。
     * @param kind 变化类型(保留以兼容调用方；所有到达此处的变化都影响矩阵，统一写全部 TRS)
     */
    _spTransChanged(kind: TransformKind) {
        const sp = this._sp;
        Transform2DStore.instance.writeTRSAll(
            this.slot,
            sp._x, sp._y, sp._scaleX, sp._scaleY,
            sp._rotation, sp._skewX, sp._skewY, sp._pivotX, sp._pivotY,
        );
        // 直接节点入更新列表(与旧行为对齐)：bump modifiedFrame、刷新 struct.renderMatrix。
        // 即便本次 world 未变(如 setClipRect/dcOptimize 调用)，也需让 _updateStruct 跑一次刷新 clip 等。
        // 子孙节点由 Stage 帧末 flush(按 store.changedSlots)补充加入，Set 去重。
        this._notifyRenderSpriteTransChange();
    }

    /**
     * @en Convert the point to the global coordinate system.
     * @zh 转换点坐标到全局坐标系。
     */
    localToGlobal(x: number, y: number): Readonly<Point> {
        if (this._cache) {
            return this.getMatrix().transformPoint(tmpPoint.setTo(this._sp.pivotX + x, this._sp.pivotY + y));
        } else {
            return this._sp.localToGlobal(tmpPoint.setTo(x, y));
        }
    }

    /**
     * @en Convert the point to the local coordinate system.
     * @zh 转换点坐标到本地坐标系。
     */
    globalToLocal(x: number, y: number): Readonly<Point> {
        if (this._cache) {
            let point = this.getMatrix().invertTransformPoint(tmpPoint.setTo(x, y));
            point.x -= this._sp.pivotX;
            point.y -= this._sp.pivotY;
            return point;
        } else {
            return this._sp.globalToLocal(tmpPoint.setTo(x, y));
        }
    }

    /**
     * @internal
     */
    destroy(): void {
        if (this.slot !== SlotConst.None) {
            Transform2DStore.instance.free(this.slot);
            this.slot = SlotConst.None;
        }
        this._sp = null;
        this._matrix = null;
    }
}

const tmpPoint = new Point();
const tmpMarix = new Matrix();
const _m6 = new Float32Array(6);
