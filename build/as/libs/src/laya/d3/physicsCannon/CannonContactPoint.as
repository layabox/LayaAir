package laya.d3.physicsCannon {
	import laya.d3.physicsCannon.CannonPhysicsComponent;
	import laya.d3.math.Vector3;

	/**
	 * <code>ContactPoint</code> 类用于创建物理碰撞信息。
	 */
	public class CannonContactPoint {

		/**
		 * 碰撞器A。
		 */
		public var colliderA:CannonPhysicsComponent;

		/**
		 * 碰撞器B。
		 */
		public var colliderB:CannonPhysicsComponent;

		/**
		 * 距离。
		 */
		public var distance:Number;

		/**
		 * 法线。
		 */
		public var normal:Vector3;

		/**
		 * 碰撞器A的碰撞点。
		 */
		public var positionOnA:Vector3;

		/**
		 * 碰撞器B的碰撞点。
		 */
		public var positionOnB:Vector3;

		/**
		 * 创建一个 <code>ContactPoint</code> 实例。
		 */

		public function CannonContactPoint(){}
	}

}
