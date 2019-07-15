/*[IF-FLASH]*/
package laya.media.h5audio {
	improt laya.events.EventDispatcher;
	improt laya.media.SoundChannel;
	public class AudioSound extends laya.events.EventDispatcher {
		private static var _audioCache:*;
		public var url:String;
		public var audio:HTMLAudioElement;
		public var loaded:Boolean;
		public function dispose():void{}
		private static var _makeMusicOK:*;
		public function load(url:String):void{}
		public function play(startTime:Number = null,loops:Number = null):SoundChannel{}
		public function get duration():Number{};
	}

}
