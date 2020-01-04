package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;

	/**
	 * <code>GradientDataInt</code> 类用于创建整形渐变。
	 */
	public class GradientDataInt implements IClone {
		private var _currentLength:*;

		/**
		 * 整形渐变数量。
		 */
		public function get gradientCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>GradientDataInt</code> 实例。
		 */

		public function GradientDataInt(){}

		/**
		 * 增加整形渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 整形值。
		 */
		public function add(key:Number,value:Number):void{}

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
