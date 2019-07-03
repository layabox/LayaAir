import { ColliderShape } from "./ColliderShape";
import { Physics } from "../Physics";
/**
 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
 */
export class StaticPlaneColliderShape extends ColliderShape {
    /**
     * @internal
     */
    static __init__() {
        StaticPlaneColliderShape._nativeNormal = new Physics._physics3D.btVector3(0, 0, 0);
    }
    /**
     * 创建一个新的 <code>StaticPlaneColliderShape</code> 实例。
     */
    constructor(normal, offset) {
        super();
        this._normal = normal;
        this._offset = offset;
        this._type = ColliderShape.SHAPETYPES_STATICPLANE;
        StaticPlaneColliderShape._nativeNormal.setValue(-normal.x, normal.y, normal.z);
        this._nativeShape = new Physics._physics3D.btStaticPlaneShape(StaticPlaneColliderShape._nativeNormal, offset);
    }
    /**
     * @inheritDoc
     */
    /*override*/ clone() {
        var dest = new StaticPlaneColliderShape(this._normal, this._offset);
        this.cloneTo(dest);
        return dest;
    }
}
