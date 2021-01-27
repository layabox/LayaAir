package laya.d3.core.pixelLine {
	import laya.d3.math.Color;
	import laya.d3.math.Vector3;
	import laya.d3.math.Color;
	import laya.d3.math.Vector3;

	/**
	 * <code>PixelLineData</code> 类用于表示线数据。
	 */
	public class PixelLineData {

		/**
		 * 线开始位置
		 */
		public var startPosition:Vector3;

		/**
		 * 线结束位置
		 */
		public var endPosition:Vector3;

		/**
		 * 线开始颜色
		 */
		public var startColor:Color;

		/**
		 * 线结束颜色
		 */
		public var endColor:Color;

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:PixelLineData):void{}
	}

}
