package laya.d3.physicsCannon {
	import laya.d3.physicsCannon.CannonContactPoint;
	import laya.d3.physicsCannon.CannonPhysicsComponent;

	/**
	 * <code>Collision</code> 类用于创建物理碰撞信息。
	 */
	public class CannonCollision {

		/**
		 * @readonly 
		 */
		public var contacts:Array;

		/**
		 * @readonly 
		 */
		public var other:CannonPhysicsComponent;

		/**
		 * 创建一个 <code>Collision</code> 实例。
		 */

		public function CannonCollision(){}
	}

}
