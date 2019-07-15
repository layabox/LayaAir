/*[IF-FLASH]*/
package laya.media {
	improt laya.media.SoundChannel;
	improt laya.utils.Handler;
	public class SoundManager {
		public static var musicVolume:Number;
		public static var soundVolume:Number;
		public static var playbackRate:Number;
		private static var _useAudioMusic:*;
		private static var _muted:*;
		private static var _soundMuted:*;
		private static var _musicMuted:*;
		public static var _bgMusic:String;
		private static var _musicChannel:*;
		private static var _channels:*;
		private static var _autoStopMusic:*;
		private static var _blurPaused:*;
		private static var _isActive:*;
		public static var _soundClass:Class;
		public static var _musicClass:Class;
		private static var _lastSoundUsedTimeDic:*;
		private static var _isCheckingDispose:*;
		public static function __init__():Boolean{}
		public static var autoReleaseSound:Boolean;
		public static function addChannel(channel:SoundChannel):void{}
		public static function removeChannel(channel:SoundChannel):void{}
		public static function disposeSoundLater(url:String):void{}
		private static var _checkDisposeSound:*;
		public static function disposeSoundIfNotUsed(url:String):void{}
		public static var autoStopMusic:Boolean;
		private static var _visibilityChange:*;
		private static var _stageOnBlur:*;
		private static var _recoverWebAudio:*;
		private static var _stageOnFocus:*;
		public static var muted:Boolean;
		public static var soundMuted:Boolean;
		public static var musicMuted:Boolean;
		public static var useAudioMusic:Boolean;
		public static function playSound(url:String,loops:Number = null,complete:Handler = null,soundClass:Class = null,startTime:Number = null):SoundChannel{}
		public static function destroySound(url:String):void{}
		public static function playMusic(url:String,loops:Number = null,complete:Handler = null,startTime:Number = null):SoundChannel{}
		public static function stopSound(url:String):void{}
		public static function stopAll():void{}
		public static function stopAllSound():void{}
		public static function stopMusic():void{}
		public static function setSoundVolume(volume:Number,url:String = null):void{}
		public static function setMusicVolume(volume:Number):void{}
		private static var _setVolume:*;
	}

}
