package laya.d3.core.pixelLine {
	import laya.d3.core.pixelLine.PixelLineRenderer;
	import laya.d3.core.pixelLine.PixelLineData;
	import laya.d3.core.RenderableSprite3D;
	import laya.d3.core.material.Material;
	import laya.d3.math.Color;
	import laya.d3.math.Vector3;

	/**
	 * <code>PixelLineSprite3D</code> 类用于像素线渲染精灵。
	 */
	public class PixelLineSprite3D extends RenderableSprite3D {

		/**
		 * 最大线数量
		 */
		public var maxLineCount:Number;

		/**
		 * 获取线数量。
		 */
		public var lineCount:Number;

		/**
		 * line渲染器。
		 */
		public function get pixelLineRenderer():PixelLineRenderer{
				return null;
		}

		/**
		 * 创建一个 <code>PixelLineSprite3D</code> 实例。
		 * @param maxCount 最大线段数量。
		 * @param name 名字。
		 */

		public function PixelLineSprite3D(maxCount:Number = undefined,name:String = undefined){}

		/**
		 * @inheritDoc 
		 */
		public function _changeRenderObjects(sender:PixelLineRenderer,index:Number,material:Material):void{}

		/**
		 * 增加一条线。
		 * @param startPosition 初始点位置
		 * @param endPosition 结束点位置
		 * @param startColor 初始点颜色
		 * @param endColor 结束点颜色
		 */
		public function addLine(startPosition:Vector3,endPosition:Vector3,startColor:Color,endColor:Color):void{}

		/**
		 * 添加多条线段。
		 * @param lines 线段数据
		 */
		public function addLines(lines:Array):void{}

		/**
		 * 移除一条线段。
		 * @param index 索引。
		 */
		public function removeLine(index:Number):void{}

		/**
		 * 更新线
		 * @param index 索引
		 * @param startPosition 初始点位置
		 * @param endPosition 结束点位置
		 * @param startColor 初始点颜色
		 * @param endColor 结束点颜色
		 */
		public function setLine(index:Number,startPosition:Vector3,endPosition:Vector3,startColor:Color,endColor:Color):void{}

		/**
		 * 获取线段数据
		 * @param out 线段数据。
		 */
		public function getLine(index:Number,out:PixelLineData):void{}

		/**
		 * 清除所有线段。
		 */
		public function clear():void{}
	}

}
