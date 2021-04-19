import { Styles } from "./Styles";
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { UIUtils } from "./UIUtils"
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

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

    /**
     * 创建一个新的 <code>Label</code> 实例。
     * @param text 文本内容字符串。
     */
    constructor(text: string = "") {
        super();
        this.text = text;
    }

    /**
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
		super.destroy(destroyChild);
		//@ts-ignore
        this._tf = null;
    }

    /**
     * @override
     * @inheritDoc 
    */
    protected createChildren(): void {
        this.addChild(this._tf = new Text());
    }

    /**
     * 当前文本内容字符串。
     * @see laya.display.Text.text
     */
    get text(): string {
        return this._tf.text;
    }

    set text(value: string) {
        if (this._tf.text != value) {
            if (value)
                value = UIUtils.adptString(value + "");
            this._tf.text = value;
            this.event(Event.CHANGE);
            if (!this._width || !this._height) this.onCompResize();
        }
    }

    /**@copy laya.display.Text#changeText()
     **/
    changeText(text: string): void {
        this._tf.changeText(text);
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
     * @see laya.display.Text.padding
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
		/*override*/ protected measureWidth(): number {
        return this._tf.width;
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/ protected measureHeight(): number {
        return this._tf.height;
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/  get width(): number {
        if (this._width || this._tf.text) return super.width;
        return 0;
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/  set width(value: number) {
        super.width = value;
        this._tf.width = value;
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/  get height(): number {
        if (this._height || this._tf.text) return super.height;
        return 0;
    }

		/**
		 * @inheritDoc
		 * @override
		 */
		/*override*/  set height(value: number) {
        super.height = value;
        this._tf.height = value;
    }

    /**
     * @inheritDoc 
     * @override
     */
    set dataSource(value: any) {
        this._dataSource = value;
        if (typeof (value) == 'number' || typeof (value) == 'string') this.text = value + "";
        else super.dataSource = value;
    }
    /**
     * @inheritDoc 
     * @override
     */
    get dataSource() {
        return super.dataSource;
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
}

ILaya.regClass(Label);
ClassUtils.regClass("laya.ui.Label", Label);
ClassUtils.regClass("Laya.Label", Label);