/*[IF-FLASH]*/
package laya.media.webaudio {
	improt laya.events.EventDispatcher;
	improt laya.media.SoundChannel;
	public class WebAudioSound extends laya.events.EventDispatcher {
		private static var _dataCache:*;
		public static var webAudioEnabled:Boolean;
		public static var ctx:*;
		public static var buffs:Array;
		public static var isDecoding:Boolean;
		public static var _miniBuffer:*;
		public static var e:EventDispatcher;
		private static var _unlocked:*;
		public static var tInfo:*;
		private static var __loadingSound:*;
		public var url:String;
		public var loaded:Boolean;
		public var data:ArrayBuffer;
		public var audioBuffer:*;
		private var __toPlays:*;
		private var _disposed:*;
		public static function decode():void{}
		private static var _done:*;
		private static var _fail:*;
		private static var _playEmptySound:*;
		private static var _unlock:*;
		public static function initWebAudio():void{}
		public function load(url:String):void{}
		private var _err:*;
		private var _loaded:*;
		private var _removeLoadEvents:*;
		private var __playAfterLoaded:*;
		public function play(startTime:Number = null,loops:Number = null,channel:SoundChannel = null):SoundChannel{}
		public function get duration():Number{};
		public function dispose():void{}
	}

}
