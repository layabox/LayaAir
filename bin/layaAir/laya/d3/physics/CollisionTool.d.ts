import { HitResult } from "././HitResult";
import { ContactPoint } from "././ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent";
import { Collision } from "./Collision";
/**
 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
 */
export declare class CollisionTool {
    /**@private	*/
    private _hitResultsPoolIndex;
    /**@private	*/
    private _hitResultsPool;
    /**@private	*/
    private _contactPonintsPoolIndex;
    /**@private	*/
    private _contactPointsPool;
    /**@private */
    private _collisionsPool;
    /**@private */
    private _collisions;
    /**
     * 创建一个 <code>CollisionMap</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    getHitResult(): HitResult;
    /**
     * @private
     */
    recoverAllHitResultsPool(): void;
    /**
     * @private
     */
    getContactPoints(): ContactPoint;
    /**
     * @private
     */
    recoverAllContactPointsPool(): void;
    /**
     * @private
     */
    getCollision(physicComponentA: PhysicsComponent, physicComponentB: PhysicsComponent): Collision;
    /**
     * @private
     */
    recoverCollision(collision: Collision): void;
    /**
     * @private
     */
    garbageCollection(): void;
}
