package laya.d3.core.pixelLine {
	import laya.d3.core.GeometryElement;
	import laya.d3.core.pixelLine.PixelLineData;
	import laya.d3.core.pixelLine.PixelLineSprite3D;

	/**
	 * <code>PixelLineFilter</code> 类用于线过滤器。
	 */
	public class PixelLineFilter extends GeometryElement {

		/**
		 * @private 
		 */
		private static var _tempVector0:*;

		/**
		 * @private 
		 */
		private static var _tempVector1:*;

		public function PixelLineFilter(owner:PixelLineSprite3D = undefined,maxLineCount:Number = undefined){}

		/**
		 * {@inheritDoc PixelLineFilter._getType}
		 * @override 
		 */
		override public function _getType():Number{
			return null;
		}

		/**
		 * 获取线段数据
		 * @return 线段数据。
		 */
		public function _getLineData(index:Number,out:PixelLineData):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
	}

}
