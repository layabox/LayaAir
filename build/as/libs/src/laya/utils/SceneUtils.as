/*[IF-FLASH]*/
package laya.utils {
	public class SceneUtils {
		private static var _funMap:*;
		private static var _parseWatchData:*;
		private static var _parseKeyWord:*;
		public static function __init():void{}
		public static function getBindFun(value:String):Function{}
		public static function createByData(root:*,uiView:*):*{}
		public static function createInitTool():InitTool{}
		public static function createComp(uiView:*,comp:* = null,view:* = null,dataMap:Array = null,initTool:InitTool = null):*{}
		private static var setCompValue:*;
		public static function getCompInstance(json:*):*{}
	}

}
	improt laya.display.Scene;
	public class InitTool {
		private var _nodeRefList:*;
		private var _initList:*;
		private var _loadList:*;
		public function reset():void{}
		public function recover():void{}
		public static function create():InitTool{}
		public function addLoadRes(url:String,type:String = null):void{}
		public function addNodeRef(node:*,prop:String,referStr:String):void{}
		public function setNodeRef():void{}
		public function getReferData(referStr:String):*{}
		public function addInitItem(item:*):void{}
		public function doInits():void{}
		public function finish():void{}
		public function beginLoad(scene:Scene):void{}
	}
