package laya.maths {

	/**
	 * <code>Point</code> 对象表示二维坐标系统中的某个位置，其中 x 表示水平轴，y 表示垂直轴。
	 */
	public class Point {

		/**
		 * 临时使用的公用对象。
		 */
		public static var TEMP:Point;

		/**
		 * @private 全局空的point对象(x=0，y=0)，不允许修改此对象内容
		 */
		public static var EMPTY:Point;

		/**
		 * 该点的水平坐标。
		 */
		public var x:Number;

		/**
		 * 该点的垂直坐标。
		 */
		public var y:Number;

		/**
		 * 根据指定坐标，创建一个新的 <code>Point</code> 对象。
		 * @param x （可选）水平坐标。
		 * @param y （可选）垂直坐标。
		 */

		public function Point(x:Number = undefined,y:Number = undefined){}

		/**
		 * 从对象池创建
		 */
		public static function create():Point{
			return null;
		}

		/**
		 * 将 <code>Point</code> 的成员设置为指定值。
		 * @param x 水平坐标。
		 * @param y 垂直坐标。
		 * @return 当前 Point 对象。
		 */
		public function setTo(x:Number,y:Number):Point{
			return null;
		}

		/**
		 * 重置
		 */
		public function reset():Point{
			return null;
		}

		/**
		 * 回收到对象池，方便复用
		 */
		public function recover():void{}

		/**
		 * 计算当前点和目标点(x，y)的距离。
		 * @param x 水平坐标。
		 * @param y 垂直坐标。
		 * @return 返回当前点和目标点之间的距离。
		 */
		public function distance(x:Number,y:Number):Number{
			return null;
		}

		/**
		 * 返回包含 x 和 y 坐标的值的字符串。
		 */
		public function toString():String{
			return null;
		}

		/**
		 * 标准化向量。
		 */
		public function normalize():void{}

		/**
		 * copy point坐标
		 * @param point 需要被copy的point
		 */
		public function copy(point:Point):Point{
			return null;
		}
	}

}
