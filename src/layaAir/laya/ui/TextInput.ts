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
    protected _skin: string;

    declare _graphics: AutoBitmap;
    declare _tf: Input;

    /**
     * 创建一个新的 <code>TextInput</code> 类实例。
     * @param text 文本内容。
     */
    constructor(text?: string) {
        super();
        if (text != null)
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

    /**
     * @inheritDoc 
     * @override
    */
    protected initialize(): void {
        this.width = 128;
        this.height = 22;
    }

    /**
     * @see laya.ui.Image#skin
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
     * <p>当前实例的背景图（ <code>AutoBitmap</code> ）实例的有效缩放网格数据。</p>
     * <p>数据格式："上边距,右边距,下边距,左边距,是否重复填充(值为0：不重复填充，1：重复填充)"，以逗号分隔。
     * <ul><li>例如："4,4,4,4,1"</li></ul></p>
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
     * @inheritDoc 
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        this._graphics && (this._graphics.width = value);
    }

    /**
     * @inheritDoc 
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._graphics && (this._graphics.height = value);
    }

    /**
     * <p>指示当前是否是文本域。</p>
     * 值为true表示当前是文本域，否则不是文本域。
     */
    get multiline(): boolean {
        return this._tf.multiline;
    }

    set multiline(value: boolean) {
        this._tf.multiline = value;
    }

    /**
     * 设置可编辑状态。
     */
    set editable(value: boolean) {
        this._tf.editable = value;
    }

    get editable(): boolean {
        return this._tf.editable;
    }

    /**选中输入框内的文本。*/
    select(): void {
        this._tf.select();
    }

    /**限制输入的字符。*/
    get restrict(): string {
        return this._tf.restrict;
    }

    set restrict(pattern: string) {
        this._tf.restrict = pattern;
    }

    /**
     * @see laya.display.Input#prompt
     */
    get prompt(): string {
        return this._tf.prompt;
    }

    set prompt(value: string) {
        this._tf.prompt = value;
    }

    /**
     * @see laya.display.Input#promptColor
     */
    get promptColor(): string {
        return this._tf.promptColor;
    }

    set promptColor(value: string) {
        this._tf.promptColor = value;
    }

    /**
     * @see laya.display.Input#maxChars
     */
    get maxChars(): number {
        return this._tf.maxChars;
    }

    set maxChars(value: number) {
        this._tf.maxChars = value;
    }

    /**
     * @see laya.display.Input#focus
     */
    get focus(): boolean {
        return this._tf.focus;
    }

    set focus(value: boolean) {
        this._tf.focus = value;
    }

    /**
     * @see laya.display.Input#type
     */
    get type(): string {
        return this._tf.type;
    }

    set type(value: string) {
        this._tf.type = value;
    }

    setSelection(startIndex: number, endIndex: number): void {
        this._tf.setSelection(startIndex, endIndex);
    }
}