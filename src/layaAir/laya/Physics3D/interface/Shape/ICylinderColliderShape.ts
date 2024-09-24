import { IColliderShape } from "./IColliderShape";

/**
 * @en Interface for cylinder collider shape.
 * @zh 圆柱体碰撞器的接口。
 */
export interface ICylinderColliderShape extends IColliderShape {
    /**
     * @en Set radius of the cylinder.
     * @param radius The radius of the cylinder base
     * @zh 设置圆柱体的半径。
     * @param radius 圆柱体底面的半径
     */
    setRadius(radius: number): void;

    /**
     * @en Set height of the cylinder.
     * @param height The height of the cylinder
     * @zh 设置圆柱体的高度。
     * @param height 圆柱体的高度
     */
    setHeight(height: number): void;

    /**
     * @en Set up axis of the cylinder.
     * @param upAxis The up axis of the cylinder
     * @zh 设置圆柱体的朝上轴。
     * @param upAxis 圆柱体的朝上轴
     */
    setUpAxis(upAxis: number): void;
}