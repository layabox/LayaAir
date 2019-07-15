/*[IF-FLASH]*/
package  {
	improt laya.display.Sprite;
	improt laya.display.Stage;
	improt laya.net.LoaderManager;
	improt laya.renders.Render;
	improt laya.utils.Timer;
	public class Laya {
		public static var stage:Stage;
		public static var systemTimer:Timer;
		public static var startTimer:Timer;
		public static var physicsTimer:Timer;
		public static var updateTimer:Timer;
		public static var lateTimer:Timer;
		public static var timer:Timer;
		public static var loader:LoaderManager;
		public static var version:String;
		public static var render:Render;
		public static var _currentStage:Sprite;
		private static var _isinit:*;
		public static var isWXOpenDataContext:Boolean;
		public static var isWXPosMsg:Boolean;
		public static function init(width:Number,height:Number,...plugins):*{}
		public static function _getUrlPath():String{}
		public static function _arrayBufferSlice(start:Number,end:Number):ArrayBuffer{}
		public static var alertGlobalError:Boolean;
		private static var _evcode:*;
		public static function _runScript(script:String):*{}
		public static function enableDebugPanel(debugJsPath:String = null):void{}
		private static var isNativeRender_enable:*;
		private static var enableNative:*;
	}

}
