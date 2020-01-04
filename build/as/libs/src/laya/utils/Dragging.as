package laya.utils {
	import laya.display.Sprite;
	import laya.maths.Rectangle;

	/**
	 * @private <code>Dragging</code> 类是触摸滑动控件。
	 */
	public class Dragging {

		/**
		 * 被拖动的对象。
		 */
		public var target:Sprite;

		/**
		 * 缓动衰减系数。
		 */
		public var ratio:Number;

		/**
		 * 单帧最大偏移量。
		 */
		public var maxOffset:Number;

		/**
		 * 滑动范围。
		 */
		public var area:Rectangle;

		/**
		 * 表示拖动是否有惯性。
		 */
		public var hasInertia:Boolean;

		/**
		 * 橡皮筋最大值。
		 */
		public var elasticDistance:Number;

		/**
		 * 橡皮筋回弹时间，单位为毫秒。
		 */
		public var elasticBackTime:Number;

		/**
		 * 事件携带数据。
		 */
		public var data:*;
		private var _dragging:*;
		private var _clickOnly:*;
		private var _elasticRateX:*;
		private var _elasticRateY:*;
		private var _lastX:*;
		private var _lastY:*;
		private var _offsetX:*;
		private var _offsetY:*;
		private var _offsets:*;
		private var _disableMouseEvent:*;
		private var _tween:*;
		private var _parent:*;

		/**
		 * 开始拖拽。
		 * @param target 待拖拽的 <code>Sprite</code> 对象。
		 * @param area 滑动范围。
		 * @param hasInertia 拖动是否有惯性。
		 * @param elasticDistance 橡皮筋最大值。
		 * @param elasticBackTime 橡皮筋回弹时间，单位为毫秒。
		 * @param data 事件携带数据。
		 * @param disableMouseEvent 鼠标事件是否有效。
		 * @param ratio 惯性阻尼系数
		 */
		public function start(target:Sprite,area:Rectangle,hasInertia:Boolean,elasticDistance:Number,elasticBackTime:Number,data:*,disableMouseEvent:Boolean,ratio:Number = null):void{}

		/**
		 * 清除计时器。
		 */
		private var clearTimer:*;

		/**
		 * 停止拖拽。
		 */
		public function stop():void{}

		/**
		 * 拖拽的循环处理函数。
		 */
		private var loop:*;

		/**
		 * 拖拽区域检测。
		 */
		private var checkArea:*;

		/**
		 * 移动至设定的拖拽区域。
		 */
		private var backToArea:*;

		/**
		 * 舞台的抬起事件侦听函数。
		 * @param e Event 对象。
		 */
		private var onStageMouseUp:*;

		/**
		 * 橡皮筋效果检测。
		 */
		private var checkElastic:*;

		/**
		 * 移动。
		 */
		private var tweenMove:*;

		/**
		 * 结束拖拽。
		 */
		private var clear:*;
	}

}
