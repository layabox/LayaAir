package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	public class BoxColliderShape extends ColliderShape {

		/**
		 * X轴尺寸。
		 */
		public function get sizeX():Number{
				return null;
		}

		/**
		 * Y轴尺寸。
		 */
		public function get sizeY():Number{
				return null;
		}

		/**
		 * Z轴尺寸。
		 */
		public function get sizeZ():Number{
				return null;
		}

		/**
		 * 创建一个新的 <code>BoxColliderShape</code> 实例。
		 * @param sizeX 盒子X轴尺寸。
		 * @param sizeY 盒子Y轴尺寸。
		 * @param sizeZ 盒子Z轴尺寸。
		 */

		public function BoxColliderShape(sizeX:Number = undefined,sizeY:Number = undefined,sizeZ:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
