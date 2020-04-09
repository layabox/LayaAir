package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.particleShuriKen.module.GradientAngularVelocity;
	import laya.d3.core.IClone;

	/**
	 * <code>RotationOverLifetime</code> 类用于粒子的生命周期旋转。
	 */
	public class RotationOverLifetime implements IClone {
		private var _angularVelocity:*;

		/**
		 * 是否启用
		 */
		public var enable:Boolean;

		/**
		 * 获取角速度。
		 */
		public function get angularVelocity():GradientAngularVelocity{
				return null;
		}

		/**
		 * 创建一个 <code>RotationOverLifetime,不允许new，请使用静态创建函数。</code> 实例。
		 */

		public function RotationOverLifetime(angularVelocity:GradientAngularVelocity = undefined){}

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
