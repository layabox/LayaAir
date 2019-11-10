package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientColor;

	/**
	 * <code>ColorOverLifetime</code> 类用于粒子的生命周期颜色。
	 */
	public class ColorOverLifetime {
		private var _color:*;

		/**
		 * 是否启用。
		 */
		public var enable:Boolean;

		/**
		 * 获取颜色。
		 */
		public function get color():GradientColor{
				return null;
		}

		/**
		 * 创建一个 <code>ColorOverLifetime</code> 实例。
		 */

		public function ColorOverLifetime(color:GradientColor = undefined){}

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
