package laya.d3.math {
	import laya.d3.core.IClone;

	/**
	 * <code>Color</code> 类用于创建颜色实例。
	 */
	public class Color implements IClone {

		/**
		 * 红色
		 */
		public static var RED:Color;

		/**
		 * 绿色
		 */
		public static var GREEN:Color;

		/**
		 * 蓝色
		 */
		public static var BLUE:Color;

		/**
		 * 蓝绿色
		 */
		public static var CYAN:Color;

		/**
		 * 黄色
		 */
		public static var YELLOW:Color;

		/**
		 * 品红色
		 */
		public static var MAGENTA:Color;

		/**
		 * 灰色
		 */
		public static var GRAY:Color;

		/**
		 * 白色
		 */
		public static var WHITE:Color;

		/**
		 * 黑色
		 */
		public static var BLACK:Color;

		/**
		 * Gamma空间值转换到线性空间。
		 * @param value gamma空间值。
		 */
		public static function gammaToLinearSpace(value:Number):Number{
			return null;
		}

		/**
		 * 线性空间值转换到Gamma空间。
		 * @param value 线性空间值。
		 */
		public static function linearToGammaSpace(value:Number):Number{
			return null;
		}

		/**
		 * red分量
		 */
		public var r:Number;

		/**
		 * green分量
		 */
		public var g:Number;

		/**
		 * blue分量
		 */
		public var b:Number;

		/**
		 * alpha分量
		 */
		public var a:Number;

		/**
		 * 创建一个 <code>Color</code> 实例。
		 * @param r 颜色的red分量。
		 * @param g 颜色的green分量。
		 * @param b 颜色的blue分量。
		 * @param a 颜色的alpha分量。
		 */

		public function Color(r:Number = undefined,g:Number = undefined,b:Number = undefined,a:Number = undefined){}

		/**
		 * Gamma空间转换到线性空间。
		 * @param linear 线性空间颜色。
		 */
		public function toLinear(out:Color):void{}

		/**
		 * 线性空间转换到Gamma空间。
		 * @param gamma Gamma空间颜色。
		 */
		public function toGamma(out:Color):void{}

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
		public function forNativeElement():void{}
	}

}
