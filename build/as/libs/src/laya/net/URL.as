/*[IF-FLASH]*/
package laya.net {
	public class URL {
		public static var version:*;
		private var _url:*;
		private var _path:*;
		public static var exportSceneToJson:Boolean;

		public function URL(url:String){}
		public function get url():String{};
		public function get path():String{};
		public static var _basePath:String;
		public static var rootPath:String;
		public static var basePath:String;
		public static var customFormat:Function;
		public static function formatURL(url:String):String{}
		public static function getPath(url:String):String{}
		public static function getFileName(url:String):String{}
		private static var _adpteTypeList:*;
		public static function getAdptedFilePath(url:String):String{}
	}

}
