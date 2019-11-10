package laya.d3.math {
	import laya.d3.math.Vector3;
	import laya.d3.math.Matrix4x4;
	import laya.d3.math.Plane;
	import laya.d3.math.BoundBox;
	import laya.d3.math.BoundSphere;

	/**
	 * <code>BoundFrustum</code> 类用于创建锥截体。
	 */
	public class BoundFrustum {

		/**
		 * 4x4矩阵
		 */
		private var _matrix:*;

		/**
		 * 近平面
		 */
		private var _near:*;

		/**
		 * 远平面
		 */
		private var _far:*;

		/**
		 * 左平面
		 */
		private var _left:*;

		/**
		 * 右平面
		 */
		private var _right:*;

		/**
		 * 顶平面
		 */
		private var _top:*;

		/**
		 * 底平面
		 */
		private var _bottom:*;

		/**
		 * 创建一个 <code>BoundFrustum</code> 实例。
		 * @param matrix 锥截体的描述4x4矩阵。
		 */

		public function BoundFrustum(matrix:Matrix4x4 = undefined){}

		/**
		 * 获取描述矩阵。
		 * @return 描述矩阵。
		 */

		/**
		 * 设置描述矩阵。
		 * @param matrix 描述矩阵。
		 */
		public var matrix:Matrix4x4;

		/**
		 * 获取近平面。
		 * @return 近平面。
		 */
		public function get near():Plane{
				return null;
		}

		/**
		 * 获取远平面。
		 * @return 远平面。
		 */
		public function get far():Plane{
				return null;
		}

		/**
		 * 获取左平面。
		 * @return 左平面。
		 */
		public function get left():Plane{
				return null;
		}

		/**
		 * 获取右平面。
		 * @return 右平面。
		 */
		public function get right():Plane{
				return null;
		}

		/**
		 * 获取顶平面。
		 * @return 顶平面。
		 */
		public function get top():Plane{
				return null;
		}

		/**
		 * 获取底平面。
		 * @return 底平面。
		 */
		public function get bottom():Plane{
				return null;
		}

		/**
		 * 判断是否与其他锥截体相等。
		 * @param other 锥截体。
		 */
		public function equalsBoundFrustum(other:BoundFrustum):Boolean{
			return null;
		}

		/**
		 * 判断是否与其他对象相等。
		 * @param obj 对象。
		 */
		public function equalsObj(obj:*):Boolean{
			return null;
		}

		/**
		 * 获取锥截体的任意一平面。
		 * 0:近平面
		 * 1:远平面
		 * 2:左平面
		 * 3:右平面
		 * 4:顶平面
		 * 5:底平面
		 * @param index 索引。
		 */
		public function getPlane(index:Number):Plane{
			return null;
		}

		/**
		 * 根据描述矩阵获取锥截体的6个面。
		 * @param m 描述矩阵。
		 * @param np 近平面。
		 * @param fp 远平面。
		 * @param lp 左平面。
		 * @param rp 右平面。
		 * @param tp 顶平面。
		 * @param bp 底平面。
		 */
		private static var _getPlanesFromMatrix:*;

		/**
		 * 锥截体三个相交平面的交点。
		 * @param p1 平面1。
		 * @param p2 平面2。
		 * @param p3 平面3。
		 */
		private static var _get3PlaneInterPoint:*;

		/**
		 * 锥截体的8个顶点。
		 * @param corners 返回顶点的输出队列。
		 */
		public function getCorners(corners:Array):void{}

		/**
		 * 与点的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param point 点。
		 */
		public function containsPoint(point:Vector3):Number{
			return null;
		}

		/**
		 * 是否与包围盒交叉。
		 * @param box 包围盒。
		 */
		public function intersects(box:BoundBox):Boolean{
			return null;
		}

		/**
		 * 与包围盒的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param box 包围盒。
		 */
		public function containsBoundBox(box:BoundBox):Number{
			return null;
		}

		/**
		 * 与包围球的位置关系。返回-1,包涵;0,相交;1,不相交
		 * @param sphere 包围球。
		 */
		public function containsBoundSphere(sphere:BoundSphere):Number{
			return null;
		}
	}

}
