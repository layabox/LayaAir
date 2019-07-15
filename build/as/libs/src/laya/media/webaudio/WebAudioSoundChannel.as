/*[IF-FLASH]*/
package laya.media.webaudio {
	improt laya.media.SoundChannel;
	public class WebAudioSoundChannel extends laya.media.SoundChannel {
		public var audioBuffer:*;
		private var gain:*;
		private var bufferSource:*;
		private var _currentTime:*;
		private var _volume:*;
		private var _startTime:*;
		private var _pauseTime:*;
		private var context:*;
		private var _onPlayEnd:*;
		private static var _tryCleanFailed:*;
		public static var SetTargetDelay:Number;

		public function WebAudioSoundChannel(){}
		public function play():void{}
		private var __onPlayEnd:*;
		public function get position():Number{};
		public function get duration():Number{};
		private var _clearBufferSource:*;
		private var _tryClearBuffer:*;
		public function stop():void{}
		public function pause():void{}
		public function resume():void{}
		public var volume:Number;
	}

}
