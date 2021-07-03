package laya.utils {

	/**
	 * @private <code>ColorUtils</code> 是一个颜色值处理类。
	 */
	public class ColorUtils {

		/**
		 * @private 
		 */
		public static var _SAVE:*;

		/**
		 * @private 
		 */
		public static var _SAVE_SIZE:Number;

		/**
		 * @private 
		 */
		private static var _COLOR_MAP:*;

		/**
		 * @private 
		 */
		private static var _DEFAULT:*;

		/**
		 * @private 
		 */
		private static var _COLODID:*;

		/**
		 * rgba 取值范围0-1
		 */
		public var arrColor:Array;

		/**
		 * 字符串型颜色值。
		 */
		public var strColor:String;

		/**
		 * uint 型颜色值。
		 */
		public var numColor:Number;

		/**
		 * 根据指定的属性值，创建一个 <code>Color</code> 类的实例。
		 * @param value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
		 */

		public function ColorUtils(value:* = undefined){}

		/**
		 * @private 
		 */
		public static function _initDefault():*{}

		/**
		 * @private 缓存太大，则清理缓存
		 */
		public static function _initSaveMap():void{}

		/**
		 * 根据指定的属性值，创建并返回一个 <code>Color</code> 类的实例。
		 * @param value 颜色值，可以是字符串："#ff0000"或者16进制颜色 0xff0000。
		 * @return 一个 <code>Color</code> 类的实例。
		 */
		public static function create(value:*):ColorUtils{
			return null;
		}
	}

}
