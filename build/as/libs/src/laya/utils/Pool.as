/*[IF-FLASH]*/
package laya.utils {
	public class Pool {
		private static var _CLSID:*;
		private static var POOLSIGN:*;
		private static var _poolDic:*;
		public static function getPoolBySign(sign:String):Array{}
		public static function clearBySign(sign:String):void{}
		public static function recover(sign:String,item:*):void{}
		public static function recoverByClass(instance:*):void{}
		private static var _getClassSign:*;
		public static function createByClass(cls:Class):*{}
		public static function getItemByClass(sign:String,cls:Class):*{}
		public static function getItemByCreateFun(sign:String,createFun:Function,caller:* = null):*{}
		public static function getItem(sign:String):*{}
	}

}
