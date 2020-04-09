package laya.d3.physics.constraints {
	import laya.d3.math.Vector3;

	/**
	 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
	 */
	public class Point2PointConstraint {
		public var pivotInA:Vector3;
		public var pivotInB:Vector3;
		public var damping:Number;
		public var impulseClamp:Number;
		public var tau:Number;

		/**
		 * 创建一个 <code>Point2PointConstraint</code> 实例。
		 */

		public function Point2PointConstraint(){}
	}

}
