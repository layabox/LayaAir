/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Matrix4x4;
	improt laya.d3.math.Plane;
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.BoundSphere;
	public class BoundFrustum {
		private var _matrix:*;
		private var _near:*;
		private var _far:*;
		private var _left:*;
		private var _right:*;
		private var _top:*;
		private var _bottom:*;

		public function BoundFrustum(matrix:Matrix4x4){}
		public var matrix:Matrix4x4;
		public function get near():Plane{};
		public function get far():Plane{};
		public function get left():Plane{};
		public function get right():Plane{};
		public function get top():Plane{};
		public function get bottom():Plane{};
		public function equalsBoundFrustum(other:BoundFrustum):Boolean{}
		public function equalsObj(obj:*):Boolean{}
		public function getPlane(index:Number):Plane{}
		private static var _getPlanesFromMatrix:*;
		private static var _get3PlaneInterPoint:*;
		public function getCorners(corners:Array):void{}
		public function containsPoint(point:Vector3):Number{}
		public function containsBoundBox(box:BoundBox):Number{}
		public function containsBoundSphere(sphere:BoundSphere):Number{}
	}

}
