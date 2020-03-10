package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;
	import laya.d3.math.Vector3;

	/**
	 * <code>StaticPlaneColliderShape</code> 类用于创建静态平面碰撞器。
	 */
	public class StaticPlaneColliderShape extends ColliderShape {

		/**
		 * 创建一个新的 <code>StaticPlaneColliderShape</code> 实例。
		 */

		public function StaticPlaneColliderShape(normal:Vector3 = undefined,offset:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
