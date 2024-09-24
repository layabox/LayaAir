import { IColliderShape } from "./Shape/IColliderShape";
import { Node } from "../../display/Node";
import { PhysicsColliderComponent, PhysicsCombineMode } from "../../d3/physics/PhysicsColliderComponent";

/**
 * @en Interface for collider.
 * @zh 碰撞器的接口。
 */
export interface ICollider {
    /**
     * @en The owner node of the collider.
     * @zh 碰撞器所属的节点。
     */
    owner: Node;
    /**
     * @en Indicates whether the collider can be enabled. It's true only when placed in the scene and the physics component is effective.
     * @zh 是否可以启用，只有放入scene中且物理组件生效才会为true。
     */
    active:boolean;
    /**
     * @en Index in the physics update list.
     * @zh 在物理更新列表中的索引。
     */
    inPhysicUpdateListIndex: number;
    /**
     * @internal
     * @en Indicates whether the component is enabled.
     * @zh 指示组件是否启用。
     */
    componentEnable: boolean;

    /**
     * @en The physics collider component associated with this collider.
     * @zh 与此碰撞器关联的物理碰撞器组件。
     */
    component: PhysicsColliderComponent;

    /**
     * @en Get the capability of the collider.
     * @param value The capability value to check.
     * @zh 获取碰撞器的能力。
     * @param value 要检查的能力值。
     */
    getCapable(value: number): boolean;

    /**
     * @en Set the collider shape.
     * @param shape The collider shape to set.
     * @zh 设置碰撞器形状。
     * @param shape 要设置的碰撞器形状。
     */
    setColliderShape(shape: IColliderShape): void;

    /**
     * @en Destroy the collider.
     * @zh 销毁碰撞器。
     */
    destroy(): void;

    /**
     * @en Set the collision group of the collider.
     * @param value The collision group value.
     * @zh 设置碰撞器的碰撞组。
     * @param value 碰撞组的值。
     */
    setCollisionGroup(value: number): void;

    /**
     * @en Set the groups that this collider can collide with.
     * @param value The collision mask value.
     * @zh 设置此碰撞器可以与之碰撞的组。
     * @param value 碰撞掩码的值。
     */
    setCanCollideWith(value: number): void;

    /**
     * @en Set the owner node of the collider.
     * @param node The owner node to set.
     * @zh 设置碰撞器的所有者节点。
     * @param node 要设置的所有者节点。
     */
    setOwner(node: Node): void;

    /**
     * @en Handle transform changes of the collider.
     * @param flag The transform change flag.
     * @zh 处理碰撞器的变换改变。
     * @param flag 变换改变标志。
     */
    transformChanged(flag: number): void;

    /**
     * @en Set the bounciness of the collider.
     * @param value The bounciness value.
     * @zh 设置碰撞器的弹性。
     * @param value 弹性值。
     */
    setBounciness?(value: number): void;

    /**
     * @en Set the friction of the collider.
     * @param value The friction value.
     * @zh 设置碰撞器的摩擦力。
     * @param value 摩擦力值。
     */
    setfriction?(value: number): void;

    /**
     * @en Set the rolling friction of the collider.
     * @param value The rolling friction value.
     * @zh 设置碰撞器的滚动摩擦力。
     * @param value 滚动摩擦力值。
     */
    setRollingFriction?(value: number): void;

    /**
     * @en Set the dynamic friction of the collider.
     * @param value The dynamic friction value.
     * @zh 设置碰撞器的动态摩擦力。
     * @param value 动态摩擦力值。
     */
    setDynamicFriction?(value: number): void;

    /**
     * @en Set the static friction of the collider.
     * @param value The static friction value.
     * @zh 设置碰撞器的静态摩擦力。
     * @param value 静态摩擦力值。
     */
    setStaticFriction?(value: number): void;

    /**
     * @en Set the friction combine mode of the collider.
     * @param value The friction combine mode.
     * @zh 设置碰撞器的摩擦力合并模式。
     * @param value 摩擦力合并模式。
     */
    setFrictionCombine?(value: PhysicsCombineMode): void;

    /**
     * @en Set the bounce combine mode of the collider.
     * @param value The bounce combine mode.
     * @zh 设置碰撞器的弹性合并模式。
     * @param value 弹性合并模式。
     */
    setBounceCombine?(value: PhysicsCombineMode): void;

    /**
     * @en Set the event filter for the collider.
     * @param events An array of event names to filter.
     * @zh 设置碰撞器的事件过滤器。
     * @param events 要过滤的事件数组。
     */
    setEventFilter?(events: string[]): void;
}