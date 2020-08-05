package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.math.Ray;
	import laya.d3.core.IClone;

	/**
	 * <code>BoundSphere</code> 类用于创建包围球。
	 */
	public class BoundSphere implements IClone {
		private static var _tempVector3:*;

		/**
		 * 包围球的中心。
		 */
		public var center:Vector3;

		/**
		 * 包围球的半径。
		 */
		public var radius:Number;

		/**
		 * 创建一个 <code>BoundSphere</code> 实例。
		 * @param center 包围球的中心。
		 * @param radius 包围球的半径。
		 */

		public function BoundSphere(center:Vector3 = undefined,radius:Number = undefined){}
		public function toDefault():void{}

		/**
		 * 从顶点的子队列生成包围球。
		 * @param points 顶点的队列。
		 * @param start 顶点子队列的起始偏移。
		 * @param count 顶点子队列的顶点数。
		 * @param result 生成的包围球。
		 */
		public static function createFromSubPoints(points:Array,start:Number,count:Number,out:BoundSphere):void{}

		/**
		 * 从顶点队列生成包围球。
		 * @param points 顶点的队列。
		 * @param result 生成的包围球。
		 */
		public static function createfromPoints(points:Array,out:BoundSphere):void{}

		/**
		 * 判断射线是否与碰撞球交叉，并返回交叉距离。
		 * @param ray 射线。
		 * @return 距离交叉点的距离，-1表示不交叉。
		 */
		public function intersectsRayDistance(ray:Ray):Number{
			return null;
		}

		/**
		 * 判断射线是否与碰撞球交叉，并返回交叉点。
		 * @param ray 射线。
		 * @param outPoint 交叉点。
		 * @return 距离交叉点的距离，-1表示不交叉。
		 */
		public function intersectsRayPoint(ray:Ray,outPoint:Vector3):Number{
			return null;
		}

		/**
		 * 克隆。
		 * @param destObject 克隆源。
		 */
		public function cloneTo(destObject:*):void{}

		/**
		 * 克隆。
		 * @return 克隆副本。
		 */
		public function clone():*{}
	}

}
