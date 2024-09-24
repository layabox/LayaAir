import { UIComponent } from "./UIComponent";
import { Box } from "./Box";
import { Button } from "./Button";
import { UIUtils } from "./UIUtils";
import { Graphics } from "../display/Graphics"
import { Input } from "../display/Input"
import { Sprite } from "../display/Sprite"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";

/**
 * @en The `ColorPicker` component displays a color palette from which the user can select a color.
 * @zh `ColorPicker` 组件将显示包含多个颜色样本的列表，用户可以从中选择颜色。
 */
export class ColorPicker extends UIComponent {

    /**
     * @en Specifies the width and height of each color cell (in pixels).
     * @zh 指定每个正方形的颜色小格子的宽高（以像素为单位）。
     */
    protected _gridSize: number = 11;
    /**
     * @en The background color value of the color palette panel.
     * @zh 表示颜色样本列表面板的背景颜色值。
     */
    protected _bgColor: string = "#ffffff";
    /**
     * @en The border color value of the color palette panel.
     * @zh 表示颜色样本列表面板的边框颜色值。
     */
    protected _borderColor: string = "#000000";
    /**
     * @en Represents the color value selected or input in the color sample list panel.
     * @cn 表示颜色样本列表面板选择或输入的颜色值。
     */
    protected _inputColor: string = "#000000";
    /**
     * @en The background color value of the color input box.
     * @zh 表示颜色输入框的背景颜色值。
     */
    protected _inputBgColor: string = "#efefef";
    /**
     * @en Represents the color palette panel.
     * @zh 表示颜色样本列表面板。
     */
    protected _colorPanel: Box;
    /**
     * @en Represents the color grid.
     * @zh 表示颜色网格。
     */
    protected _colorTiles: Sprite;
    /**
     * @en Represents the color block display object.
     * @zh 表示颜色块显示对象。
     */
    protected _colorBlock: Sprite;
    /**
     * @en Represents the color input box control `Input`.
     * @zh 表示颜色输入框控件 `Input`。
     */
    protected _colorInput: Input;
    /**
     * @en Represents the button control `Button` that displays the color palette panel when clicked.
     * @zh 表示点击后显示颜色样本列表面板的按钮控件 `Button`。
     */
    protected _colorButton: Button;
     /**
     * @en Represents the list of color values.
     * @zh 表示颜色值列表。
     */
    protected _colors: any[] = [];
    /**
     * @en Represents the selected color value.  
     * @zh 表示选择的颜色值。
     */
    protected _selectedColor: string = "#000000";
    protected _panelChanged: boolean;

    /**
     * @en The function handler executed when the color changes.
     * The default return parameter is `color`: the color value string.
     * @zh 当颜色发生改变时执行的函数处理器。
     * 默认返回参数color：颜色值字符串。
     */
    changeHandler: Handler;


    /**
     * @en The selected color value.
     * @zh 表示选择的颜色值。
     */
    get selectedColor(): string {
        return this._selectedColor;
    }
    set selectedColor(value: string) {
        if (this._selectedColor != value) {
            this._selectedColor = this._colorInput.text = value;
            this.drawBlock(value);
            this.changeColor();
            this.changeHandler && this.changeHandler.runWith(this._selectedColor);
            this.event(Event.CHANGE, Event.EMPTY);
        }
    }

    /**
     * @en The skin URL of the color picker.
     * @zh 颜色选择器的皮肤地址。
     */
    get skin(): string {
        return this._colorButton.skin;
    }

    set skin(value: string) {
        this._colorButton.once(Event.LOADED, this, this.changeColor);
        this._colorButton.skin = value;
        //changeColor();
    }

    /**
     * @en The background color value of the color palette panel.
     * @zh 表示颜色样本列表面板的背景颜色值。
     */
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        this._bgColor = value;
        this._setPanelChanged();
    }

    /**
     * @en The border color value of the color palette panel.
     * @zh 表示颜色样本列表面板的边框颜色值。
     */
    get borderColor(): string {
        return this._borderColor;
    }

    set borderColor(value: string) {
        this._borderColor = value;
        this._setPanelChanged();
    }

    /**
     * @en The color value selected or entered in the color palette panel.
     * @zh 表示颜色样本列表面板选择或输入的颜色值。
     */
    get inputColor(): string {
        return this._inputColor;
    }

    set inputColor(value: string) {
        this._inputColor = value;
        this._setPanelChanged();
    }

    /**
     * @en The background color value of the color input box.
     * @zh 表示颜色输入框的背景颜色值。
     */
    get inputBgColor(): string {
        return this._inputBgColor;
    }

    set inputBgColor(value: string) {
        this._inputBgColor = value;
        this._setPanelChanged();
    }

    constructor(createChildren = true) {
        super(false);
        if (createChildren) {
            this.preinitialize();
            this.createChildren();
            this.initialize();
        }
    }

    protected _setPanelChanged(): void {
        if (!this._panelChanged) {
            this._panelChanged = true;
            this.callLater(this.changePanel);
        }
    }

    protected createChildren(): void {
        this._colorButton = new Button()
        this._colorButton.hideFlags = HideFlags.HideAndDontSave;
        this.addChild(this._colorButton);
        this._colorPanel = new Box();
        this._colorPanel.hideFlags = HideFlags.HideAndDontSave;
        this._colorPanel.size(230, 166);
        this._colorPanel.addChild(this._colorTiles = new Sprite());
        this._colorPanel.addChild(this._colorBlock = new Sprite());
        this._colorPanel.addChild(this._colorInput = new Input());
    }

    protected initialize(): void {
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

    private onPanelMouseDown(e: Event): void {
        e.stopPropagation();
    }

    /**
     * @en Changes the color palette panel.
     * @zh 改变颜色样本列表面板。
     */
    protected changePanel(): void {
        this._panelChanged = false;
        var g: Graphics = this._colorPanel.graphics;
        g.clear(true);
        //g.drawRect(0, 0, 230, 166, _bgColor);
        g.drawRect(0, 0, 230, 166, this._bgColor, this._borderColor);

        this.drawBlock(this._selectedColor);

        this._colorInput.borderColor = this._borderColor;
        this._colorInput.bgColor = this._inputBgColor;
        this._colorInput.color = this._inputColor;

        g = this._colorTiles.graphics;
        g.clear(true);

        var mainColors: any[] = [0x000000, 0x333333, 0x666666, 0x999999, 0xCCCCCC, 0xFFFFFF, 0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0x00FFFF, 0xFF00FF];
        for (var i: number = 0; i < 12; i++) {
            for (var j: number = 0; j < 20; j++) {
                var color: number;
                if (j === 0) color = mainColors[i];
                else if (j === 1) color = 0x000000;
                else color = (((i * 3 + j / 6) % 3 << 0) + ((i / 6) << 0) * 3) * 0x33 << 16 | j % 6 * 0x33 << 8 | (i << 0) % 6 * 0x33;

                var strColor: string = UIUtils.toColor(color);
                this._colors.push(strColor);

                var x: number = j * this._gridSize;
                var y: number = i * this._gridSize;

                g.drawRect(x, y, this._gridSize, this._gridSize, strColor, "#000000");
                //g.drawRect(x + 1, y + 1, _gridSize - 1, _gridSize - 1, strColor);
            }
        }
    }

    /**
     * @en Handles the `Event.MOUSE_DOWN` event of the color button.
     * @param e The event object.
     * @zh 颜色样本列表面板显示按钮的 `Event.MOUSE_DOWN` 事件侦听处理函数。
     * @param e 事件对象。
     */
    private onColorButtonClick(e: Event): void {
        if (this._colorPanel.parent) this.close();
        else this.open();
    }

    /**
     * @en Handles the `Event.MOUSE_DOWN` event of the stage to close the color palette panel.
     * @param e (Optional) The event object. 
     * @zh 处理舞台的 `Event.MOUSE_DOWN` 事件侦听处理函数，关闭颜色面板。
     * @param e (可选) 事件对象。
     */
    private removeColorBox(e: Event = null): void {
        this.close();
    }

    /**
     * @en Handles the `Event.KEY_DOWN` event of the color input field.
     * @param e The event object.
     * @zh 处理颜色输入框的 `Event.KEY_DOWN` 事件侦听处理函数。
     * @param e 事件对象。
     */
    private onColorFieldKeyDown(e: Event): void {
        if (e.keyCode == 13) {
            if (this._colorInput.text) this.selectedColor = this._colorInput.text;
            else this.selectedColor = null;
            this.close();
            e.stopPropagation();
        }
    }

    /**
     * @en Handles the `Event.CHANGE` event of the color input field.
     * @param e (Optional) The event object.
     * @zh 处理颜色输入框的 `Event.CHANGE` 事件侦听处理函数。
     * @param e (可选) 事件对象。
     */
    private onColorInputChange(e: Event = null): void {
        if (this._colorInput.text) this.drawBlock(this._colorInput.text);
        else this.drawBlock("#FFFFFF");
    }

    /**
     * @en Handles the `Event.CLICK` event of the color tiles.
     * @param e The event object.
     * @zh 处理颜色格子的 `Event.CLICK` 事件侦听处理函数。
     * @param e 事件对象。
     */
    private onColorTilesClick(e: Event): void {
        this.selectedColor = this.getColorByMouse();
        this.close();
    }

    /**
     * @en Handles the `Event.MOUSE_MOVE` event of the color tiles.
     * @param e The event object.
     * @zh 处理颜色格子的 `Event.MOUSE_MOVE` 事件侦听处理函数。
     * @param e 事件对象。
     */
    private onColorTilesMouseMove(e: Event): void {
        this._colorInput.focus = false;
        var color: string = this.getColorByMouse();
        this._colorInput.text = color;
        this.drawBlock(color);
    }

    /**
     * @en Gets the color value of the corresponding color block based on the mouse position.
     * @zh 通过鼠标位置取对应的颜色块的颜色值。
     */  
    protected getColorByMouse(): string {
        var point: Point = this._colorTiles.getMousePoint();
        var x: number = Math.floor(point.x / this._gridSize);
        var y: number = Math.floor(point.y / this._gridSize);
        return this._colors[y * 20 + x];
    }

    /**
     * @en Draws the color block.
     * @param color The color value to draw.
     * @zh 绘制颜色块。
     * @param color 要绘制的颜色值。
     */
    private drawBlock(color: string): void {
        var g: Graphics = this._colorBlock.graphics;
        g.clear(true);
        var showColor: string = color ? color : "#ffffff";
        g.drawRect(0, 0, 50, 20, showColor, this._borderColor);

        color || g.drawLine(0, 0, 50, 20, "#ff0000");
    }

    /**
     * @en Changes the color.
     * @zh 改变颜色。
     */
    private changeColor(): void {
        var g: Graphics = this.graphics;
        g.clear(true);
        var showColor: string = this._selectedColor || "#000000";
        g.drawRect(0, 0, this._colorButton.width, this._colorButton.height, showColor);
    }


    /**
     * @en Opens the color palette panel.
     * @zh 打开颜色样本列表面板。
     */
    open(): void {
        let stage = ILaya.stage;
        var p: Point = this.localToGlobal(new Point());
        var px: number = p.x + this._colorPanel.width <= stage.width ? p.x : stage.width - this._colorPanel.width;
        var py: number = p.y + this._colorButton.height;
        py = py + this._colorPanel.height <= stage.height ? py : p.y - this._colorPanel.height;
        this._colorPanel.pos(px, py);
        this._colorPanel.zOrder = 1001;
        stage.addChild(this._colorPanel);
        stage.on(Event.MOUSE_DOWN, this, this.removeColorBox);
    }

    /**
     * @en Closes the color palette panel.
     * @zh 关闭颜色样本列表面板。
     */
    close(): void {
        ILaya.stage.off(Event.MOUSE_DOWN, this, this.removeColorBox);
        this._colorPanel.removeSelf();
    }

    /**
     * @en Destroys the color picker component.
     * @param destroyChild Indicates whether to destroy the component's children as well. Default value is true.
     * @zh 销毁颜色选择器组件。
     * @param destroyChild 是否同时销毁子项。默认为 true。
     */
    destroy(destroyChild: boolean = true): void {
        ILaya.stage.off(Event.MOUSE_DOWN, this, this.removeColorBox);
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
}