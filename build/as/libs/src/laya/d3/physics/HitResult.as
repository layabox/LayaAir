package laya.d3.physics {
	import laya.d3.physics.PhysicsComponent;
	import laya.d3.math.Vector3;

	/**
	 * <code>HitResult</code> 类用于实现射线检测或形状扫描的结果。
	 */
	public class HitResult {

		/**
		 * 是否成功。
		 */
		public var succeeded:Boolean;

		/**
		 * 发生碰撞的碰撞组件。
		 */
		public var collider:PhysicsComponent;

		/**
		 * 碰撞点。
		 */
		public var point:Vector3;

		/**
		 * 碰撞法线。
		 */
		public var normal:Vector3;

		/**
		 * 碰撞分数。
		 */
		public var hitFraction:Number;

		/**
		 * 创建一个 <code>HitResult</code> 实例。
		 */

		public function HitResult(){}
	}

}
