/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	improt laya.utils.Timer;
	public class Scene extends laya.display.Sprite {
		public static var unDestroyedScenes:Array;
		private static var _root:*;
		private static var _loadPage:*;
		public var autoDestroyAtClosed:Boolean;
		public var url:String;
		private var _timer:*;
		private var _viewCreated:*;

		public function Scene(){}
		protected function createChildren():void{}
		public function loadScene(path:String):void{}
		private var _onSceneLoaded:*;
		public function createView(view:*):void{}
		public function getNodeByID(id:Number):*{}
		public function open(closeOther:Boolean = null,param:* = null):void{}
		public function onOpened(param:*):void{}
		public function close(type:String = null):void{}
		public function onClosed(type:String = null):void{}
		public function destroy(destroyChild:Boolean = null):void{}
		public var scaleX:Number;
		public var scaleY:Number;
		public var width:Number;
		public var height:Number;
		protected function _sizeChanged():void{}
		public static function get root():Sprite{};
		public var timer:Timer;
		public static function load(url:String,complete:Handler = null,progress:Handler = null):void{}
		public static function open(url:String,closeOther:Boolean = null,param:* = null,complete:Handler = null,progress:Handler = null):void{}
		private static var _onSceneLoaded:*;
		public static function close(url:String,name:String = null):Boolean{}
		public static function closeAll():void{}
		public static function destroy(url:String,name:String = null):Boolean{}
		public static function gc():void{}
		public static function setLoadingPage(loadPage:Scene):void{}
		public static function showLoadingPage(param:* = null,delay:Number = null):void{}
		private static var _showLoading:*;
		private static var _hideLoading:*;
		public static function hideLoadingPage(delay:Number = null):void{}
	}

}
