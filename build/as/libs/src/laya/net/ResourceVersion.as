/*[IF-FLASH]*/
package laya.net {
	improt laya.utils.Handler;
	public class ResourceVersion {
		public static var FOLDER_VERSION:Number;
		public static var FILENAME_VERSION:Number;
		public static var manifest:*;
		public static var type:Number;
		public static function enable(manifestFile:String,callback:Handler,type:Number = null):void{}
		private static var onManifestLoaded:*;
		public static function addVersionPrefix(originURL:String):String{}
	}

}
