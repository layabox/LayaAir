import { UIComponent } from "././UIComponent";
import { Box } from "././Box";
import { Button } from "././Button";
import { UIUtils } from "././UIUtils";
import { Input } from "../display/Input";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { ILaya } from "../../ILaya";
/**
 * 选择项改变后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
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
export class ColorPicker extends UIComponent {
    constructor() {
        super(...arguments);
        /**
         * @private
         * 指定每个正方形的颜色小格子的宽高（以像素为单位）。
         */
        this._gridSize = 11;
        /**
         * @private
         * 表示颜色样本列表面板的背景颜色值。
         */
        this._bgColor = "#ffffff";
        /**
         * @private
         * 表示颜色样本列表面板的边框颜色值。
         */
        this._borderColor = "#000000";
        /**
         * @private
         * 表示颜色样本列表面板选择或输入的颜色值。
         */
        this._inputColor = "#000000";
        /**
         * @private
         * 表示颜色输入框的背景颜色值。
         */
        this._inputBgColor = "#efefef";
        /**
         * @private
         * 表示颜色值列表。
         */
        this._colors = [];
        /**
         * @private
         * 表示选择的颜色值。
         */
        this._selectedColor = "#000000";
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._colorPanel && this._colorPanel.destroy(destroyChild);
        this._colorButton && this._colorButton.destroy(destroyChild);
        this._colorPanel = null;
        this._colorTiles = null;
        this._colorBlock = null;
        this._colorInput = null;
        this._colorButton = null;
        this._colors = null;
        this.changeHandler = null;
    }
    /**@inheritDoc */
    /*override*/ createChildren() {
        this.addChild(this._colorButton = new Button());
        this._colorPanel = new Box();
        this._colorPanel.size(230, 166);
        this._colorPanel.addChild(this._colorTiles = new Sprite());
        this._colorPanel.addChild(this._colorBlock = new Sprite());
        this._colorPanel.addChild(this._colorInput = new Input());
    }
    /**@inheritDoc */
    /*override*/ initialize() {
        this._colorButton.on(Event.CLICK, this, this.onColorButtonClick);
        this._colorBlock.pos(5, 5);
        this._colorInput.pos(60, 5);
        this._colorInput.size(60, 20);
        this._colorInput.on(Event.CHANGE, this, this.onColorInputChange);
        this._colorInput.on(Event.KEY_DOWN, this, this.onColorFieldKeyDown);
        this._colorTiles.pos(5, 30);
        this._colorTiles.on(Event.MOUSE_MOVE, this, this.onColorTilesMouseMove);
        this._colorTiles.on(Event.CLICK, this, this.onColorTilesClick);
        this._colorTiles.size(20 * this._gridSize, 12 * this._gridSize);
        this._colorPanel.on(Event.MOUSE_DOWN, this, this.onPanelMouseDown);
        this.bgColor = this._bgColor;
    }
    onPanelMouseDown(e) {
        e.stopPropagation();
    }
    /**
     * 改变颜色样本列表面板。
     */
    changePanel() {
        this._panelChanged = false;
        var g = this._colorPanel.graphics;
        g.clear(true);
        //g.drawRect(0, 0, 230, 166, _bgColor);
        g.drawRect(0, 0, 230, 166, this._bgColor, this._borderColor);
        this.drawBlock(this._selectedColor);
        this._colorInput.borderColor = this._borderColor;
        this._colorInput.bgColor = this._inputBgColor;
        this._colorInput.color = this._inputColor;
        g = this._colorTiles.graphics;
        g.clear(true);
        var mainColors = [0x000000, 0x333333, 0x666666, 0x999999, 0xCCCCCC, 0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
        for (var i = 0; i < 12; i++) {
            for (var j = 0; j < 20; j++) {
                var color;
                if (j === 0)
                    color = mainColors[i];
                else if (j === 1)
                    color = 0x000000;
                else
                    color = (((i * 3 + j / 6) % 3 << 0) + ((i / 6) << 0) * 3) * 0x33 << 16 | j % 6 * 0x33 << 8 | (i << 0) % 6 * 0x33;
                var strColor = UIUtils.toColor(color);
                this._colors.push(strColor);
                var x = j * this._gridSize;
                var y = i * this._gridSize;
                g.drawRect(x, y, this._gridSize, this._gridSize, strColor, "#000000");
                //g.drawRect(x + 1, y + 1, _gridSize - 1, _gridSize - 1, strColor);
            }
        }
    }
    /**
     * 颜色样本列表面板的显示按钮的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    onColorButtonClick(e) {
        if (this._colorPanel.parent)
            this.close();
        else
            this.open();
    }
    /**
     * 打开颜色样本列表面板。
     */
    open() {
        var Laya = window.Laya;
        var p = this.localToGlobal(new Point());
        var px = p.x + this._colorPanel.width <= Laya.stage.width ? p.x : Laya.stage.width - this._colorPanel.width;
        var py = p.y + this._colorButton.height;
        py = py + this._colorPanel.height <= Laya.stage.height ? py : p.y - this._colorPanel.height;
        this._colorPanel.pos(px, py);
        this._colorPanel.zOrder = 1001;
        Laya._currentStage.addChild(this._colorPanel);
        Laya.stage.on(Event.MOUSE_DOWN, this, this.removeColorBox);
    }
    /**
     * 关闭颜色样本列表面板。
     */
    close() {
        window.Laya.stage.off(Event.MOUSE_DOWN, this, this.removeColorBox);
        this._colorPanel.removeSelf();
    }
    /**
     * 舞台的 <code>Event.MOUSE_DOWN</code> 事件侦听处理函数。
     */
    removeColorBox(e = null) {
        this.close();
        //var target:Sprite = e.target as Sprite;
        //if (!_colorButton.contains(target) && !_colorPanel.contains(target)) {
        //close();
        //}
    }
    /**
     * 小格子色块的 <code>Event.KEY_DOWN</code> 事件侦听处理函数。
     */
    onColorFieldKeyDown(e) {
        if (e.keyCode == 13) {
            if (this._colorInput.text)
                this.selectedColor = this._colorInput.text;
            else
                this.selectedColor = null;
            this.close();
            e.stopPropagation();
        }
    }
    /**
     * 颜色值输入框 <code>Event.CHANGE</code> 事件侦听处理函数。
     */
    onColorInputChange(e = null) {
        if (this._colorInput.text)
            this.drawBlock(this._colorInput.text);
        else
            this.drawBlock("#FFFFFF");
    }
    /**
     * 小格子色块的 <code>Event.CLICK</code> 事件侦听处理函数。
     */
    onColorTilesClick(e) {
        this.selectedColor = this.getColorByMouse();
        this.close();
    }
    /**
     * @private
     * 小格子色块的 <code>Event.MOUSE_MOVE</code> 事件侦听处理函数。
     */
    onColorTilesMouseMove(e) {
        this._colorInput.focus = false;
        var color = this.getColorByMouse();
        this._colorInput.text = color;
        this.drawBlock(color);
    }
    /**
     * 通过鼠标位置取对应的颜色块的颜色值。
     */
    getColorByMouse() {
        var point = this._colorTiles.getMousePoint();
        var x = Math.floor(point.x / this._gridSize);
        var y = Math.floor(point.y / this._gridSize);
        return this._colors[y * 20 + x];
    }
    /**
     * 绘制颜色块。
     * @param color 需要绘制的颜色块的颜色值。
     */
    drawBlock(color) {
        var g = this._colorBlock.graphics;
        g.clear(true);
        var showColor = color ? color : "#ffffff";
        g.drawRect(0, 0, 50, 20, showColor, this._borderColor);
        color || g.drawLine(0, 0, 50, 20, "#ff0000");
    }
    /**
     * 表示选择的颜色值。
     */
    get selectedColor() {
        return this._selectedColor;
    }
    set selectedColor(value) {
        if (this._selectedColor != value) {
            this._selectedColor = this._colorInput.text = value;
            this.drawBlock(value);
            this.changeColor();
            this.changeHandler && this.changeHandler.runWith(this._selectedColor);
            this.event(Event.CHANGE, Event.EMPTY.setTo(Event.CHANGE, this, this));
        }
    }
    /**
     * @copy laya.ui.Button#skin
     */
    get skin() {
        return this._colorButton.skin;
    }
    set skin(value) {
        this._colorButton.once(Event.LOADED, this, this.changeColor);
        this._colorButton.skin = value;
        //changeColor();
    }
    /**
     * 改变颜色。
     */
    changeColor() {
        var g = this.graphics;
        g.clear(true);
        var showColor = this._selectedColor || "#000000";
        g.drawRect(0, 0, this._colorButton.width, this._colorButton.height, showColor);
    }
    /**
     * 表示颜色样本列表面板的背景颜色值。
     */
    get bgColor() {
        return this._bgColor;
    }
    set bgColor(value) {
        this._bgColor = value;
        this._setPanelChanged();
    }
    /**
     * 表示颜色样本列表面板的边框颜色值。
     */
    get borderColor() {
        return this._borderColor;
    }
    set borderColor(value) {
        this._borderColor = value;
        this._setPanelChanged();
    }
    /**
     * 表示颜色样本列表面板选择或输入的颜色值。
     */
    get inputColor() {
        return this._inputColor;
    }
    set inputColor(value) {
        this._inputColor = value;
        this._setPanelChanged();
    }
    /**
     * 表示颜色输入框的背景颜色值。
     */
    get inputBgColor() {
        return this._inputBgColor;
    }
    set inputBgColor(value) {
        this._inputBgColor = value;
        this._setPanelChanged();
    }
    /**@private */
    _setPanelChanged() {
        if (!this._panelChanged) {
            this._panelChanged = true;
            this.callLater(this.changePanel);
        }
    }
}
ILaya.regClass(ColorPicker);
