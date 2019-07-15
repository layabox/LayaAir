/*[IF-FLASH]*/
package laya.filters {
	improt laya.resource.Context;
	improt laya.resource.RenderTexture2D;
	improt laya.webgl.shader.d2.value.Value2D;
	improt laya.filters.BlurFilter;
	public class BlurFilterGLRender {
		private static var blurinfo:*;
		public function render(rt:RenderTexture2D,ctx:Context,width:Number,height:Number,filter:BlurFilter):void{}
		public function setShaderInfo(shader:Value2D,filter:BlurFilter,w:Number,h:Number):void{}
	}

}
