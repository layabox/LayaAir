import { ColliderShape } from "././ColliderShape";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
 */
export declare class StaticPlaneColliderShape extends ColliderShape {
    /** @private */
    private static _nativeNormal;
    /**@private */
    _offset: number;
    /**@private */
    _normal: Vector3;
    /**
     * 创建一个新的 <code>StaticPlaneColliderShape</code> 实例。
     */
    constructor(normal: Vector3, offset: number);
    /**
     * @inheritDoc
     */
    clone(): any;
}
