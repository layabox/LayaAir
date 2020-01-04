package laya.media.h5audio {
	import laya.events.EventDispatcher;
	import laya.media.SoundChannel;

	/**
	 * @private 使用Audio标签播放声音
	 */
	public class AudioSound extends EventDispatcher {

		/**
		 * @private 
		 */
		private static var _audioCache:*;

		/**
		 * 声音URL
		 */
		public var url:String;

		/**
		 * 播放用的audio标签
		 */
		public var audio:Audio;

		/**
		 * 是否已加载完成
		 */
		public var loaded:Boolean;

		/**
		 * 释放声音
		 */
		public function dispose():void{}

		/**
		 * @private 
		 */
		private static var _makeMusicOK:*;

		/**
		 * 加载声音
		 * @param url 
		 */
		public function load(url:String):void{}

		/**
		 * 播放声音
		 * @param startTime 起始时间
		 * @param loops 循环次数
		 * @return 
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
	}

}
