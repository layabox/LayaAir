import { CannonPhysicsComponent } from "./CannonPhysicsComponent";
import { SingletonList } from "../component/SingletonList"
import { ISingletonElement } from "../../resource/ISingletonElement";
	
	/**
	 * <code>PhysicsUpdateList</code> 类用于实现物理更新队列。
	 */
	export class CannonPhysicsUpdateList extends SingletonList<ISingletonElement> {
		
		/**
		 * 创建一个新的 <code>PhysicsUpdateList</code> 实例。
		 */
		constructor(){super();

		}
		
		/**
		 * @internal
		 */
		 add(element:CannonPhysicsComponent):void {
			var index:number = element._inPhysicUpdateListIndex;
			if (index !== -1)
				throw "PhysicsUpdateList:element has  in  PhysicsUpdateList.";
			this._add(element);
			element._inPhysicUpdateListIndex = this.length++;
		}
		
		/**
		 * @internal
		 */
		 remove(element:CannonPhysicsComponent):void {
			var index:number = element._inPhysicUpdateListIndex;
			this.length--;
			if (index !== this.length) {
				var end:any = this.elements[this.length];
				this.elements[index] = end;
				end._inPhysicUpdateListIndex = index;
			}
			element._inPhysicUpdateListIndex = -1;
		}
	
	}


