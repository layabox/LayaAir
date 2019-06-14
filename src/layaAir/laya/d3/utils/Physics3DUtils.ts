import { Vector3 } from "../math/Vector3"
import { PhysicsComponent } from "../physics/PhysicsComponent"

	
	/**
	 * <code>Physics</code> 类用于简单物理检测。
	 */
	export class Physics3DUtils {
		 static COLLISIONFILTERGROUP_DEFAULTFILTER:number = 0x1;
		
		 static COLLISIONFILTERGROUP_STATICFILTER:number = 0x2;
		
		 static COLLISIONFILTERGROUP_KINEMATICFILTER:number = 0x4;
		
		 static COLLISIONFILTERGROUP_DEBRISFILTER:number = 0x8;
		
		 static COLLISIONFILTERGROUP_SENSORTRIGGER:number = 0x10;
		
		 static COLLISIONFILTERGROUP_CHARACTERFILTER:number = 0x20;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER1:number = 0x40;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER2:number = 0x80;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER3:number = 0x100;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER4:number = 0x200;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER5:number = 0x400;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER6:number = 0x800;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER7:number = 0x1000;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER8:number = 0x2000;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER9:number = 0x4000;
		
		 static COLLISIONFILTERGROUP_CUSTOMFILTER10:number = 0x8000;
		
		 static COLLISIONFILTERGROUP_ALLFILTER:number = -1;
		
		/**重力值。*/
		 static gravity:Vector3 = new Vector3(0, -9.81, 0);
		
		/**
		 * 创建一个 <code>Physics</code> 实例。
		 */
		constructor(){
		
		}
		
		/**
		 * 是否忽略两个碰撞器的碰撞检测。
		 * @param	collider1 碰撞器一。
		 * @param	collider2 碰撞器二。
		 * @param	ignore 是否忽略。
		 */
		 static setColliderCollision(collider1:PhysicsComponent, collider2:PhysicsComponent, collsion:boolean):void {
		}
		
		/**
		 * 获取是否忽略两个碰撞器的碰撞检测。
		 * @param	collider1 碰撞器一。
		 * @param	collider2 碰撞器二。
		 * @return	是否忽略。
		 */
		 static getIColliderCollision(collider1:PhysicsComponent, collider2:PhysicsComponent):boolean {
			//return collider1._ignoreCollisonMap[collider2.id] ? true : false;
			return false;
		}
	
	}


