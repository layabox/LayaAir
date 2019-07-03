import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";
/**
 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
 */
export class SphereColliderShape extends ColliderShape {
    /**
     * 获取半径。
     */
    get radius() {
        return this._radius;
    }
    /**
     * 创建一个新的 <code>SphereColliderShape</code> 实例。
     * @param radius 半径。
     */
    constructor(radius = 0.5) {
        super();
        this._radius = radius;
        this._type = ColliderShape.SHAPETYPES_SPHERE;
        this._nativeShape = new Physics3D._physics3D.btSphereShape(radius);
    }
    /**
     * @inheritDoc
     */
    /*override*/ clone() {
        var dest = new SphereColliderShape(this._radius);
        this.cloneTo(dest);
        return dest;
    }
}
