package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
	 */
	public class SphereColliderShape extends ColliderShape {

		/**
		 * 半径。
		 */
		public function get radius():Number{
				return null;
		}

		/**
		 * 创建一个新的 <code>SphereColliderShape</code> 实例。
		 * @param radius 半径。
		 */

		public function SphereColliderShape(radius:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
