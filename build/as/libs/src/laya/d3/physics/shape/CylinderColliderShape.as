package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>CylinderColliderShape</code> 类用于创建圆柱碰撞器。
	 */
	public class CylinderColliderShape extends ColliderShape {
		private var _orientation:*;
		private var _radius:*;
		private var _height:*;

		/**
		 * 半径。
		 */
		public function get radius():Number{
				return null;
		}

		/**
		 * 高度。
		 */
		public function get height():Number{
				return null;
		}

		/**
		 * 方向。
		 */
		public function get orientation():Number{
				return null;
		}

		/**
		 * 创建一个新的 <code>CylinderColliderShape</code> 实例。
		 * @param height 高。
		 * @param radius 半径。
		 */

		public function CylinderColliderShape(radius:Number = undefined,height:Number = undefined,orientation:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
