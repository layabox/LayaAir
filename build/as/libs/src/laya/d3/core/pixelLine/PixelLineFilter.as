package laya.d3.core.pixelLine {
	import laya.d3.core.pixelLine.PixelLineSprite3D;
	import laya.d3.core.pixelLine.PixelLineData;
	import laya.d3.core.GeometryElement;

	/*
	 * <code>PixelLineFilter</code> 类用于线过滤器。
	 */
	public class PixelLineFilter extends laya.d3.core.GeometryElement {

		public function PixelLineFilter(owner:PixelLineSprite3D = undefined,maxLineCount:Number = undefined){}

		/*
		 * {@inheritDoc PixelLineFilter._getType}
		 * @override 
		 */
		override public function _getType():Number{
			return null;
		}

		/*
		 * 获取线段数据
		 * @return 线段数据。
		 */
		public function _getLineData(index:Number,out:PixelLineData):void{}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy():void{}
	}

}
