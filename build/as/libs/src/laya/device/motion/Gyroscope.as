/*[IF-FLASH]*/
package laya.device.motion {
	improt laya.events.EventDispatcher;
	public class Gyroscope extends laya.events.EventDispatcher {
		private static var info:*;
		private static var _instance:*;
		public static function get instance():Gyroscope{};

		public function Gyroscope(singleton:Number){}
		public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function off(type:String,caller:*,listener:Function,onceOnly:Boolean = null):EventDispatcher{}
		private var onDeviceOrientationChange:*;
	}

}
