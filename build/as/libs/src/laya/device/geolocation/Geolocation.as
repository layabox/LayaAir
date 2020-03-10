package laya.device.geolocation {
	import laya.utils.Handler;

	/**
	 * 使用前可用<code>supported</code>查看浏览器支持。
	 */
	public class Geolocation {
		private static var navigator:*;
		private static var position:*;

		/**
		 * 由于权限被拒绝造成的地理信息获取失败。
		 */
		public static var PERMISSION_DENIED:Number;

		/**
		 * 由于内部位置源返回了内部错误导致地理信息获取失败。
		 */
		public static var POSITION_UNAVAILABLE:Number;

		/**
		 * 信息获取所用时长超出<code>timeout</code>所设置时长。
		 */
		public static var TIMEOUT:Number;

		/**
		 * 是否支持。
		 */
		public static var supported:Boolean;

		/**
		 * 如果<code>enableHighAccuracy</code>为true，并且设备能够提供一个更精确的位置，则会获取最佳可能的结果。
		 * 请注意,这可能会导致较慢的响应时间或增加电量消耗（如使用GPS）。
		 * 另一方面，如果设置为false，将会得到更快速的响应和更少的电量消耗。
		 * 默认值为false。
		 */
		public static var enableHighAccuracy:Boolean;

		/**
		 * 表示允许设备获取位置的最长时间。默认为Infinity，意味着getCurentPosition()直到位置可用时才会返回信息。
		 */
		public static var timeout:Number;

		/**
		 * 表示可被返回的缓存位置信息的最大时限。
		 * 如果设置为0，意味着设备不使用缓存位置，并且尝试获取实时位置。
		 * 如果设置为Infinity，设备必须返回缓存位置而无论其时限。
		 */
		public static var maximumAge:Number;

		public function Geolocation(){}

		/**
		 * 获取设备当前位置。
		 * @param onSuccess 带有唯一<code>Position</code>参数的回调处理器。
		 * @param onError 可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
		 */
		public static function getCurrentPosition(onSuccess:Handler,onError:Handler = null):void{}

		/**
		 * 监视设备当前位置。回调处理器在设备位置改变时被执行。
		 * @param onSuccess 带有唯一<code>Position</code>参数的回调处理器。
		 * @param onError 可选的。带有错误信息的回调处理器。错误代码为Geolocation.PERMISSION_DENIED、Geolocation.POSITION_UNAVAILABLE和Geolocation.TIMEOUT之一。
		 */
		public static function watchPosition(onSuccess:Handler,onError:Handler):Number{
			return null;
		}

		/**
		 * 移除<code>watchPosition</code>安装的指定处理器。
		 * @param id 
		 */
		public static function clearWatch(id:Number):void{}
	}

}
