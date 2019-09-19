package laya.media {
	import laya.events.EventDispatcher;
	import laya.utils.Handler;

	/**
	 * <p> <code>SoundChannel</code> 用来控制程序中的声音。每个声音均分配给一个声道，而且应用程序可以具有混合在一起的多个声道。</p>
	 * <p> <code>SoundChannel</code> 类包含控制声音的播放、暂停、停止、音量的方法，以及获取声音的播放状态、总时间、当前播放时间、总循环次数、播放地址等信息的方法。</p>
	 */
	public class SoundChannel extends EventDispatcher {

		/**
		 * 声音地址。
		 */
		public var url:String;

		/**
		 * 循环次数。
		 */
		public var loops:Number;

		/**
		 * 播放声音开始时间。
		 */
		public var startTime:Number;

		/**
		 * 表示声音是否已暂停。
		 */
		public var isStopped:Boolean;

		/**
		 * 播放完成处理器。
		 */
		public var completeHandler:Handler;

		/**
		 * 音量范围从 0（静音）至 1（最大音量）。
		 */
		public var volume:Number;

		/**
		 * 获取当前播放时间，单位是秒。
		 */
		public function get position():Number{
				return null;
		}

		/**
		 * 获取总时间，单位是秒。
		 */
		public function get duration():Number{
				return null;
		}

		/**
		 * 播放声音。
		 */
		public function play():void{}

		/**
		 * 停止播放。
		 */
		public function stop():void{}

		/**
		 * 暂停播放。
		 */
		public function pause():void{}

		/**
		 * 继续播放。
		 */
		public function resume():void{}

		/**
		 * private
		 */
		protected function __runComplete(handler:Handler):void{}
	}

}
