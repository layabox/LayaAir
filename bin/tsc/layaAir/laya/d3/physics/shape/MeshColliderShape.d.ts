import { Vector3 } from "../../math/Vector3";
import { Mesh } from "../../resource/models/Mesh";
import { ColliderShape } from "././ColliderShape";
/**
 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
 */
export declare class MeshColliderShape extends ColliderShape {
    /**@private */
    private _mesh;
    /**@private */
    private _convex;
    /**
     * 获取网格。
     * @return 网格。
     */
    /**
    * 设置网格。
    * @param 网格。
    */
    mesh: Mesh;
    /**
     * 获取是否使用凸多边形。
     * @return 是否使用凸多边形。
     */
    /**
    * 设置是否使用凸多边形。
    * @param value 是否使用凸多边形。
    */
    convex: boolean;
    /**
     * 创建一个新的 <code>MeshColliderShape</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    _setScale(value: Vector3): void;
    /**
     * @inheritDoc
     */
    cloneTo(destObject: any): void;
    /**
     * @inheritDoc
     */
    clone(): any;
    /**
     * @inheritDoc
     */
    destroy(): void;
}
