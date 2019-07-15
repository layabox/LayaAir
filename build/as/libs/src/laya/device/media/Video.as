/*[IF-FLASH]*/
package laya.device.media {
	improt laya.display.Sprite;
	public class Video extends laya.display.Sprite {
		public static var MP4:Number;
		public static var OGG:Number;
		public static var CAMERA:Number;
		public static var WEBM:Number;
		public static var SUPPORT_PROBABLY:String;
		public static var SUPPORT_MAYBY:String;
		public static var SUPPORT_NO:String;
		private var htmlVideo:*;
		private var videoElement:*;
		private var internalTexture:*;

		public function Video(width:Number = null,height:Number = null){}
		private static var onAbort:*;
		private static var onCanplay:*;
		private static var onCanplaythrough:*;
		private static var onDurationchange:*;
		private static var onEmptied:*;
		private static var onError:*;
		private static var onLoadeddata:*;
		private static var onLoadedmetadata:*;
		private static var onLoadstart:*;
		private static var onPause:*;
		private static var onPlay:*;
		private static var onPlaying:*;
		private static var onProgress:*;
		private static var onRatechange:*;
		private static var onSeeked:*;
		private static var onSeeking:*;
		private static var onStalled:*;
		private static var onSuspend:*;
		private static var onTimeupdate:*;
		private static var onVolumechange:*;
		private static var onWaiting:*;
		private var onPlayComplete:*;
		public function load(url:String):void{}
		public function play():void{}
		public function pause():void{}
		public function reload():void{}
		public function canPlayType(type:Number):String{}
		private var renderCanvas:*;
		private var onDocumentClick:*;
		public function get buffered():*{};
		public function get currentSrc():String{};
		public var currentTime:Number;
		public var volume:Number;
		public function get readyState():*{};
		public function get videoWidth():Number{};
		public function get videoHeight():Number{};
		public function get duration():Number{};
		public function get ended():Boolean{};
		public function get error():Boolean{};
		public var loop:Boolean;
		public var x:Number;
		public var y:Number;
		public var playbackRate:Number;
		public var muted:Boolean;
		public function get paused():Boolean{};
		public var preload:String;
		public function get seekable():*{};
		public function get seeking():Boolean{};
		public function size(width:Number,height:Number):Sprite{}
		public var width:Number;
		public var height:Number;
		public function destroy(detroyChildren:Boolean = null):void{}
		private var syncVideoPosition:*;
	}

}
