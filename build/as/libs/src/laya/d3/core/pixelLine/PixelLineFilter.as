/*[IF-FLASH]*/
package laya.d3.core.pixelLine {
	improt laya.d3.core.pixelLine.PixelLineSprite3D;
	improt laya.d3.core.pixelLine.PixelLineData;
	improt laya.d3.core.GeometryElement;
	improt laya.d3.core.render.RenderContext3D;
	public class PixelLineFilter extends laya.d3.core.GeometryElement {

		public function PixelLineFilter(owner:PixelLineSprite3D,maxLineCount:Number){}
		public function _getType():Number{}
		public function _getLineData(index:Number,out:PixelLineData):void{}
		public function _prepareRender(state:RenderContext3D):Boolean{}
		public function _render(state:RenderContext3D):void{}
		public function destroy():void{}
	}

}
