package laya.utils {
	import laya.resource.HTMLCanvas;

	/**
	 * <code>Browser</code> 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
	 */
	public class Browser {

		/**
		 * 浏览器代理信息。
		 */
		public static var userAgent:String;

		/**
		 * 表示是否在移动设备，包括IOS和安卓等设备内。
		 */
		public static var onMobile:Boolean;

		/**
		 * 表示是否在 IOS 设备内。
		 */
		public static var onIOS:Boolean;

		/**
		 * 表示是否在 Mac 设备。
		 */
		public static var onMac:Boolean;

		/**
		 * 表示是否在 IPhone 设备内。
		 */
		public static var onIPhone:Boolean;

		/**
		 * 表示是否在 IPad 设备内。
		 */
		public static var onIPad:Boolean;

		/**
		 * 表示是否在 Android 设备内。
		 */
		public static var onAndroid:Boolean;

		/**
		 * 表示是否在 Windows Phone 设备内。
		 */
		public static var onWP:Boolean;

		/**
		 * 表示是否在 QQ 浏览器内。
		 */
		public static var onQQBrowser:Boolean;

		/**
		 * 表示是否在移动端 QQ 或 QQ 浏览器内。
		 */
		public static var onMQQBrowser:Boolean;

		/**
		 * 表示是否在 Safari 内。
		 */
		public static var onSafari:Boolean;

		/**
		 * 表示是否在 IE 浏览器内
		 */
		public static var onIE:Boolean;

		/**
		 * 表示是否在 微信 内
		 */
		public static var onWeiXin:Boolean;

		/**
		 * 表示是否在 PC 端。
		 */
		public static var onPC:Boolean;

		/**
		 * 微信小游戏 *
		 */
		public static var onMiniGame:Boolean;

		/**
		 * 百度小游戏 *
		 */
		public static var onBDMiniGame:Boolean;

		/**
		 * 小米戏小游戏 *
		 */
		public static var onKGMiniGame:Boolean;

		/**
		 * OPPO小游戏 *
		 */
		public static var onQGMiniGame:Boolean;

		/**
		 * VIVO小游戏 *
		 */
		public static var onVVMiniGame:Boolean;

		/**
		 * 阿里小游戏 *
		 */
		public static var onAlipayMiniGame:Boolean;

		/**
		 * *手机QQ小游戏
		 */
		public static var onQQMiniGame:Boolean;

		/**
		 * * BILIBILI小游戏
		 */
		public static var onBLMiniGame:Boolean;

		/**
		 * @private 
		 */
		public static var onFirefox:Boolean;

		/**
		 * @private 
		 */
		public static var onEdge:Boolean;

		/**
		 * @private 
		 */
		public static var onLayaRuntime:Boolean;

		/**
		 * 表示是否支持WebAudio
		 */
		public static var supportWebAudio:Boolean;

		/**
		 * 表示是否支持LocalStorage
		 */
		public static var supportLocalStorage:Boolean;

		/**
		 * 全局离线画布（非主画布）。主要用来测量字体、获取image数据。
		 */
		public static var canvas:HTMLCanvas;

		/**
		 * 全局离线画布上绘图的环境（非主画布）。
		 */
		public static var context:*;

		/**
		 * @private 
		 */
		private static var _window:*;

		/**
		 * @private 
		 */
		private static var _document:*;

		/**
		 * @private 
		 */
		private static var _container:*;

		/**
		 * @private 
		 */
		private static var _pixelRatio:*;

		/**
		 * @private 
		 */
		public static var mainCanvas:*;

		/**
		 * @private 
		 */
		private static var hanzi:*;

		/**
		 * @private 
		 */
		private static var fontMap:*;

		/**
		 * @private 
		 */
		public static var measureText:Function;

		/**
		 * 创建浏览器原生节点。
		 * @param type 节点类型。
		 * @return 创建的节点对象的引用。
		 */
		public static function createElement(type:String):*{}

		/**
		 * 返回 Document 对象中拥有指定 id 的第一个对象的引用。
		 * @param type 节点id。
		 * @return 节点对象。
		 */
		public static function getElementById(type:String):*{}

		/**
		 * 移除指定的浏览器原生节点对象。
		 * @param type 节点对象。
		 */
		public static function removeElement(ele:*):void{}

		/**
		 * 获取浏览器当前时间戳，单位为毫秒。
		 */
		public static function now():Number{
			return null;
		}

		/**
		 * 浏览器窗口可视宽度。
		 * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，如果前者为0或为空，则选择后者。
		 */
		public static function get clientWidth():Number{
				return null;
		}

		/**
		 * 浏览器窗口可视高度。
		 * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight(不包含滚动条高度)，如果前者为0或为空，则选择后者。
		 */
		public static function get clientHeight():Number{
				return null;
		}

		/**
		 * 浏览器窗口物理宽度。考虑了设备像素比。
		 */
		public static function get width():Number{
				return null;
		}

		/**
		 * 浏览器窗口物理高度。考虑了设备像素比。
		 */
		public static function get height():Number{
				return null;
		}

		/**
		 * 获得设备像素比。
		 */
		public static function get pixelRatio():Number{
				return null;
		}

		/**
		 * 画布容器，用来盛放画布的容器。方便对画布进行控制
		 */
		public static var container:*;

		/**
		 * 浏览器原生 window 对象的引用。
		 */
		public static function get window():*{
				return null;
		}

		/**
		 * 浏览器原生 document 对象的引用。
		 */
		public static function get document():*{
				return null;
		}
	}

}
