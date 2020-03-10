package laya.device {
	import laya.events.EventDispatcher;

	/**
	 * Shake只能在支持此操作的设备上有效。
	 */
	public class Shake extends EventDispatcher {
		private var throushold:*;
		private var shakeInterval:*;
		private var callback:*;
		private var lastX:*;
		private var lastY:*;
		private var lastZ:*;
		private var lastMillSecond:*;

		public function Shake(){}
		private static var _instance:*;
		public static function get instance():Shake{
				return null;
		}

		/**
		 * 开始响应设备摇晃。
		 * @param throushold 响应的瞬时速度阈值，轻度摇晃的值约在5~10间。
		 * @param timeout 设备摇晃的响应间隔时间。
		 * @param callback 在设备摇晃触发时调用的处理器。
		 */
		public function start(throushold:Number,interval:Number):void{}

		/**
		 * 停止响应设备摇晃。
		 */
		public function stop():void{}
		private var onShake:*;
		private var isShaked:*;
	}

}
