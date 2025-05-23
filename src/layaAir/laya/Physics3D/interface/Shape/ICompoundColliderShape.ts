import { PhysicsColliderComponent } from "../../../d3/physics/PhysicsColliderComponent";
import { IColliderShape } from "./IColliderShape";

/**
 * @en The `ICompoundColliderShape` interface defines the methods for managing compound collider shapes.
 * @zh `ICompoundColliderShape` 接口定义了用于管理组合碰撞器形状的方法。
 */
export interface ICompoundColliderShape extends IColliderShape {

    /**
     * @en Adds a child shape to the compound collider shape.
     * @param shape The child shape to add.
     * @zh 添加一个子形状到组合碰撞器形状。
     * @param shape 要添加的子形状。
     */
    addChildShape(shape: IColliderShape): void;

    /**
     * @en Removes a child shape from the compound collider shape.
     * @param shape The child shape to remove.
     * @param index The index of the child shape to remove.
     * @zh 从组合碰撞器形状中移除一个子形状。
     * @param shape 要移除的子形状。
     * @param index 要移除的子形状的索引。
     */
    removeChildShape(shape: IColliderShape, index: number): void;

    /**
     * @en Sets the data of the shape.
     * @param component The component to set the data.
     * @zh 设置形状的数据。
     * @param component 要设置数据的组件。
     */
    setShapeData?(component: PhysicsColliderComponent): void;
}