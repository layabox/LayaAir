/*[IF-FLASH]*/
package {
	
	/**
	 * @private
	 */
	public class Worker {
		/**接收worker消息监听*/
		public var onmessage:Function;
		/**接收worker错误监听*/
		public var onerror:Function;
		
		/**
		 * 后台进程
		 * @param	url worker的地址
		 */
		public function Worker(url:String) {}
		
		/**
		 * 增加事件监听
		 * @param	type 事件类型
		 * @param	listener 监听函数
		 * @param	userCaptrue 使用捕获阶段触发事件
		 */
		public function addEventListener(type:String, listener:Function, userCaptrue:Boolean = false):void {}
		
		/**
		 * 向主线程发送消息
		 */
		public function postMessage(data:*, option:* = null):void {}
		
		/**
		 * 终止 worker
		 */
		public function terminate():void {}
	}

}