package laya.filters {
	import laya.resource.Context;
	import laya.resource.RenderTexture2D;
	import laya.webgl.shader.d2.value.Value2D;
	import laya.filters.BlurFilter;

	/**
	 * @private 
	 */
	public class BlurFilterGLRender {
		private static var blurinfo:*;
		public function render(rt:RenderTexture2D,ctx:Context,width:Number,height:Number,filter:BlurFilter):void{}
		public function setShaderInfo(shader:Value2D,filter:BlurFilter,w:Number,h:Number):void{}
	}

}
