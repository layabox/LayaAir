/**
	 * 平台信息。不依赖与任何模块
	 * @author laya
	 */
	export class PlatformInfo {
		/** 是否是在LayaRuntime上运行*/
		 static onLayaRuntime:boolean = false;
		/** 表示是否在移动设备，包括IOS和安卓等设备内。*/
		 static onMobile:boolean;
		/** 表示是否在 IOS 设备内。*/
		 static onIOS:boolean;
		/** 表示是否在 Mac 设备。*/
		 static onMac:boolean;
		/** 表示是否在 IPhone 设备内。*/
		 static onIPhone:boolean;
		/** 表示是否在 IPad 设备内。*/
		 static onIPad:boolean;
		/** 表示是否在 Android 设备内。*/
		 static onAndroid:boolean;
		/** 表示是否在 Windows Phone 设备内。*/
		 static onWP:boolean;
		/** 表示是否在 QQ 浏览器内。*/
		 static onQQBrowser:boolean;
		/** 表示是否在移动端 QQ 或 QQ 浏览器内。*/
		 static onMQQBrowser:boolean;
		/** 表示是否在 Safari 内。*/
		 static onSafari:boolean;
		/** 表示是否在 IE 浏览器内*/
		 static onIE:boolean;
		/** 表示是否在 微信 内*/
		 static onWeiXin:boolean;
		/** 表示是否在 PC 端。*/
		 static onPC:boolean;
		/** @private */
		 static onMiniGame:boolean;
		/** @private */
		 static onBDMiniGame:boolean;
		/** @private */
		 static onKGMiniGame:boolean;
		/** @private */
		 static onQGMiniGame:boolean;
		/** @private */
		 static onLimixiu:boolean;
		/** @private */
		 static onFirefox:boolean;//TODO:求补充
		/** @private */
		 static onEdge:boolean;//TODO:求补充
		
		/** 表示是否支持WebAudio*/
		 static supportWebAudio:boolean;
		/** 表示是否支持LocalStorage*/
		 static supportLocalStorage:boolean;
		/** 是否支持webgl2 */
		 static supportWebGL2:boolean;
		/** 是否支持WebXR */
		/** 是否支持WebGPU*/
		/** 是否支持Wasm */
		
		/** 原始window */
		 static window:any = null;
		
		/**
		 * 获取浏览器当前时间戳，单位为毫秒。
		 */
		 static now():number {
			return Date.now();;
		}		
	}


