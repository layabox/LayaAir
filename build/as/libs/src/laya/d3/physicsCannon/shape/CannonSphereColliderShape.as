package laya.d3.physicsCannon.shape {
	import laya.d3.physicsCannon.shape.CannonColliderShape;
	import laya.d3.math.Vector3;

	/**
	 * <code>SphereColliderShape</code> 类用于创建球形碰撞器。
	 */
	public class CannonSphereColliderShape extends CannonColliderShape {

		/**
		 * 半径。
		 */
		public function get radius():Number{return null;}

		/**
		 * 创建一个新的 <code>SphereColliderShape</code> 实例。
		 * @param radius 半径。
		 */

		public function CannonSphereColliderShape(radius:Number = undefined){}

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
