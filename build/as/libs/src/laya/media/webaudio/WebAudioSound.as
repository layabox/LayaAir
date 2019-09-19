package laya.media.webaudio {
	import laya.events.EventDispatcher;
	import laya.media.SoundChannel;

	/**
	 * @private web audio api方式播放声音
	 */
	public class WebAudioSound extends EventDispatcher {
		private static var _dataCache:*;

		/**
		 * 是否支持web audio api
		 */
		public static var webAudioEnabled:Boolean;

		/**
		 * 播放设备
		 */
		public static var ctx:*;

		/**
		 * 当前要解码的声音文件列表
		 */
		public static var buffs:Array;

		/**
		 * 是否在解码中
		 */
		public static var isDecoding:Boolean;

		/**
		 * 用于播放解锁声音以及解决Ios9版本的内存释放
		 */
		public static var _miniBuffer:*;

		/**
		 * 事件派发器，用于处理加载解码完成事件的广播
		 */
		public static var e:EventDispatcher;

		/**
		 * 是否已解锁声音播放
		 */
		private static var _unlocked:*;

		/**
		 * 当前解码的声音信息
		 */
		public static var tInfo:*;
		private static var __loadingSound:*;

		/**
		 * 声音URL
		 */
		public var url:String;

		/**
		 * 是否已加载完成
		 */
		public var loaded:Boolean;

		/**
		 * 声音文件数据
		 */
		public var data:ArrayBuffer;

		/**
		 * 声音原始文件数据
		 */
		public var audioBuffer:*;

		/**
		 * 待播放的声音列表
		 */
		private var __toPlays:*;

		/**
		 * @private 
		 */
		private var _disposed:*;

		/**
		 * 解码声音文件
		 */
		public static function decode():void{}

		/**
		 * 解码成功回调
		 * @param audioBuffer 
		 */
		private static var _done:*;

		/**
		 * 解码失败回调
		 * @return 
		 */
		private static var _fail:*;

		/**
		 * 播放声音以解锁IOS的声音
		 */
		private static var _playEmptySound:*;

		/**
		 * 尝试解锁声音
		 */
		private static var _unlock:*;
		public static function initWebAudio():void{}

		/**
		 * 加载声音
		 * @param url 
		 */
		public function load(url:String):void{}
		private var _err:*;
		private var _loaded:*;
		private var _removeLoadEvents:*;
		private var __playAfterLoaded:*;

		/**
		 * 播放声音
		 * @param startTime 起始时间
		 * @param loops 循环次数
		 * @return 
		 */
		public function play(startTime:Number = null,loops:Number = null,channel:SoundChannel = null):SoundChannel{
			return null;
		}
		public function get duration():Number{
				return null;
		}
		public function dispose():void{}
	}

}
