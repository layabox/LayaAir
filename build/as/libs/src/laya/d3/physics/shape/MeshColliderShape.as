package laya.d3.physics.shape {
	import laya.d3.resource.models.Mesh;
	import laya.d3.physics.shape.ColliderShape;

	/**
	 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
	 */
	public class MeshColliderShape extends ColliderShape {

		/**
		 * 网格。
		 */
		public function get mesh():Mesh{return null;}
		public function set mesh(value:Mesh):void{}

		/**
		 * 是否使用凸多边形。
		 */
		public function get convex():Boolean{return null;}
		public function set convex(value:Boolean):void{}

		/**
		 * 创建一个新的 <code>MeshColliderShape</code> 实例。
		 */

		public function MeshColliderShape(){}

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
	}

}
