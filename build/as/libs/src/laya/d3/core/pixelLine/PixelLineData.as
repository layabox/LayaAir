package laya.d3.core.pixelLine {
	import laya.d3.math.Color;
	import laya.d3.math.Vector3;

	/**
	 * <code>PixelLineData</code> 类用于表示线数据。
	 */
	public class PixelLineData {
		public var startPosition:Vector3;
		public var endPosition:Vector3;
		public var startColor:Color;
		public var endColor:Color;

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:PixelLineData):void{}
	}

}
