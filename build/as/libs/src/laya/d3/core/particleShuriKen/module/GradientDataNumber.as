package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;

	/**
	 * <code>GradientDataNumber</code> 类用于创建浮点渐变。
	 */
	public class GradientDataNumber implements IClone {
		private var _currentLength:*;

		/**
		 * 渐变浮点数量。
		 */
		public function get gradientCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>GradientDataNumber</code> 实例。
		 */

		public function GradientDataNumber(){}

		/**
		 * 增加浮点渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 浮点值。
		 */
		public function add(key:Number,value:Number):void{}

		/**
		 * 通过索引获取键。
		 * @param index 索引。
		 * @return value 键。
		 */
		public function getKeyByIndex(index:Number):Number{
			return null;
		}

		/**
		 * 通过索引获取值。
		 * @param index 索引。
		 * @return value 值。
		 */
		public function getValueByIndex(index:Number):Number{
			return null;
		}

		/**
		 * 获取平均值。
		 */
		public function getAverageValue():Number{
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
