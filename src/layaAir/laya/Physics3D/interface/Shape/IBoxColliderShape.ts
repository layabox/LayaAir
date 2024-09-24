import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for box collider shape.
 * @zh 盒形碰撞器的接口。
 */
export interface IBoxColliderShape extends IColliderShape {
    /**
     * @en Set size of Box Shape.
     * @param size The size of the box
     * @zh 设置盒子形状的大小。
     * @param size 盒子的大小
     */
    setSize(size: Vector3): void;
}