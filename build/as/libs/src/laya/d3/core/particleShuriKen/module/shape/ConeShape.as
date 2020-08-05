package laya.d3.core.particleShuriKen.module.shape {
	import laya.d3.core.particleShuriKen.module.shape.BaseShape;
	import laya.d3.math.Rand;
	import laya.d3.math.Vector3;

	/**
	 * <code>ConeShape</code> 类用于创建锥形粒子形状。
	 */
	public class ConeShape extends BaseShape {

		/**
		 * 发射角度。
		 */
		public var angle:Number;

		/**
		 * 发射器半径。
		 */
		public var radius:Number;

		/**
		 * 椎体长度。
		 */
		public var length:Number;

		/**
		 * 发射类型,0为Base,1为BaseShell,2为Volume,3为VolumeShell。
		 */
		public var emitType:Number;

		/**
		 * 创建一个 <code>ConeShape</code> 实例。
		 */

		public function ConeShape(){}

		/**
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		override public function generatePositionAndDirection(position:Vector3,direction:Vector3,rand:Rand = null,randomSeeds:Uint32Array = null):void{}

		/**
		 * @override 
		 */
		override public function cloneTo(destObject:*):void{}

		/**
		 * @override 克隆。
		 * @return 克隆副本。
		 */
		override public function clone():*{}
	}

}
