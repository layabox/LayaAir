package laya.d3.physicsCannon {
	import laya.d3.physicsCannon.CannonPhysicsComponent;

	/**
	 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
	 */
	public class CannonPhysicsTriggerComponent extends CannonPhysicsComponent {

		/**
		 * 是否为触发器。
		 */
		public function get isTrigger():Boolean{return null;}
		public function set isTrigger(value:Boolean):void{}

		/**
		 * 创建一个 <code>PhysicsTriggerComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function CannonPhysicsTriggerComponent(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}
	}

}
