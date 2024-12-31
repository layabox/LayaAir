import { GWidget } from "./GWidget";
import { Text } from "../display/Text";
import { HideFlags } from "../Const";
import { TextFitContent } from "./Const";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";
import { TransformKind } from "../display/SpriteConst";

export class GTextField extends GWidget {
    readonly textIns: Text;

    private _fitContent: TextFitContent = 0;
    private _fitFlag: boolean;

    constructor() {
        super();

        this.textIns = new Text();
        this.textIns.hideFlags |= HideFlags.HideAndDontSave;
        this.textIns.padding.fill(2);
        this.textIns._onPostLayout = () => this._onPostLayout();
        this.addChild(this.textIns);
    }

    /**
     * @en The width of the text in pixels.
     * @zh 文本的宽度，以像素为单位。
     */
    get textWidth(): number {
        return this.textIns.textWidth;
    }

    /**
     * @en The height of the text in pixels.
     * @zh 文本的高度，以像素为单位。
     */
    get textHeight(): number {
        return this.textIns.textHeight;
    }

    /**
     * @en The current content string of the text.
     * @zh 当前文本的内容字符串。
     */
    get text(): string {
        return this.textIns.text;
    }

    set text(value: string) {
        this.textIns.text = value;
    }

    /**
     * @en The font name of the text, represented as a string.
     * The default value is "Arial", which can be set through Config.defaultFont.
     * If the runtime system cannot find the specified font, it will render the text with the system default font, which may cause display anomalies. (Usually, it displays normally on computers, but may display abnormally on some mobile devices due to the lack of the set font.)
     * @zh 文本的字体名称，以字符串形式表示。
     * 默认值为："Arial"，可以通过Config.defaultFont设置默认字体。
     * 如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。
     */
    get font(): string {
        return this.textIns.font;
    }

    set font(value: string) {
        this.textIns.font = value;
    }

    /**
     * @en Specifies the font size of the text in pixels.
     * The default is 20 pixels, which can be set through Config.defaultFontSize.
     * @zh 指定文本的字体大小（以像素为单位）。
     * 默认为20像素，可以通过 Config.defaultFontSize 设置默认大小。
     */
    get fontSize(): number {
        return this.textIns.fontSize;
    }

    set fontSize(value: number) {
        this.textIns.fontSize = value;
    }

    /**
     * @en Represents the color value of the text. The default color can be set through Text.defaultColor.
     * The default value is black.
     * @zh 表示文本的颜色值。可以通过 Text.defaultColor 设置默认颜色。
     * 默认值为黑色。
     */
    get color(): string {
        return this.textIns.color;
    }

    set color(value: string) {
        this.textIns.color = value;
    }

    /**
     * @en Specifies whether the text is bold.
     * The default value is false, which means bold is not used. If the value is true, the text is bold.
     * @zh 指定文本是否为粗体字。
     * 默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。
     */
    get bold(): boolean {
        return this.textIns.bold;
    }

    set bold(value: boolean) {
        this.textIns.bold = value;
    }

    /**
     * @en Indicates whether the text using this text format is italic.
     * The default value is false, which means italic is not used. If the value is true, the text is italic.
     * @zh 表示使用此文本格式的文本是否为斜体。
     * 默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。
     */
    get italic(): boolean {
        return this.textIns.italic;
    }

    set italic(value: boolean) {
        this.textIns.italic = value;
    }

    /**
     * @en Represents the horizontal alignment of the text.
     * Possible values:
     * - "left": Left-aligned.
     * - "center": Center-aligned.
     * - "right": Right-aligned.
     * @zh 表示文本的水平显示方式。
     * 取值：
     * - "left"： 居左对齐显示。
     * - "center"： 居中对齐显示。
     * - "right"： 居右对齐显示。
     */
    get align(): string {
        return this.textIns.align;
    }

    set align(value: string) {
        this.textIns.align = value;
    }

    /**
     * @en Represents the vertical alignment of the text.
     * Possible values:
     * - "top": Top-aligned.
     * - "middle": Middle-aligned.
     * - "bottom": Bottom-aligned.
     * @zh 表示文本的垂直显示方式。
     * 取值：
     * - "top"： 居顶部对齐显示。
     * - "middle"： 居中对齐显示。
     * - "bottom"： 居底部对齐显示。
     */
    get valign(): string {
        return this.textIns.valign;
    }

    set valign(value: string) {
        this.textIns.valign = value;
    }

    /**
     * @en Alignment of images and text in mixed content. Possible values are top, middle, bottom.
     * @zh 图文混排时图片和文字的对齐方式。可选值是 top, middle, bottom。
     */
    get alignItems(): string {
        return this.textIns.alignItems;
    }

    set alignItems(value: string) {
        this.textIns.alignItems = value;
    }

    /**
     * @en Indicates whether the text automatically wraps, default is false.
     * If true, the text will automatically wrap; otherwise, it will not.
     * @zh 表示文本是否自动换行，默认为 false。
     * 若值为 true，则自动换行；否则不自动换行。
     */
    get wordWrap(): boolean {
        return this.textIns.wordWrap;
    }

    set wordWrap(value: boolean) {
        this.textIns.wordWrap = value;
    }

    get fitContent(): TextFitContent {
        return this._fitContent;
    }

    set fitContent(value: TextFitContent) {
        if (this._fitContent != value) {
            if ((value == TextFitContent.Both || value == TextFitContent.Height) && !SerializeUtil.isDeserializing && (LayaEnv.isPlaying || this.textIns.textWidth > 0 && this.textIns.textHeight > 0)) {
                if (value == TextFitContent.Height)
                    this.height = this.textIns.textHeight;
                else
                    this.size(this.textIns.textWidth, this.textIns.textHeight);
            }
            this._fitContent = value;
        }
    }

    /**
     * @en Vertical line spacing in pixels.
     * @zh 垂直行间距（以像素为单位）。
     */
    get leading(): number {
        return this.textIns.leading;
    }

    set leading(value: number) {
        this.textIns.leading = value;
    }

    /**
     * @en Margin information.
     * Data format: [top margin, right margin, bottom margin, left margin] (margins in pixels).
     * @zh 边距信息。
     * 数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。
     */
    get padding(): number[] {
        return this.textIns.padding;
    }

    set padding(value: number[]) {
        this.textIns.padding = value;
    }

    /**
     * @en Stroke width in pixels.
     * The default value is 0, which means no stroke.
     * @zh 描边宽度（以像素为单位）。
     * 默认值0，表示不描边。
     */
    get stroke(): number {
        return this.textIns.stroke;
    }

    set stroke(value: number) {
        this.textIns.stroke = value;
    }

    /**
     * @en Stroke color, represented as a string.
     * The default value is "#000000" (black).
     * @zh 描边颜色，以字符串表示。
     * 默认值为 "#000000"（黑色）。
     */
    get strokeColor(): string {
        return this.textIns.strokeColor;
    }

    set strokeColor(value: string) {
        this.textIns.strokeColor = value;
    }

    /**
     * @en Specifies the behavior when text exceeds the text area.
     * Values: visible, hidden, scroll, shrink, ellipsis.
     * Effects:
     * - visible: All text is visible regardless of text width and height constraints.
     * - hidden: Text exceeding width and height will be clipped, best for performance.
     * - scroll: Parts exceeding width and height are hidden, can be controlled by scrolling.
     * - shrink: Text size automatically adjusts to fit within the width and height.
     * - ellipsis: When text exceeds width and height, last few characters are replaced with ellipsis.
     * @zh 指定文本超出文本域后的行为。
     * 值为：可见visible、隐藏hidden、滚动scroll、自动收缩shrink、显示省略号ellipsis。
     * 作用：
     * - 可见：文本不受文本宽高约束全部可见。
     * - 隐藏：超过文本宽高就会被裁切掉，性能最好。
     * - 滚动：超出宽高的部分被隐藏，可以通过划动控制显示在宽高内区域。
     * - 自动收缩：文本会跟随宽高的大小而自动调整文本的大小，始终全部显示在文本宽高内。
     * - 显示省略号：当文本超出宽高后，未尾的几位字符会替换为省略号，表示当前文本还有未显示的内容。
     */
    get overflow(): string {
        return this.textIns.overflow;
    }

    set overflow(value: string) {
        this.textIns.overflow = value;
    }

    /**
     * @en Whether to display underline.
     * @zh 是否显示下划线。
     */
    get underline(): boolean {
        return this.textIns.underline;
    }

    set underline(value: boolean) {
        this.textIns.underline = value;
    }

    /**
     * @en The color of the underline. If null, it uses the font color.
     * @zh 下划线的颜色。如果为null，则使用字体颜色。
     */
    get underlineColor(): string {
        return this.textIns.underlineColor;
    }

    set underlineColor(value: string) {
        this.textIns.underlineColor = value;
    }

    /**
     * @en Whether to display strikethrough.
     * @zh 是否显示删除线。
     */
    get strikethrough(): boolean {
        return this.textIns.strikethrough;
    }

    set strikethrough(value: boolean) {
        this.textIns.strikethrough = value;
    }

    /**
     * @en The color of the strikethrough. If null, it uses the font color.
     * @zh 删除线的颜色。如果为null，则使用字体颜色。
     */
    get strikethroughColor(): string {
        return this.textIns.strikethroughColor;
    }

    set strikethroughColor(value: string) {
        this.textIns.strikethroughColor = value;
    }

    /**
     * @en Whether rich text is enabled, supporting HTML syntax.
     * @zh 是否启用富文本，支持HTML语法。
     */
    get html(): boolean {
        return this.textIns.html;
    }

    set html(value: boolean) {
        this.textIns.html = value;
    }

    /**
     * @en Whether UBB syntax parsing is enabled for text.
     * @zh 是否启用UBB语法解析文本。
     */
    get ubb(): boolean {
        return this.textIns.ubb;
    }

    set ubb(value: boolean) {
        this.textIns.ubb = value;
    }

    /**
     * @en The maximum width allowed for text. When text reaches this width, it will automatically wrap. Set to 0 to disable this limit.
     * @zh 文本允许的最大宽度。当文本达到这个宽度时，将自动换行。设置为0则此限制不生效。
     */
    get maxWidth(): number {
        return this.textIns.maxWidth;
    }

    set maxWidth(value: number) {
        this.textIns.maxWidth = value;
    }

    /**
     * @en Text Template
     * @zh 文本模板
     */
    public get templateVars(): Record<string, any> {
        return this.textIns.templateVars;
    }

    public set templateVars(value: Record<string, any> | boolean) {
        this.textIns.templateVars = value;
    }

    /**
     * @en Set the value of a template variable.
     * @param name The name of the template variable.
     * @param value The value to set.
     * @returns The current Text instance.
     * @zh 设置模板值。
     * @param name 模板名 
     * @param value 值
     * @returns 当前 Text 实例。
     */
    public setVar(name: string, value: any): this {
        this.textIns.setVar(name, value);

        return this;
    }

    /**
     * @ignore
     */
    size(width: number, height: number): this {
        if (this._fitContent == TextFitContent.Both && !this._fitFlag) //锁定了width
            width = this._width;

        if ((this._fitContent == TextFitContent.Both || this._fitContent == TextFitContent.Height) && !this._fitFlag) //锁定了height
            height = this._height;

        return super.size(width, height);
    }

    /**
     * @ignore
     */
    protected _transChanged(kind: TransformKind) {
        super._transChanged(kind);

        if ((kind & TransformKind.Width) != 0)
            this.textIns.width = this._width;
        if ((kind & TransformKind.Height) != 0)
            this.textIns.height = this._height;
    }

    protected _onPostLayout() {
        if ((this._fitContent == TextFitContent.Both || this._fitContent == TextFitContent.Height) && (LayaEnv.isPlaying || this.textIns.textWidth > 0 && this.textIns.textHeight > 0)) {
            this._fitFlag = true;
            if (this._fitContent == TextFitContent.Height)
                this.height = this.textIns.textHeight;
            else
                this.size(this.textIns.textWidth, this.textIns.textHeight);
            this._fitFlag = false;
        }
    }
}