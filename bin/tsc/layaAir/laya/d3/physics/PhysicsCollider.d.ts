import { PhysicsTriggerComponent } from "./PhysicsTriggerComponent";
/**
 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
 */
export declare class PhysicsCollider extends PhysicsTriggerComponent {
    /**
     * 创建一个 <code>PhysicsCollider</code> 实例。
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
    constructor(collisionGroup?: number, canCollideWith?: number);
    /**
     * @inheritDoc
     */
    _addToSimulation(): void;
    /**
     * @inheritDoc
     */
    _removeFromSimulation(): void;
    /**
     * @inheritDoc
     */
    _onTransformChanged(flag: number): void;
    /**
     * @inheritDoc
     */
    _parse(data: any): void;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
}
