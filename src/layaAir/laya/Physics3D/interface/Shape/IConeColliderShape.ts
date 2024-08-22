import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for cone collider shape.
 * @zh 锥体碰撞器的接口。
 */
export interface IConeColliderShape extends IColliderShape {
    /**
     * @en Set radius of the cone.
     * @param radius The radius of the cone base
     * @zh 设置锥体的半径。
     * @param radius 锥体底部的半径
     */
    setRadius(radius: number): void;

    /**
     * @en Set height of the cone.
     * @param height The height of the cone
     * @zh 设置锥体的高度。
     * @param height 锥体的高度
     */
    setHeight(height: number): void;

    /**
     * @en Set up axis of the cone.
     * @param upAxis The up axis of the cone
     * @zh 设置锥体的朝上轴。
     * @param upAxis 锥体的朝上轴
     */
    setUpAxis(upAxis: number): void;
}