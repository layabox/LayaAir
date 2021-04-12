package laya.device.geolocation {
	public class GeolocationInfo {
		private var pos:*;
		private var coords:*;

		/**
		 * 设置设备经纬度
		 * @param pos 
		 */
		public function setPosition(pos:*):void{}

		/**
		 * 获取设备当前地理坐标的纬度
		 */
		public function get latitude():Number{return null;}

		/**
		 * 获取设备当前地理坐标的经度
		 */
		public function get longitude():Number{return null;}

		/**
		 * 获取设备当前地理坐标的高度
		 */
		public function get altitude():Number{return null;}

		/**
		 * 获取设备当前地理坐标的精度
		 */
		public function get accuracy():Number{return null;}

		/**
		 * 获取设备当前地理坐标的高度精度
		 */
		public function get altitudeAccuracy():Number{return null;}

		/**
		 * 获取设备当前行进方向
		 */
		public function get heading():Number{return null;}

		/**
		 * 获取设备当前的速度
		 */
		public function get speed():Number{return null;}

		/**
		 * 获取设备得到当前位置的时间
		 */
		public function get timestamp():Number{return null;}
	}

}
