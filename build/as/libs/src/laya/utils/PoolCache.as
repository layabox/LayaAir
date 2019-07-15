/*[IF-FLASH]*/
package laya.utils {
	public class PoolCache {
		public var sign:String;
		public var maxCount:Number;
		public function getCacheList():Array{}
		public function tryDispose(force:Boolean):void{}
		public static function addPoolCacheManager(sign:String,maxCount:Number = null):void{}
	}

}
