/*[IF-FLASH]*/
package laya.d3.core.pixelLine {
	improt laya.d3.core.pixelLine.PixelLineRenderer;
	improt laya.d3.core.pixelLine.PixelLineData;
	improt laya.d3.core.RenderableSprite3D;
	improt laya.d3.core.material.BaseMaterial;
	improt laya.d3.math.Color;
	improt laya.d3.math.Vector3;
	public class PixelLineSprite3D extends laya.d3.core.RenderableSprite3D {
		public var maxLineCount:Number;
		public var lineCount:Number;
		public function get pixelLineRenderer():PixelLineRenderer{};

		public function PixelLineSprite3D(maxCount:Number = null,name:String = null){}
		public function _changeRenderObjects(sender:PixelLineRenderer,index:Number,material:BaseMaterial):void{}
		public function addLine(startPosition:Vector3,endPosition:Vector3,startColor:Color,endColor:Color):void{}
		public function addLines(lines:Array):void{}
		public function removeLine(index:Number):void{}
		public function setLine(index:Number,startPosition:Vector3,endPosition:Vector3,startColor:Color,endColor:Color):void{}
		public function getLine(index:Number,out:PixelLineData):void{}
		public function clear():void{}
	}

}
