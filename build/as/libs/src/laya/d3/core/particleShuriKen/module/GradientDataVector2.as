package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;
	import laya.d3.math.Vector2;

	/**
	 * <code>GradientDataVector2</code> 类用于创建二维向量渐变。
	 */
	public class GradientDataVector2 implements IClone {
		private var _currentLength:*;

		/**
		 * 二维向量渐变数量。
		 */
		public function get gradientCount():Number{
				return null;
		}

		/**
		 * 创建一个 <code>GradientDataVector2</code> 实例。
		 */

		public function GradientDataVector2(){}

		/**
		 * 增加二维向量渐变。
		 * @param key 生命周期，范围为0到1。
		 * @param value 二维向量值。
		 */
		public function add(key:Number,value:Vector2):void{}

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
