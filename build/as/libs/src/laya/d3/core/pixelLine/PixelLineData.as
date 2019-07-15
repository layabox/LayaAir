/*[IF-FLASH]*/
package laya.d3.core.pixelLine {
	improt laya.d3.math.Color;
	improt laya.d3.math.Vector3;
	public class PixelLineData {
		public var startPosition:Vector3;
		public var endPosition:Vector3;
		public var startColor:Color;
		public var endColor:Color;
		public function cloneTo(destObject:PixelLineData):void{}
	}

}
