/*[IF-FLASH]*/
package laya.media.h5audio {
	improt laya.media.SoundChannel;
	public class AudioSoundChannel extends laya.media.SoundChannel {
		private var _audio:*;
		private var _onEnd:*;
		private var _resumePlay:*;

		public function AudioSoundChannel(audio:HTMLAudioElement){}
		private var __onEnd:*;
		private var __resumePlay:*;
		public function play():void{}
		public function get position():Number{};
		public function get duration():Number{};
		public function stop():void{}
		public function pause():void{}
		public function resume():void{}
		public var volume:Number;
	}

}
