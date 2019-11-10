package laya.d3.physics {
	import laya.d3.physics.ContactPoint;
	import laya.d3.physics.PhysicsComponent;

	/**
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */
	public class Collision {

		/**
		 * @readonly 
		 */
		public var contacts:Array;

		/**
		 * @readonly 
		 */
		public var other:PhysicsComponent;

		/**
		 * 创建一个 <code>Collision</code> 实例。
		 */

		public function Collision(){}
	}

}
