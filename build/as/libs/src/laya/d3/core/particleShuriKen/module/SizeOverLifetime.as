package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientSize;
	import laya.d3.core.IClone;

	/**
	 * <code>SizeOverLifetime</code> 类用于粒子的生命周期尺寸。
	 */
	public class SizeOverLifetime implements IClone {
		private var _size:*;

		/**
		 * 是否启用
		 */
		public var enable:Boolean;

		/**
		 * 获取尺寸。
		 */
		public function get size():GradientSize{
				return null;
		}

		/**
		 * 创建一个 <code>SizeOverLifetime</code> 实例。
		 */

		public function SizeOverLifetime(size:GradientSize = undefined){}

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
