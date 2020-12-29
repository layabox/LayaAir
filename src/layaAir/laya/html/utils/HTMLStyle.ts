import { HTMLExtendStyle } from "./HTMLExtendStyle";
import { ILaya } from "../../../ILaya";
import { Pool } from "../../utils/Pool";
import { HTMLElement } from "../dom/HTMLElement";
import { URL } from "../../net/URL";
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * @private
 */
export class HTMLStyle {

    private static _CSSTOVALUE: any = { 'letter-spacing': 'letterSpacing', 'white-space': 'whiteSpace', 'line-height': 'lineHeight', 'font-family': 'family', 'vertical-align': 'valign', 'text-decoration': 'textDecoration', 'background-color': 'bgColor', 'border-color': 'borderColor' };
    private static _parseCSSRegExp: RegExp = new RegExp("([\.\#]\\w+)\\s*{([\\s\\S]*?)}", "g");
    /**
     * 需要继承的属性
     */
    private static _inheritProps: any[] = ["italic", "align", "valign", "leading", "letterSpacing", "stroke", "strokeColor", "bold", "fontWeight", "fontSize", "lineHeight", "wordWrap", "color"];

    /**水平居左对齐方式。 */
    static ALIGN_LEFT: string = "left";
    /**水平居中对齐方式。 */
    static ALIGN_CENTER: string = "center";
    /**水平居右对齐方式。 */
    static ALIGN_RIGHT: string = "right";
    /**垂直居中对齐方式。 */
    static VALIGN_TOP: string = "top";
    /**垂直居中对齐方式。 */
    static VALIGN_MIDDLE: string = "middle";
    /**垂直居底部对齐方式。 */
    static VALIGN_BOTTOM: string = "bottom";
    /** 样式表信息。*/
    static styleSheets: any = {};
    /**添加布局。 */
    static ADDLAYOUTED: number = 0x200;
    private static _PADDING: any[] = [0, 0, 0, 0];

    protected static _HEIGHT_SET: number = 0x2000;
    protected static _LINE_ELEMENT: number = 0x10000;
    protected static _NOWARP: number = 0x20000;
    protected static _WIDTHAUTO: number = 0x40000;

    protected static _BOLD: number = 0x400;
    protected static _ITALIC: number = 0x800;

    /**@private */
    protected static _CSS_BLOCK: number = 0x1;
    /**@private */
    protected static _DISPLAY_NONE: number = 0x2;
    /**@private */
    protected static _ABSOLUTE: number = 0x4;
    /**@private */
    protected static _WIDTH_SET: number = 0x8;

    protected static alignVDic: any = { "left": 0, "center": 0x10, "right": 0x20, "top": 0, "middle": 0x40, "bottom": 0x80 };
    protected static align_Value: any = { 0: "left", 0x10: "center", 0x20: "right" };
    protected static vAlign_Value: any = { 0: "top", 0x40: "middle", 0x80: "bottom" };
    protected static _ALIGN: number = 0x30;// 0x10 & 0x20;
    protected static _VALIGN: number = 0xc0;//0x40 & 0x80;

    /**@internal */
    _type: number;
    fontSize: number;
    family: string;
    color: string;
    ower: HTMLElement;
    private _extendStyle: HTMLExtendStyle;
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
    padding: any[] = HTMLStyle._PADDING;

    ///**
    //* <p>描边宽度（以像素为单位）。</p>
    //* 默认值0，表示不描边。
    //* @default 0
    //*/
    //public var stroke:Number;
    ///**
    //* <p>描边颜色，以字符串表示。</p>
    //* @default "#000000";
    //*/
    //public var strokeColor:String;
    ///**
    //* <p>垂直行间距（以像素为单位）</p>
    //*/
    //public var leading:Number;
    ///**行高。 */
    //public var lineHeight:Number;
    //protected var _letterSpacing:int;

    constructor() {
        this.reset();
    }

    //TODO:coverage
    private _getExtendStyle(): HTMLExtendStyle {
        if (this._extendStyle === HTMLExtendStyle.EMPTY) this._extendStyle = HTMLExtendStyle.create();
        return this._extendStyle;
    }

    get href(): string {
        return this._extendStyle.href;
    }

    set href(value: string) {
        if (value === this._extendStyle.href) return;
        this._getExtendStyle().href = value;
    }

    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    get stroke(): number {
        return this._extendStyle.stroke;
    }

    set stroke(value: number) {
        if (this._extendStyle.stroke === value) return;
        this._getExtendStyle().stroke = value;
    }

    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    get strokeColor(): string {
        return this._extendStyle.strokeColor;
    }

    set strokeColor(value: string) {
        if (this._extendStyle.strokeColor === value) return;
        this._getExtendStyle().strokeColor = value;
    }

    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    get leading(): number {
        return this._extendStyle.leading;
    }

    set leading(value: number) {
        if (this._extendStyle.leading === value) return;
        this._getExtendStyle().leading = value;
    }

    /**行高。 */
    get lineHeight(): number {
        return this._extendStyle.lineHeight;
    }

    set lineHeight(value: number) {
        if (this._extendStyle.lineHeight === value) return;
        this._getExtendStyle().lineHeight = value;
    }

    set align(v: string) {
        if (!(v in HTMLStyle.alignVDic)) return;
        this._type &= (~HTMLStyle._ALIGN);
        this._type |= HTMLStyle.alignVDic[v];
    }

    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    get align(): string {
        var v: number = this._type & HTMLStyle._ALIGN;
        return HTMLStyle.align_Value[v];
    }

    set valign(v: string) {
        if (!(v in HTMLStyle.alignVDic)) return;
        this._type &= (~HTMLStyle._VALIGN);
        this._type |= HTMLStyle.alignVDic[v];
    }

    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    get valign(): string {
        var v: number = this._type & HTMLStyle._VALIGN;
        return HTMLStyle.vAlign_Value[v];
    }

    /**
     * 字体样式字符串。
     */
    set font(value: string) {
        var strs: any[] = value.split(' ');
        for (var i: number = 0, n: number = strs.length; i < n; i++) {
            var str: string = strs[i];
            switch (str) {
                case 'italic':
                    this.italic = true;
                    continue;
                case 'bold':
                    this.bold = true;
                    continue;
            }
            if (str.indexOf('px') > 0) {
                this.fontSize = parseInt(str);
                this.family = strs[i + 1];
                i++;
                continue;
            }
        }
    }

    get font(): string {
        return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (ILaya.Text.fontFamilyMap[this.family] || this.family) : this.family);
    }

    /**
     * 是否显示为块级元素。
     */
    set block(value: boolean) {
        value ? (this._type |= HTMLStyle._CSS_BLOCK) : (this._type &= (~HTMLStyle._CSS_BLOCK));
    }

    /**表示元素是否显示为块级元素。*/
    get block(): boolean {
        return (this._type & HTMLStyle._CSS_BLOCK) != 0;
    }

    /**
     * 重置，方便下次复用
     */
    reset(): HTMLStyle {
        this.ower = null;
        this._type = 0;
        this.wordWrap = true;
        this.fontSize = ILaya.Text.defaultFontSize;
        this.family = ILaya.Text.defaultFont;
        this.color = "#000000";
        this.valign = HTMLStyle.VALIGN_TOP;

        this.padding = HTMLStyle._PADDING;
        this.bold = false;
        this.italic = false;
        this.align = HTMLStyle.ALIGN_LEFT;

        this.textDecoration = null;
        this.bgColor = null;
        this.borderColor = null;

        if (this._extendStyle) this._extendStyle.recover();
        this._extendStyle = HTMLExtendStyle.EMPTY;

        //stroke = 0;
        //strokeColor = "#000000";
        //leading = 0;
        //lineHeight = 0;
        //_letterSpacing = 0;

        return this;
    }

    /**
     * 回收
     */
    //TODO:coverage
    recover(): void {
        Pool.recover("HTMLStyle", this.reset());
    }

    /**
     * 从对象池中创建
     */
    static create(): HTMLStyle {
        return Pool.getItemByClass("HTMLStyle", HTMLStyle);
    }

    /**
     * 复制传入的 CSSStyle 属性值。
     * @param	src 待复制的 CSSStyle 对象。
     */
    inherit(src: HTMLStyle): void {
        var i: number, len: number;
        var props: any[];
        props = HTMLStyle._inheritProps;
        len = props.length;
        var key: string;
        for (i = 0; i < len; i++) {
            key = props[i];
            (this as any)[key] = (src as any)[key];
        }
    }

    /**
     * 表示是否换行。
     */
    get wordWrap(): boolean {
        return (this._type & HTMLStyle._NOWARP) === 0;
    }

    set wordWrap(value: boolean) {
        value ? (this._type &= ~HTMLStyle._NOWARP) : (this._type |= HTMLStyle._NOWARP);
    }

    /**是否为粗体*/
    get bold(): boolean {
        return (this._type & HTMLStyle._BOLD) != 0;
    }

    set bold(value: boolean) {
        value ? (this._type |= HTMLStyle._BOLD) : (this._type &= ~HTMLStyle._BOLD);
    }

    get fontWeight(): string {
        return (this._type & HTMLStyle._BOLD) ? "bold" : "none";
    }

    set fontWeight(value: string) {
        value == "bold" ? (this._type |= HTMLStyle._BOLD) : (this._type &= ~HTMLStyle._BOLD);
    }

    /**
     * 表示使用此文本格式的文本是否为斜体。
     * @default false
     */
    get italic(): boolean {
        return (this._type & HTMLStyle._ITALIC) != 0;
    }

    set italic(value: boolean) {
        value ? (this._type |= HTMLStyle._ITALIC) : (this._type &= ~HTMLStyle._ITALIC);
    }

    /**@internal */
    _widthAuto(): boolean {
        return (this._type & HTMLStyle._WIDTHAUTO) !== 0;// || (_type & _WIDTH_SET) === 0;
    }

    /**@inheritDoc	 */
    widthed(sprite: any): boolean {
        return (this._type & HTMLStyle._WIDTH_SET) != 0;
    }

    set whiteSpace(type: string) {
        type === "nowrap" && (this._type |= HTMLStyle._NOWARP);
        type === "none" && (this._type &= ~HTMLStyle._NOWARP);
    }

    /**
     * 设置如何处理元素内的空白。
     */
    get whiteSpace(): string {
        return (this._type & HTMLStyle._NOWARP) ? "nowrap" : "";
    }

    /**
     * @internal
     */
    //TODO:coverage
    _calculation(type: string, value: string): boolean {
        return false;
    }

    /**
     * 宽度。
     */
    set width(w: any) {
        this._type |= HTMLStyle._WIDTH_SET;
        if (typeof (w) == 'string') {
            var offset: number = w.indexOf('auto');
            if (offset >= 0) {
                this._type |= HTMLStyle._WIDTHAUTO;
                w = w.substr(0, offset);
            }
            if (this._calculation("width", w)) return;
            w = parseInt(w);
        }

        this.size(w, -1);
    }

    /**
     * 高度。
     */
    set height(h: any) {
        this._type |= HTMLStyle._HEIGHT_SET;
        if (typeof (h) == 'string') {
            if (this._calculation("height", h)) return;
            h = parseInt(h);
        }
        this.size(-1, h);
    }

    /**
     * 是否已设置高度。
     * @param	sprite 显示对象 Sprite。
     * @return 一个Boolean 表示是否已设置高度。
     */
    heighted(sprite: any): boolean {
        return (this._type & HTMLStyle._HEIGHT_SET) != 0;
    }

    /**
     * 设置宽高。
     * @param	w 宽度。
     * @param	h 高度。
     */
    size(w: number, h: number): void {
        var ower: HTMLElement = this.ower;
        var resize: boolean = false;
        if (w !== -1 && w != ower.width) {
            this._type |= HTMLStyle._WIDTH_SET;
            ower.width = w;
            resize = true;
        }
        if (h !== -1 && h != ower.height) {
            this._type |= HTMLStyle._HEIGHT_SET;
            ower.height = h;
            resize = true;
        }
        if (resize) {
            ower._layoutLater();
        }
    }

    /**
     * 是否是行元素。
     */
    getLineElement(): boolean {
        return (this._type & HTMLStyle._LINE_ELEMENT) != 0;
    }

    setLineElement(value: boolean): void {
        value ? (this._type |= HTMLStyle._LINE_ELEMENT) : (this._type &= (~HTMLStyle._LINE_ELEMENT));
    }

    /**@internal */
    //TODO:coverage
    _enableLayout(): boolean {
        return (this._type & HTMLStyle._DISPLAY_NONE) === 0 && (this._type & HTMLStyle._ABSOLUTE) === 0;
    }

    /**
     * 间距。
     */
    get letterSpacing(): number {
        return this._extendStyle.letterSpacing;
    }

    set letterSpacing(d: number) {
        (typeof (d) == 'string') && (d = parseInt(d + ""));
        if (d == this._extendStyle.letterSpacing) return;
        this._getExtendStyle().letterSpacing = d;
    }

    /**
     * 设置 CSS 样式字符串。
     * @param	text CSS样式字符串。
     */
    cssText(text: string): void {
        this.attrs(HTMLStyle.parseOneCSS(text, ';'));
    }

    /**
     * 根据传入的属性名、属性值列表，设置此对象的属性值。
     * @param	attrs 属性名与属性值列表。
     */
    attrs(attrs: any[]): void {
        if (attrs) {
            for (var i: number = 0, n: number = attrs.length; i < n; i++) {
                var attr: any[] = attrs[i];
                (this as any)[attr[0]] = attr[1];
            }
        }
    }

    set position(value: string) {
        value === "absolute" ? (this._type |= HTMLStyle._ABSOLUTE) : (this._type &= ~HTMLStyle._ABSOLUTE);
    }

    /**
     * 元素的定位类型。
     */
    get position(): string {
        return (this._type & HTMLStyle._ABSOLUTE) ? "absolute" : "";
    }

    /**@inheritDoc	 */
    get absolute(): boolean {
        return (this._type & HTMLStyle._ABSOLUTE) !== 0;
    }

    /**@inheritDoc	 */
    get paddingLeft(): number {
        return this.padding[3];
    }

    /**@inheritDoc	 */
    get paddingTop(): number {
        return this.padding[0];
    }

    /**
     * 通过传入的分割符，分割解析CSS样式字符串，返回样式列表。
     * @param	text CSS样式字符串。
     * @param	clipWord 分割符；
     * @return 样式列表。
     */
    static parseOneCSS(text: string, clipWord: string): any[] {
        var out: any[] = [];
        var attrs: any[] = text.split(clipWord);
        var valueArray: any[];

        for (var i: number = 0, n: number = attrs.length; i < n; i++) {
            var attr: string = attrs[i];
            var ofs: number = attr.indexOf(':');
            var name: string = attr.substr(0, ofs).replace(/^\s+|\s+$/g, '');

            // 最后一个元素是空元素。
            if (name.length === 0) continue;

            var value: string = attr.substr(ofs + 1).replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
            var one: any[] = [name, value];
            switch (name) {
                case 'italic':
                case 'bold':
                    one[1] = value == "true";
                    break;
                case "font-weight":
                    if (value == "bold") {
                        one[1] = true;
                        one[0] = "bold";
                    }
                    break;
                case 'line-height':
                    one[0] = 'lineHeight';
                    one[1] = parseInt(value);
                    break;
                case 'font-size':
                    one[0] = 'fontSize';
                    one[1] = parseInt(value);
                    break;
                case 'stroke':
                    one[0] = 'stroke';
                    one[1] = parseInt(value);
                    break;
                case 'padding':
                    valueArray = value.split(' ');
                    valueArray.length > 1 || (valueArray[1] = valueArray[2] = valueArray[3] = valueArray[0]);
                    one[1] = [parseInt(valueArray[0]), parseInt(valueArray[1]), parseInt(valueArray[2]), parseInt(valueArray[3])];
                    break;
                default:
                    (one[0] = HTMLStyle._CSSTOVALUE[name]) || (one[0] = name);
            }
            out.push(one);
        }

        return out;
    }

    /**
     * 解析 CSS 样式文本。
     * @param	text CSS 样式文本。
     * @param	uri URL对象。
     */
    //TODO:coverage
    static parseCSS(text: string, uri: URL): void {
        var one: any[];
        while ((one = HTMLStyle._parseCSSRegExp.exec(text)) != null) {
            HTMLStyle.styleSheets[one[1]] = HTMLStyle.parseOneCSS(one[2], ';');
        }
    }
}

ClassUtils.regClass("laya.html.utils.HTMLStyle", HTMLStyle);
ClassUtils.regClass("Laya.HTMLStyle", HTMLStyle);
