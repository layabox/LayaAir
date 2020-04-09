package laya.media {
	import laya.media.SoundChannel;
	import laya.events.EventDispatcher;

	/**
	 * <code>Sound</code> 类是用来播放控制声音的类。
	 * 引擎默认有两套声音方案，优先使用WebAudio播放声音，如果WebAudio不可用，则用H5Audio播放，H5Audio在部分机器上有兼容问题（比如不能混音，播放有延迟等）。
	 */
	public class Sound extends EventDispatcher {

		/**
		 * 加载声音。
		 * @param url 地址。
		 */
		public function load(url:String):void{}

		/**
		 * 播放声音。
		 * @param startTime 开始时间,单位秒
		 * @param loops 循环次数,0表示一直循环
		 * @return 声道 SoundChannel 对象。
		 */
		public function play(startTime:Number = null,loops:Number = null):SoundChannel{
			return null;
		}

		/**
		 * 获取总时间。
		 */
		public function get duration():Number{
				return null;
		}

		/**
		 * 释放声音资源。
		 */
		public function dispose():void{}
	}

}
