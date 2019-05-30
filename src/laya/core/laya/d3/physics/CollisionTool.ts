import { HitResult } from "././HitResult";
import { ContactPoint } from "././ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent"
	
	/**
	 * <code>CollisionMap</code> 类用于实现碰撞组合实例图。
	 */
	export class CollisionTool {
		/**@private	*/
		private _hitResultsPoolIndex:number = 0;
		/**@private	*/
		private _hitResultsPool:HitResult[] = [];
		/**@private	*/
		private _contactPonintsPoolIndex:number = 0;
		/**@private	*/
		private _contactPointsPool:ContactPoint[] = [];
		/**@private */
		private _collisionsPool:Collision[] = [];
		
		/**@private */
		private _collisions:any = {};
		
		/**
		 * 创建一个 <code>CollisionMap</code> 实例。
		 */
		constructor(){
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		}
		
		/**
		 * @private
		 */
		 getHitResult():HitResult {
			var hitResult:HitResult = this._hitResultsPool[this._hitResultsPoolIndex++];
			if (!hitResult) {
				hitResult = new HitResult();
				this._hitResultsPool.push(hitResult);
			}
			return hitResult;
		}
		
		/**
		 * @private
		 */
		 recoverAllHitResultsPool():void {
			this._hitResultsPoolIndex = 0;
		}
		
		/**
		 * @private
		 */
		 getContactPoints():ContactPoint {
			var contactPoint:ContactPoint = this._contactPointsPool[this._contactPonintsPoolIndex++];
			if (!contactPoint) {
				contactPoint = new ContactPoint();
				this._contactPointsPool.push(contactPoint);
			}
			return contactPoint;
		}
		
		/**
		 * @private
		 */
		 recoverAllContactPointsPool():void {
			this._contactPonintsPoolIndex = 0;
		}
		
		/**
		 * @private
		 */
		 getCollision(physicComponentA:PhysicsComponent, physicComponentB:PhysicsComponent):Collision {
			var collision:Collision;
			var idA:number = physicComponentA.id;
			var idB:number = physicComponentB.id;
			var subCollisionFirst:any = this._collisions[idA];
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
		 recoverCollision(collision:Collision):void {
			var idA:number = collision._colliderA.id;
			var idB:number = collision._colliderB.id;
			this._collisions[idA][idB] = null;
			this._collisionsPool.push(collision);
		}
		
		/**
		 * @private
		 */
		 garbageCollection():void {//TODO:哪里调用
			this._hitResultsPoolIndex = 0;
			this._hitResultsPool.length = 0;
			
			this._contactPonintsPoolIndex = 0;
			this._contactPointsPool.length = 0;
			
			this._collisionsPool.length = 0;
			for (var subCollisionsKey  in this._collisionsPool) {
				var subCollisions:any = this._collisionsPool[subCollisionsKey];
				var wholeDelete:boolean = true;
				for (var collisionKey  in subCollisions) {
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


