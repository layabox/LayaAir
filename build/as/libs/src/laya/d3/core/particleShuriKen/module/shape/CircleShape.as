package laya.d3.core.particleShuriKen.module.shape {
	import laya.d3.core.particleShuriKen.module.shape.BaseShape;
	import laya.d3.math.Rand;
	import laya.d3.math.Vector3;

	/**
	 * <code>CircleShape</code> 类用于创建环形粒子形状。
	 */
	public class CircleShape extends BaseShape {

		/**
		 * 发射器半径。
		 */
		public var radius:Number;

		/**
		 * 环形弧度。
		 */
		public var arc:Number;

		/**
		 * 从边缘发射。
		 */
		public var emitFromEdge:Boolean;

		/**
		 * 创建一个 <code>CircleShape</code> 实例。
		 */

		public function CircleShape(){}

		/**
		 * 用于生成粒子初始位置和方向。
		 * @param position 粒子位置。
		 * @param direction 粒子方向。
		 * @override 
		 */
		override public function generatePositionAndDirection(position:Vector3,direction:Vector3,rand:Rand = null,randomSeeds:Uint32Array = null):void{}

		/**
		 * @param destObject 
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
