package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.Button;
	import laya.ui.List;
	import laya.ui.VScrollBar;
	import laya.events.Event;
	import laya.utils.Handler;

	/**
	 * 当用户更改 <code>ComboBox</code> 组件中的选定内容时调度。
	 * @eventType laya.events.EventselectedIndex属性变化时调度。
	 */

	/**
	 * <code>ComboBox</code> 组件包含一个下拉列表，用户可以从该列表中选择单个值。
	 * @example <caption>以下示例代码，创建了一个 <code>ComboBox</code> 实例。</caption>package{import laya.ui.ComboBox;import laya.utils.Handler;public class ComboBox_Example{public function ComboBox_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。}private function onLoadComplete():void{trace("资源加载完成！");var comboBox:ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。comboBox.selectHandler = new Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。}private function onSelect(index:int):void{trace("当前选中的项对象索引： ",index);}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源function loadComplete() {    console.log("资源加载完成！");    var comboBox = new laya.ui.ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。    comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。    comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。    comboBox.selectHandler = new laya.utils.Handler(this, onSelect);//设置 comboBox 选择项改变时执行的处理器。    Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。}function onSelect(index){    console.log("当前选中的项对象索引： ",index);}
	 * @example import ComboBox = laya.ui.ComboBox;import Handler = laya.utils.Handler;class ComboBox_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load("resource/ui/button.png", Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        console.log("资源加载完成！");        var comboBox: ComboBox = new ComboBox("resource/ui/button.png", "item0,item1,item2,item3,item4,item5");//创建一个 ComboBox 类的实例对象 comboBox ,传入它的皮肤和标签集。        comboBox.x = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。        comboBox.y = 100;//设置 comboBox 对象的属性 x 的值，用于控制 comboBox 对象的显示位置。        comboBox.selectHandler = new Handler(this, this.onSelect);//设置 comboBox 选择项改变时执行的处理器。        Laya.stage.addChild(comboBox);//将此 comboBox 对象添加到显示列表。    }    private onSelect(index: number): void {        console.log("当前选中的项对象索引： ", index);    }}
	 */
	public class ComboBox extends UIComponent {

		/**
		 * @private 
		 */
		protected var _visibleNum:Number;

		/**
		 * @private 
		 */
		protected var _button:Button;

		/**
		 * @private 
		 */
		protected var _list:List;

		/**
		 * @private 
		 */
		protected var _isOpen:Boolean;

		/**
		 * @private 
		 */
		protected var _itemColors:Array;

		/**
		 * @private 
		 */
		protected var _itemSize:Number;

		/**
		 * @private 
		 */
		protected var _labels:Array;

		/**
		 * @private 
		 */
		protected var _selectedIndex:Number;

		/**
		 * @private 
		 */
		protected var _selectHandler:Handler;

		/**
		 * @private 
		 */
		protected var _itemHeight:Number;

		/**
		 * @private 
		 */
		protected var _listHeight:Number;

		/**
		 * @private 
		 */
		protected var _listChanged:Boolean;

		/**
		 * @private 
		 */
		protected var _itemChanged:Boolean;

		/**
		 * @private 
		 */
		protected var _scrollBarSkin:String;

		/**
		 * @private 
		 */
		protected var _isCustomList:Boolean;

		/**
		 * 渲染项，用来显示下拉列表展示对象
		 */
		public var itemRender:*;

		/**
		 * 创建一个新的 <code>ComboBox</code> 组件实例。
		 * @param skin 皮肤资源地址。
		 * @param labels 下拉列表的标签集字符串。以逗号做分割，如"item0,item1,item2,item3,item4,item5"。
		 */

		public function ComboBox(skin:String = undefined,labels:String = undefined){}

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
		private var _createList:*;
		private var _setListEvent:*;

		/**
		 * @private 
		 */
		private var onListDown:*;
		private var onScrollBarDown:*;
		private var onButtonMouseDown:*;

		/**
		 * @copy laya.ui.Button#skin
		 */
		public var skin:String;

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
		 * @private 
		 */
		protected function changeList():void{}

		/**
		 * @private 下拉列表的鼠标事件响应函数。
		 */
		protected function onlistItemMouse(e:Event,index:Number):void{}

		/**
		 * @private 
		 */
		private var switchTo:*;

		/**
		 * 更改下拉列表的打开状态。
		 */
		protected function changeOpen():void{}

		/**
		 * 标签集合字符串。
		 */
		public var labels:String;

		/**
		 * 更改下拉列表。
		 */
		protected function changeItem():void{}

		/**
		 * 表示选择的下拉列表项的索引。
		 */
		public var selectedIndex:Number;
		private var changeSelected:*;

		/**
		 * 改变下拉列表的选择项时执行的处理器(默认返回参数index:int)。
		 */
		public var selectHandler:Handler;

		/**
		 * 表示选择的下拉列表项的的标签。
		 */
		public var selectedLabel:String;

		/**
		 * 获取或设置没有滚动条的下拉列表中可显示的最大行数。
		 */
		public var visibleNum:Number;

		/**
		 * 下拉列表项颜色。
		 * <p><b>格式：</b>"悬停或被选中时背景颜色,悬停或被选中时标签颜色,标签颜色,边框颜色,背景颜色"</p>
		 */
		public var itemColors:String;

		/**
		 * 下拉列表项标签的字体大小。
		 */
		public var itemSize:Number;

		/**
		 * 表示下拉列表的打开状态。
		 */
		public var isOpen:Boolean;
		private var _onStageMouseWheel:*;

		/**
		 * 关闭下拉列表。
		 */
		protected function removeList(e:Event):void{}

		/**
		 * 滚动条皮肤。
		 */
		public var scrollBarSkin:String;

		/**
		 * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
		 * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
		 * <ul><li>例如："4,4,4,4,1"</li></ul></p>
		 * @see laya.ui.AutoBitmap.sizeGrid
		 */
		public var sizeGrid:String;

		/**
		 * 获取对 <code>ComboBox</code> 组件所包含的 <code>VScrollBar</code> 滚动条组件的引用。
		 */
		public function get scrollBar():VScrollBar{
				return null;
		}

		/**
		 * 获取对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的引用。
		 */
		public function get button():Button{
				return null;
		}

		/**
		 * 获取对 <code>ComboBox</code> 组件所包含的 <code>List</code> 列表组件的引用。
		 */
		public var list:List;

		/**
		 * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本标签颜色。
		 * <p><b>格式：</b>upColor,overColor,downColor,disableColor</p>
		 */
		public var labelColors:String;

		/**
		 * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的文本边距。
		 * <p><b>格式：</b>上边距,右边距,下边距,左边距</p>
		 */
		public var labelPadding:String;

		/**
		 * 获取或设置对 <code>ComboBox</code> 组件所包含的 <code>Button</code> 组件的标签字体大小。
		 */
		public var labelSize:Number;

		/**
		 * 表示按钮文本标签是否为粗体字。
		 * @see laya.display.Text#bold
		 */
		public var labelBold:Boolean;

		/**
		 * 表示按钮文本标签的字体名称，以字符串形式表示。
		 * @see laya.display.Text#font
		 */
		public var labelFont:String;

		/**
		 * 表示按钮的状态值。
		 * @see laya.ui.Button#stateNum
		 */
		public var stateNum:Number;
	}

}
