package laya.net {
	import laya.events.EventDispatcher;

	/**
	 * @private Worker Image加载器
	 */
	public class WorkerLoader extends EventDispatcher {

		/**
		 * 单例
		 */
		public static var I:WorkerLoader;

		/**
		 * worker.js的路径
		 */
		public static var workerPath:String;

		/**
		 * @private 
		 */
		private static var _preLoadFun:*;

		/**
		 * @private 
		 */
		private static var _enable:*;

		/**
		 * @private 
		 */
		private static var _tryEnabled:*;

		/**
		 * 使用的Worker对象。
		 */
		public var worker:Worker;

		/**
		 * @private 
		 */
		protected var _useWorkerLoader:Boolean;

		public function WorkerLoader(){}

		/**
		 * 是否支持worker
		 * @return 是否支持worker
		 */
		public static function workerSupported():Boolean{
			return null;
		}

		/**
		 * 尝试启用WorkerLoader,只有第一次调用有效
		 */
		public static function enableWorkerLoader():void{}

		/**
		 * 是否启用。
		 */
		public static var enable:Boolean;

		/**
		 * @private 
		 */
		private var workerMessage:*;

		/**
		 * @private 
		 */
		private var imageLoaded:*;

		/**
		 * 加载图片
		 * @param url 图片地址
		 */
		public function loadImage(url:String):void{}

		/**
		 * @private 加载图片资源。
		 * @param url 资源地址。
		 */
		protected function _loadImage(url:String):void{}
	}

}
