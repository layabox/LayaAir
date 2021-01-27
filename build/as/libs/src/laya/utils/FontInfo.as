package laya.utils {
	public class FontInfo {
		public static var EMPTY:FontInfo;
		private static var _cache:*;
		private static var _gfontID:*;
		private static var _lastFont:*;
		private static var _lastFontInfo:*;

		/**
		 * 解析字体模型
		 * @param font 
		 */
		public static function Parse(font:String):FontInfo{
			return null;
		}

		public function FontInfo(font:String = undefined){}

		/**
		 * 设置字体格式
		 * @param value 
		 */
		public function setFont(value:String):void{}
	}

}
