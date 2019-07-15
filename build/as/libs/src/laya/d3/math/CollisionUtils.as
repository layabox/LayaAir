/*[IF-FLASH]*/
package laya.d3.math {
	improt laya.d3.math.Vector3;
	improt laya.d3.math.Plane;
	improt laya.d3.math.BoundBox;
	improt laya.d3.math.BoundSphere;
	improt laya.d3.math.Ray;
	public class CollisionUtils {

		public function CollisionUtils(){}
		public static function distancePlaneToPoint(plane:Plane,point:Vector3):Number{}
		public static function distanceBoxToPoint(box:BoundBox,point:Vector3):Number{}
		public static function distanceBoxToBox(box1:BoundBox,box2:BoundBox):Number{}
		public static function distanceSphereToPoint(sphere:BoundSphere,point:Vector3):Number{}
		public static function distanceSphereToSphere(sphere1:BoundSphere,sphere2:BoundSphere):Number{}
		public static function intersectsRayAndTriangleRD(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Number):Boolean{}
		public static function intersectsRayAndTriangleRP(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Vector3):Boolean{}
		public static function intersectsRayAndPoint(ray:Ray,point:Vector3):Boolean{}
		public static function intersectsRayAndRay(ray1:Ray,ray2:Ray,out:Vector3):Boolean{}
		public static function intersectsPlaneAndTriangle(plane:Plane,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{}
		public static function intersectsRayAndPlaneRD(ray:Ray,plane:Plane,out:Number):Boolean{}
		public static function intersectsRayAndPlaneRP(ray:Ray,plane:Plane,out:Vector3):Boolean{}
		public static function intersectsRayAndBoxRD(ray:Ray,box:BoundBox):Number{}
		public static function intersectsRayAndBoxRP(ray:Ray,box:BoundBox,out:Vector3):Number{}
		public static function intersectsRayAndSphereRD(ray:Ray,sphere:BoundSphere):Number{}
		public static function intersectsRayAndSphereRP(ray:Ray,sphere:BoundSphere,out:Vector3):Number{}
		public static function intersectsSphereAndTriangle(sphere:BoundSphere,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Boolean{}
		public static function intersectsPlaneAndPoint(plane:Plane,point:Vector3):Number{}
		public static function intersectsPlaneAndPlane(plane1:Plane,plane2:Plane):Boolean{}
		public static function intersectsPlaneAndPlaneRL(plane1:Plane,plane2:Plane,line:Ray):Boolean{}
		public static function intersectsPlaneAndBox(plane:Plane,box:BoundBox):Number{}
		public static function intersectsPlaneAndSphere(plane:Plane,sphere:BoundSphere):Number{}
		public static function intersectsBoxAndBox(box1:BoundBox,box2:BoundBox):Boolean{}
		public static function intersectsBoxAndSphere(box:BoundBox,sphere:BoundSphere):Boolean{}
		public static function intersectsSphereAndSphere(sphere1:BoundSphere,sphere2:BoundSphere):Boolean{}
		public static function boxContainsPoint(box:BoundBox,point:Vector3):Number{}
		public static function boxContainsBox(box1:BoundBox,box2:BoundBox):Number{}
		public static function boxContainsSphere(box:BoundBox,sphere:BoundSphere):Number{}
		public static function sphereContainsPoint(sphere:BoundSphere,point:Vector3):Number{}
		public static function sphereContainsTriangle(sphere:BoundSphere,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{}
		public static function sphereContainsBox(sphere:BoundSphere,box:BoundBox):Number{}
		public static function sphereContainsSphere(sphere1:BoundSphere,sphere2:BoundSphere):Number{}
		public static function closestPointPointTriangle(point:Vector3,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Vector3):void{}
		public static function closestPointPlanePoint(plane:Plane,point:Vector3,out:Vector3):void{}
		public static function closestPointBoxPoint(box:BoundBox,point:Vector3,out:Vector3):void{}
		public static function closestPointSpherePoint(sphere:BoundSphere,point:Vector3,out:Vector3):void{}
		public static function closestPointSphereSphere(sphere1:BoundSphere,sphere2:BoundSphere,out:Vector3):void{}
	}

}
