import { CannonContactPoint } from "./CannonContactPoint";
import { CannonHitResult } from "./CannonHitResult";
import { CannonCollision } from "./CannonCollision";
import { CannonPhysicsComponent } from "./CannonPhysicsComponent";

/**
 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
 */
export class CannonCollisionTool {
	/**@internal	*/
	private _hitResultsPoolIndex: number = 0;
	/**@internal	*/
	private _hitResultsPool: CannonHitResult[] = [];
	/**@internal	*/
	private _contactPonintsPoolIndex: number = 0;
	/**@internal	*/
	private _contactPointsPool: CannonContactPoint[] = [];
	/**@internal */
	private _collisionsPool: CannonCollision[] = [];

	/**@internal */
	private _collisions: any = {};

	/**
	 * 创建一个 <code>CollisionMap</code> 实例。
	 */
	constructor() {

	}

	/**
	 * @internal
	 */
	getHitResult(): CannonHitResult {
		var hitResult: CannonHitResult = this._hitResultsPool[this._hitResultsPoolIndex++];
		if (!hitResult) {
			hitResult = new CannonHitResult();
			this._hitResultsPool.push(hitResult);
		}
		return hitResult;
	}

	/**
	 * @internal
	 */
	recoverAllHitResultsPool(): void {
		this._hitResultsPoolIndex = 0;
	}

	/**
	 * @internal
	 */
	getContactPoints(): CannonContactPoint {
		var contactPoint: CannonContactPoint = this._contactPointsPool[this._contactPonintsPoolIndex++];
		if (!contactPoint) {
			contactPoint = new CannonContactPoint();
			this._contactPointsPool.push(contactPoint);
		}
		return contactPoint;
	}

	/**
	 * @internal
	 */
	recoverAllContactPointsPool(): void {
		this._contactPonintsPoolIndex = 0;
	}

	/**
	 * @internal
	 */
	getCollision(physicComponentA: CannonPhysicsComponent, physicComponentB: CannonPhysicsComponent): CannonCollision {
		var collision: CannonCollision;
		var idA: number = physicComponentA.id;
		var idB: number = physicComponentB.id;
		var subCollisionFirst: any = this._collisions[idA];
		if (subCollisionFirst)
			collision = subCollisionFirst[idB];
		if (!collision) {
			if (!subCollisionFirst) {
				subCollisionFirst = {};
				this._collisions[idA] = subCollisionFirst;
			}
			collision = this._collisionsPool.length === 0 ? new CannonCollision() : this._collisionsPool.pop();
			collision._colliderA = physicComponentA;
			collision._colliderB = physicComponentB;
			subCollisionFirst[idB] = collision;
		}
		return collision;
	}

	/**
	 * @internal
	 */
	recoverCollision(collision: CannonCollision): void {
		var idA: number = collision._colliderA.id;
		var idB: number = collision._colliderB.id;
		this._collisions[idA][idB] = null;
		this._collisionsPool.push(collision);
	}

	/**
	 * @internal
	 */
	garbageCollection(): void {//TODO:哪里调用
		this._hitResultsPoolIndex = 0;
		this._hitResultsPool.length = 0;

		this._contactPonintsPoolIndex = 0;
		this._contactPointsPool.length = 0;

		this._collisionsPool.length = 0;
		for (var subCollisionsKey in this._collisionsPool) {
			var subCollisions: any = this._collisionsPool[subCollisionsKey];
			var wholeDelete: boolean = true;
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


