import { HTMLExtendStyle } from "././HTMLExtendStyle";
import { ILaya } from "../../../ILaya";
import { Pool } from "../../utils/Pool";
/**
 * @private
 */
export class HTMLStyle {
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
        /**
         * 边距信息。
         */
        this.padding = HTMLStyle._PADDING;
        this.reset();
    }
    //TODO:coverage
    _getExtendStyle() {
        if (this._extendStyle === HTMLExtendStyle.EMPTY)
            this._extendStyle = HTMLExtendStyle.create();
        return this._extendStyle;
    }
    get href() {
        return this._extendStyle.href;
    }
    set href(value) {
        if (value === this._extendStyle.href)
            return;
        this._getExtendStyle().href = value;
    }
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * 默认值0，表示不描边。
     * @default 0
     */
    get stroke() {
        return this._extendStyle.stroke;
    }
    set stroke(value) {
        if (this._extendStyle.stroke === value)
            return;
        this._getExtendStyle().stroke = value;
    }
    /**
     * <p>描边颜色，以字符串表示。</p>
     * @default "#000000";
     */
    get strokeColor() {
        return this._extendStyle.strokeColor;
    }
    set strokeColor(value) {
        if (this._extendStyle.strokeColor === value)
            return;
        this._getExtendStyle().strokeColor = value;
    }
    /**
     * <p>垂直行间距（以像素为单位）</p>
     */
    get leading() {
        return this._extendStyle.leading;
    }
    set leading(value) {
        if (this._extendStyle.leading === value)
            return;
        this._getExtendStyle().leading = value;
    }
    /**行高。 */
    get lineHeight() {
        return this._extendStyle.lineHeight;
    }
    set lineHeight(value) {
        if (this._extendStyle.lineHeight === value)
            return;
        this._getExtendStyle().lineHeight = value;
    }
    set align(v) {
        if (!(v in HTMLStyle.alignVDic))
            return;
        this._type &= (~HTMLStyle._ALIGN);
        this._type |= HTMLStyle.alignVDic[v];
    }
    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    get align() {
        var v = this._type & HTMLStyle._ALIGN;
        return HTMLStyle.align_Value[v];
    }
    set valign(v) {
        if (!(v in HTMLStyle.alignVDic))
            return;
        this._type &= (~HTMLStyle._VALIGN);
        this._type |= HTMLStyle.alignVDic[v];
    }
    /**
     * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
     * @default  "left"
     */
    get valign() {
        var v = this._type & HTMLStyle._VALIGN;
        return HTMLStyle.vAlign_Value[v];
    }
    /**
     * 字体样式字符串。
     */
    set font(value) {
        var strs = value.split(' ');
        for (var i = 0, n = strs.length; i < n; i++) {
            var str = strs[i];
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
    get font() {
        return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (ILaya.Text.fontFamilyMap[this.family] || this.family) : this.family);
    }
    /**
     * 是否显示为块级元素。
     */
    set block(value) {
        value ? (this._type |= HTMLStyle._CSS_BLOCK) : (this._type &= (~HTMLStyle._CSS_BLOCK));
    }
    /**表示元素是否显示为块级元素。*/
    get block() {
        return (this._type & HTMLStyle._CSS_BLOCK) != 0;
    }
    /**
     * 重置，方便下次复用
     */
    reset() {
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
        if (this._extendStyle)
            this._extendStyle.recover();
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
    recover() {
        Pool.recover("HTMLStyle", this.reset());
    }
    /**
     * 从对象池中创建
     */
    static create() {
        return Pool.getItemByClass("HTMLStyle", HTMLStyle);
    }
    /**
     * 复制传入的 CSSStyle 属性值。
     * @param	src 待复制的 CSSStyle 对象。
     */
    inherit(src) {
        var i, len;
        var props;
        props = HTMLStyle._inheritProps;
        len = props.length;
        var key;
        for (i = 0; i < len; i++) {
            key = props[i];
            this[key] = src[key];
        }
    }
    /**
     * 表示是否换行。
     */
    get wordWrap() {
        return (this._type & HTMLStyle._NOWARP) === 0;
    }
    set wordWrap(value) {
        value ? (this._type &= ~HTMLStyle._NOWARP) : (this._type |= HTMLStyle._NOWARP);
    }
    /**是否为粗体*/
    get bold() {
        return (this._type & HTMLStyle._BOLD) != 0;
    }
    set bold(value) {
        value ? (this._type |= HTMLStyle._BOLD) : (this._type &= ~HTMLStyle._BOLD);
    }
    /**
     * 表示使用此文本格式的文本是否为斜体。
     * @default false
     */
    get italic() {
        return (this._type & HTMLStyle._ITALIC) != 0;
    }
    set italic(value) {
        value ? (this._type |= HTMLStyle._ITALIC) : (this._type &= ~HTMLStyle._ITALIC);
    }
    /**@private */
    _widthAuto() {
        return (this._type & HTMLStyle._WIDTHAUTO) !== 0; // || (_type & _WIDTH_SET) === 0;
    }
    /**@inheritDoc	 */
    widthed(sprite) {
        return (this._type & HTMLStyle._WIDTH_SET) != 0;
    }
    set whiteSpace(type) {
        type === "nowrap" && (this._type |= HTMLStyle._NOWARP);
        type === "none" && (this._type &= ~HTMLStyle._NOWARP);
    }
    /**
     * 设置如何处理元素内的空白。
     */
    get whiteSpace() {
        return (this._type & HTMLStyle._NOWARP) ? "nowrap" : "";
    }
    /**
     * @private
     */
    //TODO:coverage
    _calculation(type, value) {
        return false;
    }
    /**
     * 宽度。
     */
    set width(w) {
        this._type |= HTMLStyle._WIDTH_SET;
        if (typeof (w) == 'string') {
            var offset = w.indexOf('auto');
            if (offset >= 0) {
                this._type |= HTMLStyle._WIDTHAUTO;
                w = w.substr(0, offset);
            }
            if (this._calculation("width", w))
                return;
            w = parseInt(w);
        }
        this.size(w, -1);
    }
    /**
     * 高度。
     */
    set height(h) {
        this._type |= HTMLStyle._HEIGHT_SET;
        if (typeof (h) == 'string') {
            if (this._calculation("height", h))
                return;
            h = parseInt(h);
        }
        this.size(-1, h);
    }
    /**
     * 是否已设置高度。
     * @param	sprite 显示对象 Sprite。
     * @return 一个Boolean 表示是否已设置高度。
     */
    heighted(sprite) {
        return (this._type & HTMLStyle._HEIGHT_SET) != 0;
    }
    /**
     * 设置宽高。
     * @param	w 宽度。
     * @param	h 高度。
     */
    size(w, h) {
        var ower = this.ower;
        var resize = false;
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
    getLineElement() {
        return (this._type & HTMLStyle._LINE_ELEMENT) != 0;
    }
    setLineElement(value) {
        value ? (this._type |= HTMLStyle._LINE_ELEMENT) : (this._type &= (~HTMLStyle._LINE_ELEMENT));
    }
    /**@private */
    //TODO:coverage
    _enableLayout() {
        return (this._type & HTMLStyle._DISPLAY_NONE) === 0 && (this._type & HTMLStyle._ABSOLUTE) === 0;
    }
    /**
     * 间距。
     */
    get letterSpacing() {
        return this._extendStyle.letterSpacing;
    }
    set letterSpacing(d) {
        (typeof (d) == 'string') && (d = parseInt(d + ""));
        if (d == this._extendStyle.letterSpacing)
            return;
        this._getExtendStyle().letterSpacing = d;
    }
    /**
     * 设置 CSS 样式字符串。
     * @param	text CSS样式字符串。
     */
    cssText(text) {
        this.attrs(HTMLStyle.parseOneCSS(text, ';'));
    }
    /**
     * 根据传入的属性名、属性值列表，设置此对象的属性值。
     * @param	attrs 属性名与属性值列表。
     */
    attrs(attrs) {
        if (attrs) {
            for (var i = 0, n = attrs.length; i < n; i++) {
                var attr = attrs[i];
                this[attr[0]] = attr[1];
            }
        }
    }
    set position(value) {
        value === "absolute" ? (this._type |= HTMLStyle._ABSOLUTE) : (this._type &= ~HTMLStyle._ABSOLUTE);
    }
    /**
     * 元素的定位类型。
     */
    get position() {
        return (this._type & HTMLStyle._ABSOLUTE) ? "absolute" : "";
    }
    /**@inheritDoc	 */
    get absolute() {
        return (this._type & HTMLStyle._ABSOLUTE) !== 0;
    }
    /**@inheritDoc	 */
    get paddingLeft() {
        return this.padding[3];
    }
    /**@inheritDoc	 */
    get paddingTop() {
        return this.padding[0];
    }
    /**
     * 通过传入的分割符，分割解析CSS样式字符串，返回样式列表。
     * @param	text CSS样式字符串。
     * @param	clipWord 分割符；
     * @return 样式列表。
     */
    static parseOneCSS(text, clipWord) {
        var out = [];
        var attrs = text.split(clipWord);
        var valueArray;
        for (var i = 0, n = attrs.length; i < n; i++) {
            var attr = attrs[i];
            var ofs = attr.indexOf(':');
            var name = attr.substr(0, ofs).replace(/^\s+|\s+$/g, '');
            // 最后一个元素是空元素。
            if (name.length === 0)
                continue;
            var value = attr.substr(ofs + 1).replace(/^\s+|\s+$/g, ''); //去掉前后空格和\n\t
            var one = [name, value];
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
     * @internal 此处需要再详细点注释。
     */
    //TODO:coverage
    static parseCSS(text, uri) {
        var one;
        while ((one = HTMLStyle._parseCSSRegExp.exec(text)) != null) {
            HTMLStyle.styleSheets[one[1]] = HTMLStyle.parseOneCSS(one[2], ';');
        }
    }
}
HTMLStyle._CSSTOVALUE = { 'letter-spacing': 'letterSpacing', 'white-space': 'whiteSpace', 'line-height': 'lineHeight', 'font-family': 'family', 'vertical-align': 'valign', 'text-decoration': 'textDecoration', 'background-color': 'bgColor', 'border-color': 'borderColor' };
HTMLStyle._parseCSSRegExp = new RegExp("([\.\#]\\w+)\\s*{([\\s\\S]*?)}", "g");
/**
 * 需要继承的属性
 */
HTMLStyle._inheritProps = ["italic", "align", "valign", "leading", "stroke", "strokeColor", "bold", "fontSize", "lineHeight", "wordWrap", "color"];
/**水平居左对齐方式。 */
HTMLStyle.ALIGN_LEFT = "left";
/**水平居中对齐方式。 */
HTMLStyle.ALIGN_CENTER = "center";
/**水平居右对齐方式。 */
HTMLStyle.ALIGN_RIGHT = "right";
/**垂直居中对齐方式。 */
HTMLStyle.VALIGN_TOP = "top";
/**垂直居中对齐方式。 */
HTMLStyle.VALIGN_MIDDLE = "middle";
/**垂直居底部对齐方式。 */
HTMLStyle.VALIGN_BOTTOM = "bottom";
/** 样式表信息。*/
HTMLStyle.styleSheets = {};
/**添加布局。 */
HTMLStyle.ADDLAYOUTED = 0x200;
HTMLStyle._PADDING = [0, 0, 0, 0];
HTMLStyle._HEIGHT_SET = 0x2000;
HTMLStyle._LINE_ELEMENT = 0x10000;
HTMLStyle._NOWARP = 0x20000;
HTMLStyle._WIDTHAUTO = 0x40000;
HTMLStyle._BOLD = 0x400;
HTMLStyle._ITALIC = 0x800;
/**@private */
HTMLStyle._CSS_BLOCK = 0x1;
/**@private */
HTMLStyle._DISPLAY_NONE = 0x2;
/**@private */
HTMLStyle._ABSOLUTE = 0x4;
/**@private */
HTMLStyle._WIDTH_SET = 0x8;
HTMLStyle.alignVDic = { "left": 0, "center": 0x10, "right": 0x20, "top": 0, "middle": 0x40, "bottom": 0x80 };
HTMLStyle.align_Value = { 0: "left", 0x10: "center", 0x20: "right" };
HTMLStyle.vAlign_Value = { 0: "top", 0x40: "middle", 0x80: "bottom" };
HTMLStyle._ALIGN = 0x30; // 0x10 & 0x20;
HTMLStyle._VALIGN = 0xc0; //0x40 & 0x80;
