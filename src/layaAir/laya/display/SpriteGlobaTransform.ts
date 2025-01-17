import { ILaya } from "../../ILaya";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Sprite } from "./Sprite";
import { TransformKind } from "./SpriteConst";

export class SpriteGlobalTransform {
    private _sp: Sprite;
    private _flags: number = 0;
    private _x: number = 0.0;
    private _y: number = 0.0;
    private _rot: number = 0.0;
    private _scaleX: number = 1.0;
    private _scaleY: number = 1.0;
    private _matrix: Matrix;
    private _cache = false;

    /**
     * @zh An event constant for when the global transformation information changes.
     * @zh 全局变换信息发生改变时的事件常量。
     */
    static CHANGED = "globalTransChanged";

    constructor(sp: Sprite) {
        this._sp = sp;
    }

    /**
     * @en Whether the global transformation information is cached.
     * @zh 是否缓存了全局变换信息。
     */
    get cache() {
        return this._cache;
    }

    set cache(value: boolean) {
        if (this._cache != value) {
            this._cache = value;
            if (value) {
                //缓存全局变量
                this._setFlag(TransformKind.Matrix | TransformKind.TRS, true);
                //更新父节点
                let parent = this._sp._parent;
                if (parent != null && parent != ILaya.stage)
                    parent.globalTrans.cache = true;
            } else {
                //更新子节点
                for (let child of this._sp._children) {
                    if (child._globalTrans)
                        child._globalTrans.cache = false;
                }
            }
        }
    }

    /**
     * @en Get the global matrix of the sprite.
     * @returns The global transformation matrix of the sprite.
     * @zh 获取精灵的全局矩阵。
     * @returns 精灵的全局变换矩阵。
     */
    getMatrix() {
        if (this._matrix == null) this._matrix = new Matrix();
        //if (this.scene == null) { return this._globalMatrix; }
        if (this._cache && !this._getFlag(TransformKind.Matrix))
            return this._matrix;

        let sp = this._sp;
        this._matrix.setMatrix(sp._x, sp._y, sp._scaleX, sp._scaleY, sp._rotation, sp._skewX, sp._skewY, sp._pivotX, sp._pivotY);
        if (sp._parent) {
            Matrix.mul(this._matrix, sp._parent.globalTrans.getMatrix(), this._matrix);
            this._setFlag(TransformKind.Matrix, false);
            this._syncFlag(TransformKind.Matrix, true);
        }

        return this._matrix;
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

        this._sp.scene.globalTrans.getMatrix().invert().copyTo(out);
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
            this._cachePos();
            out.x = this._x;
            out.y = this._y;
        }
        else {
            this._sp.localToGlobal(out.setTo(0, 0), false, null);
        }
        return out;
    }

    /**
     * @en Sets the global position of the node.
     * @param x The global X position.
     * @param y The global Y position.
     * @zh 设置节点对象在全局坐标系中的位置。
     * @param x 全局X位置。
     * @param y 全局Y位置。
     */
    setPos(x: number, y: number) {
        let sp = this._sp;
        if (this._cache) {
            this._cachePos();
            if (x == this._x && y == this._y)
                return;

            let point = sp._parent.globalTrans.getMatrix().invertTransformPoint(tmpPoint.setTo(x, y));
            this._cache = false; //临时取消标志，避免死循环
            sp.pos(point.x, point.y);
            this._cache = true;

            this._x = x;
            this._y = y;
            this._setFlag(TransformKind.Pos, false);
            this._setFlag(TransformKind.Matrix, true);
            this._syncFlag(TransformKind.Pos | TransformKind.Matrix, true);
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
        if (this._cache) {
            if (this._getFlag(TransformKind.Rotation)) {
                this._setFlag(TransformKind.Rotation, false);
                if (sp._parent == sp._scene || !sp._parent)
                    this._rot = sp._rotation;
                else
                    this._rot = sp._rotation + sp._parent.globalTrans.rotation;
            }
            return this._rot;
        }
        else {
            //循环算法
            let angle: number = 0;
            let ele: Sprite = sp;
            while (ele) {
                if (ele === sp._scene) break;
                angle += ele._rotation;
                ele = ele._parent;
            }
            return angle;
        }
    }

    set rotation(value: number) {
        if (value == this.rotation) {
            return;
        }
        //set local
        let sp = this._sp;
        if (sp._parent == sp._scene || !sp._parent) {
            sp.rotation = value;
        } else {
            sp.rotation = value - sp._parent.globalTrans.rotation;
        }
        if (this._cache) {
            this._rot = value;
            this._setFlag(TransformKind.Rotation, false);
            this._setFlag(TransformKind.Matrix, true);
            this._syncFlag(TransformKind.Matrix, true);
        }
    }

    /**
     * @en Gets the global X-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global X-axis scale.
     * @zh 获得相对于stage的全局X轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局X轴缩放值。
     */
    get scaleX(): number {
        if (this._cache) {
            this._cacheScale();
            return this._scaleX;
        }
        else {
            let scale: number = 1;
            let ele: Sprite = this._sp;
            while (ele) {
                if (ele === ILaya.stage) break;
                scale *= ele._scaleX;
                ele = ele._parent;
            }
            return scale;
        }
    }

    /**
     * @en Gets the global Y-axis scale relative to the stage (this value includes the scaling of parent nodes).
     * @returns The global Y-axis scale.
     * @zh 获得相对于stage的全局Y轴缩放值（会叠加父亲节点的缩放值）。
     * @returns 全局Y轴缩放值。
     */
    get scaleY(): number {
        if (this._cache) {
            this._cacheScale();
            return this._scaleY;
        }
        else {
            let scale: number = 1;
            let ele: Sprite = this._sp;
            while (ele) {
                if (ele === ILaya.stage) break;
                scale *= ele._scaleY;
                ele = ele._parent;
            }
            return scale;
        }
    }

    private _cachePos() {
        if (this._getFlag(TransformKind.Matrix | TransformKind.Pos)) {
            this._setFlag(TransformKind.Pos, false);
            let p = this.getMatrix().transformPoint(tmpPoint.setTo(this._sp.pivotX, this._sp.pivotY));
            this._x = p.x;
            this._y = p.y;
        }
    }

    private _cacheScale() {
        if (this._getFlag(TransformKind.Matrix | TransformKind.Scale)) {
            this._setFlag(TransformKind.Scale, false);
            let mat = this.getMatrix();
            this._scaleX = mat.getScaleX();
            this._scaleY = mat.getScaleY();
        }
    }

    private _getFlag(type: number): boolean {
        return (this._flags & type) != 0;
    }

    /**
     * @en Sets a global cache flag for a specific type.
     * @param type The type of cache flag to set.
     * @param value Whether to enable the cache flag.
     * @zh 设置特定类型的全局缓存标志。
     * @param type 要设置的缓存标志类型。
     * @param value 是否启用缓存标志。
     */
    private _setFlag(type: number, value: boolean): void {
        if (value)
            this._flags |= type;
        else
            this._flags &= ~type;
        if (value) {
            this._sp.event(SpriteGlobalTransform.CHANGED, type);
        }
    }

    /**
     * @param flag 
     * @param value 
     */
    private _syncFlag(flag: number, value: boolean) {
        if (this._cache) {
            for (let child of this._sp._children) {
                if (child._globalTrans) {
                    child._globalTrans._setFlag(flag, value);
                    child._globalTrans._syncFlag(flag, value);
                }
            }
        }
    }

    /**
     * @internal
     * @param kind
     */
    _spTransChanged(kind: TransformKind) {
        if (this._cache)
            this._setFlag(kind | TransformKind.Matrix, true)
        this._syncFlag(kind | TransformKind.Matrix, true);
    }

    /**
     * @en Convert the point to the global coordinate system.
     * @param x The X-axis position of the point.
     * @param y The Y-axis position of the point.
     * @returns The global position of the point.
     * @zh 转换点坐标到全局坐标系。
     * @param x 点的X轴位置。
     * @param y 点的Y轴位置。
     * @returns 全局坐标的点。
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
     * @param x The X-axis position of the point.
     * @param y The Y-axis position of the point.
     * @returns The local position of the point.
     * @zh 转换点坐标到本地坐标系。
     * @param x 点的X轴位置。
     * @param y 点的Y轴位置。
     * @returns 本地坐标的点。
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
}

const tmpPoint = new Point();
const tmpMarix = new Matrix();