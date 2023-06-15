import { Styles } from "./Styles";
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { UIUtils } from "./UIUtils"
import { HideFlags } from "../Const";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";

/**
 * 文本内容发生改变后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * <p> <code>Label</code> 类用于创建显示对象以显示文本。</p>
 *
 * @example <caption>以下示例代码，创建了一个 <code>Label</code> 实例。</caption>
 * package
 *	{
 *		import laya.ui.Label;
 *		public class Label_Example
 *		{
 *			public function Label_Example()
 *			{
 *				Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *				Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *				onInit();
 *			}
 *			private function onInit():void
 *			{
 *				var label:Label = new Label();//创建一个 Label 类的实例对象 label 。
 *				label.font = "Arial";//设置 label 的字体。
 *				label.bold = true;//设置 label 显示为粗体。
 *				label.leading = 4;//设置 label 的行间距。
 *				label.wordWrap = true;//设置 label 自动换行。
 *				label.padding = "10,10,10,10";//设置 label 的边距。
 *				label.color = "#ff00ff";//设置 label 的颜色。
 *				label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
 *				label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
 *				label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
 *				label.width = 300;//设置 label 的宽度。
 *				label.height = 200;//设置 label 的高度。
 *				Laya.stage.addChild(label);//将 label 添加到显示列表。
 *				var passwordLabel:Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
 *				passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
 *				passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
 *				passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
 *				passwordLabel.width = 300;//设置 passwordLabel 的宽度。
 *				passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
 *				passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
 *				passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
 *				Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
 *			}
 *		}
 *	}
 * @example
 * Laya.init(640, 800);//设置游戏画布宽高
 * Laya.stage.bgColor = "#efefef";//设置画布的背景颜色
 * onInit();
 * function onInit(){
 *     var label = new laya.ui.Label();//创建一个 Label 类的实例对象 label 。
 *     label.font = "Arial";//设置 label 的字体。
 *     label.bold = true;//设置 label 显示为粗体。
 *     label.leading = 4;//设置 label 的行间距。
 *     label.wordWrap = true;//设置 label 自动换行。
 *     label.padding = "10,10,10,10";//设置 label 的边距。
 *     label.color = "#ff00ff";//设置 label 的颜色。
 *     label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
 *     label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
 *     label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
 *     label.width = 300;//设置 label 的宽度。
 *     label.height = 200;//设置 label 的高度。
 *     Laya.stage.addChild(label);//将 label 添加到显示列表。
 *     var passwordLabel = new laya.ui.Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
 *     passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
 *     passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
 *     passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
 *     passwordLabel.width = 300;//设置 passwordLabel 的宽度。
 *     passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
 *     passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
 *     passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
 *     Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
 * }
 * @example
 * import Label = laya.ui.Label;
 * class Label_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.onInit();
 *     }
 *     private onInit(): void {
 *         var label: Label = new Label();//创建一个 Label 类的实例对象 label 。
 *         label.font = "Arial";//设置 label 的字体。
 *         label.bold = true;//设置 label 显示为粗体。
 *         label.leading = 4;//设置 label 的行间距。
 *         label.wordWrap = true;//设置 label 自动换行。
 *         label.padding = "10,10,10,10";//设置 label 的边距。
 *         label.color = "#ff00ff";//设置 label 的颜色。
 *         label.text = "Hello everyone,我是一个可爱的文本！";//设置 label 的文本内容。
 *         label.x = 100;//设置 label 对象的属性 x 的值，用于控制 label 对象的显示位置。
 *         label.y = 100;//设置 label 对象的属性 y 的值，用于控制 label 对象的显示位置。
 *         label.width = 300;//设置 label 的宽度。
 *         label.height = 200;//设置 label 的高度。
 *         Laya.stage.addChild(label);//将 label 添加到显示列表。
 *         var passwordLabel: Label = new Label("请原谅我，我不想被人看到我心里话。");//创建一个 Label 类的实例对象 passwordLabel 。
 *         passwordLabel.asPassword = true;//设置 passwordLabel 的显示反式为密码显示。
 *         passwordLabel.x = 100;//设置 passwordLabel 对象的属性 x 的值，用于控制 passwordLabel 对象的显示位置。
 *         passwordLabel.y = 350;//设置 passwordLabel 对象的属性 y 的值，用于控制 passwordLabel 对象的显示位置。
 *         passwordLabel.width = 300;//设置 passwordLabel 的宽度。
 *         passwordLabel.color = "#000000";//设置 passwordLabel 的文本颜色。
 *         passwordLabel.bgColor = "#ccffff";//设置 passwordLabel 的背景颜色。
 *         passwordLabel.fontSize = 20;//设置 passwordLabel 的文本字体大小。
 *         Laya.stage.addChild(passwordLabel);//将 passwordLabel 添加到显示列表。
 *     }
 * }
 * @see laya.display.Text
 */
export class Label extends UIComponent {

    /**
     * @private
     * 文本 <code>Text</code> 实例。
     */
    protected _tf: Text;
    protected _fitContent: boolean;
    /** @internal */
    private _fitFlag: boolean;

    /**
     * 创建一个新的 <code>Label</code> 实例。
     * @param text 文本内容字符串。
     */
    constructor(text?: string) {
        super();
        if (text != null)
            this.text = text;
    }

    /**
     * @override
     * @inheritDoc 
    */
    protected createChildren(): void {
        this._tf = new Text();
        this._tf.hideFlags = HideFlags.HideAndDontSave;
        this._tf._parseEscapeChars = true;
        this._tf._onPostLayout = () => this._onPostLayout();
        this._tf.on(Event.CHANGE, () => {
            this.event(Event.CHANGE);
            if (!this._isWidthSet || !this._isHeightSet)
                this.onCompResize();
        });
        this.addChild(this._tf);
    }

    protected _onPostLayout() {
        if (this._fitContent && (LayaEnv.isPlaying || this._tf.textWidth > 0 && this._tf.textHeight > 0)) {
            this._fitFlag = true;
            if (this._tf.wordWrap)
                this.height = this._tf.textHeight;
            else
                this.size(this._tf.textWidth, this._tf.textHeight);
            this._fitFlag = false;
        }
    }

    /**
     * 当前文本内容字符串。
     * @see laya.display.Text.text
     */
    get text(): string {
        return this._tf.text;
    }

    set text(value: string) {
        this._tf.text = value;
    }

    /**
     * @copy laya.display.Text#wordWrap
     */
    get wordWrap(): boolean {
        return this._tf.wordWrap;
    }

    /**
     * @copy laya.display.Text#wordWrap
     */
    set wordWrap(value: boolean) {
        this._tf.wordWrap = value;
    }

    /**
     * @copy laya.display.Text#color
     */
    get color(): string {
        return this._tf.color;
    }

    set color(value: string) {
        this._tf.color = value;
    }

    /**
     * @copy laya.display.Text#font
     */
    get font(): string {
        return this._tf.font;
    }

    set font(value: string) {
        this._tf.font = value;
    }

    /**
     * @copy laya.display.Text#align
     */
    get align(): string {
        return this._tf.align;
    }

    set align(value: string) {
        this._tf.align = value;
    }

    /**
     * @copy laya.display.Text#valign
     */
    get valign(): string {
        return this._tf.valign;
    }

    set valign(value: string) {
        this._tf.valign = value;
    }

    /**
     * @copy laya.display.Text#bold
     */
    get bold(): boolean {
        return this._tf.bold;
    }

    set bold(value: boolean) {
        this._tf.bold = value;
    }

    /**
     * @copy laya.display.Text#italic
     */
    get italic(): boolean {
        return this._tf.italic;
    }

    set italic(value: boolean) {
        this._tf.italic = value;
    }

    /**
     * @copy laya.display.Text#leading
     */
    get leading(): number {
        return this._tf.leading;
    }

    set leading(value: number) {
        this._tf.leading = value;
    }

    /**
     * @copy laya.display.Text#fontSize
     */
    get fontSize(): number {
        return this._tf.fontSize;
    }

    set fontSize(value: number) {
        this._tf.fontSize = value;
    }

    /**
     * <p>边距信息</p>
     * <p>"上边距，右边距，下边距 , 左边距（边距以像素为单位）"</p>
     */
    get padding(): string {
        return this._tf.padding.join(",");
    }

    set padding(value: string) {
        this._tf.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }

    /**
     * @copy laya.display.Text#bgColor
     */
    get bgColor(): string {
        return this._tf.bgColor
    }

    set bgColor(value: string) {
        this._tf.bgColor = value;
    }

    /**
     * @copy laya.display.Text#borderColor
     */
    get borderColor(): string {
        return this._tf.borderColor
    }

    set borderColor(value: string) {
        this._tf.borderColor = value;
    }

    /**
     * @copy laya.display.Text#stroke
     */
    get stroke(): number {
        return this._tf.stroke;
    }

    set stroke(value: number) {
        this._tf.stroke = value;
    }

    /**
     * @copy laya.display.Text#strokeColor
     */
    get strokeColor(): string {
        return this._tf.strokeColor;
    }

    set strokeColor(value: string) {
        this._tf.strokeColor = value;
    }

    get html(): boolean {
        return this._tf.html;
    }

    /** 设置是否富文本，支持html语法 */
    set html(value: boolean) {
        this._tf.html = value;
    }

    get ubb(): boolean {
        return this._tf.ubb;
    }

    /** 设置是否使用UBB语法解析文本 */
    set ubb(value: boolean) {
        this._tf.ubb = value;
    }

    get maxWidth(): number {
        return this._tf.maxWidth;
    }

    /** 设置当文本达到最大允许的宽度时，自定换行，设置为0则此限制不生效。*/
    set maxWidth(value: number) {
        this._tf.maxWidth = value;
    }

    get fitContent(): boolean {
        return this._fitContent;
    }

    /** 设置文本框大小是否自动适应文本内容的大小。可取值为both或者height */
    set fitContent(value: boolean) {
        if (this._fitContent != value) {
            if (value && !SerializeUtil.isDeserializing && (LayaEnv.isPlaying || this._tf.textWidth > 0 && this._tf.textHeight > 0)) {
                if (this._tf.wordWrap)
                    this.height = this._tf.textHeight;
                else
                    this.size(this._tf.textWidth, this._tf.textHeight);
            }
            this._fitContent = value;
        }
    }

    /**
     * 文本控件实体 <code>Text</code> 实例。
     */
    get textField(): Text {
        return this._tf;
    }

    /**
     * @inheritDoc
     * @override
     */
    protected measureWidth(): number {
        return this._tf.width;
    }

    /**
     * @inheritDoc
     * @override
     */
    protected measureHeight(): number {
        return this._tf.height;
    }

    /**
     * @inheritDoc
     * @override
     */
    get_width(): number {
        if (this._isWidthSet || this._tf.text) return super.get_width();
        return 0;
    }

    set_width(value: number): void {
        if (this._fitContent && !this._fitFlag)
            return;
        super.set_width(value);
    }

    /**
     * @inheritDoc
     * @override
     */
    _setWidth(value: number): void {
        super._setWidth(value);
        this._tf.width = value;
    }

    /**
     * @inheritDoc
     * @override
     */
    get_height(): number {
        if (this._isHeightSet || this._tf.text) return super.get_height();
        return 0;
    }

    set_height(value: number): void {
        if (this._fitContent && !this._fitFlag)
            return;
        super.set_height(value);
    }

    /**
     * @inheritDoc
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._tf.height = value;
    }

    /**
     * @inheritDoc 
     * @override
     */
    set_dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string')
            this.text = value + "";
        else
            super.set_dataSource(value);
    }

    /**
     * @copy laya.display.Text#overflow
     */
    get overflow(): string {
        return this._tf.overflow;
    }

    /**
     * @copy laya.display.Text#overflow
     */
    set overflow(value: string) {
        this._tf.overflow = value;
    }

    /**
     * @copy laya.display.Text#underline
     */
    get underline(): boolean {
        return this._tf.underline;
    }

    /**
     * @copy laya.display.Text#underline
     */
    set underline(value: boolean) {
        this._tf.underline = value;
    }

    /**
     * @copy laya.display.Text#underlineColor
     */
    get underlineColor(): string {
        return this._tf.underlineColor;
    }

    /**
     * @copy laya.display.Text#underlineColor
     */
    set underlineColor(value: string) {
        this._tf.underlineColor = value;
    }

    /**
     * @copy laya.display.Text#ignoreLang
     */
    get ignoreLang(): boolean {
        return this._tf.ignoreLang;
    }

    /**
     * @copy laya.display.Text#ignoreLang
     */
    set ignoreLang(value: boolean) {
        this._tf.ignoreLang = value;
    }

    public get templateVars(): Record<string, any> {
        return this._tf.templateVars;
    }

    public set templateVars(value: Record<string, any> | boolean) {
        this._tf.templateVars = value;
    }

    public setVar(name: string, value: any): Label {
        this._tf.setVar(name, value);

        return this;
    }
}