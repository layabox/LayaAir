/*[IF-FLASH]*/
package laya.device.geolocation {
	improt laya.utils.Handler;
	public class Geolocation {
		private static var navigator:*;
		private static var position:*;
		public static var PERMISSION_DENIED:Number;
		public static var POSITION_UNAVAILABLE:Number;
		public static var TIMEOUT:Number;
		public static var supported:Boolean;
		public static var enableHighAccuracy:Boolean;
		public static var timeout:Number;
		public static var maximumAge:Number;

		public function Geolocation(){}
		public static function getCurrentPosition(onSuccess:Handler,onError:Handler = null):void{}
		public static function watchPosition(onSuccess:Handler,onError:Handler):Number{}
		public static function clearWatch(id:Number):void{}
	}

}
