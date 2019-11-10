package laya.utils {
	import laya.utils.Handler;

	/**
	 * <code>Tween</code>  是一个缓动类。使用此类能够实现对目标对象属性的渐变。
	 */
	public class Tween {

		/**
		 * @private 
		 */
		private static var tweenMap:*;

		/**
		 * @private 
		 */
		private var _complete:*;

		/**
		 * @private 
		 */
		private var _target:*;

		/**
		 * @private 
		 */
		private var _ease:*;

		/**
		 * @private 
		 */
		private var _props:*;

		/**
		 * @private 
		 */
		private var _duration:*;

		/**
		 * @private 
		 */
		private var _delay:*;

		/**
		 * @private 
		 */
		private var _startTimer:*;

		/**
		 * @private 
		 */
		private var _usedTimer:*;

		/**
		 * @private 
		 */
		private var _usedPool:*;

		/**
		 * @private 
		 */
		private var _delayParam:*;

		/**
		 * @private 唯一标识，TimeLintLite用到
		 */
		public var gid:Number;

		/**
		 * 更新回调，缓动数值发生变化时，回调变化的值
		 */
		public var update:Handler;

		/**
		 * 重播次数，如果repeat=0，则表示无限循环播放
		 */
		public var repeat:Number;

		/**
		 * 当前播放次数
		 */
		private var _count:*;

		/**
		 * 缓动对象的props属性到目标值。
		 * @param target 目标对象(即将更改属性值的对象)。
		 * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param duration 花费的时间，单位毫秒。
		 * @param ease 缓动类型，默认为匀速运动。
		 * @param complete 结束回调函数。
		 * @param delay 延迟执行时间。
		 * @param coverBefore 是否覆盖之前的缓动。
		 * @param autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
		 * @return 返回Tween对象。
		 */
		public static function to(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null,autoRecover:Boolean = null):Tween{
			return null;
		}

		/**
		 * 从props属性，缓动到当前状态。
		 * @param target 目标对象(即将更改属性值的对象)。
		 * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param duration 花费的时间，单位毫秒。
		 * @param ease 缓动类型，默认为匀速运动。
		 * @param complete 结束回调函数。
		 * @param delay 延迟执行时间。
		 * @param coverBefore 是否覆盖之前的缓动。
		 * @param autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
		 * @return 返回Tween对象。
		 */
		public static function from(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null,autoRecover:Boolean = null):Tween{
			return null;
		}

		/**
		 * 缓动对象的props属性到目标值。
		 * @param target 目标对象(即将更改属性值的对象)。
		 * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param duration 花费的时间，单位毫秒。
		 * @param ease 缓动类型，默认为匀速运动。
		 * @param complete 结束回调函数。
		 * @param delay 延迟执行时间。
		 * @param coverBefore 是否覆盖之前的缓动。
		 * @return 返回Tween对象。
		 */
		public function to(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null):Tween{
			return null;
		}

		/**
		 * 从props属性，缓动到当前状态。
		 * @param target 目标对象(即将更改属性值的对象)。
		 * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
		 * @param duration 花费的时间，单位毫秒。
		 * @param ease 缓动类型，默认为匀速运动。
		 * @param complete 结束回调函数。
		 * @param delay 延迟执行时间。
		 * @param coverBefore 是否覆盖之前的缓动。
		 * @return 返回Tween对象。
		 */
		public function from(target:*,props:*,duration:Number,ease:Function = null,complete:Handler = null,delay:Number = null,coverBefore:Boolean = null):Tween{
			return null;
		}
		private var firstStart:*;
		private var _initProps:*;
		private var _beginLoop:*;

		/**
		 * 执行缓动*
		 */
		private var _doEase:*;

		/**
		 * 设置当前执行比例*
		 */
		public var progress:Number;

		/**
		 * 立即结束缓动并到终点。
		 */
		public function complete():void{}

		/**
		 * 暂停缓动，可以通过resume或restart重新开始。
		 */
		public function pause():void{}

		/**
		 * 设置开始时间。
		 * @param startTime 开始时间。
		 */
		public function setStartTime(startTime:Number):void{}

		/**
		 * 清理指定目标对象上的所有缓动。
		 * @param target 目标对象。
		 */
		public static function clearAll(target:*):void{}

		/**
		 * 清理某个缓动。
		 * @param tween 缓动对象。
		 */
		public static function clear(tween:Tween):void{}

		/**
		 * @private 同clearAll，废弃掉，尽量别用。
		 */
		public static function clearTween(target:*):void{}

		/**
		 * 停止并清理当前缓动。
		 */
		public function clear():void{}

		/**
		 * 回收到对象池。
		 */
		public function recover():void{}
		private var _remove:*;

		/**
		 * 重新开始暂停的缓动。
		 */
		public function restart():void{}

		/**
		 * 恢复暂停的缓动。
		 */
		public function resume():void{}
		private static var easeNone:*;
	}

}
