package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.math.Plane;
	import laya.d3.math.BoundBox;
	import laya.d3.math.BoundSphere;
	import laya.d3.math.Ray;

	/**
	 * <code>Collision</code> 类用于检测碰撞。
	 */
	public class CollisionUtils {

		/**
		 * 创建一个 <code>Collision</code> 实例。
		 */

		public function CollisionUtils(){}

		/**
		 * 空间中点到平面的距离
		 * @param plane 平面
		 * @param point 点
		 */
		public static function distancePlaneToPoint(plane:Plane,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中点到包围盒的距离
		 * @param box 包围盒
		 * @param point 点
		 */
		public static function distanceBoxToPoint(box:BoundBox,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围盒到包围盒的距离
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 */
		public static function distanceBoxToBox(box1:BoundBox,box2:BoundBox):Number{
			return null;
		}

		/**
		 * 空间中点到包围球的距离
		 * @param sphere 包围球
		 * @param point 点
		 */
		public static function distanceSphereToPoint(sphere:BoundSphere,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围球到包围球的距离
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 */
		public static function distanceSphereToSphere(sphere1:BoundSphere,sphere2:BoundSphere):Number{
			return null;
		}

		/**
		 * 空间中射线和三角面是否相交,输出距离
		 * @param ray 射线
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 点和三角面的距离
		 * @return 是否相交
		 */
		public static function intersectsRayAndTriangleRD(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Number):Boolean{
			return null;
		}

		/**
		 * 空间中射线和三角面是否相交,输出相交点
		 * @param ray 射线
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 相交点
		 * @return 是否相交
		 */
		public static function intersectsRayAndTriangleRP(ray:Ray,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Vector3):Boolean{
			return null;
		}

		/**
		 * 空间中射线和点是否相交
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 */
		public static function intersectsRayAndPoint(ray:Ray,point:Vector3):Boolean{
			return null;
		}

		/**
		 * 空间中射线和射线是否相交
		 * @param ray1 射线1
		 * @param ray2 射线2
		 * @param out 相交点
		 */
		public static function intersectsRayAndRay(ray1:Ray,ray2:Ray,out:Vector3):Boolean{
			return null;
		}

		/**
		 * 空间中平面和三角面是否相交
		 * @param plane 平面
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回空间位置关系
		 */
		public static function intersectsPlaneAndTriangle(plane:Plane,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{
			return null;
		}

		/**
		 * 射线和平面是否相交,并返回相交距离。
		 * @param ray 射线。
		 * @param plane 平面。
		 * @return 相交距离,-1为不相交。
		 */
		public static function intersectsRayAndPlaneRD(ray:Ray,plane:Plane):Number{
			return null;
		}

		/**
		 * 空间中射线和平面是否相交，并返回相交点。
		 * @param ray 射线。
		 * @param plane 平面。
		 * @param out 相交点。
		 */
		public static function intersectsRayAndPlaneRP(ray:Ray,plane:Plane,out:Vector3):Boolean{
			return null;
		}

		/**
		 * 空间中射线和包围盒是否相交
		 * @param ray 射线
		 * @param box 包围盒
		 * @param out 相交距离,如果为0,不相交
		 */
		public static function intersectsRayAndBoxRD(ray:Ray,box:BoundBox):Number{
			return null;
		}

		/**
		 * 空间中射线和包围盒是否相交
		 * @param ray 射线
		 * @param box 包围盒
		 * @param out 相交点
		 */
		public static function intersectsRayAndBoxRP(ray:Ray,box:BoundBox,out:Vector3):Number{
			return null;
		}

		/**
		 * 空间中射线和包围球是否相交
		 * @param ray 射线
		 * @param sphere 包围球
		 * @return 相交距离,-1表示不相交
		 */
		public static function intersectsRayAndSphereRD(ray:Ray,sphere:BoundSphere):Number{
			return null;
		}

		/**
		 * 空间中射线和包围球是否相交
		 * @param ray 射线
		 * @param sphere 包围球
		 * @param out 相交点
		 * @return 相交距离,-1表示不相交
		 */
		public static function intersectsRayAndSphereRP(ray:Ray,sphere:BoundSphere,out:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围球和三角面是否相交
		 * @param sphere 包围球
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回是否相交
		 */
		public static function intersectsSphereAndTriangle(sphere:BoundSphere,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Boolean{
			return null;
		}

		/**
		 * 空间中点和平面是否相交
		 * @param plane 平面
		 * @param point 点
		 * @return 碰撞状态
		 */
		public static function intersectsPlaneAndPoint(plane:Plane,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中平面和平面是否相交
		 * @param plane1 平面1
		 * @param plane2 平面2
		 * @return 是否相交
		 */
		public static function intersectsPlaneAndPlane(plane1:Plane,plane2:Plane):Boolean{
			return null;
		}

		/**
		 * 空间中平面和平面是否相交
		 * @param plane1 平面1
		 * @param plane2 平面2
		 * @param line 相交线
		 * @return 是否相交
		 */
		public static function intersectsPlaneAndPlaneRL(plane1:Plane,plane2:Plane,line:Ray):Boolean{
			return null;
		}

		/**
		 * 空间中平面和包围盒是否相交
		 * @param plane 平面
		 * @param box 包围盒
		 * @return 碰撞状态
		 */
		public static function intersectsPlaneAndBox(plane:Plane,box:BoundBox):Number{
			return null;
		}

		/**
		 * 空间中平面和包围球是否相交
		 * @param plane 平面
		 * @param sphere 包围球
		 * @return 碰撞状态
		 */
		public static function intersectsPlaneAndSphere(plane:Plane,sphere:BoundSphere):Number{
			return null;
		}

		/**
		 * 空间中包围盒和包围盒是否相交
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 * @return 是否相交
		 */
		public static function intersectsBoxAndBox(box1:BoundBox,box2:BoundBox):Boolean{
			return null;
		}

		/**
		 * 空间中包围盒和包围球是否相交
		 * @param box 包围盒
		 * @param sphere 包围球
		 * @return 是否相交
		 */
		public static function intersectsBoxAndSphere(box:BoundBox,sphere:BoundSphere):Boolean{
			return null;
		}

		/**
		 * 空间中包围球和包围球是否相交
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 * @return 是否相交
		 */
		public static function intersectsSphereAndSphere(sphere1:BoundSphere,sphere2:BoundSphere):Boolean{
			return null;
		}

		/**
		 * 空间中包围盒是否包含另一个点
		 * @param box 包围盒
		 * @param point 点
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function boxContainsPoint(box:BoundBox,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围盒是否包含另一个包围盒
		 * @param box1 包围盒1
		 * @param box2 包围盒2
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function boxContainsBox(box1:BoundBox,box2:BoundBox):Number{
			return null;
		}

		/**
		 * 空间中包围盒是否包含另一个包围球
		 * @param box 包围盒
		 * @param sphere 包围球
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function boxContainsSphere(box:BoundBox,sphere:BoundSphere):Number{
			return null;
		}

		/**
		 * 空间中包围球是否包含另一个点
		 * @param sphere 包围球
		 * @param point 点
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function sphereContainsPoint(sphere:BoundSphere,point:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围球是否包含另一个三角面
		 * @param sphere 
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @return 返回空间位置关系
		 */
		public static function sphereContainsTriangle(sphere:BoundSphere,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3):Number{
			return null;
		}

		/**
		 * 空间中包围球是否包含另一包围盒
		 * @param sphere 包围球
		 * @param box 包围盒
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function sphereContainsBox(sphere:BoundSphere,box:BoundBox):Number{
			return null;
		}

		/**
		 * 空间中包围球是否包含另一包围球
		 * @param sphere1 包围球
		 * @param sphere2 包围球
		 * @return 位置关系:0 不想交,1 包含, 2 相交
		 */
		public static function sphereContainsSphere(sphere1:BoundSphere,sphere2:BoundSphere):Number{
			return null;
		}

		/**
		 * 空间中点与三角面的最近点
		 * @param point 点
		 * @param vertex1 三角面顶点1
		 * @param vertex2 三角面顶点2
		 * @param vertex3 三角面顶点3
		 * @param out 最近点
		 */
		public static function closestPointPointTriangle(point:Vector3,vertex1:Vector3,vertex2:Vector3,vertex3:Vector3,out:Vector3):void{}

		/**
		 * 空间中平面与一点的最近点
		 * @param plane 平面
		 * @param point 点
		 * @param out 最近点
		 */
		public static function closestPointPlanePoint(plane:Plane,point:Vector3,out:Vector3):void{}

		/**
		 * 空间中包围盒与一点的最近点
		 * @param box 包围盒
		 * @param point 点
		 * @param out 最近点
		 */
		public static function closestPointBoxPoint(box:BoundBox,point:Vector3,out:Vector3):void{}

		/**
		 * 空间中包围球与一点的最近点
		 * @param sphere 包围球
		 * @param point 点
		 * @param out 最近点
		 */
		public static function closestPointSpherePoint(sphere:BoundSphere,point:Vector3,out:Vector3):void{}

		/**
		 * 空间中包围球与包围球的最近点
		 * @param sphere1 包围球1
		 * @param sphere2 包围球2
		 * @param out 最近点
		 */
		public static function closestPointSphereSphere(sphere1:BoundSphere,sphere2:BoundSphere,out:Vector3):void{}
	}

}
