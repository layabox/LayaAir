package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.Button;
	import laya.ui.Slider;
	import laya.display.Sprite;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.utils.Handler;

	/**
	 * 滚动条滑块位置发生变化后调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * 开始滑动。
	 * @eventType laya.events.Event
	 */

	/**
	 * 结束滑动。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>ScrollBar</code> 组件是一个滚动条组件。
	 * <p>当数据太多以至于显示区域无法容纳时，最终用户可以使用 <code>ScrollBar</code> 组件控制所显示的数据部分。</p>
	 * <p> 滚动条由四部分组成：两个箭头按钮、一个轨道和一个滑块。 </p>	 *
	 * @see laya.ui.VScrollBar
	 * @see laya.ui.HScrollBar
	 */
	public class ScrollBar extends UIComponent {

		/**
		 * 滚动衰减系数
		 */
		public var rollRatio:Number;

		/**
		 * 滚动变化时回调，回传value参数。
		 */
		public var changeHandler:Handler;

		/**
		 * 是否缩放滑动条，默认值为true。
		 */
		public var scaleBar:Boolean;

		/**
		 * 一个布尔值，指定是否自动隐藏滚动条(无需滚动时)，默认值为false。
		 */
		public var autoHide:Boolean;

		/**
		 * 橡皮筋效果极限距离，0为没有橡皮筋效果。
		 */
		public var elasticDistance:Number;

		/**
		 * 橡皮筋回弹时间，单位为毫秒。
		 */
		public var elasticBackTime:Number;

		/**
		 * 上按钮
		 */
		public var upButton:Button;

		/**
		 * 下按钮
		 */
		public var downButton:Button;

		/**
		 * 滑条
		 */
		public var slider:Slider;

		/**
		 * @private 
		 */
		protected var _showButtons:Boolean;

		/**
		 * @private 
		 */
		protected var _scrollSize:Number;

		/**
		 * @private 
		 */
		protected var _skin:String;

		/**
		 * @private 
		 */
		protected var _thumbPercent:Number;

		/**
		 * @private 
		 */
		protected var _target:Sprite;

		/**
		 * @private 
		 */
		protected var _lastPoint:Point;

		/**
		 * @private 
		 */
		protected var _lastOffset:Number;

		/**
		 * @private 
		 */
		protected var _checkElastic:Boolean;

		/**
		 * @private 
		 */
		protected var _isElastic:Boolean;

		/**
		 * @private 
		 */
		protected var _value:Number;

		/**
		 * @private 
		 */
		protected var _hide:Boolean;

		/**
		 * @private 
		 */
		protected var _clickOnly:Boolean;

		/**
		 * @private 
		 */
		protected var _offsets:Array;

		/**
		 * @private 
		 */
		protected var _touchScrollEnable:Boolean;

		/**
		 * @private 
		 */
		protected var _mouseWheelEnable:Boolean;

		/**
		 * 创建一个新的 <code>ScrollBar</code> 实例。
		 * @param skin 皮肤资源地址。
		 */

		public function ScrollBar(skin:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @override 
		 */
		override protected function createChildren():void{}

		/**
		 * @override 
		 */
		override protected function initialize():void{}

		/**
		 * @private 滑块位置发生改变的处理函数。
		 */
		protected function onSliderChange():void{}

		/**
		 * @private 向上和向下按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		protected function onButtonMouseDown(e:Event):void{}

		/**
		 * @private 
		 */
		protected function startLoop(isUp:Boolean):void{}

		/**
		 * @private 
		 */
		protected function slide(isUp:Boolean):void{}

		/**
		 * @private 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		protected function onStageMouseUp(e:Event):void{}

		/**
		 * @copy laya.ui.Image#skin
		 */
		public var skin:String;
		protected function _skinLoaded():void{}

		/**
		 * @private 更改对象的皮肤及位置。
		 */
		protected function changeScrollBar():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _sizeChanged():void{}

		/**
		 * @private 
		 */
		private var resetPositions:*;

		/**
		 * @private 
		 */
		protected function resetButtonPosition():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureWidth():Number{
			return null;
		}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function measureHeight():Number{
			return null;
		}

		/**
		 * 设置滚动条信息。
		 * @param min 滚动条最小位置值。
		 * @param max 滚动条最大位置值。
		 * @param value 滚动条当前位置值。
		 */
		public function setScroll(min:Number,max:Number,value:Number):void{}

		/**
		 * 获取或设置表示最高滚动位置的数字。
		 */
		public var max:Number;

		/**
		 * 获取或设置表示最低滚动位置的数字。
		 */
		public var min:Number;

		/**
		 * 获取或设置表示当前滚动位置的数字。
		 */
		public var value:Number;

		/**
		 * 一个布尔值，指示滚动条是否为垂直滚动。如果值为true，则为垂直滚动，否则为水平滚动。
		 * <p>默认值为：true。</p>
		 */
		public var isVertical:Boolean;

		/**
		 * <p>当前实例的 <code>Slider</code> 实例的有效缩放网格数据。</p>
		 * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
		 * <ul><li>例如："4,4,4,4,1"</li></ul></p>
		 * @see laya.ui.AutoBitmap.sizeGrid
		 */
		public var sizeGrid:String;

		/**
		 * 获取或设置一个值，该值表示按下滚动条轨道时页面滚动的增量。
		 */
		public var scrollSize:Number;

		/**
		 * 获取或设置一个值，该值表示滑条长度比例，值为：（0-1）。
		 */
		public var thumbPercent:Number;

		/**
		 * 设置滚动对象。
		 * @see laya.ui.TouchScroll#target
		 */
		public var target:Sprite;

		/**
		 * 是否隐藏滚动条，不显示滚动条，但是可以正常滚动，默认为false。
		 */
		public var hide:Boolean;

		/**
		 * 一个布尔值，指定是否显示向上、向下按钮，默认值为true。
		 */
		public var showButtons:Boolean;

		/**
		 * 一个布尔值，指定是否开启触摸，默认值为true。
		 */
		public var touchScrollEnable:Boolean;

		/**
		 * 一个布尔值，指定是否滑轮滚动，默认值为true。
		 */
		public var mouseWheelEnable:Boolean;

		/**
		 * @private 
		 */
		protected function onTargetMouseWheel(e:Event):void{}
		public var isLockedFun:Function;

		/**
		 * @private 
		 */
		protected function onTargetMouseDown(e:Event):void{}
		public function startDragForce():void{}
		private var cancelDragOp:*;
		public var triggerDownDragLimit:Function;
		public var triggerUpDragLimit:Function;
		private var checkTriggers:*;
		public function get lastOffset():Number{
				return null;
		}
		public function startTweenMoveForce(lastOffset:Number):void{}

		/**
		 * @private 
		 */
		protected function loop():void{}

		/**
		 * @private 
		 */
		protected function onStageMouseUp2(e:Event):void{}

		/**
		 * @private 
		 */
		private var elasticOver:*;

		/**
		 * @private 
		 */
		protected function tweenMove(maxDistance:Number):void{}

		/**
		 * 停止滑动。
		 */
		public function stopScroll():void{}

		/**
		 * 滚动的刻度值，滑动数值为tick的整数倍。默认值为1。
		 */
		public var tick:Number;
	}

}
