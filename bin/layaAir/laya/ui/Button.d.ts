import { UIComponent } from "./UIComponent";
import { ISelect } from "./ISelect";
import { Text } from "../display/Text";
import { Event } from "../events/Event";
import { AutoBitmap } from "./AutoBitmap";
import { Handler } from "../utils/Handler";
/**
 * 当按钮的选中状态（ <code>selected</code> 属性）发生改变时调度。
 * @eventType laya.events.Event
 */
/**
 * <code>Button</code> 组件用来表示常用的多态按钮。 <code>Button</code> 组件可显示文本标签、图标或同时显示两者。	 *
 * <p>可以是单态，两态和三态，默认三态(up,over,down)。</p>
 *
 * @example <caption>以下示例代码，创建了一个 <code>Button</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Button;
 *		import laya.utils.Handler;
 *		public class Button_Example
 *		{
 *			public function Button_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				trace("资源加载完成！");
 *				var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
 *				button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *				button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *				button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。
 *				Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 *			}
 *			private function onClickButton(button:Button):void
 *			{
 *				trace("按钮button被点击了！");
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
 * function loadComplete()
 * {
 *     console.log("资源加载完成！");
 *     var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。
 *     button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *     button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *     button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理函数。
 *     Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 * }
 * function onClickButton(button)
 * {
 *     console.log("按钮被点击了。",button);
 * }
 * @example
 * import Button=laya.ui.Button;
 * import Handler=laya.utils.Handler;
 * class Button_Example{
 *     constructor()
 *     {
 *         Laya.init(640, 800);
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load("resource/ui/button.png", laya.utils.Handler.create(this,this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete()
 *     {
 *         var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,并传入它的皮肤。
 *         button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
 *         button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
 *         button.clickHandler = new Handler(this, this.onClickButton,[button]);//设置 button 的点击事件处理器。
 *         Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
 *     }
 *     private onClickButton(button:Button):void
 *     {
 *         console.log("按钮button被点击了！")
 *     }
 * }
 */
export declare class Button extends UIComponent implements ISelect {
    /**
     * 按钮状态集。
     */
    protected static stateMap: any;
    /**
     * 指定按钮按下时是否是切换按钮的显示状态。
     *
     * @example 以下示例代码，创建了一个 <code>Button</code> 实例，并设置为切换按钮。
     * @example
     * package
     *	{
     *		import laya.ui.Button;
     *		import laya.utils.Handler;
     *		public class Button_toggle
     *		{
     *			public function Button_toggle()
     *			{
     *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
     *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
     *				Laya.loader.load("resource/ui/button.png", Handler.create(this,onLoadComplete));
     *			}
     *			private function onLoadComplete():void
     *			{
     *				trace("资源加载完成！");
     *				var button:Button = new Button("resource/ui/button.png","label");//创建一个 Button 实例对象 button ,传入它的皮肤skin和标签label。
     *				button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
     *				button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
     *				button.toggle = true;//设置 button 对象为切换按钮。
     *				button.clickHandler = new Handler(this, onClickButton,[button]);//设置 button 的点击事件处理器。
     *				Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
     *	 		}
     *			private function onClickButton(button:Button):void
     *			{
     *				trace("button.selected = "+ button.selected);
     *			}
     *		}
     *	}
     * @example
     * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
     * Laya.loader.load("resource/ui/button.png",laya.utils.Handler.create(this,loadComplete));//加载资源
     * function loadComplete()
     * {
     *     console.log("资源加载完成！");
     *     var button = new laya.ui.Button("resource/ui/button.png","label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。
     *     button.x =100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
     *     button.y =100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
     *     button.toggle = true;//设置 button 对象为切换按钮。
     *     button.clickHandler = laya.utils.Handler.create(this,onClickButton,[button],false);//设置 button 的点击事件处理器。
     *     Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
     * }
     * function onClickButton(button)
     * {
     *     console.log("button.selected = ",button.selected);
     * }
     * @example
     * Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
     * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
     * Laya.loader.load("button.png", null,null, null, null, null);//加载资源
     * function loadComplete() {
     *     console.log("资源加载完成！");
     *     var button:laya.ui.Button = new laya.ui.Button("button.png", "label");//创建一个 Button 类的实例对象 button ,传入它的皮肤skin和标签label。
     *     button.x = 100;//设置 button 对象的属性 x 的值，用于控制 button 对象的显示位置。
     *     button.y = 100;//设置 button 对象的属性 y 的值，用于控制 button 对象的显示位置。
     *     button.toggle = true;//设置 button 对象为切换按钮。
     *     button.clickHandler = laya.utils.Handler.create(this, onClickButton, [button], false);//设置 button 的点击事件处理器。
     *     Laya.stage.addChild(button);//将此 button 对象添加到显示列表。
     * }
     * function onClickButton(button) {
     *     console.log("button.selected = ", button.selected);
     * }
     */
    toggle: boolean;
    /**
     * @private
     */
    protected _bitmap: AutoBitmap;
    /**
     * @private
     * 按钮上的文本。
     */
    protected _text: Text;
    /**
     * @private
     * 按钮文本标签的颜色值。
     */
    protected _labelColors: any[];
    /**
     * @private
     * 按钮文本标签描边的颜色值。
     */
    protected _strokeColors: any[];
    /**
     * @private
     * 按钮的状态值。
     */
    protected _state: number;
    /**
     * @private
     * 表示按钮的选中状态。
     */
    protected _selected: boolean;
    /**
     * @private
     * 按钮的皮肤资源。
     */
    protected _skin: string;
    /**
     * @private
     * 指定此显示对象是否自动计算并改变大小等属性。
     */
    protected _autoSize: boolean;
    /**
     * @private
     * 按钮的状态数。
     */
    protected _stateNum: number;
    /**
     * @private
     * 源数据。
     */
    protected _sources: any[];
    /**
     * @private
     * 按钮的点击事件函数。
     */
    protected _clickHandler: Handler;
    /**
     * @private
     */
    protected _stateChanged: boolean;
    /**
     * 创建一个新的 <code>Button</code> 类实例。
     * @param skin 皮肤资源地址。
     * @param label 按钮的文本内容。
     */
    constructor(skin?: string, label?: string);
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@private */
    protected createText(): void;
    /**@inheritDoc */
    protected initialize(): void;
    /**
     * 对象的 <code>Event.MOUSE_OVER、Event.MOUSE_OUT、Event.MOUSE_DOWN、Event.MOUSE_UP、Event.CLICK</code> 事件侦听处理函数。
     * @param e Event 对象。
     */
    protected onMouse(e: Event): void;
    /**
     * <p>对象的皮肤资源地址。</p>
     * 支持单态，两态和三态，用 <code>stateNum</code> 属性设置
     * <p>对象的皮肤地址，以字符串表示。</p>
     * @see #stateNum
     */
    skin: string;
    protected _skinLoaded(): void;
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
    stateNum: number;
    /**
     * @private
     * 对象的资源切片发生改变。
     */
    protected changeClips(): void;
    /**
     * @inheritDoc
     */
    protected measureWidth(): number;
    /**
     * @inheritDoc
     */
    protected measureHeight(): number;
    /**
     * 按钮的文本内容。
     */
    label: string;
    /**
     * 表示按钮的选中状态。
     * <p>如果值为true，表示该对象处于选中状态。否则该对象处于未选中状态。</p>
     */
    selected: boolean;
    /**
     * 对象的状态值。
     * @see #stateMap
     */
    protected state: number;
    /**
     * @private
     * 改变对象的状态。
     */
    protected changeState(): void;
    /**
     * 表示按钮各个状态下的文本颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
     */
    labelColors: string;
    /**
     * 表示按钮各个状态下的描边颜色。
     * <p><b>格式:</b> "upColor,overColor,downColor,disableColor"。</p>
     */
    strokeColors: string;
    /**
     * 表示按钮文本标签的边距。
     * <p><b>格式：</b>"上边距,右边距,下边距,左边距"。</p>
     */
    labelPadding: string;
    /**
     * 表示按钮文本标签的字体大小。
     * @see laya.display.Text.fontSize()
     */
    labelSize: number;
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @see laya.display.Text.stroke()
     */
    labelStroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * 默认值为 "#000000"（黑色）;
     * @see laya.display.Text.strokeColor()
     */
    labelStrokeColor: string;
    /**
     * 表示按钮文本标签是否为粗体字。
     * @see laya.display.Text.bold()
     */
    labelBold: boolean;
    /**
     * 表示按钮文本标签的字体名称，以字符串形式表示。
     * @see laya.display.Text.font()
     */
    labelFont: string;
    /**标签对齐模式，默认为居中对齐。*/
    labelAlign: string;
    /**
     * 对象的点击事件处理器函数（无默认参数）。
     */
    clickHandler: Handler;
    /**
     * 按钮文本标签 <code>Text</code> 控件。
     */
    readonly text: Text;
    /**
     * <p>当前实例的位图 <code>AutoImage</code> 实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    sizeGrid: string;
    /**@inheritDoc */
    width: number;
    /**@inheritDoc */
    height: number;
    /**@inheritDoc */
    dataSource: any;
    /**图标x,y偏移，格式：100,100*/
    iconOffset: string;
    /**@private */
    protected _setStateChanged(): void;
}
