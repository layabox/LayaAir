/*[IF-FLASH]*/
package {
	
	/**
	 * @private
	 * 声音API
	 */
	public dynamic class Audio {
		/**设置或返回是否在加载完成后随即播放音频/视频*/
		public var autoplay:Boolean;
		/**返回表示音频/视频已缓冲部分的 TimeRanges 对象*/
		public var buffered:*;
		/**设置或返回音频/视频是否显示控件（比如播放/暂停等）*/
		public var controls:Boolean;
		/**设置或返回音频/视频中的当前播放位置（以秒计）*/
		public var currentTime:Number;
		/**返回当前音频/视频的长度（以秒计）*/
		public var duration:Number;
		/**设置或返回音频/视频是否应在结束时重新播放*/
		public var loop:Boolean;
		/**设置或返回音频/视频是否静音*/
		public var muted:Boolean;
		/**设置或返回音频/视频是否应该在页面加载后进行加载*/
		public var preload:String;
		/**设置或返回音频/视频是否暂停*/
		public var paused:Boolean;
		/**返回音频/视频的播放是否已结束*/
		public var ended:Boolean;
		/**返回表示音频/视频已播放部分的 TimeRanges 对象*/
		public var played:*;
		/**返回当前音频/视频的 URL*/
		public var currentSrc:String;
		/**设置或返回音频/视频元素的当前来源*/
		public var src:String;
		/**设置或返回音频/视频的音量*/
		public var volume:Number;
		/**设置或返回音频/视频播放的速度*/
		public var playbackRate:Number;
		/**设置或返回音频/视频默认是否静音*/
		public var defaultMuted:Boolean;
		/**设置或返回音频/视频的默认播放速度*/
		public var defaultPlaybackRate:Number;
		/**返回表示音频/视频可寻址部分的 TimeRanges 对象*/
		public var seekable:*;
		/**返回表示音频/视频错误状态的 MediaError 对象*/
		public var error:*;
		/**返回用户是否正在音频/视频中进行查找*/
		public var seeking:Boolean;
		/**设置或返回音频/视频所属的组合（用于连接多个音频/视频元素）*/
		public var mediaGroup:String;
		/**返回音频/视频的当前网络状态*/
		public var networkState:Number;
		/**返回音频/视频当前的就绪状态*/
		public var readyState:Number;
		/**返回表示当前时间偏移的 Date 对象*/
		public var startDate:*;
		/**HTML内容*/
		public var innerHTML:String;
		
		public function play():void {
		
		}
		
		public function pause():void {
		
		}
		
		public function canPlayType(type:String):String {
			return null;
		}
	}
}