package laya.media {
	import laya.media.SoundChannel;
	import laya.utils.Handler;

	/**
	 * <code>SoundManager</code> 是一个声音管理类。提供了对背景音乐、音效的播放控制方法。
	 * 引擎默认有两套声音方案：WebAudio和H5Audio
	 * 播放音效，优先使用WebAudio播放声音，如果WebAudio不可用，则用H5Audio播放，H5Audio在部分机器上有兼容问题（比如不能混音，播放有延迟等）。
	 * 播放背景音乐，则使用H5Audio播放（使用WebAudio会增加特别大的内存，并且要等加载完毕后才能播放，有延迟）
	 * 建议背景音乐用mp3类型，音效用wav或者mp3类型（如果打包为app，音效只能用wav格式）。
	 * 详细教程及声音格式请参考：http://ldc2.layabox.com/doc/?nav=ch-as-1-7-0
	 */
	public class SoundManager {

		/**
		 * 背景音乐音量。
		 * @default 1
		 */
		public static var musicVolume:Number;

		/**
		 * 音效音量。
		 * @default 1
		 */
		public static var soundVolume:Number;

		/**
		 * 声音播放速率。
		 * @default 1
		 */
		public static var playbackRate:Number;

		/**
		 * 背景音乐使用Audio标签播放。
		 * @default true
		 */
		private static var _useAudioMusic:*;

		/**
		 * @private 是否静音，默认为false。
		 */
		private static var _muted:*;

		/**
		 * @private 是否音效静音，默认为false。
		 */
		private static var _soundMuted:*;

		/**
		 * @private 是否背景音乐静音，默认为false。
		 */
		private static var _musicMuted:*;

		/**
		 * @private 当前背景音乐声道。
		 */
		private static var _musicChannel:*;

		/**
		 * @private 当前播放的Channel列表。
		 */
		private static var _channels:*;

		/**
		 * @private 
		 */
		private static var _autoStopMusic:*;

		/**
		 * @private 
		 */
		private static var _blurPaused:*;

		/**
		 * @private 
		 */
		private static var _isActive:*;

		/**
		 * @private 
		 */
		private static var _lastSoundUsedTimeDic:*;

		/**
		 * @private 
		 */
		private static var _isCheckingDispose:*;

		/**
		 * 音效播放后自动删除。
		 * @default true
		 */
		public static var autoReleaseSound:Boolean;

		/**
		 * 添加播放的声音实例。
		 * @param channel <code>SoundChannel</code> 对象。
		 */
		public static function addChannel(channel:SoundChannel):void{}

		/**
		 * 移除播放的声音实例。
		 * @param channel <code>SoundChannel</code> 对象。
		 */
		public static function removeChannel(channel:SoundChannel):void{}

		/**
		 * @private 
		 */
		public static function disposeSoundLater(url:String):void{}

		/**
		 * @private 
		 */
		private static var _checkDisposeSound:*;

		/**
		 * @private 
		 */
		public static function disposeSoundIfNotUsed(url:String):void{}

		/**
		 * 失去焦点后是否自动停止背景音乐。
		 * @param v Boolean 失去焦点后是否自动停止背景音乐。
		 */

		/**
		 * 失去焦点后是否自动停止背景音乐。
		 */
		public static var autoStopMusic:Boolean;
		private static var _visibilityChange:*;
		private static var _stageOnBlur:*;
		private static var _recoverWebAudio:*;
		private static var _stageOnFocus:*;

		/**
		 * 背景音乐和所有音效是否静音。
		 */
		public static var muted:Boolean;

		/**
		 * 所有音效（不包括背景音乐）是否静音。
		 */
		public static var soundMuted:Boolean;

		/**
		 * 背景音乐（不包括音效）是否静音。
		 */
		public static var musicMuted:Boolean;
		public static var useAudioMusic:Boolean;

		/**
		 * 播放音效。音效可以同时播放多个。
		 * @param url 声音文件地址。
		 * @param loops 循环次数,0表示无限循环。
		 * @param complete 声音播放完成回调  Handler对象。
		 * @param soundClass 使用哪个声音类进行播放，null表示自动选择。
		 * @param startTime 声音播放起始时间。
		 * @return SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
		 */
		public static function playSound(url:String,loops:Number = null,complete:Handler = null,soundClass:Class = null,startTime:Number = null):SoundChannel{
			return null;
		}

		/**
		 * 释放声音资源。
		 * @param url 声音播放地址。
		 */
		public static function destroySound(url:String):void{}

		/**
		 * 播放背景音乐。背景音乐同时只能播放一个，如果在播放背景音乐时再次调用本方法，会先停止之前的背景音乐，再播发当前的背景音乐。
		 * @param url 声音文件地址。
		 * @param loops 循环次数,0表示无限循环。
		 * @param complete 声音播放完成回调。
		 * @param startTime 声音播放起始时间。
		 * @return SoundChannel对象，通过此对象可以对声音进行控制，以及获取声音信息。
		 */
		public static function playMusic(url:String,loops:Number = null,complete:Handler = null,startTime:Number = null):SoundChannel{
			return null;
		}

		/**
		 * 停止声音播放。此方法能够停止任意声音的播放（包括背景音乐和音效），只需传入对应的声音播放地址。
		 * @param url 声音文件地址。
		 */
		public static function stopSound(url:String):void{}

		/**
		 * 停止播放所有声音（包括背景音乐和音效）。
		 */
		public static function stopAll():void{}

		/**
		 * 停止播放所有音效（不包括背景音乐）。
		 */
		public static function stopAllSound():void{}

		/**
		 * 停止播放背景音乐（不包括音效）。
		 * @param url 声音文件地址。
		 */
		public static function stopMusic():void{}

		/**
		 * 设置声音音量。根据参数不同，可以分别设置指定声音（背景音乐或音效）音量或者所有音效（不包括背景音乐）音量。
		 * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
		 * @param url (default = null)声音播放地址。默认为null。为空表示设置所有音效（不包括背景音乐）的音量，不为空表示设置指定声音（背景音乐或音效）的音量。
		 */
		public static function setSoundVolume(volume:Number,url:String = null):void{}

		/**
		 * 设置背景音乐音量。音量范围从 0（静音）至 1（最大音量）。
		 * @param volume 音量。初始值为1。音量范围从 0（静音）至 1（最大音量）。
		 */
		public static function setMusicVolume(volume:Number):void{}

		/**
		 * 设置指定声音的音量。
		 * @param url 声音文件url
		 * @param volume 音量。初始值为1。
		 */
		private static var _setVolume:*;
	}

}
