/*[IF-FLASH]*/
package laya.utils {
	public class ColorUtils {
		public static var _SAVE:*;
		public static var _SAVE_SIZE:Number;
		private static var _COLOR_MAP:*;
		private static var _DEFAULT:*;
		private static var _COLODID:*;
		public var arrColor:Array;
		public var strColor:String;
		public var numColor:Number;

		public function ColorUtils(value:*){}
		public static function _initDefault():*{}
		public static function _initSaveMap():void{}
		public static function create(value:*):ColorUtils{}
	}

}
