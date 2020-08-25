package laya.d3.math {

	/**
	 * <code>MathUtils3D</code> 类用于创建数学工具。
	 */
	public class MathUtils3D {

		/**
		 * 单精度浮点(float)零的容差
		 */
		public static var zeroTolerance:Number;

		/**
		 * 浮点数默认最大值
		 */
		public static var MaxValue:Number;

		/**
		 * 浮点数默认最小值
		 */
		public static var MinValue:Number;

		/**
		 * 角度转弧度系数
		 */
		public static var Deg2Rad:Number;

		/**
		 * 创建一个 <code>MathUtils</code> 实例。
		 */

		public function MathUtils3D(){}

		/**
		 * 是否在容差的范围内近似于0
		 * @param 判断值 
		 * @return 是否近似于0
		 */
		public static function isZero(v:Number):Boolean{
			return null;
		}

		/**
		 * 两个值是否在容差的范围内近似相等Sqr Magnitude
		 * @param 判断值 
		 * @return 是否近似于0
		 */
		public static function nearEqual(n1:Number,n2:Number):Boolean{
			return null;
		}
		public static function fastInvSqrt(value:Number):Number{
			return null;
		}
	}

}
