/*[IF-FLASH]*/
package laya.net {
	improt laya.net.HttpRequest;
	improt laya.events.EventDispatcher;
	public class Loader extends laya.events.EventDispatcher {
		public static var TEXT:String;
		public static var JSON:String;
		public static var PREFAB:String;
		public static var XML:String;
		public static var BUFFER:String;
		public static var IMAGE:String;
		public static var SOUND:String;
		public static var ATLAS:String;
		public static var FONT:String;
		public static var TTF:String;
		public static var PLF:String;
		public static var PLFB:String;
		public static var HIERARCHY:String;
		public static var MESH:String;
		public static var MATERIAL:String;
		public static var TEXTURE2D:String;
		public static var TEXTURECUBE:String;
		public static var ANIMATIONCLIP:String;
		public static var AVATAR:String;
		public static var TERRAINHEIGHTDATA:String;
		public static var TERRAINRES:String;
		public static var typeMap:*;
		public static var parserMap:*;
		public static var maxTimeOut:Number;
		public static var groupMap:*;
		public static var loadedMap:*;
		protected static var atlasMap:*;
		public static var preLoadedMap:*;
		protected static var _imgCache:*;
		protected static var _loaders:Array;
		protected static var _isWorking:Boolean;
		protected static var _startIndex:Number;
		public static function getTypeFromUrl(url:String):String{}
		protected var _url:String;
		protected var _type:String;
		protected var _http:HttpRequest;
		protected var _useWorkerLoader:Boolean;
		public function load(url:String,type:String = null,cache:Boolean = null,group:String = null,ignoreCache:Boolean = null,useWorkerLoader:Boolean = null):void{}
		public function _loadResourceFilter(type:String,url:String):void{}
		private var _loadHttpRequest:*;
		private var _loadHtmlImage:*;
		public function _loadHttpRequestWhat(url:String,contentType:String):void{}
		protected function _loadTTF(url:String):void{}
		protected function _loadImage(url:String):void{}
		public function _loadSound(url:String):void{}
		protected function onProgress(value:Number):void{}
		protected function onError(message:String):void{}
		protected function onLoaded(data:* = null):void{}
		private var parsePLFData:*;
		private var parsePLFBData:*;
		private var parseOnePLFBFile:*;
		protected function complete(data:*):void{}
		private static var checkNext:*;
		public function endLoad(content:* = null):void{}
		public function get url():String{};
		public function get type():String{};
		public function get cache():Boolean{};
		public function get data():*{};
		public static function clearRes(url:String):void{}
		public static function clearTextureRes(url:String):void{}
		public static function getRes(url:String):*{}
		public static function getAtlas(url:String):Array{}
		public static function cacheRes(url:String,data:*):void{}
		public static function setGroup(url:String,group:String):void{}
		public static function clearResByGroup(group:String):void{}
	}

}
