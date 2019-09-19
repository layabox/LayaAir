package laya.device.media {
	import laya.display.Sprite;

	/**
	 * <code>Video</code>将视频显示到Canvas上。<code>Video</code>可能不会在所有浏览器有效。
	 * <p>关于Video支持的所有事件参见：<i>http://www.w3school.com.cn/tags/html_ref_audio_video_dom.asp</i>。</p>
	 * <p>
	 * <b>注意：</b><br/>
	 * 在PC端可以在任何时机调用<code>play()</code>因此，可以在程序开始运行时就使Video开始播放。但是在移动端，只有在用户第一次触碰屏幕后才可以调用play()，所以移动端不可能在程序开始运行时就自动开始播放Video。
	 * </p>
	 * 
	 * <p>MDN Video链接： <i>https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video</i></p>
	 */
	public class Video extends Sprite {
		public static var MP4:Number;
		public static var OGG:Number;
		public static var CAMERA:Number;
		public static var WEBM:Number;

		/**
		 * 表示最有可能支持。
		 */
		public static var SUPPORT_PROBABLY:String;

		/**
		 * 表示可能支持。
		 */
		public static var SUPPORT_MAYBY:String;

		/**
		 * 表示不支持。
		 */
		public static var SUPPORT_NO:String;
		private var htmlVideo:*;
		private var videoElement:*;
		private var internalTexture:*;

		public function Video(width:Number = undefined,height:Number = undefined){}
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

		/**
		 * 设置播放源。
		 * @param url 播放源路径。
		 */
		public function load(url:String):void{}

		/**
		 * 开始播放视频。
		 */
		public function play():void{}

		/**
		 * 暂停视频播放。
		 */
		public function pause():void{}

		/**
		 * 重新加载视频。
		 */
		public function reload():void{}

		/**
		 * 检测是否支持播放指定格式视频。
		 * @param type 参数为Video.MP4 / Video.OGG / Video.WEBM之一。
		 * @return 表示支持的级别。可能的值：<ul><li>"probably"，Video.SUPPORT_PROBABLY - 浏览器最可能支持该音频/视频类型</li><li>"maybe"，Video.SUPPORT_MAYBY - 浏览器也许支持该音频/视频类型</li><li>""，Video.SUPPORT_NO- （空字符串）浏览器不支持该音频/视频类型</li></ul>
		 */
		public function canPlayType(type:Number):String{
			return null;
		}
		private var renderCanvas:*;
		private var onDocumentClick:*;

		/**
		 * buffered 属性返回 TimeRanges(JS)对象。TimeRanges 对象表示用户的音视频缓冲范围。缓冲范围指的是已缓冲音视频的时间范围。如果用户在音视频中跳跃播放，会得到多个缓冲范围。
		 * <p>buffered.length返回缓冲范围个数。如获取第一个缓冲范围则是buffered.start(0)和buffered.end(0)。以秒计。</p>
		 * @return TimeRanges(JS)对象
		 */
		public function get buffered():*{
				return null;
		}

		/**
		 * 获取当前播放源路径。
		 */
		public function get currentSrc():String{
				return null;
		}

		/**
		 * 设置和获取当前播放头位置。
		 */
		public var currentTime:Number;

		/**
		 * 设置和获取当前音量。
		 */
		public var volume:Number;

		/**
		 * 表示视频元素的就绪状态：
		 * <ul>
		 * <li>0 = HAVE_NOTHING - 没有关于音频/视频是否就绪的信息</li>
		 * <li>1 = HAVE_METADATA - 关于音频/视频就绪的元数据</li>
		 * <li>2 = HAVE_CURRENT_DATA - 关于当前播放位置的数据是可用的，但没有足够的数据来播放下一帧/毫秒</li>
		 * <li>3 = HAVE_FUTURE_DATA - 当前及至少下一帧的数据是可用的</li>
		 * <li>4 = HAVE_ENOUGH_DATA - 可用数据足以开始播放</li>
		 * </ul>
		 */
		public function get readyState():*{
				return null;
		}

		/**
		 * 获取视频源尺寸。ready事件触发后可用。
		 */
		public function get videoWidth():Number{
				return null;
		}
		public function get videoHeight():Number{
				return null;
		}

		/**
		 * 获取视频长度（秒）。ready事件触发后可用。
		 */
		public function get duration():Number{
				return null;
		}

		/**
		 * 返回音频/视频的播放是否已结束
		 */
		public function get ended():Boolean{
				return null;
		}

		/**
		 * 返回表示音频/视频错误状态的 MediaError（JS）对象。
		 */
		public function get error():Boolean{
				return null;
		}

		/**
		 * 设置或返回音频/视频是否应在结束时重新播放。
		 */
		public var loop:Boolean;

		/**
		 * playbackRate 属性设置或返回音频/视频的当前播放速度。如：
		 * <ul>
		 * <li>1.0 正常速度</li>
		 * <li>0.5 半速（更慢）</li>
		 * <li>2.0 倍速（更快）</li>
		 * <li>-1.0 向后，正常速度</li>
		 * <li>-0.5 向后，半速</li>
		 * </ul>
		 * <p>只有 Google Chrome 和 Safari 支持 playbackRate 属性。</p>
		 */
		public var playbackRate:Number;

		/**
		 * 获取和设置静音状态。
		 */
		public var muted:Boolean;

		/**
		 * 返回视频是否暂停
		 */
		public function get paused():Boolean{
				return null;
		}

		/**
		 * preload 属性设置或返回是否在页面加载后立即加载视频。可赋值如下：
		 * <ul>
		 * <li>auto	指示一旦页面加载，则开始加载视频。</li>
		 * <li>metadata	指示当页面加载后仅加载音频/视频的元数据。</li>
		 * <li>none	指示页面加载后不应加载音频/视频。</li>
		 * </ul>
		 */
		public var preload:String;

		/**
		 * 参见 <i>http://www.w3school.com.cn/tags/av_prop_seekable.asp</i>。
		 */
		public function get seekable():*{
				return null;
		}

		/**
		 * seeking 属性返回用户目前是否在音频/视频中寻址。
		 * 寻址中（Seeking）指的是用户在音频/视频中移动/跳跃到新的位置。
		 */
		public function get seeking():Boolean{
				return null;
		}

		/**
		 * @param width 
		 * @param height 
		 * @override 
		 */
		override public function size(width:Number,height:Number):Sprite{
			return null;
		}

		/**
		 * 销毁内部事件绑定。
		 * @override 
		 */
		override public function destroy(detroyChildren:Boolean = null):void{}
		private var syncVideoPosition:*;
	}

}
