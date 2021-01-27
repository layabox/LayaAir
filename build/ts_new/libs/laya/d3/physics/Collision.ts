import { ContactPoint } from "./ContactPoint";
import { PhysicsComponent } from "./PhysicsComponent"
	
	/**
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */
	export class Collision {
		/**@internal */
		 _lastUpdateFrame:number = -2147483648/*int.MIN_VALUE*/;
		/**@internal */
		 _updateFrame:number = -2147483648/*int.MIN_VALUE*/;
		/**@internal */
		 _isTrigger:boolean = false;
		
		/**@internal */
		 _colliderA:PhysicsComponent;
		/**@internal */
		 _colliderB:PhysicsComponent;
		
		/**@readonly*/
		 contacts:ContactPoint[] = [];
		/**@readonly*/
		 other:PhysicsComponent;
		
		/**
		 * 创建一个 <code>Collision</code> 实例。
		 */
		constructor(){
		
		}
		
		/**
		 * @internal
		 */
		 _setUpdateFrame(farme:number):void {
			this._lastUpdateFrame = this._updateFrame;//TODO:为啥整两个
			this._updateFrame = farme;
		}
	
	}


