import { Label } from "./Label";
import { Input } from "../display/Input"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { AutoBitmap } from "./AutoBitmap"
import { Styles } from "./Styles"
import { UIUtils } from "./UIUtils"
import { ILaya } from "../../ILaya";
import { HideFlags } from "../Const";
import { URL } from "../net/URL";
/**
 * @en The TextInput class is used to create an input text display object.
 * - Event.INPUT event: When the input text after dispatching.
 * - Event.ENTER event: When the input box presses enter key after dispatching.
 * - Event.FOCUS event: When the input box gets focus.
 * - Event.BLUR event: When the input box loses focus.
 * @zh TextInput类用于创建输入文本显示对象。
 * - Event.INPUT事件：当输入文本后调度。
 * - Event.ENTER事件：当输入框内敲回车键后调度。
 * - Event.FOCUS事件：当输入框获得焦点时调度。
 * - Event.BLUR事件：当输入框失去焦点时调度。
 */
export class TextInput extends Label {
    protected _skin: string;
    /** @internal */
    declare _graphics: AutoBitmap;
    /** @internal */
    declare _tf: Input;

    /**
     * @en The URL of the skin for the TextInput UIComponent.
     * @zh TextInput组件的皮肤地址。
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (value == "")
            value = null;
        if (this._skin == value)
            return;

        this._setSkin(value);
    }

    /**
      * @en The size grid of the texture.
      * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
      * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
      * The values are separated by commas. For example: "6,6,6,6,1".
      * @zh 纹理的九宫格数据。
      * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
      * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
      * 值以逗号分隔。例如："6,6,6,6,1"。
      */
    get sizeGrid(): string {
        return this._graphics && this._graphics.sizeGrid ? this._graphics.sizeGrid.join(",") : null;
    }

    set sizeGrid(value: string) {
        if (value)
            this._graphics.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
        else
            this._graphics.sizeGrid = null;
    }

    /**
     * @en Whether it is a text area.
     * True means it is a text area, otherwise it is not.
     * @zh 是否是文本域。
     * 值为true表示当前是文本域，否则不是文本域。
     */
    get multiline(): boolean {
        return this._tf.multiline;
    }

    set multiline(value: boolean) {
        this._tf.multiline = value;
    }

    /**
     * @en whether it is editable.
     * @zh 是否可编辑。
     */
    get editable(): boolean {
        return this._tf.editable;
    }

    set editable(value: boolean) {
        this._tf.editable = value;
    }

    /**
     * @en The pattern that restricts the input.
     * @zh 限制输入的字符。
     */
    get restrict(): string {
        return this._tf.restrict;
    }

    set restrict(pattern: string) {
        this._tf.restrict = pattern;
    }

    /**
     * @en The prompt text of the input.
     * @zh 输入框的提示文本。
     */
    get prompt(): string {
        return this._tf.prompt;
    }

    set prompt(value: string) {
        this._tf.prompt = value;
    }

    /**
     * @en The prompt color of the input.
     * @zh 输入框的提示文字颜色。
     */
    get promptColor(): string {
        return this._tf.promptColor;
    }

    set promptColor(value: string) {
        this._tf.promptColor = value;
    }

    /**
     * @en The maximum number of characters allowed in the input.
     * @zh 输入框允许的最大字符数。
     */
    get maxChars(): number {
        return this._tf.maxChars;
    }

    set maxChars(value: number) {
        this._tf.maxChars = value;
    }

    /**
     * @en The focus state of the input.
     * @zh 输入框的焦点状态。
     */
    get focus(): boolean {
        return this._tf.focus;
    }

    set focus(value: boolean) {
        this._tf.focus = value;
    }

    /**
     * @en The type of the input box. Refer to the HTML5 input tag for types.
     * Common types include:
     * - text
     * - password
     * - email
     * - number
     * - date
     * - time
     * @zh 输入框的类型。可参照HTML5的input标签。
     * 常用标签例如：
     * - text
     * - password
     * - email
     * - number
     * - date
     * - time
     */

    get type(): string {
        return this._tf.type;
    }

    set type(value: string) {
        this._tf.type = value;
    }

    /**
     * @en Constructor method
     * @param text Text content.
     * @zh 构造方法
     * @param text 文本内容。
     */
    constructor(text?: string) {
        super();
        if (text != null)
            this.text = text;
        this.skin = this.skin;
    }

    /** @internal */
    _setSkin(url: string): Promise<void> {
        this._skin = url;
        if (url) {
            if (this._skinBaseUrl)
                url = URL.formatURL(url, this._skinBaseUrl);
            let source = Loader.getRes(url);
            if (source) {
                this._skinLoaded(source);
                return Promise.resolve();
            }
            else
                return ILaya.loader.load(url, Loader.IMAGE).then(tex => this._skinLoaded(tex));
        }
        else {
            this._skinLoaded(null);
            return Promise.resolve();
        }
    }
    protected _skinLoaded(source: any): void {
        if (this._destroyed)
            return;

        this._graphics.source = source;
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * @internal
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this._graphics && (this._graphics.width = value);
    }

    /**
     * @internal
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._graphics && (this._graphics.height = value);
    }

    protected preinitialize(): void {
        this.mouseEnabled = true;
    }

    protected createChildren(): void {
        this.setGraphics(new AutoBitmap(), true);

        this._tf = new Input();
        this._tf.hideFlags = HideFlags.HideAndDontSave;
        this._tf.padding = Styles.inputLabelPadding;
        this._tf._onPostLayout = () => this._onPostLayout();
        this._tf.on(Event.INPUT, () => this.event(Event.INPUT));
        this._tf.on(Event.ENTER, () => this.event(Event.ENTER));
        this._tf.on(Event.BLUR, () => this.event(Event.BLUR));
        this._tf.on(Event.FOCUS, () => this.event(Event.FOCUS));
        this.addChild(this._tf);
    }

    protected initialize(): void {
        this.width = 128;
        this.height = 22;
    }

    /**
     * @en Select the text in the input box
     * @zh 选中输入框内的文本。
     */
    select(): void {
        this._tf.select();
    }

    /**
     * @en Sets the start and end index of the selected text within the input field. 
     * @param startIndex The index of the first selected character.
     * @param endIndex The index of the character following the last selected character.
     * @zh 在输入字段内设置选中文本的起始和结束索引。
     * @param startIndex 选中文本的光标起始位置。
     * @param endIndex 选中文本的光标结束位置。
     */
    setSelection(startIndex: number, endIndex: number): void {
        this._tf.setSelection(startIndex, endIndex);
    }
}