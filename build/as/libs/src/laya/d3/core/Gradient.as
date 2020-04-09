package laya.d3.core {
	import laya.d3.core.IClone;
	import laya.d3.math.Color;

	/**
	 * <code>Gradient</code> 类用于创建颜色渐变。
	 */
	public class Gradient implements IClone {
		private var _mode:*;
		private var _maxColorRGBKeysCount:*;
		private var _maxColorAlphaKeysCount:*;
		private var _colorRGBKeysCount:*;
		private var _colorAlphaKeysCount:*;

		/**
		 * 获取梯度模式。
		 * @return 梯度模式。
		 */

		/**
		 * 设置梯度模式。
		 * @param value 梯度模式。
		 */
		public var mode:Number;

		/**
		 * 获取颜色RGB数量。
		 * @return 颜色RGB数量。
		 */
		public function get colorRGBKeysCount():Number{
				return null;
		}

		/**
		 * 获取颜色Alpha数量。
		 * @return 颜色Alpha数量。
		 */
		public function get colorAlphaKeysCount():Number{
				return null;
		}

		/**
		 * 获取最大颜色RGB帧数量。
		 * @return 最大RGB帧数量。
		 */
		public function get maxColorRGBKeysCount():Number{
				return null;
		}

		/**
		 * 获取最大颜色Alpha帧数量。
		 * @return 最大Alpha帧数量。
		 */
		public function get maxColorAlphaKeysCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>Gradient</code> 实例。
		 * @param maxColorRGBKeyCount 最大RGB帧个数。
		 * @param maxColorAlphaKeyCount 最大Alpha帧个数。
		 */

		public function Gradient(maxColorRGBKeyCount:Number = undefined,maxColorAlphaKeyCount:Number = undefined){}

		/**
		 * 增加颜色RGB帧。
		 * @param key 生命周期，范围为0到1。
		 * @param value RGB值。
		 */
		public function addColorRGB(key:Number,value:Color):void{}

		/**
		 * 增加颜色Alpha帧。
		 * @param key 生命周期，范围为0到1。
		 * @param value Alpha值。
		 */
		public function addColorAlpha(key:Number,value:Number):void{}

		/**
		 * 更新颜色RGB帧。
		 * @param index 索引。
		 * @param key 生命周期，范围为0到1。
		 * @param value RGB值。
		 */
		public function updateColorRGB(index:Number,key:Number,value:Color):void{}

		/**
		 * 更新颜色Alpha帧。
		 * @param index 索引。
		 * @param key 生命周期，范围为0到1。
		 * @param value Alpha值。
		 */
		public function updateColorAlpha(index:Number,key:Number,value:Number):void{}

		/**
		 * 通过插值获取RGB颜色。
		 * @param lerpFactor 插值因子。
		 * @param out 颜色结果。
		 * @param 开始查找索引 。
		 * @return 结果索引。
		 */
		public function evaluateColorRGB(lerpFactor:Number,out:Color,startSearchIndex:Number = null,reverseSearch:Boolean = null):Number{
			return null;
		}

		/**
		 * 通过插值获取透明值。
		 * @param lerpFactor 插值因子。
		 * @param out 颜色结果。
		 * @param 开始查找索引 。
		 * @return 结果索引 。
		 */
		public function evaluateColorAlpha(lerpFactor:Number,outColor:Color,startSearchIndex:Number = null,reverseSearch:Boolean = null):Number{
			return null;
		}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
