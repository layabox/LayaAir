package laya.d3.math {
	import laya.d3.math.Vector3;

	/**
	 * 平面。
	 */
	public class Plane {

		/**
		 * 平面的向量
		 */
		public var normal:Vector3;

		/**
		 * 平面到坐标系原点的距离
		 */
		public var distance:Number;

		/**
		 * 平面与其他几何体相交类型
		 */
		public static var PlaneIntersectionType_Back:Number;
		public static var PlaneIntersectionType_Front:Number;
		public static var PlaneIntersectionType_Intersecting:Number;

		/**
		 * 创建一个 <code>Plane</code> 实例。
		 * @param normal 平面的向量
		 * @param d 平面到原点的距离
		 */

		public function Plane(normal:Vector3 = undefined,d:Number = undefined){}

		/**
		 * 通过三个点创建一个平面。
		 * @param point0 第零个点
		 * @param point1 第一个点
		 * @param point2 第二个点
		 */
		public static function createPlaneBy3P(point0:Vector3,point1:Vector3,point2:Vector3,out:Plane):void{}

		/**
		 * 更改平面法线向量的系数，使之成单位长度。
		 */
		public function normalize():void{}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():Plane{
			return null;
		}
	}

}
