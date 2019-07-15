/*[IF-FLASH]*/
package laya.utils {
	improt laya.utils.Handler;
	improt laya.display.Sprite;
	improt laya.display.Node;
	public class ClassUtils {
		private static var DrawTypeDic:*;
		private static var _temParam:*;
		private static var _classMap:*;
		private static var _tM:*;
		private static var _alpha:*;
		public static function regClass(className:String,classDef:*):void{}
		public static function regShortClassName(classes:Array):void{}
		public static function getRegClass(className:String):*{}
		public static function getClass(className:String):*{}
		public static function getInstance(className:String):*{}
		public static function createByJson(json:*,node:* = null,root:Node = null,customHandler:Handler = null,instanceHandler:Handler = null):*{}
		public static function _addGraphicsToSprite(graphicO:*,sprite:Sprite):void{}
		private static var _getGraphicsFromSprite:*;
		private static var _getTransformData:*;
		private static var _addGraphicToGraphics:*;
		private static var _adptLineData:*;
		private static var _adptTextureData:*;
		private static var _adptLinesData:*;
		private static var _getParams:*;
		private static var _getObjVar:*;
	}

}
