package laya.utils {

	/**
	 * @private 
	 */
	public class CallLater {
		public static var I:CallLater;

		/**
		 * @private 
		 */
		private var _pool:*;

		/**
		 * @private 
		 */
		private var _map:*;

		/**
		 * @private 
		 */
		private var _laters:*;

		/**
		 * @private 
		 */
		private var _getHandler:*;

		/**
		 * 延迟执行。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 */
		public function callLater(caller:*,method:Function,args:Array = null):void{}

		/**
		 * 立即执行 callLater 。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 */
		public function runCallLater(caller:*,method:Function):void{}
	}

}
