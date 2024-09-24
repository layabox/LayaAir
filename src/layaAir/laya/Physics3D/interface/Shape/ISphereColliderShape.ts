import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for sphere collider shape.
 * @zh 球形碰撞器的接口。
 */
export interface ISphereColliderShape extends IColliderShape {
    /**
     * @en Set the radius of the sphere.
     * @param radius The radius of the sphere
     * @zh 设置球体的半径。
     * @param radius 球体的半径
     */
    setRadius(radius: number): void;
}