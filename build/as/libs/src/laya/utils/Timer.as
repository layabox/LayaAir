package laya.utils {

	/**
	 * <code>Timer</code> 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 Laya.timer 访问。
	 */
	public class Timer {

		/**
		 * @private 
		 */
		public static var gSysTimer:Timer;

		/**
		 * @private 
		 */
		private static var _pool:*;

		/**
		 * @private 
		 */
		public static var _mid:Number;

		/**
		 * 时针缩放。
		 */
		public var scale:Number;

		/**
		 * 当前帧开始的时间。
		 */
		public var currTimer:Number;

		/**
		 * 当前的帧数。
		 */
		public var currFrame:Number;

		/**
		 * @private 
		 */
		private var _map:*;

		/**
		 * @private 
		 */
		private var _handlers:*;

		/**
		 * @private 
		 */
		private var _temp:*;

		/**
		 * @private 
		 */
		private var _count:*;

		/**
		 * 创建 <code>Timer</code> 类的一个实例。
		 */

		public function Timer(autoActive:Boolean = undefined){}

		/**
		 * 两帧之间的时间间隔,单位毫秒。
		 */
		public function get delta():Number{
				return null;
		}

		/**
		 * @private 
		 */
		private var _clearHandlers:*;

		/**
		 * @private 
		 */
		private var _recoverHandler:*;

		/**
		 * @private 
		 */
		private var _indexHandler:*;

		/**
		 * 定时执行一次。
		 * @param delay 延迟时间(单位为毫秒)。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
		 */
		public function once(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}

		/**
		 * 定时重复执行。
		 * @param delay 间隔时间(单位毫秒)。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
		 * @param jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
		 */
		public function loop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null,jumpFrame:Boolean = null):void{}

		/**
		 * 定时执行一次(基于帧率)。
		 * @param delay 延迟几帧(单位为帧)。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
		 */
		public function frameOnce(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}

		/**
		 * 定时重复执行(基于帧率)。
		 * @param delay 间隔几帧(单位为帧)。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
		 */
		public function frameLoop(delay:Number,caller:*,method:Function,args:Array = null,coverBefore:Boolean = null):void{}

		/**
		 * 返回统计信息。
		 */
		public function toString():String{
			return null;
		}

		/**
		 * 清理定时器。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 */
		public function clear(caller:*,method:Function):void{}

		/**
		 * 清理对象身上的所有定时器。
		 * @param caller 执行域(this)。
		 */
		public function clearAll(caller:*):void{}

		/**
		 * @private 
		 */
		private var _getHandler:*;

		/**
		 * 延迟执行。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 * @param args 回调参数。
		 */
		public function callLater(caller:*,method:Function,args:Array = null):void{}

		/**
		 * 立即执行 callLater 。
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 */
		public function runCallLater(caller:*,method:Function):void{}

		/**
		 * 立即提前执行定时器，执行之后从队列中删除
		 * @param caller 执行域(this)。
		 * @param method 定时器回调函数。
		 */
		public function runTimer(caller:*,method:Function):void{}

		/**
		 * 暂停时钟
		 */
		public function pause():void{}

		/**
		 * 恢复时钟
		 */
		public function resume():void{}
	}

}
