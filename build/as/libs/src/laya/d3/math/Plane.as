/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	public class Plane {
		public var normal:Vector3;
		public var distance:Number;
		public static var PlaneIntersectionType_Back:Number;
		public static var PlaneIntersectionType_Front:Number;
		public static var PlaneIntersectionType_Intersecting:Number;

		public function Plane(normal:Vector3,d:Number = null){}
		public static function createPlaneBy3P(point1:Vector3,point2:Vector3,point3:Vector3):Plane{}
		public function normalize():void{}
	}

}
