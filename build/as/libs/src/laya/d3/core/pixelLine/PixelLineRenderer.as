/*[IF-FLASH]*/
package laya.d3.core.pixelLine {
	improt laya.d3.core.pixelLine.PixelLineSprite3D;
	improt laya.d3.core.Transform3D;
	improt laya.d3.core.render.BaseRender;
	improt laya.d3.core.render.RenderContext3D;
	public class PixelLineRenderer extends laya.d3.core.render.BaseRender {

		public function PixelLineRenderer(owner:PixelLineSprite3D){}
		protected function _calculateBoundingBox():void{}
		public function _renderUpdateWithCamera(context:RenderContext3D,transform:Transform3D):void{}
	}

}
