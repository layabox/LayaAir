package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>CapsuleColliderShape</code> 类用于创建胶囊形状碰撞器。
	 */
	public class CapsuleColliderShape extends ColliderShape {

		/**
		 * 半径。
		 */
		public function get radius():Number{
				return null;
		}

		/**
		 * 长度。
		 */
		public function get length():Number{
				return null;
		}

		/**
		 * 方向。
		 */
		public function get orientation():Number{
				return null;
		}

		/**
		 * 创建一个新的 <code>CapsuleColliderShape</code> 实例。
		 * @param 半径 。
		 * @param 高 (包含半径)。
		 * @param orientation 胶囊体方向。
		 */

		public function CapsuleColliderShape(radius:Number = undefined,length:Number = undefined,orientation:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
