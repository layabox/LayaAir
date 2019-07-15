/*[IF-FLASH]*/
package laya.device {
	improt laya.events.EventDispatcher;
	public class Shake extends laya.events.EventDispatcher {
		private var throushold:*;
		private var shakeInterval:*;
		private var callback:*;
		private var lastX:*;
		private var lastY:*;
		private var lastZ:*;
		private var lastMillSecond:*;

		public function Shake(){}
		private static var _instance:*;
		public static function get instance():Shake{};
		public function start(throushold:Number,interval:Number):void{}
		public function stop():void{}
		private var onShake:*;
		private var isShaked:*;
	}

}
