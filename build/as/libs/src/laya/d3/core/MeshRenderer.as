package laya.d3.core {
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.core.Transform3D;
	import laya.d3.core.render.BaseRender;
	import laya.d3.core.render.RenderContext3D;

	/*
	 * <code>MeshRenderer</code> 类用于网格渲染器。
	 */
	public class MeshRenderer extends laya.d3.core.render.BaseRender {

		/*
		 * 创建一个新的 <code>MeshRender</code> 实例。
		 */

		public function MeshRenderer(owner:RenderableSprite3D = undefined){}

		/*
		 * @inheritDoc 
		 */
		public function _renderUpdateWithCameraForNative(context:RenderContext3D,transform:Transform3D):void{}
	}

}
