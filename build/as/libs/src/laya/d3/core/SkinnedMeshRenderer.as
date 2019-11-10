package laya.d3.core {
	import laya.d3.core.Bounds;
	import laya.d3.core.MeshRenderer;
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.core.Sprite3D;

	/**
	 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
	 */
	public class SkinnedMeshRenderer extends MeshRenderer {

		/**
		 * 局部边界。
		 */
		public var localBounds:Bounds;

		/**
		 * 根节点。
		 */
		public var rootBone:Sprite3D;

		/**
		 * 用于蒙皮的骨骼。
		 */
		public function get bones():Array{
				return null;
		}

		/**
		 * 创建一个 <code>SkinnedMeshRender</code> 实例。
		 */

		public function SkinnedMeshRenderer(owner:RenderableSprite3D = undefined){}
	}

}
