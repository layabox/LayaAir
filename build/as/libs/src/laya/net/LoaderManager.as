/*[IF-FLASH]*/
package laya.net {
	improt laya.events.EventDispatcher;
	improt laya.utils.Handler;
	public class LoaderManager extends laya.events.EventDispatcher {
		private static var _resMap:*;
		public static var createMap:*;
		public var retryNum:Number;
		public var retryDelay:Number;
		public var maxLoader:Number;
		private var _loaders:*;
		private var _loaderCount:*;
		private var _resInfos:*;
		private var _infoPool:*;
		private var _maxPriority:*;
		private var _failRes:*;
		private var _statInfo:*;
		public function getProgress():Number{}
		public function resetProgress():void{}

		public function LoaderManager(){}
		public function create(url:*,complete:Handler = null,progress:Handler = null,type:String = null,constructParams:Array = null,propertyParams:* = null,priority:Number = null,cache:Boolean = null):void{}
		private var _createOne:*;
		public function load(url:*,complete:Handler = null,progress:Handler = null,type:String = null,priority:Number = null,cache:Boolean = null,group:String = null,ignoreCache:Boolean = null,useWorkerLoader:Boolean = null):LoaderManager{}
		private var _resInfoLoaded:*;
		private var _next:*;
		private var _doLoad:*;
		private var _endLoad:*;
		private var _addReTry:*;
		public function clearRes(url:String):void{}
		public function clearTextureRes(url:String):void{}
		public function getRes(url:String):*{}
		public function cacheRes(url:String,data:*):void{}
		public function setGroup(url:String,group:String):void{}
		public function clearResByGroup(group:String):void{}
		public static function cacheRes(url:String,data:*):void{}
		public function clearUnLoaded():void{}
		public function cancelLoadByUrls(urls:Array):void{}
		public function cancelLoadByUrl(url:String):void{}
		private var _loadAssets:*;
		public function decodeBitmaps(urls:Array):void{}
		private var _decodeTexture:*;
	}

}
