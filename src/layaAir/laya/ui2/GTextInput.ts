import { GWidget } from "./GWidget";
import { Input } from "../display/Input";
import { HideFlags } from "../Const";
import { TransformKind } from "../display/SpriteConst";
import { Event } from "../events/Event";
import { UIEvent } from "./UIEvent";

export class GTextInput extends GWidget {
    readonly textIns: Input;

    constructor() {
        super();

        this.textIns = new Input();
        this.textIns.hideFlags |= HideFlags.HideAndDontSave;
        this.textIns.overflow = "hidden";
        this.textIns.wordWrap = true;
        this.textIns.padding.fill(2);
        this.textIns.on(Event.KEY_DOWN, this, this._onKeyDown);
        this.addChild(this.textIns);
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
     * @en Whether it is a text area.
     * True means it is a text area, otherwise it is not.
     * @zh 是否是文本域。
     * 值为true表示当前是文本域，否则不是文本域。
     */
    get multiline(): boolean {
        return this.textIns.multiline;
    }

    set multiline(value: boolean) {
        this.textIns.multiline = value;
    }

    /**
     * @en whether it is editable.
     * @zh 是否可编辑。
     */
    get editable(): boolean {
        return this.textIns.editable;
    }

    set editable(value: boolean) {
        this.textIns.editable = value;
    }

    /**
     * @en The pattern that restricts the input.
     * @zh 限制输入的字符。
     */
    get restrict(): string {
        return this.textIns.restrict;
    }

    set restrict(pattern: string) {
        this.textIns.restrict = pattern;
    }

    /**
     * @en The prompt text of the input.
     * @zh 输入框的提示文本。
     */
    get prompt(): string {
        return this.textIns.prompt;
    }

    set prompt(value: string) {
        this.textIns.prompt = value;
    }

    /**
     * @en The prompt color of the input.
     * @zh 输入框的提示文字颜色。
     */
    get promptColor(): string {
        return this.textIns.promptColor;
    }

    set promptColor(value: string) {
        this.textIns.promptColor = value;
    }

    /**
     * @en The maximum number of characters allowed in the input.
     * @zh 输入框允许的最大字符数。
     */
    get maxChars(): number {
        return this.textIns.maxChars;
    }

    set maxChars(value: number) {
        this.textIns.maxChars = value;
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
        return this.textIns.type;
    }

    set type(value: string) {
        this.textIns.type = value;
    }

    /**
     * @en Activates the input box.
     * @zh 激活输入框。
     */
    focus() {
        this.textIns.focus = true;
    }

    /**
     * @en Deactivates the input box.
     * @zh 取消激活输入框。
     */
    blur() {
        this.textIns.focus = false;
    }

    protected _transChanged(kind: TransformKind): void {
        super._transChanged(kind);
        if ((kind & TransformKind.Size) != 0) {
            this.textIns.size(this.width, this.height);
        }
    }

    private _onKeyDown(evt: Event): void {
        if (!this.multiline && evt.key == "Enter") {
            this.event(UIEvent.Submit);
            evt.preventDefault();
        }
    }
}
