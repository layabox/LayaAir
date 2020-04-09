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
		 * 根据矩阵获取6个包围平面。
		 * @param m 描述矩阵。
		 * @param np 近平面。
		 * @param fp 远平面。
		 * @param lp 左平面。
		 * @param rp 右平面。
		 * @param tp 顶平面。
		 * @param bp 底平面。
		 */
		public static function getPlanesFromMatrix(m:Matrix4x4,np:Plane,fp:Plane,lp:Plane,rp:Plane,tp:Plane,bp:Plane):void{}

		/**
		 * 创建一个 <code>BoundFrustum</code> 实例。
		 * @param matrix 锥截体的描述4x4矩阵。
		 */

		public function BoundFrustum(matrix:Matrix4x4 = undefined){}

		/**
		 * 描述矩阵。
		 */
		public var matrix:Matrix4x4;

		/**
		 * 近平面。
		 */
		public function get near():Plane{
				return null;
		}

		/**
		 * 远平面。
		 */
		public function get far():Plane{
				return null;
		}

		/**
		 * 左平面。
		 */
		public function get left():Plane{
				return null;
		}

		/**
		 * 右平面。
		 */
		public function get right():Plane{
				return null;
		}

		/**
		 * 顶平面。
		 */
		public function get top():Plane{
				return null;
		}

		/**
		 * 底平面。
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
		 * 锥截体三个相交平面的交点。
		 * @param p1 平面1。
		 * @param p2 平面2。
		 * @param p3 平面3。
		 */
		public static function get3PlaneInterPoint(p1:Plane,p2:Plane,p3:Plane,out:Vector3):void{}

		/**
		 * 锥截体的8个顶点。
		 * @param corners 返回顶点的输出队列。
		 */
		public function getCorners(corners:Array):void{}

		/**
		 * 与点的关系。
		 * @param point 点。
		 * @returns 包涵:1,相交:2,不相交:0
		 */
		public function containsPoint(point:Vector3):Number{
			return null;
		}

		/**
		 * 是否与包围盒交叉。
		 * @param box 包围盒。
		 * @returns boolean 是否相交
		 */
		public function intersects(box:BoundBox):Boolean{
			return null;
		}

		/**
		 * 与包围盒的位置关系。
		 * @param box 包围盒。
		 * @returns 包涵:1,相交:2,不相交:0
		 */
		public function containsBoundBox(box:BoundBox):Number{
			return null;
		}

		/**
		 * 与包围球的位置关系
		 * @param sphere 包围球。
		 * @returns 包涵:1,相交:2,不相交:0
		 */
		public function containsBoundSphere(sphere:BoundSphere):Number{
			return null;
		}
	}

}
