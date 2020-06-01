package laya.device.media {
	import laya.utils.Handler;

	/**
	 * Media用于捕捉摄像头和麦克风。可以捕捉任意之一，或者同时捕捉两者。<code>getCamera</code>前可以使用<code>supported()</code>检查当前浏览器是否支持。
	 * <b>NOTE:</b>
	 * <p>目前Media在移动平台只支持Android，不支持IOS。只可在FireFox完整地使用，Chrome测试时无法捕捉视频。</p>
	 */
	public class Media {

		public function Media(){}

		/**
		 * 检查浏览器兼容性。
		 */
		public static function supported():Boolean{
			return null;
		}

		/**
		 * 获取用户媒体。
		 * @param options 简单的可选项可以使<code>{ audio:true, video:true }</code>表示同时捕捉两者。详情见<i>https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia</i>。
		 * @param onSuccess 获取成功的处理器，唯一参数返回媒体的Blob地址，可以将其传给Video。
		 * @param onError 获取失败的处理器，唯一参数是Error。
		 */
		public static function getMedia(options:*,onSuccess:Handler,onError:Handler):void{}
	}

}
