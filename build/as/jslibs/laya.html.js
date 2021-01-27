(function (exports, Laya) {
    'use strict';

    class HTMLExtendStyle {
        constructor() {
            this.reset();
        }
        reset() {
            this.stroke = 0;
            this.strokeColor = "#000000";
            this.leading = 0;
            this.lineHeight = 0;
            this.letterSpacing = 0;
            this.href = null;
            return this;
        }
        recover() {
            if (this == HTMLExtendStyle.EMPTY)
                return;
            Laya.Pool.recover("HTMLExtendStyle", this.reset());
        }
        static create() {
            return Laya.Pool.getItemByClass("HTMLExtendStyle", HTMLExtendStyle);
        }
    }
    HTMLExtendStyle.EMPTY = new HTMLExtendStyle();
    Laya.ClassUtils.regClass("laya.html.utils.HTMLExtendStyle", HTMLExtendStyle);
    Laya.ClassUtils.regClass("Laya.HTMLExtendStyle", HTMLExtendStyle);

    class HTMLStyle {
        constructor() {
            this.padding = HTMLStyle._PADDING;
            this.reset();
        }
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
        get stroke() {
            return this._extendStyle.stroke;
        }
        set stroke(value) {
            if (this._extendStyle.stroke === value)
                return;
            this._getExtendStyle().stroke = value;
        }
        get strokeColor() {
            return this._extendStyle.strokeColor;
        }
        set strokeColor(value) {
            if (this._extendStyle.strokeColor === value)
                return;
            this._getExtendStyle().strokeColor = value;
        }
        get leading() {
            return this._extendStyle.leading;
        }
        set leading(value) {
            if (this._extendStyle.leading === value)
                return;
            this._getExtendStyle().leading = value;
        }
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
        get valign() {
            var v = this._type & HTMLStyle._VALIGN;
            return HTMLStyle.vAlign_Value[v];
        }
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
            return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (Laya.ILaya.Browser.onIPhone ? (Laya.ILaya.Text.fontFamilyMap[this.family] || this.family) : this.family);
        }
        set block(value) {
            value ? (this._type |= HTMLStyle._CSS_BLOCK) : (this._type &= (~HTMLStyle._CSS_BLOCK));
        }
        get block() {
            return (this._type & HTMLStyle._CSS_BLOCK) != 0;
        }
        reset() {
            this.ower = null;
            this._type = 0;
            this.wordWrap = true;
            this.fontSize = Laya.ILaya.Text.defaultFontSize;
            this.family = Laya.ILaya.Text.defaultFont;
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
            return this;
        }
        recover() {
            Laya.Pool.recover("HTMLStyle", this.reset());
        }
        static create() {
            return Laya.Pool.getItemByClass("HTMLStyle", HTMLStyle);
        }
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
        get wordWrap() {
            return (this._type & HTMLStyle._NOWARP) === 0;
        }
        set wordWrap(value) {
            value ? (this._type &= ~HTMLStyle._NOWARP) : (this._type |= HTMLStyle._NOWARP);
        }
        get bold() {
            return (this._type & HTMLStyle._BOLD) != 0;
        }
        set bold(value) {
            value ? (this._type |= HTMLStyle._BOLD) : (this._type &= ~HTMLStyle._BOLD);
        }
        get fontWeight() {
            return (this._type & HTMLStyle._BOLD) ? "bold" : "none";
        }
        set fontWeight(value) {
            value == "bold" ? (this._type |= HTMLStyle._BOLD) : (this._type &= ~HTMLStyle._BOLD);
        }
        get italic() {
            return (this._type & HTMLStyle._ITALIC) != 0;
        }
        set italic(value) {
            value ? (this._type |= HTMLStyle._ITALIC) : (this._type &= ~HTMLStyle._ITALIC);
        }
        _widthAuto() {
            return (this._type & HTMLStyle._WIDTHAUTO) !== 0;
        }
        widthed(sprite) {
            return (this._type & HTMLStyle._WIDTH_SET) != 0;
        }
        set whiteSpace(type) {
            type === "nowrap" && (this._type |= HTMLStyle._NOWARP);
            type === "none" && (this._type &= ~HTMLStyle._NOWARP);
        }
        get whiteSpace() {
            return (this._type & HTMLStyle._NOWARP) ? "nowrap" : "";
        }
        _calculation(type, value) {
            return false;
        }
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
        set height(h) {
            this._type |= HTMLStyle._HEIGHT_SET;
            if (typeof (h) == 'string') {
                if (this._calculation("height", h))
                    return;
                h = parseInt(h);
            }
            this.size(-1, h);
        }
        heighted(sprite) {
            return (this._type & HTMLStyle._HEIGHT_SET) != 0;
        }
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
        getLineElement() {
            return (this._type & HTMLStyle._LINE_ELEMENT) != 0;
        }
        setLineElement(value) {
            value ? (this._type |= HTMLStyle._LINE_ELEMENT) : (this._type &= (~HTMLStyle._LINE_ELEMENT));
        }
        _enableLayout() {
            return (this._type & HTMLStyle._DISPLAY_NONE) === 0 && (this._type & HTMLStyle._ABSOLUTE) === 0;
        }
        get letterSpacing() {
            return this._extendStyle.letterSpacing;
        }
        set letterSpacing(d) {
            (typeof (d) == 'string') && (d = parseInt(d + ""));
            if (d == this._extendStyle.letterSpacing)
                return;
            this._getExtendStyle().letterSpacing = d;
        }
        cssText(text) {
            this.attrs(HTMLStyle.parseOneCSS(text, ';'));
        }
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
        get position() {
            return (this._type & HTMLStyle._ABSOLUTE) ? "absolute" : "";
        }
        get absolute() {
            return (this._type & HTMLStyle._ABSOLUTE) !== 0;
        }
        get paddingLeft() {
            return this.padding[3];
        }
        get paddingTop() {
            return this.padding[0];
        }
        static parseOneCSS(text, clipWord) {
            var out = [];
            var attrs = text.split(clipWord);
            var valueArray;
            for (var i = 0, n = attrs.length; i < n; i++) {
                var attr = attrs[i];
                var ofs = attr.indexOf(':');
                var name = attr.substr(0, ofs).replace(/^\s+|\s+$/g, '');
                if (name.length === 0)
                    continue;
                var value = attr.substr(ofs + 1).replace(/^\s+|\s+$/g, '');
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
        static parseCSS(text, uri) {
            var one;
            while ((one = HTMLStyle._parseCSSRegExp.exec(text)) != null) {
                HTMLStyle.styleSheets[one[1]] = HTMLStyle.parseOneCSS(one[2], ';');
            }
        }
    }
    HTMLStyle._CSSTOVALUE = { 'letter-spacing': 'letterSpacing', 'white-space': 'whiteSpace', 'line-height': 'lineHeight', 'font-family': 'family', 'vertical-align': 'valign', 'text-decoration': 'textDecoration', 'background-color': 'bgColor', 'border-color': 'borderColor' };
    HTMLStyle._parseCSSRegExp = new RegExp("([\.\#]\\w+)\\s*{([\\s\\S]*?)}", "g");
    HTMLStyle._inheritProps = ["italic", "align", "valign", "leading", "letterSpacing", "stroke", "strokeColor", "bold", "fontWeight", "fontSize", "lineHeight", "wordWrap", "color"];
    HTMLStyle.ALIGN_LEFT = "left";
    HTMLStyle.ALIGN_CENTER = "center";
    HTMLStyle.ALIGN_RIGHT = "right";
    HTMLStyle.VALIGN_TOP = "top";
    HTMLStyle.VALIGN_MIDDLE = "middle";
    HTMLStyle.VALIGN_BOTTOM = "bottom";
    HTMLStyle.styleSheets = {};
    HTMLStyle.ADDLAYOUTED = 0x200;
    HTMLStyle._PADDING = [0, 0, 0, 0];
    HTMLStyle._HEIGHT_SET = 0x2000;
    HTMLStyle._LINE_ELEMENT = 0x10000;
    HTMLStyle._NOWARP = 0x20000;
    HTMLStyle._WIDTHAUTO = 0x40000;
    HTMLStyle._BOLD = 0x400;
    HTMLStyle._ITALIC = 0x800;
    HTMLStyle._CSS_BLOCK = 0x1;
    HTMLStyle._DISPLAY_NONE = 0x2;
    HTMLStyle._ABSOLUTE = 0x4;
    HTMLStyle._WIDTH_SET = 0x8;
    HTMLStyle.alignVDic = { "left": 0, "center": 0x10, "right": 0x20, "top": 0, "middle": 0x40, "bottom": 0x80 };
    HTMLStyle.align_Value = { 0: "left", 0x10: "center", 0x20: "right" };
    HTMLStyle.vAlign_Value = { 0: "top", 0x40: "middle", 0x80: "bottom" };
    HTMLStyle._ALIGN = 0x30;
    HTMLStyle._VALIGN = 0xc0;
    Laya.ClassUtils.regClass("laya.html.utils.HTMLStyle", HTMLStyle);
    Laya.ClassUtils.regClass("Laya.HTMLStyle", HTMLStyle);

    class HTMLDocument {
        constructor() {
            this.all = {};
            this.styleSheets = HTMLStyle.styleSheets;
        }
        getElementById(id) {
            return this.all[id];
        }
        setElementById(id, e) {
            this.all[id] = e;
        }
    }
    HTMLDocument.document = new HTMLDocument();
    Laya.ClassUtils.regClass("laya.html.dom.HTMLDocument", HTMLDocument);
    Laya.ClassUtils.regClass("Laya.HTMLDocument", HTMLDocument);

    class HTMLHitRect {
        constructor() {
            this.rec = new Laya.Rectangle();
            this.reset();
        }
        reset() {
            this.rec.reset();
            this.href = null;
            return this;
        }
        recover() {
            Laya.Pool.recover("HTMLHitRect", this.reset());
        }
        static create() {
            return Laya.Pool.getItemByClass("HTMLHitRect", HTMLHitRect);
        }
    }
    Laya.ClassUtils.regClass("laya.html.dom.HTMLHitRect", HTMLHitRect);
    Laya.ClassUtils.regClass("Laya.HTMLHitRect", HTMLHitRect);

    class IHtml {
    }
    IHtml.HTMLDivElement = null;
    IHtml.HTMLImageElement = null;
    IHtml.HTMLBrElement = null;
    IHtml.HTMLDivParser = null;
    IHtml.HTMLParse = null;
    IHtml.HTMLElementType = null;

    class LayoutLine {
        constructor() {
            this.elements = [];
            this.x = 0;
            this.y = 0;
            this.w = 0;
            this.h = 0;
            this.wordStartIndex = 0;
            this.minTextHeight = 99999;
            this.mWidth = 0;
        }
        updatePos(left, width, lineNum, dy, align, valign, lineHeight) {
            var w = 0;
            var one;
            if (this.elements.length > 0) {
                one = this.elements[this.elements.length - 1];
                w = one.x + one.width - this.elements[0].x;
            }
            lineHeight = lineHeight || this.h;
            var dx = 0, ddy;
            if (align === HTMLStyle.ALIGN_CENTER)
                dx = (width - w) / 2;
            if (align === HTMLStyle.ALIGN_RIGHT)
                dx = (width - w);
            for (var i = 0, n = this.elements.length; i < n; i++) {
                one = this.elements[i];
                var tCSSStyle = one._getCSSStyle();
                dx !== 0 && (one.x += dx);
                switch (tCSSStyle.valign) {
                    case "top":
                        one.y = dy;
                        break;
                    case "middle":
                        var tMinTextHeight = 0;
                        if (this.minTextHeight != 99999)
                            tMinTextHeight = this.minTextHeight;
                        var tBottomLineY = (tMinTextHeight + lineHeight) / 2;
                        tBottomLineY = Math.max(tBottomLineY, this.h);
                        if (one.eletype == IHtml.HTMLElementType.IMAGE)
                            ddy = dy + tBottomLineY - one.height;
                        else
                            ddy = dy + tBottomLineY - one.height;
                        one.y = ddy;
                        break;
                    case "bottom":
                        one.y = dy + (lineHeight - one.height);
                        break;
                }
            }
        }
    }
    Laya.ClassUtils.regClass("laya.html.utils.LayoutLine", LayoutLine);
    Laya.ClassUtils.regClass("Laya.LayoutLine", LayoutLine);

    class Layout {
        static later(element) {
            if (Layout._will == null) {
                Layout._will = [];
                Laya.ILaya.stage.frameLoop(1, null, function () {
                    if (Layout._will.length < 1)
                        return;
                    for (var i = 0; i < Layout._will.length; i++) {
                        Layout.layout(Layout._will[i]);
                    }
                    Layout._will.length = 0;
                });
            }
            Layout._will.push(element);
        }
        static layout(element) {
            if (!element || !element._style)
                return null;
            var style = element._style;
            if ((style._type & HTMLStyle.ADDLAYOUTED) === 0)
                return null;
            element.style._type &= ~HTMLStyle.ADDLAYOUTED;
            var arr = Layout._multiLineLayout(element);
            return arr;
        }
        static _multiLineLayout(element) {
            var elements = [];
            element._addChildsToLayout(elements);
            var i, n = elements.length;
            var style = element._getCSSStyle();
            var letterSpacing = style.letterSpacing;
            var leading = style.leading;
            var lineHeight = style.lineHeight;
            var widthAuto = style._widthAuto() || !style.wordWrap;
            var width = widthAuto ? 999999 : element.width;
            var height = element.height;
            var maxWidth = 0;
            var exWidth = style.italic ? style.fontSize / 3 : 0;
            var align = style.align;
            var valign = style.valign;
            var endAdjust = valign !== HTMLStyle.VALIGN_TOP || align !== HTMLStyle.ALIGN_LEFT || lineHeight != 0;
            var oneLayout;
            var x = 0;
            var y = 0;
            var w = 0;
            var h = 0;
            var lines = [];
            var curStyle;
            var curPadding;
            var curLine = lines[0] = new LayoutLine();
            var newLine, nextNewline = false;
            var htmlWord;
            var sprite;
            curLine.h = 0;
            if (style.italic)
                width -= style.fontSize / 3;
            var tWordWidth = 0;
            var tLineFirstKey = true;
            function addLine() {
                curLine.y = y;
                y += curLine.h + leading;
                curLine.mWidth = tWordWidth;
                tWordWidth = 0;
                curLine = new LayoutLine();
                lines.push(curLine);
                curLine.h = 0;
                x = 0;
                tLineFirstKey = true;
                newLine = false;
            }
            for (i = 0; i < n; i++) {
                oneLayout = elements[i];
                if (oneLayout == null) {
                    if (!tLineFirstKey) {
                        x += Layout.DIV_ELEMENT_PADDING;
                    }
                    curLine.wordStartIndex = curLine.elements.length;
                    continue;
                }
                tLineFirstKey = false;
                if (oneLayout instanceof IHtml.HTMLBrElement) {
                    addLine();
                    curLine.y = y;
                    curLine.h = lineHeight;
                    continue;
                }
                else if (oneLayout._isChar()) {
                    htmlWord = oneLayout;
                    w = htmlWord.width + htmlWord.style.letterSpacing;
                    h = htmlWord.height;
                    if (!htmlWord.isWord) {
                        if (lines.length > 0 && (x + w) > width && curLine.wordStartIndex > 0) {
                            var tLineWord = 0;
                            tLineWord = curLine.elements.length - curLine.wordStartIndex + 1;
                            curLine.elements.length = curLine.wordStartIndex;
                            i -= tLineWord;
                            addLine();
                            continue;
                        }
                        newLine = false;
                        tWordWidth += htmlWord.width;
                    }
                    else {
                        newLine = nextNewline || (htmlWord.char === '\n');
                        curLine.wordStartIndex = curLine.elements.length;
                    }
                    nextNewline = false;
                    newLine = newLine || ((x + w) > width);
                    newLine && addLine();
                    curLine.minTextHeight = Math.min(curLine.minTextHeight, oneLayout.height);
                }
                else {
                    curStyle = oneLayout._getCSSStyle();
                    sprite = oneLayout;
                    curPadding = curStyle.padding;
                    newLine = nextNewline || curStyle.getLineElement();
                    w = sprite.width + curPadding[1] + curPadding[3] + curStyle.letterSpacing;
                    h = sprite.height + curPadding[0] + curPadding[2];
                    nextNewline = curStyle.getLineElement();
                    newLine = newLine || ((x + w) > width && curStyle.wordWrap);
                    newLine && addLine();
                }
                curLine.elements.push(oneLayout);
                curLine.h = Math.max(curLine.h, h);
                oneLayout.x = x;
                oneLayout.y = y;
                x += w;
                curLine.w = x - letterSpacing;
                curLine.y = y;
                maxWidth = Math.max(x + exWidth, maxWidth);
            }
            y = curLine.y + curLine.h;
            if (endAdjust) {
                var tY = 0;
                var tWidth = width;
                if (widthAuto && element.width > 0) {
                    tWidth = element.width;
                }
                for (i = 0, n = lines.length; i < n; i++) {
                    lines[i].updatePos(0, tWidth, i, tY, align, valign, lineHeight);
                    tY += Math.max(lineHeight, lines[i].h + leading);
                }
                y = tY;
            }
            widthAuto && (element.width = maxWidth);
            (y > element.height) && (element.height = y);
            return [maxWidth, y];
        }
    }
    Layout.DIV_ELEMENT_PADDING = 0;
    Laya.ClassUtils.regClass("laya.html.utils.Layout", Layout);
    Laya.ClassUtils.regClass("Laya.Layout", Layout);

    (function (HTMLElementType) {
        HTMLElementType[HTMLElementType["BASE"] = 0] = "BASE";
        HTMLElementType[HTMLElementType["IMAGE"] = 1] = "IMAGE";
    })(exports.HTMLElementType || (exports.HTMLElementType = {}));
    class HTMLElement {
        constructor() {
            this.eletype = exports.HTMLElementType.BASE;
            this._creates();
            this.reset();
        }
        static formatURL1(url, basePath = null) {
            if (!url)
                return "null path";
            if (!basePath)
                basePath = Laya.URL.basePath;
            if (url.indexOf(":") > 0)
                return url;
            if (Laya.URL.customFormat != null)
                url = Laya.URL.customFormat(url);
            if (url.indexOf(":") > 0)
                return url;
            var char1 = url.charAt(0);
            if (char1 === ".") {
                return Laya.URL._formatRelativePath(basePath + url);
            }
            else if (char1 === '~') {
                return Laya.URL.rootPath + url.substring(1);
            }
            else if (char1 === "d") {
                if (url.indexOf("data:image") === 0)
                    return url;
            }
            else if (char1 === "/") {
                return url;
            }
            return basePath + url;
        }
        _creates() {
            this._style = HTMLStyle.create();
        }
        reset() {
            this.URI = null;
            this.parent = null;
            this._style.reset();
            this._style.ower = this;
            this._style.valign = "middle";
            if (this._text && this._text.words) {
                var words = this._text.words;
                var i, len;
                len = words.length;
                var tChar;
                for (i = 0; i < len; i++) {
                    tChar = words[i];
                    if (tChar)
                        tChar.recover();
                }
            }
            this._text = HTMLElement._EMPTYTEXT;
            if (this._children)
                this._children.length = 0;
            this._x = this._y = this._width = this._height = 0;
            return this;
        }
        _getCSSStyle() {
            return this._style;
        }
        _addChildsToLayout(out) {
            var words = this._getWords();
            if (words == null && (!this._children || this._children.length == 0))
                return false;
            if (words) {
                for (var i = 0, n = words.length; i < n; i++) {
                    out.push(words[i]);
                }
            }
            if (this._children)
                this._children.forEach(function (o, index, array) {
                    var _style = o._style;
                    _style._enableLayout && _style._enableLayout() && o._addToLayout(out);
                });
            return true;
        }
        _addToLayout(out) {
            if (!this._style)
                return;
            var style = this._style;
            if (style.absolute)
                return;
            style.block ? out.push(this) : (this._addChildsToLayout(out) && (this.x = this.y = 0));
        }
        set id(value) {
            HTMLDocument.document.setElementById(value, this);
        }
        repaint(recreate = false) {
            this.parentRepaint(recreate);
        }
        parentRepaint(recreate = false) {
            if (this.parent)
                this.parent.repaint(recreate);
        }
        set innerTEXT(value) {
            if (this._text === HTMLElement._EMPTYTEXT) {
                this._text = { text: value, words: null };
            }
            else {
                this._text.text = value;
                this._text.words && (this._text.words.length = 0);
            }
            this.repaint();
        }
        get innerTEXT() {
            return this._text.text;
        }
        _setParent(value) {
            if (value instanceof HTMLElement) {
                var p = value;
                this.URI || (this.URI = p.URI);
                if (this.style)
                    this.style.inherit(p.style);
            }
        }
        appendChild(c) {
            return this.addChild(c);
        }
        addChild(c) {
            if (c.parent)
                c.parent.removeChild(c);
            if (!this._children)
                this._children = [];
            this._children.push(c);
            c.parent = this;
            c._setParent(this);
            this.repaint();
            return c;
        }
        removeChild(c) {
            if (!this._children)
                return null;
            var i, len;
            len = this._children.length;
            for (i = 0; i < len; i++) {
                if (this._children[i] == c) {
                    this._children.splice(i, 1);
                    return c;
                }
            }
            return null;
        }
        static getClassName(tar) {
            if (tar instanceof Function)
                return tar.name;
            return tar["constructor"].name;
        }
        destroy() {
            if (this._children) {
                this.destroyChildren();
                this._children.length = 0;
            }
            Laya.Pool.recover(HTMLElement.getClassName(this), this.reset());
        }
        destroyChildren() {
            if (this._children) {
                for (var i = this._children.length - 1; i > -1; i--) {
                    this._children[i].destroy();
                }
                this._children.length = 0;
            }
        }
        get style() {
            return this._style;
        }
        _getWords() {
            if (!this._text)
                return null;
            var txt = this._text.text;
            if (!txt || txt.length === 0)
                return null;
            var words = this._text.words;
            if (words && words.length === txt.length)
                return words;
            words === null && (this._text.words = words = []);
            words.length = txt.length;
            var size;
            var style = this.style;
            var fontStr = style.font;
            for (var i = 0, n = txt.length; i < n; i++) {
                size = Laya.ILaya.Browser.measureText(txt.charAt(i), fontStr);
                words[i] = Laya.HTMLChar.create().setData(txt.charAt(i), size.width, size.height || style.fontSize, style);
            }
            return words;
        }
        _isChar() {
            return false;
        }
        _layoutLater() {
            var style = this.style;
            if ((style._type & HTMLStyle.ADDLAYOUTED))
                return;
            if (style.widthed(this) && ((this._children && this._children.length > 0) || this._getWords() != null) && style.block) {
                Layout.later(this);
                style._type |= HTMLStyle.ADDLAYOUTED;
            }
            else {
                this.parent && this.parent._layoutLater();
            }
        }
        set x(v) {
            if (this._x != v) {
                this._x = v;
                this.parentRepaint();
            }
        }
        get x() {
            return this._x;
        }
        set y(v) {
            if (this._y != v) {
                this._y = v;
                this.parentRepaint();
            }
        }
        get y() {
            return this._y;
        }
        get width() {
            return this._width;
        }
        set width(value) {
            if (this._width !== value) {
                this._width = value;
                this.repaint();
            }
        }
        get height() {
            return this._height;
        }
        set height(value) {
            if (this._height !== value) {
                this._height = value;
                this.repaint();
            }
        }
        _setAttributes(name, value) {
            switch (name) {
                case 'style':
                    this.style.cssText(value);
                    break;
                case 'class':
                    this.className = value;
                    break;
                case 'x':
                    this.x = parseFloat(value);
                    break;
                case 'y':
                    this.y = parseFloat(value);
                    break;
                case 'width':
                    this.width = parseFloat(value);
                    break;
                case 'height':
                    this.height = parseFloat(value);
                    break;
                default:
                    this[name] = value;
            }
        }
        set href(url) {
            if (!this._style)
                return;
            if (url != this._style.href) {
                this._style.href = url;
                this.repaint();
            }
        }
        get href() {
            if (!this._style)
                return null;
            return this._style.href;
        }
        formatURL(url) {
            if (!this.URI)
                return url;
            return HTMLElement.formatURL1(url, this.URI ? this.URI.path : null);
        }
        set color(value) {
            this.style.color = value;
        }
        set className(value) {
            this.style.attrs(HTMLDocument.document.styleSheets['.' + value]);
        }
        drawToGraphic(graphic, gX, gY, recList) {
            gX += this.x;
            gY += this.y;
            var cssStyle = this.style;
            if (cssStyle.paddingLeft) {
                gX += cssStyle.paddingLeft;
            }
            if (cssStyle.paddingTop) {
                gY += cssStyle.paddingTop;
            }
            if (cssStyle.bgColor != null || cssStyle.borderColor) {
                graphic.drawRect(gX, gY, this.width, this.height, cssStyle.bgColor, cssStyle.borderColor, 1);
            }
            this.renderSelfToGraphic(graphic, gX, gY, recList);
            var i, len;
            var tChild;
            if (this._children && this._children.length > 0) {
                len = this._children.length;
                for (i = 0; i < len; i++) {
                    tChild = this._children[i];
                    if (tChild.drawToGraphic != null)
                        tChild.drawToGraphic(graphic, gX, gY, recList);
                }
            }
        }
        renderSelfToGraphic(graphic, gX, gY, recList) {
            var cssStyle = this.style;
            var words = this._getWords();
            var len;
            if (words) {
                len = words.length;
                if (cssStyle) {
                    var font = cssStyle.font;
                    var color = cssStyle.color;
                    if (cssStyle.stroke) {
                        var stroke = cssStyle.stroke;
                        stroke = parseInt(stroke);
                        var strokeColor = cssStyle.strokeColor;
                        graphic.fillBorderWords(words, gX, gY, font, color, strokeColor, stroke);
                    }
                    else {
                        graphic.fillWords(words, gX, gY, font, color);
                    }
                    if (this.href) {
                        var lastIndex = words.length - 1;
                        var lastWords = words[lastIndex];
                        var lineY = lastWords.y + lastWords.height;
                        if (lastWords.y == words[0].y) {
                            if (cssStyle.textDecoration != "none")
                                graphic.drawLine(words[0].x, lineY, lastWords.x + lastWords.width, lineY, color, 1);
                            var hitRec = HTMLHitRect.create();
                            hitRec.rec.setTo(words[0].x, lastWords.y, lastWords.x + lastWords.width - words[0].x, lastWords.height);
                            hitRec.href = this.href;
                            recList.push(hitRec);
                        }
                        else {
                            this.workLines(words, graphic, recList);
                        }
                    }
                }
            }
        }
        workLines(wordList, g, recList) {
            var cssStyle = this.style;
            var hasLine;
            hasLine = cssStyle.textDecoration != "none";
            var i = 0, len;
            len = wordList.length;
            var tStartWord;
            tStartWord = wordList[i];
            var tEndWord;
            tEndWord = tStartWord;
            if (!tStartWord)
                return;
            var tword;
            for (i = 1; i < len; i++) {
                tword = wordList[i];
                if (tword.y != tStartWord.y) {
                    this.createOneLine(tStartWord, tEndWord, hasLine, g, recList);
                    tStartWord = tword;
                    tEndWord = tword;
                }
                else {
                    tEndWord = tword;
                }
            }
            this.createOneLine(tStartWord, tEndWord, hasLine, g, recList);
        }
        createOneLine(startWord, lastWords, hasLine, graphic, recList) {
            var lineY = lastWords.y + lastWords.height;
            if (hasLine)
                graphic.drawLine(startWord.x, lineY, lastWords.x + lastWords.width, lineY, this.style.color, 1);
            var hitRec = HTMLHitRect.create();
            hitRec.rec.setTo(startWord.x, lastWords.y, lastWords.x + lastWords.width - startWord.x, lastWords.height);
            hitRec.href = this.href;
            recList.push(hitRec);
        }
    }
    HTMLElement._EMPTYTEXT = { text: null, words: null };
    Laya.ILaya.regClass(HTMLElement);
    IHtml.HTMLElementType = exports.HTMLElementType;
    Laya.ClassUtils.regClass("laya.html.dom.HTMLElement", HTMLElement);
    Laya.ClassUtils.regClass("Laya.HTMLElement", HTMLElement);

    class HTMLBrElement {
        _addToLayout(out) {
            out.push(this);
        }
        reset() {
            return this;
        }
        destroy() {
            Laya.Pool.recover(HTMLElement.getClassName(this), this.reset());
        }
        _setParent(value) {
        }
        set parent(value) {
        }
        set URI(value) {
        }
        set href(value) {
        }
        _getCSSStyle() {
            if (!HTMLBrElement.brStyle) {
                HTMLBrElement.brStyle = new HTMLStyle();
                HTMLBrElement.brStyle.setLineElement(true);
                HTMLBrElement.brStyle.block = true;
            }
            return HTMLBrElement.brStyle;
        }
        renderSelfToGraphic(graphic, gX, gY, recList) {
        }
    }
    IHtml.HTMLBrElement = HTMLBrElement;
    Laya.ILaya.regClass(HTMLBrElement);
    Laya.ClassUtils.regClass("laya.html.dom.HTMLBrElement", HTMLBrElement);
    Laya.ClassUtils.regClass("Laya.HTMLBrElement", HTMLBrElement);

    class HTMLStyleElement extends HTMLElement {
        _creates() {
        }
        drawToGraphic(graphic, gX, gY, recList) {
        }
        reset() {
            return this;
        }
        set innerTEXT(value) {
            HTMLStyle.parseCSS(value, null);
        }
        get innerTEXT() {
            return super.innerTEXT;
        }
    }
    Laya.ILaya.regClass(HTMLStyleElement);
    Laya.ClassUtils.regClass("laya.html.dom.HTMLStyleElement", HTMLStyleElement);
    Laya.ClassUtils.regClass("Laya.HTMLStyleElement", HTMLStyleElement);

    class HTMLLinkElement extends HTMLElement {
        _creates() {
        }
        drawToGraphic(graphic, gX, gY, recList) {
        }
        reset() {
            if (this._loader)
                this._loader.off(Laya.Event.COMPLETE, this, this._onload);
            this._loader = null;
            return this;
        }
        _onload(data) {
            if (this._loader)
                this._loader = null;
            switch (this.type) {
                case 'text/css':
                    HTMLStyle.parseCSS(data, this.URI);
                    break;
            }
            this.repaint(true);
        }
        set href(url) {
            if (!url)
                return;
            url = this.formatURL(url);
            this.URI = new Laya.URL(url);
            if (this._loader)
                this._loader.off(Laya.Event.COMPLETE, this, this._onload);
            if (Laya.Loader.getRes(url)) {
                if (this.type == "text/css") {
                    HTMLStyle.parseCSS(Laya.Loader.getRes(url), this.URI);
                }
                return;
            }
            this._loader = new Laya.Loader();
            this._loader.once(Laya.Event.COMPLETE, this, this._onload);
            this._loader.load(url, Laya.Loader.TEXT);
        }
        get href() {
            return super.href;
        }
    }
    HTMLLinkElement._cuttingStyle = new RegExp("((@keyframes[\\s\\t]+|)(.+))[\\t\\n\\r\\\s]*{", "g");
    Laya.ILaya.regClass(HTMLLinkElement);
    Laya.ClassUtils.regClass("laya.html.dom.HTMLLinkElement", HTMLLinkElement);
    Laya.ClassUtils.regClass("Laya.HTMLLinkElement", HTMLLinkElement);

    class HTMLDivParser extends HTMLElement {
        constructor() {
            super(...arguments);
            this.repaintHandler = null;
        }
        reset() {
            super.reset();
            this._style.block = true;
            this._style.setLineElement(true);
            this._style.width = 200;
            this._style.height = 200;
            this.repaintHandler = null;
            this.contextHeight = 0;
            this.contextWidth = 0;
            return this;
        }
        set innerHTML(text) {
            this.destroyChildren();
            this.appendHTML(text);
        }
        set width(value) {
            var changed;
            if (value === 0) {
                changed = value != this._width;
            }
            else {
                changed = value != this.width;
            }
            super.width = value;
            if (changed)
                this.layout();
        }
        appendHTML(text) {
            IHtml.HTMLParse.parse(this, text, this.URI);
            this.layout();
        }
        _addChildsToLayout(out) {
            var words = this._getWords();
            if (words == null && (!this._children || this._children.length == 0))
                return false;
            words && words.forEach(function (o) {
                out.push(o);
            });
            var tFirstKey = true;
            for (var i = 0, len = this._children.length; i < len; i++) {
                var o = this._children[i];
                if (tFirstKey) {
                    tFirstKey = false;
                }
                else {
                    out.push(null);
                }
                o._addToLayout(out);
            }
            return true;
        }
        _addToLayout(out) {
            this.layout();
            !this.style.absolute && out.push(this);
        }
        getBounds() {
            if (!this._htmlBounds)
                return null;
            if (!this._boundsRec)
                this._boundsRec = Laya.Rectangle.create();
            return this._boundsRec.copyFrom(this._htmlBounds);
        }
        parentRepaint(recreate = false) {
            super.parentRepaint();
            if (this.repaintHandler)
                this.repaintHandler.runWith(recreate);
        }
        layout() {
            this.style._type |= HTMLStyle.ADDLAYOUTED;
            var tArray = Layout.layout(this);
            if (tArray) {
                if (!this._htmlBounds)
                    this._htmlBounds = Laya.Rectangle.create();
                var tRectangle = this._htmlBounds;
                tRectangle.x = tRectangle.y = 0;
                tRectangle.width = this.contextWidth = tArray[0];
                tRectangle.height = this.contextHeight = tArray[1];
            }
        }
        get height() {
            if (this._height)
                return this._height;
            return this.contextHeight;
        }
        set height(value) {
            super.height = value;
        }
        get width() {
            if (this._width)
                return this._width;
            return this.contextWidth;
        }
    }
    IHtml.HTMLDivParser = HTMLDivParser;
    Laya.ILaya.regClass(HTMLDivParser);
    Laya.ClassUtils.regClass("laya.html.dom.HTMLDivParser", HTMLDivParser);
    Laya.ClassUtils.regClass("Laya.HTMLDivParser", HTMLDivParser);

    class HTMLImageElement extends HTMLElement {
        constructor() {
            super();
            this.eletype = exports.HTMLElementType.IMAGE;
        }
        reset() {
            super.reset();
            if (this._tex) {
                this._tex.off(Laya.Event.LOADED, this, this.onloaded);
            }
            this._tex = null;
            this._url = null;
            return this;
        }
        set src(url) {
            url = this.formatURL(url);
            if (this._url === url)
                return;
            this._url = url;
            var tex = this._tex = Laya.Loader.getRes(url);
            if (!tex) {
                this._tex = tex = new Laya.Texture();
                tex.load(url);
                Laya.Loader.cacheTexture(url, tex);
            }
            tex.getIsReady() ? this.onloaded() : tex.once(Laya.Event.READY, this, this.onloaded);
        }
        onloaded() {
            if (!this._style)
                return;
            var style = this._style;
            var w = style.widthed(this) ? -1 : this._tex.width;
            var h = style.heighted(this) ? -1 : this._tex.height;
            if (!style.widthed(this) && this._width != this._tex.width) {
                this.width = this._tex.width;
                this.parent && this.parent._layoutLater();
            }
            if (!style.heighted(this) && this._height != this._tex.height) {
                this.height = this._tex.height;
                this.parent && this.parent._layoutLater();
            }
            this.repaint();
        }
        _addToLayout(out) {
            var style = this._style;
            !style.absolute && out.push(this);
        }
        renderSelfToGraphic(graphic, gX, gY, recList) {
            if (!this._tex)
                return;
            graphic.drawImage(this._tex, gX, gY, this.width || this._tex.width, this.height || this._tex.height);
        }
    }
    IHtml.HTMLImageElement = HTMLImageElement;
    Laya.ILaya.regClass(HTMLImageElement);
    Laya.ClassUtils.regClass("laya.html.dom.HTMLImageElement", HTMLImageElement);
    Laya.ClassUtils.regClass("Laya.HTMLImageElement", HTMLImageElement);

    class HTMLParse {
        static getInstance(type) {
            var rst = Laya.Pool.getItem(HTMLParse._htmlClassMapShort[type]);
            if (!rst) {
                rst = Laya.ClassUtils.getInstance(type);
            }
            return rst;
        }
        static parse(ower, xmlString, url) {
            xmlString = xmlString.replace(/<br>/g, "<br/>");
            xmlString = "<root>" + xmlString + "</root>";
            xmlString = xmlString.replace(HTMLParse.spacePattern, HTMLParse.char255);
            var xml = Laya.Utils.parseXMLFromString(xmlString);
            HTMLParse._parseXML(ower, xml.childNodes[0].childNodes, url);
        }
        static _parseXML(parent, xml, url, href = null) {
            var i, n;
            if (xml.join || xml.item) {
                for (i = 0, n = xml.length; i < n; ++i) {
                    HTMLParse._parseXML(parent, xml[i], url, href);
                }
            }
            else {
                var node;
                var nodeName;
                if (xml.nodeType == 3) {
                    var txt;
                    if (parent instanceof IHtml.HTMLDivParser) {
                        if (xml.nodeName == null) {
                            xml.nodeName = "#text";
                        }
                        nodeName = xml.nodeName.toLowerCase();
                        txt = xml.textContent.replace(/^\s+|\s+$/g, '');
                        if (txt.length > 0) {
                            node = HTMLParse.getInstance(nodeName);
                            if (node) {
                                parent.addChild(node);
                                (node.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " "));
                            }
                        }
                    }
                    else {
                        txt = xml.textContent.replace(/^\s+|\s+$/g, '');
                        if (txt.length > 0) {
                            var containNode = parent;
                            if (parent instanceof HTMLElement && parent.innerTEXT && parent.innerTEXT.length > 0) {
                                let cnode = HTMLParse.getInstance('p');
                                if (cnode) {
                                    parent.addChild(cnode);
                                    containNode = cnode;
                                }
                            }
                            containNode.innerTEXT = txt.replace(HTMLParse.char255AndOneSpacePattern, " ");
                        }
                    }
                    return;
                }
                else {
                    nodeName = xml.nodeName.toLowerCase();
                    if (nodeName == "#comment")
                        return;
                    node = HTMLParse.getInstance(nodeName);
                    if (node) {
                        if (nodeName == "p") {
                            parent.addChild(HTMLParse.getInstance("br"));
                            node = parent.addChild(node);
                            parent.addChild(HTMLParse.getInstance("br"));
                        }
                        else {
                            node = parent.addChild(node);
                        }
                        node.URI = url;
                        node.href = href;
                        var attributes = xml.attributes;
                        if (attributes && attributes.length > 0) {
                            for (i = 0, n = attributes.length; i < n; ++i) {
                                var attribute = attributes[i];
                                var attrName = attribute.nodeName;
                                var value = attribute.value;
                                node._setAttributes(attrName, value);
                            }
                        }
                        HTMLParse._parseXML(node, xml.childNodes, url, node.href);
                    }
                    else {
                        HTMLParse._parseXML(parent, xml.childNodes, url, href);
                    }
                }
            }
        }
    }
    HTMLParse.char255 = String.fromCharCode(255);
    HTMLParse.spacePattern = /&nbsp;|&#160;/g;
    HTMLParse.char255AndOneSpacePattern = new RegExp(String.fromCharCode(255) + "|(\\s+)", "g");
    HTMLParse._htmlClassMapShort = {
        'div': HTMLDivParser,
        'p': HTMLElement,
        'img': HTMLImageElement,
        'span': HTMLElement,
        'br': HTMLBrElement,
        'style': HTMLStyleElement,
        'font': HTMLElement,
        'a': HTMLElement,
        '#text': HTMLElement,
        'link': HTMLLinkElement
    };
    IHtml.HTMLParse = HTMLParse;
    Laya.ClassUtils.regClass('div', HTMLDivParser);
    Laya.ClassUtils.regClass('p', HTMLElement);
    Laya.ClassUtils.regClass('img', HTMLImageElement);
    Laya.ClassUtils.regClass('span', HTMLElement);
    Laya.ClassUtils.regClass('br', HTMLBrElement);
    Laya.ClassUtils.regClass('style', HTMLStyleElement);
    Laya.ClassUtils.regClass('font', HTMLElement);
    Laya.ClassUtils.regClass('a', HTMLElement);
    Laya.ClassUtils.regClass('#text', HTMLElement);
    Laya.ClassUtils.regClass('link', HTMLLinkElement);
    Laya.ClassUtils.regClass("laya.html.utils.HTMLParse", HTMLParse);
    Laya.ClassUtils.regClass("Laya.HTMLParse", HTMLParse);

    class HTMLDivElement extends Laya.Sprite {
        constructor() {
            super();
            this._recList = [];
            this._repaintState = 0;
            this._element = new HTMLDivParser();
            this._element.repaintHandler = new Laya.Handler(this, this._htmlDivRepaint);
            this.mouseEnabled = true;
            this.on(Laya.Event.CLICK, this, this._onMouseClick);
        }
        destroy(destroyChild = true) {
            if (this._element)
                this._element.reset();
            this._element = null;
            this._doClears();
            super.destroy(destroyChild);
        }
        _htmlDivRepaint(recreate = false) {
            if (recreate) {
                if (this._repaintState < 2)
                    this._repaintState = 2;
            }
            else {
                if (this._repaintState < 1)
                    this._repaintState = 1;
            }
            if (this._repaintState > 0)
                this._setGraphicDirty();
        }
        _updateGraphicWork() {
            switch (this._repaintState) {
                case 1:
                    this._updateGraphic();
                    break;
                case 2:
                    this._refresh();
                    break;
            }
        }
        _setGraphicDirty() {
            this.callLater(this._updateGraphicWork);
        }
        _doClears() {
            if (!this._recList)
                return;
            var i, len = this._recList.length;
            var tRec;
            for (i = 0; i < len; i++) {
                tRec = this._recList[i];
                tRec.recover();
            }
            this._recList.length = 0;
        }
        _updateGraphic() {
            this._doClears();
            this.graphics.clear(true);
            this._repaintState = 0;
            this._element.drawToGraphic(this.graphics, -this._element.x, -this._element.y, this._recList);
            var bounds = this._element.getBounds();
            if (bounds)
                this.setSelfBounds(bounds);
            this.size(bounds.width, bounds.height);
        }
        get style() {
            return this._element.style;
        }
        set innerHTML(text) {
            if (this._innerHTML == text)
                return;
            this._repaintState = 1;
            this._innerHTML = text;
            this._element.innerHTML = text;
            this._setGraphicDirty();
        }
        _refresh() {
            this._repaintState = 1;
            if (this._innerHTML)
                this._element.innerHTML = this._innerHTML;
            this._setGraphicDirty();
        }
        set width(value) {
            this._element.width = value;
        }
        get width() {
            return this._element.width;
        }
        set height(value) {
            this._element.height = value;
        }
        get height() {
            return this._element.height;
        }
        get contextWidth() {
            return this._element.contextWidth;
        }
        get contextHeight() {
            return this._element.contextHeight;
        }
        _onMouseClick() {
            var tX = this.mouseX;
            var tY = this.mouseY;
            var i, len;
            var tHit;
            len = this._recList.length;
            for (i = 0; i < len; i++) {
                tHit = this._recList[i];
                if (tHit.rec.contains(tX, tY)) {
                    this._eventLink(tHit.href);
                }
            }
        }
        _eventLink(href) {
            this.event(Laya.Event.LINK, [href]);
        }
    }
    IHtml.HTMLDivElement = HTMLDivElement;
    IHtml.HTMLParse = HTMLParse;
    Laya.ClassUtils.regClass("laya.html.dom.HTMLDivElement", HTMLDivElement);
    Laya.ClassUtils.regClass("Laya.HTMLDivElement", HTMLDivElement);

    class HTMLIframeElement extends HTMLDivElement {
        constructor() {
            super();
            this._element._getCSSStyle().valign = "middle";
        }
        set href(url) {
            url = this._element.formatURL(url);
            var l = new Laya.Loader();
            l.once(Laya.Event.COMPLETE, null, (data) => {
                var pre = this._element.URI;
                this._element.URI = new Laya.URL(url);
                this.innerHTML = data;
                !pre || (this._element.URI = pre);
            });
            l.load(url, Laya.Loader.TEXT);
        }
    }
    Laya.ClassUtils.regClass("laya.html.dom.HTMLIframeElement", HTMLIframeElement);
    Laya.ClassUtils.regClass("Laya.HTMLIframeElement", HTMLIframeElement);

    exports.HTMLBrElement = HTMLBrElement;
    exports.HTMLDivElement = HTMLDivElement;
    exports.HTMLDivParser = HTMLDivParser;
    exports.HTMLDocument = HTMLDocument;
    exports.HTMLElement = HTMLElement;
    exports.HTMLExtendStyle = HTMLExtendStyle;
    exports.HTMLHitRect = HTMLHitRect;
    exports.HTMLIframeElement = HTMLIframeElement;
    exports.HTMLImageElement = HTMLImageElement;
    exports.HTMLLinkElement = HTMLLinkElement;
    exports.HTMLParse = HTMLParse;
    exports.HTMLStyle = HTMLStyle;
    exports.HTMLStyleElement = HTMLStyleElement;
    exports.IHtml = IHtml;
    exports.Layout = Layout;
    exports.LayoutLine = LayoutLine;

}(window.Laya = window.Laya || {}, Laya));
