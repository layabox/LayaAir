/*[IF-FLASH]*/
package laya.utils {
	improt laya.resource.HTMLCanvas;
	public class Browser {
		public static var userAgent:String;
		public static var onMobile:Boolean;
		public static var onIOS:Boolean;
		public static var onMac:Boolean;
		public static var onIPhone:Boolean;
		public static var onIPad:Boolean;
		public static var onAndroid:Boolean;
		public static var onWP:Boolean;
		public static var onQQBrowser:Boolean;
		public static var onMQQBrowser:Boolean;
		public static var onSafari:Boolean;
		public static var onIE:Boolean;
		public static var onWeiXin:Boolean;
		public static var onPC:Boolean;
		public static var onMiniGame:Boolean;
		public static var onBDMiniGame:Boolean;
		public static var onKGMiniGame:Boolean;
		public static var onQGMiniGame:Boolean;
		public static var onVVMiniGame:Boolean;
		public static var onLimixiu:Boolean;
		public static var onFirefox:Boolean;
		public static var onEdge:Boolean;
		public static var onLayaRuntime:Boolean;
		public static var supportWebAudio:Boolean;
		public static var supportLocalStorage:Boolean;
		public static var canvas:HTMLCanvas;
		public static var context:CanvasRenderingContext2D;
		private static var _window:*;
		private static var _document:*;
		private static var _container:*;
		private static var _pixelRatio:*;
		public static var mainCanvas:*;
		private static var hanzi:*;
		private static var fontMap:*;
		public static var measureText:Function;
		public static function createElement(type:String):*{}
		public static function getElementById(type:String):*{}
		public static function removeElement(ele:*):void{}
		public static function now():Number{}
		public static function get clientWidth():Number{};
		public static function get clientHeight():Number{};
		public static function get width():Number{};
		public static function get height():Number{};
		public static function get pixelRatio():Number{};
		public static var container:*;
		public static function get window():*{};
		public static function get document():*{};
	}

}
