package laya.ui {
	import laya.ui.Box;
	import laya.ui.IItem;
	import laya.ui.ISelect;
	import laya.display.Sprite;
	import laya.utils.Handler;

	/**
	 * 当 <code>Group</code> 实例的 <code>selectedIndex</code> 属性发生变化时调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>Group</code> 是一个可以自动布局的项集合控件。
	 * <p> <code>Group</code> 的默认项对象为 <code>Button</code> 类实例。
	 * <code>Group</code> 是 <code>Tab</code> 和 <code>RadioGroup</code> 的基类。</p>
	 */
	public class UIGroup extends Box implements IItem {

		/**
		 * 改变 <code>Group</code> 的选择项时执行的处理器，(默认返回参数： 项索引（index:int）)。
		 */
		public var selectHandler:Handler;

		/**
		 * @private 
		 */
		protected var _items:Array;

		/**
		 * @private 
		 */
		protected var _selectedIndex:Number;

		/**
		 * @private 
		 */
		protected var _skin:String;

		/**
		 * @private 
		 */
		protected var _direction:String;

		/**
		 * @private 
		 */
		protected var _space:Number;

		/**
		 * @private 
		 */
		protected var _labels:String;

		/**
		 * @private 
		 */
		protected var _labelColors:String;

		/**
		 * @private 
		 */
		private var _labelFont:*;

		/**
		 * @private 
		 */
		protected var _labelStrokeColor:String;

		/**
		 * @private 
		 */
		protected var _strokeColors:String;

		/**
		 * @private 
		 */
		protected var _labelStroke:Number;

		/**
		 * @private 
		 */
		protected var _labelSize:Number;

		/**
		 * @private 
		 */
		protected var _labelBold:Boolean;

		/**
		 * @private 
		 */
		protected var _labelPadding:String;

		/**
		 * @private 
		 */
		protected var _labelAlign:String;

		/**
		 * @private 
		 */
		protected var _stateNum:Number;

		/**
		 * @private 
		 */
		protected var _labelChanged:Boolean;

		/**
		 * 创建一个新的 <code>Group</code> 类实例。
		 * @param labels 标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
		 * @param skin 皮肤。
		 */

		public function UIGroup(labels:String = undefined,skin:String = undefined){}

		/**
		 * @override 
		 */
		override protected function preinitialize():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * 添加一个项对象，返回此项对象的索引id。
		 * @param item 需要添加的项对象。
		 * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
		 * @return 
		 */
		public function addItem(item:ISelect,autoLayOut:Boolean = null):Number{
			return null;
		}

		/**
		 * 删除一个项对象。
		 * @param item 需要删除的项对象。
		 * @param autoLayOut 是否自动布局，如果为true，会根据 <code>direction</code> 和 <code>space</code> 属性计算item的位置。
		 */
		public function delItem(item:ISelect,autoLayOut:Boolean = null):void{}

		/**
		 * 初始化项对象们。
		 */
		public function initItems():void{}

		/**
		 * @private 项对象的点击事件侦听处理函数。
		 * @param index 项索引。
		 */
		protected function itemClick(index:Number):void{}

		/**
		 * 表示当前选择的项索引。默认值为-1。
		 */
		public var selectedIndex:Number;

		/**
		 * @private 通过对象的索引设置项对象的 <code>selected</code> 属性值。
		 * @param index 需要设置的项对象的索引。
		 * @param selected 表示项对象的选中状态。
		 */
		protected function setSelect(index:Number,selected:Boolean):void{}

		/**
		 * @copy laya.ui.Image#skin
		 */
		public var skin:String;
		protected function _skinLoaded():void{}

		/**
		 * 标签集合字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
		 */
		public var labels:String;

		/**
		 * @private 创建一个项显示对象。
		 * @param skin 项对象的皮肤。
		 * @param label 项对象标签。
		 */
		protected function createItem(skin:String,label:String):Sprite{
			return null;
		}

		/**
		 * @copy laya.ui.Button#labelColors()
		 */
		public var labelColors:String;

		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @see laya.display.Text.stroke()
		 */
		public var labelStroke:Number;

		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * 默认值为 "#000000"（黑色）;
		 * @see laya.display.Text.strokeColor()
		 */
		public var labelStrokeColor:String;

		/**
		 * <p>表示各个状态下的描边颜色。</p>
		 * @see laya.display.Text.strokeColor()
		 */
		public var strokeColors:String;

		/**
		 * 表示按钮文本标签的字体大小。
		 */
		public var labelSize:Number;

		/**
		 * 表示按钮的状态值，以数字表示，默认为3态。
		 * @see laya.ui.Button#stateNum
		 */
		public var stateNum:Number;

		/**
		 * 表示按钮文本标签是否为粗体字。
		 */
		public var labelBold:Boolean;

		/**
		 * 表示按钮文本标签的字体名称，以字符串形式表示。
		 * @see laya.display.Text.font()
		 */
		public var labelFont:String;

		/**
		 * 表示按钮文本标签的边距。
		 * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
		 */
		public var labelPadding:String;

		/**
		 * 布局方向。
		 * <p>默认值为"horizontal"。</p>
		 * <p><b>取值：</b>
		 * <li>"horizontal"：表示水平布局。</li>
		 * <li>"vertical"：表示垂直布局。</li>
		 * </p>
		 */
		public var direction:String;

		/**
		 * 项对象们之间的间隔（以像素为单位）。
		 */
		public var space:Number;

		/**
		 * @private 更改项对象的属性值。
		 */
		protected function changeLabels():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function commitMeasure():void{}

		/**
		 * 项对象们的存放数组。
		 */
		public function get items():Array{
				return null;
		}

		/**
		 * 获取或设置当前选择的项对象。
		 */
		public var selection:ISelect;

		/**
		 * @private 
		 */
		protected function _setLabelChanged():void{}
	}

}
