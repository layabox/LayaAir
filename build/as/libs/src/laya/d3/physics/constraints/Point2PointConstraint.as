/*[IF-FLASH]*/
package laya.d3.physics.constraints {
	improt laya.d3.math.Vector3;
	public class Point2PointConstraint {
		public var pivotInA:Vector3;
		public var pivotInB:Vector3;
		public var damping:Number;
		public var impulseClamp:Number;
		public var tau:Number;

		public function Point2PointConstraint(){}
	}

}
