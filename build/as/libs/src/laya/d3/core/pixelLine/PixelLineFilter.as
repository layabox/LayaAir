package laya.d3.core.pixelLine {
	import laya.d3.core.pixelLine.PixelLineData;
	import laya.d3.core.pixelLine.PixelLineSprite3D;
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

		/**
		 * 创建一个PixelLineFilter实例
		 * @param owner 渲染精灵节点
		 * @param maxLineCount 最大线长
		 */

		public function PixelLineFilter(owner:PixelLineSprite3D = undefined,maxLineCount:Number = undefined){}

		/**
		 * 获取线段数据
		 * @return 线段数据。
		 */
		public function _getLineData(index:Number,out:PixelLineData):void{}

		/**
		 * @inheritDoc 
		 * @override 删除
		 */
		override public function destroy():void{}
	}

}
