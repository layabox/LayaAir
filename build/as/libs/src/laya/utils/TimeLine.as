package laya.utils {
	import laya.events.EventDispatcher;

	/**
	 * 整个缓动结束的时候会调度
	 * @eventType Event.COMPLETE
	 */

	/**
	 * 当缓动到达标签时会调度。
	 * @eventType Event.LABEL
	 */

	/**
	 * <code>TimeLine</code> 是一个用来创建时间轴动画的类。
	 */
	public class TimeLine extends EventDispatcher {
		private var _labelDic:*;
		private var _tweenDic:*;
		private var _tweenDataList:*;
		private var _endTweenDataList:*;
		private var _currTime:*;
		private var _lastTime:*;
		private var _startTime:*;

		/**
		 * 当前动画数据播放到第几个了
		 */
		private var _index:*;

		/**
		 * 为TWEEN创建属于自己的唯一标识，方便管理
		 */
		private var _gidIndex:*;

		/**
		 * 保留所有对象第一次注册动画时的状态（根据时间跳转时，需要把对象的恢复，再计算接下来的状态）
		 */
		private var _firstTweenDic:*;

		/**
		 * 是否需要排序
		 */
		private var _startTimeSort:*;
		private var _endTimeSort:*;

		/**
		 * 是否循环
		 */
		private var _loopKey:*;

		/**
		 * 缩放动画播放的速度。
		 */
		public var scale:Number;
		private var _frameRate:*;
		private var _frameIndex:*;
		private var _total:*;

		/**
		 * 控制一个对象，从当前点移动到目标点。
		 * @param target 要控制的对象。
		 * @param props 要控制对象的属性。
		 * @param duration 对象TWEEN的时间。
		 * @param ease 缓动类型
		 * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
		 */
		public static function to(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{
			return null;
		}

		/**
		 * 从 props 属性，缓动到当前状态。
		 * @param target target 目标对象(即将更改属性值的对象)
		 * @param props 要控制对象的属性
		 * @param duration 对象TWEEN的时间
		 * @param ease 缓动类型
		 * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）
		 */
		public static function from(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{
			return null;
		}

		/**
		 * 控制一个对象，从当前点移动到目标点。
		 * @param target 要控制的对象。
		 * @param props 要控制对象的属性。
		 * @param duration 对象TWEEN的时间。
		 * @param ease 缓动类型
		 * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）。
		 */
		public function to(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{
			return null;
		}

		/**
		 * 从 props 属性，缓动到当前状态。
		 * @param target target 目标对象(即将更改属性值的对象)
		 * @param props 要控制对象的属性
		 * @param duration 对象TWEEN的时间
		 * @param ease 缓动类型
		 * @param offset 相对于上一个对象，偏移多长时间（单位：毫秒）
		 */
		public function from(target:*,props:*,duration:Number,ease:Function = null,offset:Number = null):TimeLine{
			return null;
		}

		/**
		 * @private 
		 */
		private var _create:*;

		/**
		 * 在时间队列中加入一个标签。
		 * @param label 标签名称。
		 * @param offset 标签相对于上个动画的偏移时间(单位：毫秒)。
		 */
		public function addLabel(label:String,offset:Number):TimeLine{
			return null;
		}

		/**
		 * 移除指定的标签
		 * @param label 
		 */
		public function removeLabel(label:String):void{}

		/**
		 * 动画从整个动画的某一时间开始。
		 * @param time (单位：毫秒)。
		 */
		public function gotoTime(time:Number):void{}

		/**
		 * 从指定的标签开始播。
		 * @param Label 标签名。
		 */
		public function gotoLabel(Label:String):void{}

		/**
		 * 暂停整个动画。
		 */
		public function pause():void{}

		/**
		 * 恢复暂停动画的播放。
		 */
		public function resume():void{}

		/**
		 * 播放动画。
		 * @param timeOrLabel 开启播放的时间点或标签名。
		 * @param loop 是否循环播放。
		 */
		public function play(timeOrLabel:* = null,loop:Boolean = null):void{}

		/**
		 * 更新当前动画。
		 */
		private var _update:*;

		/**
		 * 指定的动画索引处的动画播放完成后，把此动画从列表中删除。
		 * @param index 
		 */
		private var _animComplete:*;

		/**
		 * @private 
		 */
		private var _complete:*;

		/**
		 * @private 得到帧索引
		 */

		/**
		 * @private 设置帧索引
		 */
		public var index:Number;

		/**
		 * 得到总帧数。
		 */
		public function get total():Number{
				return null;
		}

		/**
		 * 重置所有对象，复用对象的时候使用。
		 */
		public function reset():void{}

		/**
		 * 彻底销毁此对象。
		 */
		public function destroy():void{}
	}

}
