package laya.d3.physics.shape {
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
	 */
	public class CompoundColliderShape extends ColliderShape {

		/**
		 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
		 */

		public function CompoundColliderShape(){}

		/**
		 * 添加子碰撞器形状。
		 * @param shape 子碰撞器形状。
		 */
		public function addChildShape(shape:ColliderShape):void{}

		/**
		 * 移除子碰撞器形状。
		 * @param shape 子碰撞器形状。
		 */
		public function removeChildShape(shape:ColliderShape):void{}

		/**
		 * 清空子碰撞器形状。
		 */
		public function clearChildShape():void{}

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
