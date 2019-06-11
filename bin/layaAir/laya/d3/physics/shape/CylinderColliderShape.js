import { Physics } from "../Physics";
import { ColliderShape } from "././ColliderShape";
/**
 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
 */
export class CylinderColliderShape extends ColliderShape {
    /**
     * 创建一个新的 <code>CylinderColliderShape</code> 实例。
     * @param height 高。
     * @param radius 半径。
     */
    constructor(radius = 0.5, height = 1.0, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /**@private */
        this._radius = 1;
        /**@private */
        this._height = 0.5;
        this._radius = radius;
        this._height = height;
        this._orientation = orientation;
        this._type = ColliderShape.SHAPETYPES_CYLINDER;
        switch (orientation) {
            case ColliderShape.SHAPEORIENTATION_UPX:
                CylinderColliderShape._nativeSize.setValue(height / 2, radius, radius);
                this._nativeShape = new Physics._physics3D.btCylinderShapeX(CylinderColliderShape._nativeSize);
                break;
            case ColliderShape.SHAPEORIENTATION_UPY:
                CylinderColliderShape._nativeSize.setValue(radius, height / 2, radius);
                this._nativeShape = new Physics._physics3D.btCylinderShape(CylinderColliderShape._nativeSize);
                break;
            case ColliderShape.SHAPEORIENTATION_UPZ:
                CylinderColliderShape._nativeSize.setValue(radius, radius, height / 2);
                this._nativeShape = new Physics._physics3D.btCylinderShapeZ(CylinderColliderShape._nativeSize);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }
    /**
* @private
*/
    static __init__() {
        CylinderColliderShape._nativeSize = new Physics._physics3D.btVector3(0, 0, 0);
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
        var dest = new CylinderColliderShape(this._radius, this._height, this._orientation);
        this.cloneTo(dest);
        return dest;
    }
}
