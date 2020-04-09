package laya.d3.core.particleShuriKen.module {
	import laya.d3.core.IClone;
	import laya.d3.core.particleShuriKen.module.GradientVelocity;

	/**
	 * <code>VelocityOverLifetime</code> 类用于粒子的生命周期速度。
	 */
	public class VelocityOverLifetime implements IClone {

		/**
		 * 是否启用
		 */
		public var enable:Boolean;

		/**
		 * 速度空间,0为local,1为world。
		 */
		public var space:Number;

		/**
		 * 获取尺寸。
		 */
		public function get velocity():GradientVelocity{
				return null;
		}

		/**
		 * 创建一个 <code>VelocityOverLifetime</code> 实例。
		 */

		public function VelocityOverLifetime(velocity:GradientVelocity = undefined){}

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
