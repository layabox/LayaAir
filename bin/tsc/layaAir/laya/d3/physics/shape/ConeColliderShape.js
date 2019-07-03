import { ColliderShape } from "./ColliderShape";
import { Physics } from "../Physics";
/**
 * <code>ConeColliderShape</code> 类用于创建圆柱碰撞器。
 */
export class ConeColliderShape extends ColliderShape {
    /**
     * 创建一个新的 <code>ConeColliderShape</code> 实例。
     * @param height 高。
     * @param radius 半径。
     */
    constructor(radius = 0.5, height = 1.0, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
        super();
        this._radius = 1;
        this._height = 0.5;
        this._radius = radius;
        this._height = height;
        this._orientation = orientation;
        this._type = ColliderShape.SHAPETYPES_CYLINDER;
        switch (orientation) {
            case ColliderShape.SHAPEORIENTATION_UPX:
                this._nativeShape = new Physics._physics3D.btConeShapeX(radius, height);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                this._nativeShape = new Physics._physics3D.btConeShape(radius, height);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                this._nativeShape = new Physics._physics3D.btConeShapeZ(radius, height);
                break;
            default:
                throw "ConeColliderShape:unknown orientation.";
        }
    }
    /**
     * 获取半径。
     */
    get radius() {
        return this._radius;
    }
    /**
     * 获取高度。
     */
    get height() {
        return this._height;
    }
    /**
     * 获取方向。
     */
    get orientation() {
        return this._orientation;
    }
    /**
     * @inheritDoc
     */
    /*override*/ clone() {
        var dest = new ConeColliderShape(this._radius, this._height, this._orientation);
        this.cloneTo(dest);
        return dest;
    }
}
