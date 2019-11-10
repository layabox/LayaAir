package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.Label;
	import laya.ui.Image;
	import laya.ui.Button;
	import laya.events.Event;
	import laya.maths.Point;
	import laya.utils.Handler;

	/**
	 * 移动滑块位置时调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * 移动滑块位置完成（用户鼠标抬起）后调度。
	 * @eventType 
	 * @eventType laya.events.EventD
	 */

	/**
	 * 使用 <code>Slider</code> 控件，用户可以通过在滑块轨道的终点之间移动滑块来选择值。
	 * <p>滑块的当前值由滑块端点（对应于滑块的最小值和最大值）之间滑块的相对位置确定。</p>
	 * <p>滑块允许最小值和最大值之间特定间隔内的值。滑块还可以使用数据提示显示其当前值。</p>
	 * @see laya.ui.HSlider
	 * @see laya.ui.VSlider
	 */
	public class Slider extends UIComponent {

		/**
		 * @private 获取对 <code>Slider</code> 组件所包含的 <code>Label</code> 组件的引用。
		 */
		public static var label:Label;

		/**
		 * 数据变化处理器。
		 * <p>默认回调参数为滑块位置属性 <code>value</code>属性值：Number 。</p>
		 */
		public var changeHandler:Handler;

		/**
		 * 一个布尔值，指示是否为垂直滚动。如果值为true，则为垂直方向，否则为水平方向。
		 * <p>默认值为：true。</p>
		 * @default true
		 */
		public var isVertical:Boolean;

		/**
		 * 一个布尔值，指示是否显示标签。
		 * @default true
		 */
		public var showLabel:Boolean;

		/**
		 * @private 
		 */
		protected var _allowClickBack:Boolean;

		/**
		 * @private 
		 */
		protected var _max:Number;

		/**
		 * @private 
		 */
		protected var _min:Number;

		/**
		 * @private 
		 */
		protected var _tick:Number;

		/**
		 * @private 
		 */
		protected var _value:Number;

		/**
		 * @private 
		 */
		protected var _skin:String;

		/**
		 * @private 
		 */
		protected var _bg:Image;

		/**
		 * @private 
		 */
		protected var _progress:Image;

		/**
		 * @private 
		 */
		protected var _bar:Button;

		/**
		 * @private 
		 */
		protected var _tx:Number;

		/**
		 * @private 
		 */
		protected var _ty:Number;

		/**
		 * @private 
		 */
		protected var _maxMove:Number;

		/**
		 * @private 
		 */
		protected var _globalSacle:Point;

		/**
		 * 创建一个新的 <code>Slider</code> 类示例。
		 * @param skin 皮肤。
		 */

		public function Slider(skin:String = undefined){}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function createChildren():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function initialize():void{}

		/**
		 * @private 滑块的的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		protected function onBarMouseDown(e:Event):void{}

		/**
		 * @private 显示标签。
		 */
		protected function showValueText():void{}

		/**
		 * @private 隐藏标签。
		 */
		protected function hideValueText():void{}

		/**
		 * @private 
		 */
		private var mouseUp:*;

		/**
		 * @private 
		 */
		private var mouseMove:*;

		/**
		 * @private 
		 */
		protected function sendChangeEvent(type:String = null):void{}

		/**
		 * @copy laya.ui.Image#skin
		 */
		public var skin:String;
		protected function _skinLoaded():void{}

		/**
		 * @private 设置滑块的位置信息。
		 */
		protected function setBarPoint():void{}

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
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _sizeChanged():void{}

		/**
		 * <p>当前实例的背景图（ <code>Image</code> ）和滑块按钮（ <code>Button</code> ）实例的有效缩放网格数据。</p>
		 * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
		 * <ul><li>例如："4,4,4,4,1"</li></ul></p>
		 * @see laya.ui.AutoBitmap.sizeGrid
		 */
		public var sizeGrid:String;

		/**
		 * 设置滑动条的信息。
		 * @param min 滑块的最小值。
		 * @param max 滑块的最小值。
		 * @param value 滑块的当前值。
		 */
		public function setSlider(min:Number,max:Number,value:Number):void{}

		/**
		 * 滑动的刻度值，滑动数值为tick的整数倍。默认值为1。
		 */
		public var tick:Number;

		/**
		 * @private 改变滑块的位置值。
		 */
		public function changeValue():void{}

		/**
		 * 获取或设置表示最高位置的数字。 默认值为100。
		 */
		public var max:Number;

		/**
		 * 获取或设置表示最低位置的数字。 默认值为0。
		 */
		public var min:Number;

		/**
		 * 获取或设置表示当前滑块位置的数字。
		 */
		public var value:Number;

		/**
		 * 一个布尔值，指定是否允许通过点击滑动条改变 <code>Slider</code> 的 <code>value</code> 属性值。
		 */
		public var allowClickBack:Boolean;

		/**
		 * @private 滑动条的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		protected function onBgMouseDown(e:Event):void{}

		/**
		 * 表示滑块按钮的引用。
		 */
		public function get bar():Button{
				return null;
		}
	}

}
