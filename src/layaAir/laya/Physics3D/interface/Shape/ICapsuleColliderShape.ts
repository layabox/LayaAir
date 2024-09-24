import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for capsule collider shape.
 * @zh 胶囊体碰撞器的接口。
 */
export interface ICapsuleColliderShape extends IColliderShape {
    /**
     * @en Set radius of capsule.
     * @param radius The radius of the capsule
     * @zh 设置胶囊体的半径。
     * @param radius 胶囊体的半径
     */
    setRadius(radius: number): void;

    /**
     * @en Set height of capsule.
     * @param height The height of the capsule
     * @zh 设置胶囊体的高度。
     * @param height 胶囊体的高度
     */
    setHeight(height: number): void;

    /**
     * @en Set up axis of capsule.
     * @param upAxis The up axis of the capsule
     * @zh 设置胶囊体的朝上轴。
     * @param upAxis 胶囊体的朝上轴
     */
    setUpAxis(upAxis: number): void;
}