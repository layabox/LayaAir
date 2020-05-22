import { CannonContactPoint } from "./CannonContactPoint";
import { CannonPhysicsComponent } from "./CannonPhysicsComponent"
	
	/**
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */
	export class CannonCollision {
		/**@internal */
		 _lastUpdateFrame:number = -2147483648/*int.MIN_VALUE*/;
		/**@internal */
		 _updateFrame:number = -2147483648/*int.MIN_VALUE*/;
		/**@internal */
		 _isTrigger:boolean = false;
		
		/**@internal */
		 _colliderA:CannonPhysicsComponent;
		/**@internal */
		 _colliderB:CannonPhysicsComponent;
		
		/**@readonly*/
		 contacts:CannonContactPoint[] = [];
		/**@readonly*/
		 other:CannonPhysicsComponent;
		
		/**
		 * 创建一个 <code>Collision</code> 实例。
		 */
		constructor(){
		
		}
		
		/**
		 * @internal
		 */
		 _setUpdateFrame(farme:number):void {
			this._lastUpdateFrame = this._updateFrame;//
			this._updateFrame = farme;
		}
	
	}


