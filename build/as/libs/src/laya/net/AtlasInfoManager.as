package laya.net {
	import laya.utils.Handler;

	/**
	 * @private 
	 */
	public class AtlasInfoManager {
		private static var _fileLoadDic:*;
		public static function enable(infoFile:String,callback:Handler = null):void{}

		/**
		 * @private 
		 */
		private static var _onInfoLoaded:*;
		public static function getFileLoadPath(file:String):String{
			return null;
		}
	}

}
