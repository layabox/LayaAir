import { HTMLElement } from "../dom/HTMLElement";
/**
 * @private
 */
export declare class HTMLStyle {
    private static _CSSTOVALUE;
    private static _parseCSSRegExp;
    /**
     * 需要继承的属性
     */
    private static _inheritProps;
    /**水平居左对齐方式。 */
    static ALIGN_LEFT: string;
    /**水平居中对齐方式。 */
    static ALIGN_CENTER: string;
    /**水平居右对齐方式。 */
    static ALIGN_RIGHT: string;
    /**垂直居中对齐方式。 */
    static VALIGN_TOP: string;
    /**垂直居中对齐方式。 */
    static VALIGN_MIDDLE: string;
    /**垂直居底部对齐方式。 */
    static VALIGN_BOTTOM: string;
    /** 样式表信息。*/
    static styleSheets: any;
    /**添加布局。 */
    static ADDLAYOUTED: number;
    private static _PADDING;
    protected static _HEIGHT_SET: number;
    protected static _LINE_ELEMENT: number;
    protected static _NOWARP: number;
    protected static _WIDTHAUTO: number;
    protected static _BOLD: number;
    protected static _ITALIC: number;
    /**@private */
    protected static _CSS_BLOCK: number;
    /**@private */
    protected static _DISPLAY_NONE: number;
    /**@private */
    protected static _ABSOLUTE: number;
    /**@private */
    protected static _WIDTH_SET: number;
    protected static alignVDic: any;
    protected static align_Value: any;
    protected static vAlign_Value: any;
    protected static _ALIGN: number;
    protected static _VALIGN: number;
    fontSize: number;
    family: string;
    color: string;
    ower: HTMLElement;
    private _extendStyle;
    textDecoration: string;
    /**
     * 文本背景颜色，以字符串表示。
     */
    bgColor: string;
    /**
     * 文本边框背景颜色，以字符串表示。
     */
    borderColor: string;
    /**
     * 边距信息。
     */
    padding: any[];
    constructor();
    private _getExtendStyle;
    href: string;
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    stroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    strokeColor: string;
    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    leading: number;
    /**行高。 */
    lineHeight: number;
    /**
    * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
    * @default  "left"
    */
    align: string;
    /**
    * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
    * @default  "left"
    */
    valign: string;
    /**
     * 字体样式字符串。
     */
    font: string;
    /**
     * 是否显示为块级元素。
     */
    /**表示元素是否显示为块级元素。*/
    block: boolean;
    /**
     * 重置，方便下次复用
     */
    reset(): HTMLStyle;
    /**
     * 回收
     */
    recover(): void;
    /**
     * 从对象池中创建
     */
    static create(): HTMLStyle;
    /**
     * 复制传入的 CSSStyle 属性值。
     * @param	src 待复制的 CSSStyle 对象。
     */
    inherit(src: HTMLStyle): void;
    /**
     * 表示是否换行。
     */
    wordWrap: boolean;
    /**是否为粗体*/
    bold: boolean;
    /**
     * 表示使用此文本格式的文本是否为斜体。
     * @default false
     */
    italic: boolean;
    /**@inheritDoc	 */
    widthed(sprite: any): boolean;
    /**
    * 设置如何处理元素内的空白。
    */
    whiteSpace: string;
    /**
     * 宽度。
     */
    width: any;
    /**
     * 高度。
     */
    height: any;
    /**
     * 是否已设置高度。
     * @param	sprite 显示对象 Sprite。
     * @return 一个Boolean 表示是否已设置高度。
     */
    heighted(sprite: any): boolean;
    /**
     * 设置宽高。
     * @param	w 宽度。
     * @param	h 高度。
     */
    size(w: number, h: number): void;
    /**
     * 是否是行元素。
     */
    getLineElement(): boolean;
    setLineElement(value: boolean): void;
    /**
     * 间距。
     */
    letterSpacing: number;
    /**
     * 设置 CSS 样式字符串。
     * @param	text CSS样式字符串。
     */
    cssText(text: string): void;
    /**
     * 根据传入的属性名、属性值列表，设置此对象的属性值。
     * @param	attrs 属性名与属性值列表。
     */
    attrs(attrs: any[]): void;
    /**
    * 元素的定位类型。
    */
    position: string;
    /**@inheritDoc	 */
    readonly absolute: boolean;
    /**@inheritDoc	 */
    readonly paddingLeft: number;
    /**@inheritDoc	 */
    readonly paddingTop: number;
    /**
     * 通过传入的分割符，分割解析CSS样式字符串，返回样式列表。
     * @param	text CSS样式字符串。
     * @param	clipWord 分割符；
     * @return 样式列表。
     */
    static parseOneCSS(text: string, clipWord: string): any[];
}
