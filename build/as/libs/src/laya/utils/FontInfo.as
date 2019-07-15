/*[IF-FLASH]*/
package laya.utils {
	public class FontInfo {
		public static var EMPTY:FontInfo;
		private static var _cache:*;
		private static var _gfontID:*;
		private static var _lastFont:*;
		private static var _lastFontInfo:*;
		public static function Parse(font:String):FontInfo{}
		public var _id:Number;
		public var _font:String;
		public var _family:String;
		public var _size:Number;
		public var _italic:Boolean;
		public var _bold:Boolean;

		public function FontInfo(font:String){}
		public function setFont(value:String):void{}
	}

}
