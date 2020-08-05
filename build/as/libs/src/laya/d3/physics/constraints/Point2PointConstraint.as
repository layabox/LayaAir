package laya.d3.physics.constraints {
	import laya.d3.math.Vector3;

	/**
	 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
	 */
	public class Point2PointConstraint {
		public function get pivotInA():Vector3{return null;}
		public function set pivotInA(value:Vector3):void{}
		public function get pivotInB():Vector3{return null;}
		public function set pivotInB(value:Vector3):void{}
		public function get damping():Number{return null;}
		public function set damping(value:Number):void{}
		public function get impulseClamp():Number{return null;}
		public function set impulseClamp(value:Number):void{}
		public function get tau():Number{return null;}
		public function set tau(value:Number):void{}

		/**
		 * 创建一个 <code>Point2PointConstraint</code> 实例。
		 */

		public function Point2PointConstraint(){}
	}

}
