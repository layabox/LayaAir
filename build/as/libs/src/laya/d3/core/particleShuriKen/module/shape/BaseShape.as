package laya.d3.core.particleShuriKen.module.shape {
	import laya.d3.core.IClone;
	import laya.d3.math.Rand;
	import laya.d3.math.Vector3;

	/**
	 * <code>BaseShape</code> 类用于粒子形状。
	 */
	public class BaseShape implements IClone {

		/**
		 * 是否启用。
		 */
		public var enable:Boolean;

		/**
		 * 随机方向。
		 */
		public var randomDirection:Number;

		/**
		 * 创建一个 <code>BaseShape</code> 实例。
		 */

		public function BaseShape(){}

		/**
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 */
		public function generatePositionAndDirection(position:Vector3,direction:Vector3,rand:Rand = null,randomSeeds:Uint32Array = null):void{}

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
