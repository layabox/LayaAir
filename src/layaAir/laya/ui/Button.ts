import { UIComponent } from "./UIComponent";
import { ISelect } from "./ISelect";
import { Styles } from "./Styles";
import { NodeFlags, HideFlags } from "../Const"
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { Texture } from "../resource/Texture"
import { AutoBitmap } from "./AutoBitmap"
import { UIUtils } from "./UIUtils"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { URL } from "../net/URL";



/**
 * @en The Button component is used to represent a button with multiple states. The Button component can display a text label, an icon, or both.
 * The states can be single-state, two-state (normal, pressed), or three-state (normal, hover, pressed). By default, it is three-state.
 * @zh `Button` 组件用来表示多种状态的按钮。`Button` 组件可显示文本标签、图标或同时显示两者。
 * 多种状态，可以是单态，两态（移出、按下）和三态(移出、悬停、按下)，默认是三态。
 */
export class Button extends UIComponent implements ISelect {
    /**
     * @en Controls whether the button can toggle its display state. When the value is true, the display state can be toggled by clicking, such as switching between selected and unselected states.
     * @zh 用于控制按钮是否可切换显示状态；值为 true 时，才可以在运行后通过点击切换显示状态。例如选中状态和未选中状态。
     */
    toggle: boolean;

    /**
     * @internal
     * @en The text on the button.
     * @zh 按钮上的文本。
     */
    protected _text: Text;
    /**
     * @internal
     * @en The color value of the button's text label.
     * @zh 按钮文本标签的颜色值。
     */
    protected _labelColors: string[];
    /**
     * @internal
     * @en The color value of the button's text label stroke.
     * @zh 按钮文本标签描边的颜色值。
     */
    protected _strokeColors: string[];
    /**
     * @internal 
     * @en The state value of the button.
     * @zh 按钮的状态值。
     */
    protected _state: number = 0;
    /**
     * @internal
     * @en Indicates the selected state of the button.
     * @zh 表示按钮的选中状态。
     */
    protected _selected: boolean;

    /**
     * @internal
     * @en The skin resource of the button.
     * @zh 按钮的皮肤资源。
     */
    protected _skin: string;

    /**
     * @internal
     * @en Specifies whether the display object automatically calculates and changes size and other attributes.
     * @zh 指定此显示对象是否自动计算并改变大小等属性。
     */
    protected _autoSize: boolean = true;

    /**
     * @internal
     * @en The number of states for the button.
     * @zh 按钮的状态数。
     */
    protected _stateNum: number;
    /**
     * @internal
     * @en The click event handler of the button.
     * @zh 按钮的点击事件函数。
     */
    protected _clickHandler: Handler;

    /**
     * @internal
     */
    protected _stateChanged: boolean = false;

    /**
     * @internal
     */
    declare _graphics: AutoBitmap;

    /**
     * @internal
     * @en The state value of the button.
     * @zh 对象的状态值。
     * @see #stateMap
     */
    protected get state(): number {
        return this._state;
    }

    /**
     * @internal
     */
    protected set state(value: number) {
        if (this._state != value) {
            this._state = value;
            this._setStateChanged();
        }
    }

    /**
     * @en The skin resource address of the object.
     * Supports single state, two states and three states, set with the `stateNum` property.
     * @zh 对象的皮肤资源地址。
     * 支持单态，两态和三态，用 `stateNum` 属性设置
     * @see #stateNum
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
     * @en The state value of the object, expressed as a number.
     * The default value is 3. This value determines how the skin resource image is sliced.
     * Values:
     * - 1: Single state. The image is not sliced, and the button has only one skin state.
     * - 2: Two states. The image will be sliced equally in the vertical direction into 2 parts, from top to bottom, the up state skin and the down and over and selected state skin, respectively.
     * - 3: Three states. The image will be sliced equally in the vertical direction into 3 parts, from top to bottom, the up state skin, the over state skin, and the down and selected state skin, respectively.
     * @zh 指定对象的状态值，以数字表示。
     * 默认值为3。此值决定皮肤资源图片的切割方式。
     * 取值：
     * - 1：单态。图片不做切割，按钮的皮肤状态只有一种。
     * - 2：两态。图片将以竖直方向被等比切割为2部分，从上向下，依次为弹起状态皮肤、按下和经过及选中状态皮肤。
     * - 3：三态。图片将以竖直方向被等比切割为3部分，从上向下，依次为弹起状态皮肤、经过状态皮肤、按下和选中状态皮肤
     */
    get stateNum(): number {
        return this._stateNum;
    }

    set stateNum(value: number) {
        if (typeof (value as any) == 'string') {
            value = parseInt(value as any);
        }
        if (this._stateNum != value) {
            this._stateNum = value < 1 ? 1 : value > 3 ? 3 : value;
            this._graphics.setState(this._state, this._stateNum);
            if (this._skin) {
                this.callLater(this.changeClips);
                this._setStateChanged();
            }
        }
    }

    /**
     * @en The text content of the button.
     * @zh 按钮的文本内容。
     */
    get label(): string {
        return this._text ? this._text.text : null;
    }

    set label(value: string) {
        if (!this._text && !value) return;
        this.createText();
        if (this._text.text != value) {
            value && !this._text.parent && this.addChild(this._text);
            this._text.text = (value + "").replace(/\\n/g, "\n");
            this._setStateChanged();
        }
    }

    /**
     * @en Indicates the selected state of the button.
     * If the value is true, it indicates that the object is in the selected state. Otherwise, it is not selected.
     * @zh 表示按钮的选中状态。
     * 如果值为true，表示该对象处于选中状态。否则该对象处于未选中状态。
     * @implements
     */
    get selected(): boolean {
        return this._selected;
    }

    set selected(value: boolean) {
        if (this._selected != value) {
            this._selected = value;
            this.state = this._selected ? 2 : 0;
            this.event(Event.CHANGE);
        }
    }


    /**
      * @en The text color of the button in each state.
      * Format: "upColor,overColor,downColor".
      * @zh 表示按钮各个状态下的文本颜色。
      * 格式: "upColor,overColor,downColor"。
      */
    get labelColors(): string {
        return this._labelColors.join(",");
    }

    set labelColors(value: string) {
        this._labelColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }

    /**
     * @en The stroke color of the button in each state.
     * Format: "upColor,overColor,downColor".
     * @zh 表示按钮各个状态下的描边颜色。
     * 格式: "upColor,overColor,downColor"。
     */
    get strokeColors(): string {
        return this._strokeColors ? this._strokeColors.join(",") : "";
    }

    set strokeColors(value: string) {
        this._strokeColors = UIUtils.fillArray(Styles.buttonLabelColors, value, String);
        this._setStateChanged();
    }

    /**
     * @en The margins of the button's text label.
     * Format: "top,right,bottom,left".
     * @zh 表示按钮文本标签的边距。
     * 格式："上边距,右边距,下边距,左边距"。
     */
    get labelPadding(): string {
        this.createText();
        return this._text.padding.join(",");
    }

    set labelPadding(value: string) {
        this.createText();
        this._text.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }

    /**
     * @en The font size of the button's text label.
     * @zh 表示按钮文本标签的字体大小。
     */
    get labelSize(): number {
        this.createText();
        return this._text.fontSize;
    }

    set labelSize(value: number) {
        this.createText();
        this._text.fontSize = value
    }

    /**
     * @en The stroke width, in pixels.
     * Default value is 0, indicating no stroke.
     * @zh 描边宽度（以像素为单位）。
     * 默认值0，表示不描边。
     */
    get labelStroke(): number {
        this.createText();
        return this._text.stroke;
    }

    set labelStroke(value: number) {
        this.createText();
        this._text.stroke = value
    }

    /**
     * @en The stroke color, represented by a string.
     * The default value is "#000000" (black).
     * @zh 描边颜色，以字符串表示。
     * 默认值为 "#000000"（黑色）;
     * @see laya.display.Text.strokeColor()
     */
    get labelStrokeColor(): string {
        this.createText();
        return this._text.strokeColor;
    }

    set labelStrokeColor(value: string) {
        this.createText();
        this._text.strokeColor = value
    }

    /**
     * @en Indicates whether the button's text label is bold.
     * @zh 表示按钮文本标签是否为粗体字。
     */
    get labelBold(): boolean {
        this.createText();
        return this._text.bold;
    }

    set labelBold(value: boolean) {
        this.createText();
        this._text.bold = value;
    }

    /**
     * @en The font name of the button's text label, expressed as a string.
     * @zh 表示按钮文本标签的字体名称，以字符串形式表示。
     */
    get labelFont(): string {
        this.createText();
        return this._text.font;
    }

    set labelFont(value: string) {
        this.createText();
        this._text.font = value;
    }

    /**
     * @en The text alignment mode.
     * @zh 标签水平对齐模式。
     */
    get labelAlign(): string {
        this.createText()
        return this._text.align;
    }

    set labelAlign(value: string) {
        this.createText()
        this._text.align = value;
    }

    /**
     * @en The vertical alignment mode.
     * @zh 标签垂直对齐模式。
     */
    get labelVAlign(): string {
        this.createText()
        return this._text.valign;
    }

    set labelVAlign(value: string) {
        this.createText()
        this._text.valign = value;
    }

    /**
     * @en The click event handler of the object (without default parameters).
     * @zh 对象的点击事件处理器函数（无默认参数）。
     * @implements
     */
    get clickHandler(): Handler {
        return this._clickHandler;
    }

    set clickHandler(value: Handler) {
        this._clickHandler = value;
    }

    /**
     * @en The button's text label `Text` control.
     * @zh 按钮文本标签 `Text` 控件。
     */
    get text(): Text {
        this.createText();
        return this._text;
    }

    /**
     * @private
    */
    set text(value: Text) {
        if (typeof (value) == "string") {
            this._text && (this._text.text = value);
        }
    }

    /**
       * @en The size grid of the texture.
       * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
       * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
       * The values are separated by commas. For example: "6,6,6,6,1".
       * @zh 皮肤纹理的九宫格数据。
       * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
       * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
       * 值以逗号分隔。例如："6,6,6,6,1"。
       */
    get sizeGrid(): string {
        if (this._graphics.sizeGrid) return this._graphics.sizeGrid.join(",");
        return null;
    }

    set sizeGrid(value: string) {
        if (value)
            this._graphics.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
        else
            this._graphics.sizeGrid = null;
    }

    /**
     * @en The x and y offset of the icon, format: 100,100
     * @zh 图标x,y偏移，格式：100,100
     */
    get iconOffset(): string {
        return this._graphics._offset ? this._graphics._offset.join(",") : null;
    }

    set iconOffset(value: string) {
        if (value)
            this._graphics._offset = UIUtils.fillArray([1, 1], value, Number);
        else
            this._graphics._offset = [];
    }

    /**
     * @en Creates a new instance of the `Button` class.
     * @param skin The address of the skin resource.
     * @param label The text content of the button.
     * @zh 创建一个新的 `Button` 类实例。
     * @param skin 皮肤资源地址。
     * @param label 按钮的文本内容。
     */
    constructor(skin: string = null, label: string = "") {
        super();
        this._labelColors = Styles.buttonLabelColors;
        this._stateNum = Styles.buttonStateNum;

        if (skin)
            this.skin = skin;
        this.label = label;
    }

    /**
   * @internal
   * @inheritDoc
   * @override
   */
    protected measureWidth(): number {
        if (this._skin)
            this.runCallLater(this.changeClips);
        if (this._autoSize) return this._graphics.width;
        this.runCallLater(this.changeState);
        return this._graphics.width + (this._text ? this._text.width : 0);
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected measureHeight(): number {
        if (this._skin)
            this.runCallLater(this.changeClips);
        return this._text ? Math.max(this._graphics.height, this._text.height) : this._graphics.height;
    }

    /**
     * 销毁
     * @param destroyChild 是否删除子节点
     * @inheritDoc 
     * @override
     */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._text && this._text.destroy(destroyChild);
        this._text = null;
        this._clickHandler = null;
        this._labelColors = this._strokeColors = null;
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    protected createChildren(): void {
        this.setGraphics(new AutoBitmap(), true);
    }

    /**@internal */
    protected createText(): void {
        if (!this._text) {
            this._text = new Text();
            this._text.overflow = Text.HIDDEN;
            this._text.align = "center";
            this._text.valign = "middle";
            this._text.width = this._width;
            this._text.height = this._height;
            this._text.hideFlags = HideFlags.HideAndDontSave;
        }
    }

    /**
     * @internal 
     * @override
    */
    protected initialize(): void {
        if (this._mouseState !== 1) {
            this.mouseEnabled = true;
            this._setBit(NodeFlags.HAS_MOUSE, true);
        }
        this.on(Event.MOUSE_OVER, this, this.onMouse);
        this.on(Event.MOUSE_OUT, this, this.onMouse);
        this.on(Event.MOUSE_DOWN, this, this.onMouse);
        this.on(Event.MOUSE_UP, this, this.onMouse);
        this.on(Event.CLICK, this, this.onMouse);
    }

    /**
     * @internal
     * @en The event listener process function for the object's `Event.MOUSE_OVER`, `Event.MOUSE_OUT`, `Event.MOUSE_DOWN`, `Event.MOUSE_UP`, and `Event.CLICK` events.
     * @param e The event object.
     * @zh 对象的 `Event.MOUSE_OVER`、`Event.MOUSE_OUT`、`Event.MOUSE_DOWN`、`Event.MOUSE_UP`、`Event.CLICK` 事件侦听处理函数。
     * @param e 事件对象
     */
    protected onMouse(e: Event): void {
        if (this.toggle === false && this._selected) return;
        let type = e ? e.type : Event.CLICK;
        if (type === Event.CLICK) {
            this.toggle && (this.selected = !this._selected);
            this._clickHandler && this._clickHandler.run();
            return;
        }
        !this._selected && (this.state = stateMap[type]);
    }

    /**
     * @internal
     * @en Set the skin resource of the button.
     * @param url The URL of the skin resource.
     * @zh 设置皮肤资源。
     * @param url 皮肤资源的URL。
     */
    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            if (this._skinBaseUrl)
                url = URL.formatURL(url, this._skinBaseUrl);
            let tex = Loader.getRes(url);
            if (!tex)
                return ILaya.loader.load(url, Loader.IMAGE).then(tex => this._skinLoaded(tex));
            else {
                this._skinLoaded(tex);
                return Promise.resolve();
            }
        }
        else {
            this._skinLoaded(null);
            return Promise.resolve();
        }
    }

    /**
     * @internal
     * @en The skin resource is loaded.
     * @param tex The texture resource.
     * @zh 皮肤资源加载完成后的处理。
     * @param tex 纹理资源。
     */
    protected _skinLoaded(tex: any): void {
        if (this._destroyed)
            return;

        this._graphics.source = tex;
        if (tex)
            this.callLater(this.changeClips);
        this._setStateChanged();
        this._sizeChanged();
        this.event(Event.LOADED);
    }


    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        if (this._autoSize) {
            this._graphics.width = value;
            this._text && (this._text.width = value);
        }
    }

    /**
     * @internal
     * @inheritDoc 
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        if (this._autoSize) {
            this._graphics.height = value;
            this._text && (this._text.height = value);
        }
    }

    /**
     * @internal
     * @en The resource slices of the object have changed.
     * @zh 对象的资源切片发生改变。
     */
    protected changeClips(): void {
        let width: number = 0, height: number = 0;

        let img: Texture = Loader.getRes(this._skin);
        if (!img) {
            console.log(`lose skin ${this._skin}`);
            return;
        }

        width = img.sourceWidth;
        height = img.sourceHeight / (img._stateNum || this._stateNum);

        if (this._autoSize) {
            this._graphics.width = this._isWidthSet ? this._width : width;
            this._graphics.height = this._isHeightSet ? this._height : height;
            if (this._text) {
                this._text.width = this._graphics.width;
                this._text.height = this._graphics.height;
            }
        } else {
            if (this._text) {
                this._text.x = width;
                this._text.height = height;
            }
        }
    }

    /**
     * @internal
     * @en Change the state of the object.
     * @zh 改变对象的状态。
     */
    protected changeState(): void {
        this._stateChanged = false;
        if (this._skin)
            this.runCallLater(this.changeClips);
        let index = Math.max(this._state, 0);
        this._graphics.setState(index, this._stateNum);
        if (this.label) {
            this._text.color = this._labelColors[index];
            if (this._strokeColors) this._text.strokeColor = this._strokeColors[index];
        }
    }

    /**@internal */
    protected _setStateChanged(): void {
        if (!this._stateChanged) {
            this._stateChanged = true;
            this.callLater(this.changeState);
        }
    }

    /**
     * @inheritDoc 
     * @override
     * @en Sets the data source.
     * @zh 设置数据源。
     */
    set_dataSource(value: any) {
        if (typeof (value) == 'number' || typeof (value) == 'string') {
            this._dataSource = value;
            this.label = value + "";
        }
        else
            super.set_dataSource(value);
    }

}

const stateMap: any = { "mouseup": 0, "mouseover": 1, "mousedown": 2, "mouseout": 0 };