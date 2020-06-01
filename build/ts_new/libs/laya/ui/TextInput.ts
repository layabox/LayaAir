import { Label } from "./Label";
import { Input } from "../display/Input"
import { Event } from "../events/Event"
import { Loader } from "../net/Loader"
import { AutoBitmap } from "./AutoBitmap"
import { Styles } from "./Styles"
import { UIUtils } from "./UIUtils"
import { Handler } from "../utils/Handler"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

/**
 * 输入文本后调度。
 * @eventType Event.INPUT
 */
/*[Event(name = "input", type = "laya.events.Event")]*/
/**
 * 在输入框内敲回车键后调度。
 * @eventType Event.ENTER
 */
/*[Event(name = "enter", type = "laya.events.Event")]*/
/**
 * 当获得输入焦点后调度。
 * @eventType Event.FOCUS
 */
/*[Event(name = "focus", type = "laya.events.Event")]*/
/**
 * 当失去输入焦点后调度。
 * @eventType Event.BLUR
 */
/*[Event(name = "blur", type = "laya.events.Event")]*/

/**
 * <code>TextInput</code> 类用于创建显示对象以显示和输入文本。
 *
 * @example <caption>以下示例代码，创建了一个 <code>TextInput</code> 实例。</caption>
 * package
 *	{
 *		import laya.display.Stage;
 *		import laya.ui.TextInput;
 *		import laya.utils.Handler;
 *		public class TextInput_Example
 *		{
 *			public function TextInput_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				Laya.loader.load(["resource/ui/input.png"], Handler.create(this, onLoadComplete));//加载资源。
 *			}
 *			private function onLoadComplete():void
 *			{
 *				var textInput:TextInput = new TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
 *				textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
 *				textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
 *				textInput.color = "#008fff";//设置 textInput 的文本颜色。
 *				textInput.font = "Arial";//设置 textInput 的文本字体。
 *				textInput.bold = true;//设置 textInput 的文本显示为粗体。
 *				textInput.fontSize = 30;//设置 textInput 的字体大小。
 *				textInput.wordWrap = true;//设置 textInput 的文本自动换行。
 *				textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
 *				textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
 *				textInput.width = 300;//设置 textInput 的宽度。
 *				textInput.height = 200;//设置 textInput 的高度。
 *				Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * Laya.loader.load(["resource/ui/input.png"], laya.utils.Handler.create(this, onLoadComplete));//加载资源。
 * function onLoadComplete() {
 *     var textInput = new laya.ui.TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
 *     textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
 *     textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
 *     textInput.color = "#008fff";//设置 textInput 的文本颜色。
 *     textInput.font = "Arial";//设置 textInput 的文本字体。
 *     textInput.bold = true;//设置 textInput 的文本显示为粗体。
 *     textInput.fontSize = 30;//设置 textInput 的字体大小。
 *     textInput.wordWrap = true;//设置 textInput 的文本自动换行。
 *     textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
 *     textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
 *     textInput.width = 300;//设置 textInput 的宽度。
 *     textInput.height = 200;//设置 textInput 的高度。
 *     Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
 * }
 * @example
 * import Stage = laya.display.Stage;
 * import TextInput = laya.ui.TextInput;
 * import Handler = laya.utils.Handler;
 * class TextInput_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         Laya.loader.load(["resource/ui/input.png"], Handler.create(this, this.onLoadComplete));//加载资源。
 *     }
 *     private onLoadComplete(): void {
 *         var textInput: TextInput = new TextInput("这是一个TextInput实例。");//创建一个 TextInput 类的实例对象 textInput 。
 *         textInput.skin = "resource/ui/input.png";//设置 textInput 的皮肤。
 *         textInput.sizeGrid = "4,4,4,4";//设置 textInput 的网格信息。
 *         textInput.color = "#008fff";//设置 textInput 的文本颜色。
 *         textInput.font = "Arial";//设置 textInput 的文本字体。
 *         textInput.bold = true;//设置 textInput 的文本显示为粗体。
 *         textInput.fontSize = 30;//设置 textInput 的字体大小。
 *         textInput.wordWrap = true;//设置 textInput 的文本自动换行。
 *         textInput.x = 100;//设置 textInput 对象的属性 x 的值，用于控制 textInput 对象的显示位置。
 *         textInput.y = 100;//设置 textInput 对象的属性 y 的值，用于控制 textInput 对象的显示位置。
 *         textInput.width = 300;//设置 textInput 的宽度。
 *         textInput.height = 200;//设置 textInput 的高度。
 *         Laya.stage.addChild(textInput);//将 textInput 添加到显示列表。
 *     }
 * }
 */
export class TextInput extends Label {
    /** @private */
    protected _bg: AutoBitmap;
    /** @private */
    protected _skin: string;

    /**
     * 创建一个新的 <code>TextInput</code> 类实例。
     * @param text 文本内容。
     */
    constructor(text: string = "") {
        super();
        this.text = text;
        this.skin = this.skin;
    }

		/**
		 * @inheritDoc 
         * @override
		*/
		protected preinitialize(): void {
        this.mouseEnabled = true;
    }

		/**
		 * @inheritDoc 
		 * @override
		*/
		/*override*/  destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._bg && this._bg.destroy();
        this._bg = null;
    }

    /**
     * @inheritDoc
     * @override 
    */
    protected createChildren(): void {
        this.addChild(this._tf = new Input());
        this._tf.padding = Styles.inputLabelPadding;
        this._tf.on(Event.INPUT, this, this._onInput);
        this._tf.on(Event.ENTER, this, this._onEnter);
        this._tf.on(Event.BLUR, this, this._onBlur);
        this._tf.on(Event.FOCUS, this, this._onFocus);
    }

    /**
     * @private
     */
    private _onFocus(): void {
        this.event(Event.FOCUS, this);
    }

    /**
     * @private
     */
    private _onBlur(): void {
        this.event(Event.BLUR, this);
    }

    /**
     * @private
     */
    private _onInput(): void {
        this.event(Event.INPUT, this);
    }

    /**
     * @private
     */
    private _onEnter(): void {
        this.event(Event.ENTER, this);
    }

    /**
     * @inheritDoc 
     * @override
    */
    protected initialize(): void {
        this.width = 128;
        this.height = 22;
    }

    /**
     * 表示此对象包含的文本背景 <code>AutoBitmap</code> 组件实例。
     */
    get bg(): AutoBitmap {
        return this._bg;
    }

    set bg(value: AutoBitmap) {
        this.graphics = this._bg = value;
    }

    /**
     * @copy laya.ui.Image#skin
     */
    get skin(): string {
        return this._skin;
    }

    set skin(value: string) {
        if (this._skin != value) {
            this._skin = value;
            if (this._skin && !Loader.getRes(this._skin)) {
                ILaya.loader.load(this._skin, Handler.create(this, this._skinLoaded), null, Loader.IMAGE, 1);
            } else {
                this._skinLoaded();
            }
        }
    }

    protected _skinLoaded(): void {
        this._bg || (this.graphics = this._bg = new AutoBitmap());
        this._bg.source = Loader.getRes(this._skin);
        this._width && (this._bg.width = this._width);
        this._height && (this._bg.height = this._height);
        this._sizeChanged();
        this.event(Event.LOADED);
    }

    /**
     * <p>当前实例的背景图（ <code>AutoBitmap</code> ）实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
     * @see laya.ui.AutoBitmap.sizeGrid
     */
    get sizeGrid(): string {
        return this._bg && this._bg.sizeGrid ? this._bg.sizeGrid.join(",") : null;
    }

    set sizeGrid(value: string) {
        this._bg || (this.graphics = this._bg = new AutoBitmap());
        this._bg.sizeGrid = UIUtils.fillArray(Styles.defaultSizeGrid, value, Number);
    }

    /**
     * 当前文本内容字符串。
     * @see laya.display.Text.text
     * @override
     */
	set text(value: string) {
        if (this._tf.text != value) {
            value = value + "";
            this._tf.text = value;
            this.event(Event.CHANGE);
        }
    }
    /**
     * @override
     */
    get text() {
        return super.text;
    }

    /**
     * @inheritDoc 
     * @override
     */
	set width(value: number) {
        super.width = value;
        this._bg && (this._bg.width = value);
    }
    /**
     * @inheritDoc 
     * @override
     */
    get width() {
        return super.width;
    }

    /**
     * @inheritDoc 
     * @override
     */
	set height(value: number) {
        super.height = value;
        this._bg && (this._bg.height = value);
    }
    /**
     * @inheritDoc 
     * @override
     */
    get height() {
        return super.height;
    }

    /**
     * <p>指示当前是否是文本域。</p>
     * 值为true表示当前是文本域，否则不是文本域。
     */
    get multiline(): boolean {
        return ((<Input>this._tf)).multiline;
    }

    set multiline(value: boolean) {
        (<Input>this._tf).multiline = value;
    }

    /**
     * 设置可编辑状态。
     */
    set editable(value: boolean) {
        (<Input>this._tf).editable = value;
    }

    get editable(): boolean {
        return (<Input>this._tf).editable;
    }

    /**选中输入框内的文本。*/
    select(): void {
        ((<Input>this._tf)).select();
    }

    /**限制输入的字符。*/
    get restrict(): string {
        return (<Input>this._tf).restrict;
    }

    set restrict(pattern: string) {
        (<Input>this._tf).restrict = pattern;
    }

    /**
     * @copy laya.display.Input#prompt
     */
    get prompt(): string {
        return (<Input>this._tf).prompt;
    }

    set prompt(value: string) {
        (<Input>this._tf).prompt = value;
    }

    /**
     * @copy laya.display.Input#promptColor
     */
    get promptColor(): string {
        return (<Input>this._tf).promptColor;
    }

    set promptColor(value: string) {
        (<Input>this._tf).promptColor = value;
    }

    /**
     * @copy laya.display.Input#maxChars
     */
    get maxChars(): number {
        return (<Input>this._tf).maxChars;
    }

    set maxChars(value: number) {
        (<Input>this._tf).maxChars = value;
    }

    /**
     * @copy laya.display.Input#focus
     */
    get focus(): boolean {
        return (<Input>this._tf).focus;
    }

    set focus(value: boolean) {
        (<Input>this._tf).focus = value;
    }

    /**
     * @copy laya.display.Input#type
     */
    get type(): string {
        return (<Input>this._tf).type;
    }

    set type(value: string) {
        (<Input>this._tf).type = value;
    }

    setSelection(startIndex: number, endIndex: number): void {
        (<Input>this._tf).setSelection(startIndex, endIndex);
    }
}

ILaya.regClass(TextInput);
ClassUtils.regClass("laya.ui.TextInput", TextInput);
ClassUtils.regClass("Laya.TextInput", TextInput);