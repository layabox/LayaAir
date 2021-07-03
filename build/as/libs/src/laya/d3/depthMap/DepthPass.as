package laya.d3.depthMap {
	import laya.d3.core.render.RenderContext3D;
	import laya.d3.core.Camera;
	import laya.d3.core.Camera;
	import laya.d3.core.render.RenderContext3D;

	/**
	 * <code>ShadowCasterPass</code> 类用于实现阴影渲染管线
	 */
	public class DepthPass {
		private static var SHADOW_BIAS:*;

		public function DepthPass(){}

		/**
		 * 渲染深度更新
		 * @param camera 
		 * @param depthType 
		 */
		public function update(camera:Camera,depthType:*):void{}

		/**
		 * 渲染深度帧缓存
		 * @param context 
		 * @param depthType 
		 */
		public function render(context:RenderContext3D,depthType:*):void{}
	}

}
