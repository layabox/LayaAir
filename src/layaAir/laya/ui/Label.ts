import { Styles } from "./Styles";
import { Text } from "../display/Text"
import { Event } from "../events/Event"
import { UIComponent } from "./UIComponent"
import { UIUtils } from "./UIUtils"
import { HideFlags } from "../Const";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";

export type LabelFitContent = "no" | "yes" | "height";

/**
 * @en Scheduling after text content changes.
 * @zh 文本内容发生改变后调度。
 * @eventType laya.events.Event
 */
/*[Event(name = "change", type = "laya.events.Event")]*/

/**
 * @en The Label class is used to create display objects to display text
 * @zh Label 类用于创建显示对象以显示文本。
 * @see laya.display.Text
 */
export class Label extends UIComponent {

    /**
     * @internal
     * @en Text instance.
     * @zh 文本 Text 实例。
     */
    protected _tf: Text;
    /**@internal */
    protected _fitContent: LabelFitContent;
    /** @internal */
    private _fitFlag: boolean;

    /**
     * @en Current text content string.
     * @zh 当前文本内容字符串。
     * @see laya.display.Text.text
     */
    get text(): string {
        return this._tf.text;
    }

    set text(value: string) {
        this._tf.text = value;
    }

    /**
     * @en Whether the text automatically wraps when it reaches the maximum width.
     * @zh 文本是否在达到最大宽度时自动换行。
     * 值为 true，则该文本字段自动换行；值为 false，则该文本字段不自动换行。
     * @copy laya.display.Text#wordWrap
     */
    get wordWrap(): boolean {
        return this._tf.wordWrap;
    }

    set wordWrap(value: boolean) {
        this._tf.wordWrap = value;
    }

    /**
     * @en Color of the text.
     * @zh 文本颜色。
     * @copy laya.display.Text#color
     */
    get color(): string {
        return this._tf.color;
    }

    set color(value: string) {
        this._tf.color = value;
    }

    /**
     * @en Font of the text.
     * @zh 文本字体。
     * @copy laya.display.Text#font
     */
    get font(): string {
        return this._tf.font;
    }

    set font(value: string) {
        this._tf.font = value;
    }

    /**
     * @en Horizontal alignment of the text within the label.
     * @zh 文本的水平对齐方式。
     * @copy laya.display.Text#align
     */
    get align(): string {
        return this._tf.align;
    }

    set align(value: string) {
        this._tf.align = value;
    }

    /**
     * @en Vertical alignment of the text within the label.
     * @zh 文本的垂直对齐方式。
     * @copy laya.display.Text#valign
     */
    get valign(): string {
        return this._tf.valign;
    }

    set valign(value: string) {
        this._tf.valign = value;
    }

    /**
     * @en The alignment of images and text when mixed. The optional values are top, middle, and bottom.
     * @zh 图文混排时图片和文字的对齐方式。可选值是top,middle,bottom
     * @copy laya.display.Text#alignItems
     */
    get alignItems(): string {
        return this._tf.alignItems;
    }

    set alignItems(value: string) {
        this._tf.alignItems = value;
    }

    /**
     * @en Whether the text is bold.
     * @zh 文本是否加粗。
     * @copy laya.display.Text#bold
     */
    get bold(): boolean {
        return this._tf.bold;
    }

    set bold(value: boolean) {
        this._tf.bold = value;
    }

    /**
     * @en Whether the text is italic.
     * @zh 文本是否斜体。
     * @copy laya.display.Text#italic
     */
    get italic(): boolean {
        return this._tf.italic;
    }

    set italic(value: boolean) {
        this._tf.italic = value;
    }

    /**
     * @en Space between lines of text.
     * @zh 文本行之间的间距（以像素为单位）
     * @copy laya.display.Text#leading
     */
    get leading(): number {
        return this._tf.leading;
    }

    set leading(value: number) {
        this._tf.leading = value;
    }

    /**
     * @en Font size of the text.
     * @zh 文本的字号大小。
     * @copy laya.display.Text#fontSize
     */
    get fontSize(): number {
        return this._tf.fontSize;
    }

    set fontSize(value: number) {
        this._tf.fontSize = value;
    }

    /**
     * @en The margins of the text label.
     * Format: "top,right,bottom,left".
     * @zh 文本标签的边距。
     * 格式："上边距,右边距,下边距,左边距"（以像素为单位）。
     */
    get padding(): string {
        return this._tf.padding.join(",");
    }

    set padding(value: string) {
        this._tf.padding = UIUtils.fillArray(Styles.labelPadding, value, Number);
    }

    /**
     * @en Background color of the label.
     * @zh 文本标签的背景颜色。
     * @copy laya.display.Text#bgColor
     */
    get bgColor(): string {
        return this._tf.bgColor
    }

    set bgColor(value: string) {
        this._tf.bgColor = value;
    }

    /**
     * @en Border color of the label.
     * @zh 文本标签的边框颜色。
     * @copy laya.display.Text#borderColor
     */
    get borderColor(): string {
        return this._tf.borderColor
    }

    set borderColor(value: string) {
        this._tf.borderColor = value;
    }

    /**
     * @en Stroke width of the text stroke.
     * @zh 文本描边的宽度（以像素为单位），默认值为0，表示不描边。
     * @copy laya.display.Text#stroke
     */
    get stroke(): number {
        return this._tf.stroke;
    }

    set stroke(value: number) {
        this._tf.stroke = value;
    }

    /**
     * @en Color of the text stroke.
     * @zh 文本描边的颜色。
     * @copy laya.display.Text#strokeColor
     */
    get strokeColor(): string {
        return this._tf.strokeColor;
    }

    set strokeColor(value: string) {
        this._tf.strokeColor = value;
    }

    /**
     * @en Supporting html syntax.
     * @zh 是否富文本，支持html语法
     */
    get html(): boolean {
        return this._tf.html;
    }

    set html(value: boolean) {
        this._tf.html = value;
    }

    /**
     * @en Whether to use UBB syntax to parse text.
     * @zh 是否使用UBB语法解析文本。
     */
    get ubb(): boolean {
        return this._tf.ubb;
    }

    set ubb(value: boolean) {
        this._tf.ubb = value;
    }

    /**
     * @en The maximum width of the text box. If the text content exceeds this width, it will wrap automatically. Set to 0 to disable this limit.
     * @zh 文本最大宽度，当文本达到最大宽度时，会自动换行，设置为0则此限制不生效。
     */
    get maxWidth(): number {
        return this._tf.maxWidth;
    }

    set maxWidth(value: number) {
        this._tf.maxWidth = value;
    }

    /**
     * @en Sets whether the text content adapts to the container size.
     * Possible values: "yes" (both text width and height adapt), "height" (only text height adapts), "no" (does not adapt).
     * If a boolean value is provided, true corresponds to "yes" and false corresponds to "no".
     * @zh 设置文本内容是否自适应容器大小
     * 可选值："yes"（文本宽度和高度自适应）、"height"（仅文本高度自适应）、"no"（不自适应）
     * 如果传入布尔值，则 true 对应 "yes"，false 对应 "no"
     */
    get fitContent(): LabelFitContent {
        return this._fitContent;
    }

    set fitContent(value: LabelFitContent) {
        if (typeof (value) === "boolean")
            value = value ? "yes" : "no";
        if (this._fitContent != value) {
            if ((value == "yes" || value == "height") && !SerializeUtil.isDeserializing && (LayaEnv.isPlaying || this._tf.textWidth > 0 && this._tf.textHeight > 0)) {
                if (value == "height")
                    this.height = this._tf.textHeight;
                else
                    this.size(this._tf.textWidth, this._tf.textHeight);
            }
            this._fitContent = value;
        }
    }

    /**
     * @en An instance of the basic text object.
     * @zh 基础文本对象（Text）的实例。
     */
    get textField(): Text {
        return this._tf;
    }

    /**
     * @en The overflow property of the text, determining how overflow text is handled.
     * Possible values: visible, hidden, scroll, shrink, ellipsis.
     * visible: The text is not constrained by the text width and height, and all text is visible.
     * hidden: Text beyond the width and height is cut off, providing the best performance.
     * scroll: The part of the text that exceeds the width and height is hidden, and can be scrolled to view.
     * shrink: The text automatically adjusts its size to fit within the width and height, always fully visible.
     * ellipsis: When the text exceeds the width and height, the last few characters are replaced with an ellipsis, indicating that there is more content.
     * @zh 文本的溢出属性，决定超出文本如何被处理。
     * 值为: 可见 visible、隐藏 hidden、滚动 scroll、自动收缩 shrink、显示省略号 ellipsis。
     * 作用：
     * 可见，表示文本不受文本宽高约束全部可见；
     * 隐藏，超过文本宽高就会被裁切掉，性能最好；
     * 滚动，表示超出宽高的部分被隐藏，可以通过划动控制显示在宽高内区域；
     * 自动收缩，表示文本会跟随宽高的大小而自动调整文本的大小，始终全部显示在文本宽高内；
     * 显示省略号，表示当文本超出宽高后，未尾的几位字符会替换为省略号，表示当前文本还有未显示的内容。
     * @copy laya.display.Text#overflow
     */

    get overflow(): string {
        return this._tf.overflow;
    }

    set overflow(value: string) {
        this._tf.overflow = value;
    }

    /**
     * @en Text decoration style of the text, specifically whether it is underlined.
     * @zh 文本是否显示下划线。
     * @copy laya.display.Text#underline
     */
    get underline(): boolean {
        return this._tf.underline;
    }

    set underline(value: boolean) {
        this._tf.underline = value;
    }

    /**
     * @en Color of the text underline.
     * @zh 文本下划线的颜色。
     * @copy laya.display.Text#underlineColor
     */
    get underlineColor(): string {
        return this._tf.underlineColor;
    }

    set underlineColor(value: string) {
        this._tf.underlineColor = value;
    }

    /**
     * @en Whether the text ignores language localization.
     * @zh 文本是否忽略语言本地化。
     * @copy laya.display.Text#ignoreLang
     */
    get ignoreLang(): boolean {
        return this._tf.ignoreLang;
    }

    set ignoreLang(value: boolean) {
        this._tf.ignoreLang = value;
    }

    /**
     * @en Text template variables.
     * When set to true, templateVars is set to an empty object;
     * When set to false, templateVars is set to null;
     * When set to a value of type Record<string, any>, templateVars is set to the provided value.
     * @zh 文本模板变量对象
     * 为 true 时，将 templateVars 设置为空对象;
     * 为 false 时，将 templateVars 设置为 null;
     * 为 Record<string, any> 类型时，将 templateVars 设置为传入值（value）;
     */
    public get templateVars(): Record<string, any> {
        return this._tf.templateVars;
    }

    public set templateVars(value: Record<string, any> | boolean) {
        this._tf.templateVars = value;
    }

    /**
     * @en Sets a template variable in the text field, used for dynamic text replacement.
     * @param name The key name of the template variable to set.
     * @param value The value corresponding to the key name of the template variable.
     * @return This label instance.
     * @zh 设置模板变量对象对应的键名与值，用于动态文本替换。
     * @param name 要设置的模板变量对象的键名。
     * @param value 模板变量对象键名对应的值。
     * @return 当前标签实例。
     */
    public setVar(name: string, value: any): Label {
        this._tf.setVar(name, value);

        return this;
    }

    constructor(text?: string) {
        super();
        this._fitContent = "no";
        if (text != null)
            this.text = text;
    }

    /**@internal */
    protected _onPostLayout() {
        if ((this._fitContent == "yes" || this._fitContent == "height") && (LayaEnv.isPlaying || this._tf.textWidth > 0 && this._tf.textHeight > 0)) {
            this._fitFlag = true;
            if (this._fitContent == "height")
                this.height = this._tf.textHeight;
            else
                this.size(this._tf.textWidth, this._tf.textHeight);
            this._fitFlag = false;
        }
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    _setWidth(value: number): void {
        super._setWidth(value);
        this._tf.width = value;
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        this._tf.height = value;
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

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected measureWidth(): number {
        return this._tf.width;
    }

    /**
     * @internal
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

    /**
     * @en Sets the width of the label.
     * @param value The new width value.
     * @zh 设置文本标签的宽度。
     * @param value 新的宽度值。
     */
    set_width(value: number): void {
        if (this._fitContent == "yes" && !this._fitFlag)
            return;
        super.set_width(value);
    }

    /**
     * @inheritDoc
     * @override
     */
    get_height(): number {
        if (this._isHeightSet || this._tf.text) return super.get_height();
        return 0;
    }

    /**
     * @en Sets the height of the label.
     * @param value The new height value.
     * @zh 设置文本标签的高度。
     * @param value 新的高度值。
     */
    set_height(value: number): void {
        if ((this._fitContent == "yes" || this._fitContent == "height") && !this._fitFlag)
            return;
        super.set_height(value);
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


}