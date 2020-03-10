package laya.utils {

	/**
	 * @private 对象缓存统一管理类
	 */
	public class CacheManger {

		/**
		 * 单次清理检测允许执行的时间，单位ms。
		 */
		public static var loopTimeLimit:Number;

		/**
		 * @private 
		 */
		private static var _cacheList:*;

		/**
		 * @private 当前检测的索引
		 */
		private static var _index:*;

		public function CacheManger(){}

		/**
		 * 注册cache管理函数
		 * @param disposeFunction 释放函数 fun(force:Boolean)
		 * @param getCacheListFunction 获取cache列表函数fun():Array
		 */
		public static function regCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void{}

		/**
		 * 移除cache管理函数
		 * @param disposeFunction 释放函数 fun(force:Boolean)
		 * @param getCacheListFunction 获取cache列表函数fun():Array
		 */
		public static function unRegCacheByFunction(disposeFunction:Function,getCacheListFunction:Function):void{}

		/**
		 * 强制清理所有管理器
		 */
		public static function forceDispose():void{}

		/**
		 * 开始检测循环
		 * @param waitTime 检测间隔时间
		 */
		public static function beginCheck(waitTime:Number = null):void{}

		/**
		 * 停止检测循环
		 */
		public static function stopCheck():void{}

		/**
		 * @private 检测函数
		 */
		private static var _checkLoop:*;
	}

}
