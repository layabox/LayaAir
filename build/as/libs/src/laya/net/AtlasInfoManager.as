/*[IF-FLASH]*/
package laya.net {
	improt laya.utils.Handler;
	public class AtlasInfoManager {
		private static var _fileLoadDic:*;
		public static function enable(infoFile:String,callback:Handler = null):void{}
		private static var _onInfoLoaded:*;
		public static function getFileLoadPath(file:String):String{}
	}

}
