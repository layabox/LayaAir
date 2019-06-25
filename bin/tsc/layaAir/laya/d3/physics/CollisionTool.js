import { ContactPoint } from "././ContactPoint";
import { HitResult } from "././HitResult";
import { Collision } from "./Collision";
/**
 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
 */
export class CollisionTool {
    /**
     * 创建一个 <code>CollisionMap</code> 实例。
     */
    constructor() {
        /**@private	*/
        this._hitResultsPoolIndex = 0;
        /**@private	*/
        this._hitResultsPool = [];
        /**@private	*/
        this._contactPonintsPoolIndex = 0;
        /**@private	*/
        this._contactPointsPool = [];
        /**@private */
        this._collisionsPool = [];
        /**@private */
        this._collisions = {};
    }
    /**
     * @private
     */
    getHitResult() {
        var hitResult = this._hitResultsPool[this._hitResultsPoolIndex++];
        if (!hitResult) {
            hitResult = new HitResult();
            this._hitResultsPool.push(hitResult);
        }
        return hitResult;
    }
    /**
     * @private
     */
    recoverAllHitResultsPool() {
        this._hitResultsPoolIndex = 0;
    }
    /**
     * @private
     */
    getContactPoints() {
        var contactPoint = this._contactPointsPool[this._contactPonintsPoolIndex++];
        if (!contactPoint) {
            contactPoint = new ContactPoint();
            this._contactPointsPool.push(contactPoint);
        }
        return contactPoint;
    }
    /**
     * @private
     */
    recoverAllContactPointsPool() {
        this._contactPonintsPoolIndex = 0;
    }
    /**
     * @private
     */
    getCollision(physicComponentA, physicComponentB) {
        var collision;
        var idA = physicComponentA.id;
        var idB = physicComponentB.id;
        var subCollisionFirst = this._collisions[idA];
        if (subCollisionFirst)
            collision = subCollisionFirst[idB];
        if (!collision) {
            if (!subCollisionFirst) {
                subCollisionFirst = {};
                this._collisions[idA] = subCollisionFirst;
            }
            collision = this._collisionsPool.length === 0 ? new Collision() : this._collisionsPool.pop();
            collision._colliderA = physicComponentA;
            collision._colliderB = physicComponentB;
            subCollisionFirst[idB] = collision;
        }
        return collision;
    }
    /**
     * @private
     */
    recoverCollision(collision) {
        var idA = collision._colliderA.id;
        var idB = collision._colliderB.id;
        this._collisions[idA][idB] = null;
        this._collisionsPool.push(collision);
    }
    /**
     * @private
     */
    garbageCollection() {
        this._hitResultsPoolIndex = 0;
        this._hitResultsPool.length = 0;
        this._contactPonintsPoolIndex = 0;
        this._contactPointsPool.length = 0;
        this._collisionsPool.length = 0;
        for (var subCollisionsKey in this._collisionsPool) {
            var subCollisions = this._collisionsPool[subCollisionsKey];
            var wholeDelete = true;
            for (var collisionKey in subCollisions) {
                if (subCollisions[collisionKey])
                    wholeDelete = false;
                else
                    delete subCollisions[collisionKey];
            }
            if (wholeDelete)
                delete this._collisionsPool[subCollisionsKey];
        }
    }
}
