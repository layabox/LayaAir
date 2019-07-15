/*[IF-FLASH]*/
package laya.device.motion {
	improt laya.device.motion.AccelerationInfo;
	improt laya.events.EventDispatcher;
	public class Accelerator extends laya.events.EventDispatcher {
		private static var _instance:*;
		public static function get instance():Accelerator{};
		private static var acceleration:*;
		private static var accelerationIncludingGravity:*;
		private static var rotationRate:*;
		private static var onChrome:*;

		public function Accelerator(singleton:Number){}
		public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function off(type:String,caller:*,listener:Function,onceOnly:Boolean = null):EventDispatcher{}
		private var onDeviceOrientationChange:*;
		private static var transformedAcceleration:*;
		public static function getTransformedAcceleration(acceleration:AccelerationInfo):AccelerationInfo{}
	}

}
