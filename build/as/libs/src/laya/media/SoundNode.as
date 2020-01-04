package laya.media {
	import laya.display.Sprite;
	import laya.utils.Handler;

	/**
	 * @private 
	 */
	public class SoundNode extends Sprite {
		public var url:String;
		private var _channel:*;
		private var _tar:*;
		private var _playEvents:*;
		private var _stopEvents:*;

		public function SoundNode(){}

		/**
		 * @private 
		 */
		private var _onParentChange:*;

		/**
		 * 播放
		 * @param loops 循环次数
		 * @param complete 完成回调
		 */
		public function play(loops:Number = null,complete:Handler = null):void{}

		/**
		 * 停止播放
		 */
		public function stop():void{}

		/**
		 * @private 
		 */
		private var _setPlayAction:*;

		/**
		 * @private 
		 */
		private var _setPlayActions:*;

		/**
		 * 设置触发播放的事件
		 * @param events 
		 */
		public var playEvent:String;

		/**
		 * 设置控制播放的对象
		 * @param tar 
		 */
		public var target:Sprite;

		/**
		 * 设置触发停止的事件
		 * @param events 
		 */
		public var stopEvent:String;
	}

}
