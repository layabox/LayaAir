import { UIComponent } from "././UIComponent";
import { Box } from "././Box";
import { Button } from "././Button";
import { Input } from "../display/Input";
import { Sprite } from "../display/Sprite";
import { Handler } from "../utils/Handler";
/**
 * 选择项改变后调度。
 * @eventType laya.events.Event
 */
/**
 * <code>ColorPicker</code> 组件将显示包含多个颜色样本的列表，用户可以从中选择颜色。
 *
 * @example <caption>以下示例代码，创建了一个 <code>ColorPicker</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.ColorPicker;
 *		import laya.utils.Handler;
 *		public class ColorPicker_Example
 *		{
 *			public function ColorPicker_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load("resource/ui/color.png", Handler.create(this,onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				trace("资源加载完成！");
 *				var colorPicket:ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
 *				colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
 *				colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
 *				colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
 *				colorPicket.changeHandler = new Handler(this, onChangeColor,[colorPicket]);//设置 colorPicket 的颜色改变回调函数。
 *				Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
 *			}
 *			private function onChangeColor(colorPicket:ColorPicker):void
 *			{
 *				trace("当前选择的颜色： " + colorPicket.selectedColor);
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * Laya.loader.load("resource/ui/color.png",laya.utils.Handler.create(this,loadComplete));//加载资源
 * function loadComplete()
 * {
 *     console.log("资源加载完成！");
 *     var colorPicket = new laya.ui.ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
 *     colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
 *     colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
 *     colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
 *     colorPicket.changeHandler = laya.utils.Handler.create(this, onChangeColor,[colorPicket],false);//设置 colorPicket 的颜色改变回调函数。
 *     Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
 * }
 * function onChangeColor(colorPicket)
 * {
 *     console.log("当前选择的颜色： " + colorPicket.selectedColor);
 * }
 * @example
 * import ColorPicker = laya.ui.ColorPicker;
 * import Handler = laya.utils.Handler;
 * class ColorPicker_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load("resource/ui/color.png", Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         console.log("资源加载完成！");
 *         var colorPicket: ColorPicker = new ColorPicker();//创建一个 ColorPicker 类的实例对象 colorPicket 。
 *         colorPicket.skin = "resource/ui/color.png";//设置 colorPicket 的皮肤。
 *         colorPicket.x = 100;//设置 colorPicket 对象的属性 x 的值，用于控制 colorPicket 对象的显示位置。
 *         colorPicket.y = 100;//设置 colorPicket 对象的属性 y 的值，用于控制 colorPicket 对象的显示位置。
 *         colorPicket.changeHandler = new Handler(this, this.onChangeColor, [colorPicket]);//设置 colorPicket 的颜色改变回调函数。
 *         Laya.stage.addChild(colorPicket);//将此 colorPicket 对象添加到显示列表。
 *     }
 *     private onChangeColor(colorPicket: ColorPicker): void {
 *         console.log("当前选择的颜色： " + colorPicket.selectedColor);
 *     }
 * }
 */
export declare class ColorPicker extends UIComponent {
    /**
     * 当颜色发生改变时执行的函数处理器。
     * 默认返回参数color：颜色值字符串。
     */
    changeHandler: Handler;
    /**
     * @private
     * 指定每个正方形的颜色小格子的宽高（以像素为单位）。
     */
    protected _gridSize: number;
    /**
     * @private
     * 表示颜色样本列表面板的背景颜色值。
     */
    protected _bgColor: string;
    /**
     * @private
     * 表示颜色样本列表面板的边框颜色值。
     */
    protected _borderColor: string;
    /**
     * @private
     * 表示颜色样本列表面板选择或输入的颜色值。
     */
    protected _inputColor: string;
    /**
     * @private
     * 表示颜色输入框的背景颜色值。
     */
    protected _inputBgColor: string;
    /**
     * @private
     * 表示颜色样本列表面板。
     */
    protected _colorPanel: Box;
    /**
     * @private
     * 表示颜色网格。
     */
    protected _colorTiles: Sprite;
    /**
     * @private
     * 表示颜色块显示对象。
     */
    protected _colorBlock: Sprite;
    /**
     * @private
     * 表示颜色输入框控件 <code>Input</code> 。
     */
    protected _colorInput: Input;
    /**
     * @private
     * 表示点击后显示颜色样本列表面板的按钮控件 <code>Button</code> 。
     */
    protected _colorButton: Button;
    /**
     * @private
     * 表示颜色值列表。
     */
    protected _colors: any[];
    /**
     * @private
     * 表示选择的颜色值。
     */
    protected _selectedColor: string;
    /** @private */
    protected _panelChanged: boolean;
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**@inheritDoc */
    protected createChildren(): void;
    /**@inheritDoc */
    protected initialize(): void;
    private onPanelMouseDown;
    /**
     * 改变颜色样本列表面板。
     */
    protected changePanel(): void;
    /**
     * 颜色样本列表面板的显示按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    private onColorButtonClick;
    /**
     * 打开颜色样本列表面板。
     */
    open(): void;
    /**
     * 关闭颜色样本列表面板。
     */
    close(): void;
    /**
     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    private removeColorBox;
    /**
     * 小格子色块的 <code>Event.KEY_DOWN</code> 事件侦听处理函数。
     */
    private onColorFieldKeyDown;
    /**
     * 颜色值输入框 <code>Event.CHANGE</code> 事件侦听处理函数。
     */
    private onColorInputChange;
    /**
     * 小格子色块的 <code>Event.CLICK</code> 事件侦听处理函数。
     */
    private onColorTilesClick;
    /**
     * @private
     * 小格子色块的 <code>Event.MOUSE_MOVE</code> 事件侦听处理函数。
     */
    private onColorTilesMouseMove;
    /**
     * 通过鼠标位置取对应的颜色块的颜色值。
     */
    protected getColorByMouse(): string;
    /**
     * 绘制颜色块。
     * @param color 需要绘制的颜色块的颜色值。
     */
    private drawBlock;
    /**
     * 表示选择的颜色值。
     */
    selectedColor: string;
    /**
     * @copy laya.ui.Button#skin
     */
    skin: string;
    /**
     * 改变颜色。
     */
    private changeColor;
    /**
     * 表示颜色样本列表面板的背景颜色值。
     */
    bgColor: string;
    /**
     * 表示颜色样本列表面板的边框颜色值。
     */
    borderColor: string;
    /**
     * 表示颜色样本列表面板选择或输入的颜色值。
     */
    inputColor: string;
    /**
     * 表示颜色输入框的背景颜色值。
     */
    inputBgColor: string;
    /**@private */
    protected _setPanelChanged(): void;
}
