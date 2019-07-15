/*[IF-FLASH]*/
package laya.utils {
	public class CacheManger {
		public static var loopTimeLimit:Number;
		private static var _cacheList:*;
		private static var _index:*;

		public function CacheManger(){}
		public static function regCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void{}
		public static function unRegCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void{}
		public static function forceDispose():void{}
		public static function beginCheck(waitTime:Number = null):void{}
		public static function stopCheck():void{}
		private static var _checkLoop:*;
	}

}
