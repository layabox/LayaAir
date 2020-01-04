package laya.d3.physics {
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
	 */
	public class PhysicsTriggerComponent extends PhysicsComponent {

		/**
		 * 是否为触发器。
		 */
		public var isTrigger:Boolean;

		/**
		 * 创建一个 <code>PhysicsTriggerComponent</code> 实例。
		 * @param collisionGroup 所属碰撞组。
		 * @param canCollideWith 可产生碰撞的碰撞组。
		 */

		public function PhysicsTriggerComponent(collisionGroup:Number = undefined,canCollideWith:Number = undefined){}
	}

}
