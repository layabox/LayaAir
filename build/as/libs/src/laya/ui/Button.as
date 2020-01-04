package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.ISelect;
	import laya.display.Text;
	import laya.events.Event;
	import laya.ui.AutoBitmap;
	import laya.utils.Handler;

	/**
	 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>Button</code> 组件用来表示常用的多态按钮。 <code>Button</code> 组件可显示文本标签、图标或同时显示两者。	 *
	 * <p>可以是单态，两态和三态，默认三态(up,over,down)。</p>
	 * @example <caption>以下示例代码，创建了一个 <code>Button</code> 实例。</caption>package{import laya.ui.Button;import laya.utils.Handler;public class Button_Example{public function Button_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。}private function onLoadComplete():void{trace("资源加载完成！");var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。Laya.stage.addChild(button);//将此 button 对象添加到显示列表。}private function onClickButton(button:Button):void{trace("按钮button被点击了！");}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源function loadComplete(){    console.log("资源加载完成！");    var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。    button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。    button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。    button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理函数。    Laya.stage.addChild(button);//将此 button 对象添加到显示列表。}function onClickButton(button){    console.log("按钮被点击了。",button);}
	 * @example import Button=laya.ui.Button;import Handler=laya.utils.Handler;class Button_Example{    constructor()    {        Laya.init(640, 800);        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load("resource/ui/button.png", laya.utils.Handler.create(this,this.onLoadComplete));//加载资源。    }    private onLoadComplete()    {        var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。        button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。        button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。        button.clickHandler = new Handler(this, this.onClickButton,[button]);//设置 button 的点击事件处理器。        Laya.stage.addChild(button);//将此 button 对象添加到显示列表。    }    private onClickButton(button:Button):void    {        console.log("按钮button被点击了！")    }}
	 */
	public class Button extends UIComponent implements ISelect {

		/**
		 * 按钮状态集。
		 */
		protected static var stateMap:*;

		/**
		 * 指定按钮按下时是否是切换按钮的显示状态。
		 * @example 以下示例代码，创建了一个 <code>Button</code> 实例，并设置为切换按钮。
		 * @example package{	import laya.ui.Button;	import laya.utils.Handler;	public class Button_toggle	{		public function Button_toggle()		{			Laya.init(640, 800);//设置游戏画布宽高、渲染模式。			Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。			Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));		}		private function onLoadComplete():void		{			trace("资源加载完成！");			var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 实例对象 button ,传入它的皮肤skin和标签label。			button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。			button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。			button.toggle = true;//设置 button 对象为切换按钮。			button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。			Laya.stage.addChild(button);//将此 button 对象添加到显示列表。 		}		private function onClickButton(button:Button):void		{			trace("button.selected = "+ button.selected);		}	}}
		 * @example Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源function loadComplete(){    console.log("资源加载完成！");    var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。    button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。    button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。    button.toggle = true;//设置 button 对象为切换按钮。    button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理器。    Laya.stage.addChild(button);//将此 button 对象添加到显示列表。}function onClickButton(button){    console.log("button.selected = ",button.selected);}
		 * @example Laya.init(640, 800);//设置游戏画布宽高、渲染模式。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("button.png", null,null, null, null, null);//加载资源function loadComplete() {    console.log("资源加载完成！");    var button:laya.ui.Button = new laya.ui.Button("button.png", "label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。    button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。    button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。    button.toggle = true;//设置 button 对象为切换按钮。    button.clickHandler = laya.utils.Handler.create(this, onClickButton, [button], false);//设置 button 的点击事件处理器。    Laya.stage.addChild(button);//将此 button 对象添加到显示列表。}function onClickButton(button) {    console.log("button.selected = ", button.selected);}
		 */
		public var toggle:Boolean;

		/**
		 * @private 
		 */
		protected var _bitmap:AutoBitmap;

		/**
		 * @private 按钮上的文本。
		 */
		protected var _text:Text;

		/**
		 * @private 按钮文本标签的颜色值。
		 */
		protected var _labelColors:Array;

		/**
		 * @private 按钮文本标签描边的颜色值。
		 */
		protected var _strokeColors:Array;

		/**
		 * @private 按钮的状态值。
		 */
		protected var _state:Number;

		/**
		 * @private 表示按钮的选中状态。
		 */
		protected var _selected:Boolean;

		/**
		 * @private 按钮的皮肤资源。
		 */
		protected var _skin:String;

		/**
		 * @private 指定此显示对象是否自动计算并改变大小等属性。
		 */
		protected var _autoSize:Boolean;

		/**
		 * @private 按钮的状态数。
		 */
		protected var _stateNum:Number;

		/**
		 * @private 源数据。
		 */
		protected var _sources:Array;

		/**
		 * @private 按钮的点击事件函数。
		 */
		protected var _clickHandler:Handler;

		/**
		 * @private 
		 */
		protected var _stateChanged:Boolean;

		/**
		 * 创建一个新的 <code>Button</code> 类实例。
		 * @param skin 皮肤资源地址。
		 * @param label 按钮的文本内容。
		 */

		public function Button(skin:String = undefined,label:String = undefined){}

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
		 * @private 
		 */
		protected function createText():void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override protected function initialize():void{}

		/**
		 * 对象的 <code>Event.MOUSE_OVER、Event.MOUSE_OUT、Event.MOUSE_DOWN、Event.MOUSE_UP、Event.CLICK</code> 事件侦听处理函数。
		 * @param e Event 对象。
		 */
		protected function onMouse(e:Event):void{}

		/**
		 * <p>对象的皮肤资源地址。</p>
		 * 支持单态，两态和三态，用 <code>stateNum</code> 属性设置
		 * <p>对象的皮肤地址，以字符串表示。</p>
		 * @see #stateNum
		 */
		public var skin:String;
		protected function _skinLoaded():void{}

		/**
		 * <p>指定对象的状态值，以数字表示。</p>
		 * <p>默认值为3。此值决定皮肤资源图片的切割方式。</p>
		 * <p><b>取值：</b>
		 * <li>1：单态。图片不做切割，按钮的皮肤状态只有一种。</li>
		 * <li>2：两态。图片将以竖直方向被等比切割为2部分，从上向下，依次为
		 * 弹起状态皮肤、
		 * 按下和经过及选中状态皮肤。</li>
		 * <li>3：三态。图片将以竖直方向被等比切割为3部分，从上向下，依次为
		 * 弹起状态皮肤、
		 * 经过状态皮肤、
		 * 按下和选中状态皮肤</li>
		 * </p>
		 */
		public var stateNum:Number;

		/**
		 * @private 对象的资源切片发生改变。
		 */
		protected function changeClips():void{}

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
		 * 按钮的文本内容。
		 */
		public var label:String;

		/**
		 * 表示按钮的选中状态。
		 * <p>如果值为true，表示该对象处于选中状态。否则该对象处于未选中状态。</p>
		 * @implements 
		 */
		public function get selected():Boolean{
				return null;
		}
		public  function set selected(value:Boolean):void{}

		/**
		 * 对象的状态值。
		 * @see #stateMap
		 */
		protected var state:Number;

		/**
		 * @private 改变对象的状态。
		 */
		protected function changeState():void{}

		/**
		 * 表示按钮各个状态下的文本颜色。
		 * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
		 */
		public var labelColors:String;

		/**
		 * 表示按钮各个状态下的描边颜色。
		 * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
		 */
		public var strokeColors:String;

		/**
		 * 表示按钮文本标签的边距。
		 * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
		 */
		public var labelPadding:String;

		/**
		 * 表示按钮文本标签的字体大小。
		 * @see laya.display.Text.fontSize()
		 */
		public var labelSize:Number;

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
		 * 表示按钮文本标签是否为粗体字。
		 * @see laya.display.Text.bold()
		 */
		public var labelBold:Boolean;

		/**
		 * 表示按钮文本标签的字体名称，以字符串形式表示。
		 * @see laya.display.Text.font()
		 */
		public var labelFont:String;

		/**
		 * 标签对齐模式，默认为居中对齐。
		 */
		public var labelAlign:String;

		/**
		 * 对象的点击事件处理器函数（无默认参数）。
		 * @implements 
		 */
		public function get clickHandler():Handler{
				return null;
		}
		public  function set clickHandler(value:Handler):void{}

		/**
		 * 按钮文本标签 <code>Text</code> 控件。
		 */
		public function get text():Text{
				return null;
		}

		/**
		 * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
		 * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
		 * <ul><li>例如："4,4,4,4,1"</li></ul></p>
		 * @see laya.ui.AutoBitmap.sizeGrid
		 */
		public var sizeGrid:String;

		/**
		 * 图标x,y偏移，格式：100,100
		 */
		public var iconOffset:String;

		/**
		 * @private 
		 */
		protected function _setStateChanged():void{}
	}

}
