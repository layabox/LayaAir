package laya.d3.physics.shape {
	import laya.d3.resource.models.Mesh;
	import laya.d3.physics.shape.ColliderShape;

	/*
	 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
	 */
	public class MeshColliderShape extends laya.d3.physics.shape.ColliderShape {
		private var _mesh:*;
		private var _convex:*;

		/*
		 * 获取网格。
		 * @return 网格。
		 */

		/*
		 * 设置网格。
		 * @param 网格 。
		 */
		public var mesh:Mesh;

		/*
		 * 获取是否使用凸多边形。
		 * @return 是否使用凸多边形。
		 */

		/*
		 * 设置是否使用凸多边形。
		 * @param value 是否使用凸多边形。
		 */
		public var convex:Boolean;

		/*
		 * 创建一个新的 <code>MeshColliderShape</code> 实例。
		 */

		public function MeshColliderShape(){}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override public function clone():*{}
	}

}
