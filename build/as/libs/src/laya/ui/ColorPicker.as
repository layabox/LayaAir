package laya.ui {
	import laya.ui.UIComponent;
	import laya.ui.Box;
	import laya.ui.Button;
	import laya.display.Input;
	import laya.display.Sprite;
	import laya.utils.Handler;

	/**
	 * 选择项改变后调度。
	 * @eventType laya.events.Event
	 */

	/**
	 * <code>ColorPicker</code> 组件将显示包含多个颜色样本的列表，用户可以从中选择颜色。
	 * @example <caption>以下示例代码，创建了一个 <code>ColorPicker</code> 实例。</caption>package{import laya.ui.ColorPicker;import laya.utils.Handler;public class ColorPicker_Example{public function ColorPicker_Example(){Laya.init(640, 800);//设置游戏画布宽高。Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。Laya.loader.load("resource/ui/color.png", Handler.create(this,onLoadComplete));//加载资源。}private function onLoadComplete():void{trace("资源加载完成！");var colorPicket:ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。colorPicket.changeHandler = new Handler(this, onChangeColor,[colorPicket]);//设置 colorPicket 的颜色改变回调函数。Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。}private function onChangeColor(colorPicket:ColorPicker):void{trace("当前选择的颜色： " + colorPicket.selectedColor);}}}
	 * @example Laya.init(640, 800);//设置游戏画布宽高Laya.stage.bgColor = "#efefef";//设置画布的背景颜色Laya.loader.load("resource/ui/color.png",laya.utils.Handler.create(this,loadComplete));//加载资源function loadComplete(){    console.log("资源加载完成！");    var colorPicket = new laya.ui.ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。    colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。    colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。    colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。    colorPicket.changeHandler = laya.utils.Handler.create(this, onChangeColor,[colorPicket],false);//设置 colorPicket 的颜色改变回调函数。    Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。}function onChangeColor(colorPicket){    console.log("当前选择的颜色： " + colorPicket.selectedColor);}
	 * @example import ColorPicker = laya.ui.ColorPicker;import Handler = laya.utils.Handler;class ColorPicker_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        Laya.loader.load("resource/ui/color.png", Handler.create(this, this.onLoadComplete));//加载资源。    }    private onLoadComplete(): void {        console.log("资源加载完成！");        var colorPicket: ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。        colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。        colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。        colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。        colorPicket.changeHandler = new Handler(this, this.onChangeColor, [colorPicket]);//设置 colorPicket 的颜色改变回调函数。        Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。    }    private onChangeColor(colorPicket: ColorPicker): void {        console.log("当前选择的颜色： " + colorPicket.selectedColor);    }}
	 */
	public class ColorPicker extends UIComponent {

		/**
		 * 当颜色发生改变时执行的函数处理器。
		 * 默认返回参数color：颜色值字符串。
		 */
		public var changeHandler:Handler;

		/**
		 * @private 指定每个正方形的颜色小格子的宽高（以像素为单位）。
		 */
		protected var _gridSize:Number;

		/**
		 * @private 表示颜色样本列表面板的背景颜色值。
		 */
		protected var _bgColor:String;

		/**
		 * @private 表示颜色样本列表面板的边框颜色值。
		 */
		protected var _borderColor:String;

		/**
		 * @private 表示颜色样本列表面板选择或输入的颜色值。
		 */
		protected var _inputColor:String;

		/**
		 * @private 表示颜色输入框的背景颜色值。
		 */
		protected var _inputBgColor:String;

		/**
		 * @private 表示颜色样本列表面板。
		 */
		protected var _colorPanel:Box;

		/**
		 * @private 表示颜色网格。
		 */
		protected var _colorTiles:Sprite;

		/**
		 * @private 表示颜色块显示对象。
		 */
		protected var _colorBlock:Sprite;

		/**
		 * @private 表示颜色输入框控件 <code>Input</code> 。
		 */
		protected var _colorInput:Input;

		/**
		 * @private 表示点击后显示颜色样本列表面板的按钮控件 <code>Button</code> 。
		 */
		protected var _colorButton:Button;

		/**
		 * @private 表示颜色值列表。
		 */
		protected var _colors:Array;

		/**
		 * @private 表示选择的颜色值。
		 */
		protected var _selectedColor:String;

		/**
		 * @private 
		 */
		protected var _panelChanged:Boolean;

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
		private var onPanelMouseDown:*;

		/**
		 * 改变颜色样本列表面板。
		 */
		protected function changePanel():void{}

		/**
		 * 颜色样本列表面板的显示按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		private var onColorButtonClick:*;

		/**
		 * 打开颜色样本列表面板。
		 */
		public function open():void{}

		/**
		 * 关闭颜色样本列表面板。
		 */
		public function close():void{}

		/**
		 * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
		 */
		private var removeColorBox:*;

		/**
		 * 小格子色块的 <code>Event.KEY_DOWN</code> 事件侦听处理函数。
		 */
		private var onColorFieldKeyDown:*;

		/**
		 * 颜色值输入框 <code>Event.CHANGE</code> 事件侦听处理函数。
		 */
		private var onColorInputChange:*;

		/**
		 * 小格子色块的 <code>Event.CLICK</code> 事件侦听处理函数。
		 */
		private var onColorTilesClick:*;

		/**
		 * @private 小格子色块的 <code>Event.MOUSE_MOVE</code> 事件侦听处理函数。
		 */
		private var onColorTilesMouseMove:*;

		/**
		 * 通过鼠标位置取对应的颜色块的颜色值。
		 */
		protected function getColorByMouse():String{
			return null;
		}

		/**
		 * 绘制颜色块。
		 * @param color 需要绘制的颜色块的颜色值。
		 */
		private var drawBlock:*;

		/**
		 * 表示选择的颜色值。
		 */
		public var selectedColor:String;

		/**
		 * @copy laya.ui.Button#skin
		 */
		public var skin:String;

		/**
		 * 改变颜色。
		 */
		private var changeColor:*;

		/**
		 * 表示颜色样本列表面板的背景颜色值。
		 */
		public var bgColor:String;

		/**
		 * 表示颜色样本列表面板的边框颜色值。
		 */
		public var borderColor:String;

		/**
		 * 表示颜色样本列表面板选择或输入的颜色值。
		 */
		public var inputColor:String;

		/**
		 * 表示颜色输入框的背景颜色值。
		 */
		public var inputBgColor:String;

		/**
		 * @private 
		 */
		protected function _setPanelChanged():void{}
	}

}
