/*[IF-FLASH]*/
package laya.device.geolocation {
	public class GeolocationInfo {
		private var pos:*;
		private var coords:*;
		public function setPosition(pos:*):void{}
		public function get latitude():Number{};
		public function get longitude():Number{};
		public function get altitude():Number{};
		public function get accuracy():Number{};
		public function get altitudeAccuracy():Number{};
		public function get heading():Number{};
		public function get speed():Number{};
		public function get timestamp():Number{};
	}

}
