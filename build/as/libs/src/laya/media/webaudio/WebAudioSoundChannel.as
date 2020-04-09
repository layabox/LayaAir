package laya.media.webaudio {
	import laya.media.SoundChannel;

	/**
	 * @private web audio api方式播放声音的音轨控制
	 */
	public class WebAudioSoundChannel extends SoundChannel {

		/**
		 * 声音原始文件数据
		 */
		public var audioBuffer:*;

		/**
		 * gain节点
		 */
		private var gain:*;

		/**
		 * 播放用的数据
		 */
		private var bufferSource:*;

		/**
		 * 当前时间
		 */
		private var _currentTime:*;

		/**
		 * 当前音量
		 */
		private var _volume:*;

		/**
		 * 播放开始时的时间戳
		 */
		private var _startTime:*;
		private var _pauseTime:*;

		/**
		 * 播放设备
		 */
		private var context:*;
		private var _onPlayEnd:*;
		private static var _tryCleanFailed:*;
		public static var SetTargetDelay:Number;

		public function WebAudioSoundChannel(){}

		/**
		 * 播放声音
		 * @override 
		 */
		override public function play():void{}
		private var __onPlayEnd:*;
		private var _clearBufferSource:*;
		private var _tryClearBuffer:*;

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
	}

}
