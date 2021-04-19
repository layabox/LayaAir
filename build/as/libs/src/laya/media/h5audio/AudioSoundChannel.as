package laya.media.h5audio {
	import laya.media.SoundChannel;

	/**
	 * @private audio标签播放声音的音轨控制
	 */
	public class AudioSoundChannel extends SoundChannel {

		/**
		 * 播放用的audio标签
		 */
		private var _audio:*;
		private var _onEnd:*;
		private var _resumePlay:*;

		public function AudioSoundChannel(audio:Audio = undefined){}
		private var __onEnd:*;
		private var __resumePlay:*;

		/**
		 * 播放
		 * @override 
		 */
		override public function play():void{}

		/**
		 * 当前播放到的位置
		 * @return 
		 * @override 
		 */
		override public function get position():Number{return null;}

		/**
		 * 获取总时间。
		 * @override 
		 */
		override public function get duration():Number{return null;}

		/**
		 * 停止播放
		 * @override 
		 */
		override public function stop():void{}

		/**
		 * @override 
		 */
		override public function pause():void{}

		/**
		 * @override 
		 */
		override public function resume():void{}

		/**
		 * 设置音量
		 * @param v 
		 * @override 
		 */
		override public function set volume(v:Number):void{}

		/**
		 * 获取音量
		 * @return 
		 * @override 
		 */
		override public function get volume():Number{return null;}
	}

}
