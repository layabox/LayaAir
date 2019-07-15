/*[IF-FLASH]*/
package laya.net {
	public class LocalStorage {
		public static var _baseClass:*;
		public static var items:*;
		public static var support:Boolean;
		public static function __init__():Boolean{}
		public static function setItem(key:String,value:String):void{}
		public static function getItem(key:String):String{}
		public static function setJSON(key:String,value:*):void{}
		public static function getJSON(key:String):*{}
		public static function removeItem(key:String):void{}
		public static function clear():void{}
	}

}
