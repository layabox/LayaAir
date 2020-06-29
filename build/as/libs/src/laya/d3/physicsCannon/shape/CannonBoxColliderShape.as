package laya.d3.physicsCannon.shape {
	import laya.d3.physicsCannon.shape.CannonColliderShape;
	import laya.d3.math.Vector3;

	/**
	 * <code>BoxColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	public class CannonBoxColliderShape extends CannonColliderShape {

		/**
		 * X轴尺寸。
		 */
		public function get sizeX():Number{return null;}

		/**
		 * Y轴尺寸。
		 */
		public function get sizeY():Number{return null;}

		/**
		 * Z轴尺寸。
		 */
		public function get sizeZ():Number{return null;}

		/**
		 * 创建一个新的 <code>BoxColliderShape</code> 实例。
		 * @param sizeX 盒子X轴尺寸。
		 * @param sizeY 盒子Y轴尺寸。
		 * @param sizeZ 盒子Z轴尺寸。
		 */

		public function CannonBoxColliderShape(sizeX:Number = undefined,sizeY:Number = undefined,sizeZ:Number = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _setScale(scale:Vector3):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
