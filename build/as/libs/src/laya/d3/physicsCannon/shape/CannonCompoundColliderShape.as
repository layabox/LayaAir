package laya.d3.physicsCannon.shape {
	import laya.d3.math.Vector3;
	import laya.d3.physicsCannon.shape.CannonColliderShape;
	import laya.d3.physicsCannon.CannonPhysicsComponent;

	/**
	 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	public class CannonCompoundColliderShape extends CannonColliderShape {
		private static var _tempCannonQue:*;
		private static var _tempCannonVec:*;
		private var physicColliderObject:*;

		/**
		 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
		 */

		public function CannonCompoundColliderShape(){}
		public function addChildShape(shape:CannonColliderShape,localOffset:Vector3 = null):void{}

		/**
		 * 移除子碰撞器形状。
		 * @param shape 子碰撞器形状。
		 */
		public function removeChildShape(shape:CannonColliderShape):void{}
		public function bindRigidBody(rigidbody:CannonPhysicsComponent):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function _setScale(scale:Vector3):void{}

		/**
		 * 获取子形状数量。
		 * @return 
		 */
		public function getChildShapeCount():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
	}

}
