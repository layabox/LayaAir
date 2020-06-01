package laya.net {
	import laya.utils.Handler;

	/**
	 * @private 
	 */
	public class TTFLoader {
		private static var _testString:*;
		public var fontName:String;
		public var complete:Handler;
		public var err:Handler;
		private var _fontTxt:*;
		private var _url:*;
		private var _div:*;
		private var _txtWidth:*;
		private var _http:*;
		public function load(fontPath:String):void{}
		private var _loadConch:*;
		private var _onHttpLoaded:*;
		private var _clearHttp:*;
		private var _onErr:*;
		private var _complete:*;
		private var _checkComplete:*;
		private var _loadWithFontFace:*;
		private var _createDiv:*;
		private var _loadWithCSS:*;
	}

}
