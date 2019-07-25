package laya.d3.core {
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.resource.models.Mesh;

	/*
	 * <code>MeshFilter</code> 类用于创建网格过滤器。
	 */
	public class MeshFilter {
		private var _owner:*;
		private var _sharedMesh:*;

		/*
		 * 获取共享网格。
		 * @return 共享网格。
		 */

		/*
		 * 设置共享网格。
		 * @return value 共享网格。
		 */
		public var sharedMesh:Mesh;

		/*
		 * 创建一个新的 <code>MeshFilter</code> 实例。
		 * @param owner 所属网格精灵。
		 */

		public function MeshFilter(owner:RenderableSprite3D = undefined){}
		private var _getMeshDefine:*;

		/*
		 * @inheritDoc 
		 */
		public function destroy():void{}
	}

}
