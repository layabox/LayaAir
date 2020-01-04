package laya.utils {

	/**
	 * @private 基于个数的对象缓存管理器
	 */
	public class PoolCache {

		/**
		 * 对象在Pool中的标识
		 */
		public var sign:String;

		/**
		 * 允许缓存的最大数量
		 */
		public var maxCount:Number;

		/**
		 * 获取缓存的对象列表
		 * @return 
		 */
		public function getCacheList():Array{
			return null;
		}

		/**
		 * 尝试清理缓存
		 * @param force 是否强制清理
		 */
		public function tryDispose(force:Boolean):void{}

		/**
		 * 添加对象缓存管理
		 * @param sign 对象在Pool中的标识
		 * @param maxCount 允许缓存的最大数量
		 */
		public static function addPoolCacheManager(sign:String,maxCount:Number = null):void{}
	}

}
