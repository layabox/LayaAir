package laya.d3.core {
	import laya.d3.resource.models.Mesh;
	import laya.d3.core.RenderableSprite3D;

	/**
	 * <code>MeshFilter</code> 类用于创建网格过滤器。
	 */
	public class MeshFilter {

		/**
		 * 共享网格。
		 */
		public var sharedMesh:Mesh;

		/**
		 * 创建一个新的 <code>MeshFilter</code> 实例。
		 * @param owner 所属网格精灵。
		 */

		public function MeshFilter(owner:RenderableSprite3D = undefined){}

		/**
		 * @inheritDoc 
		 */
		public function destroy():void{}
	}

}
