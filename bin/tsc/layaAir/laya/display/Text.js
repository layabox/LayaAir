import { Sprite } from "./Sprite";
import { SpriteConst } from "./SpriteConst";
import { TextStyle } from "./css/TextStyle";
import { Event } from "../events/Event";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { WordText } from "../utils/WordText";
import { ILaya } from "../../ILaya";
//import { ClassUtils } from "../utils/ClassUtils";
/**
 * 文本内容发生改变后调度。
 * @eventType Event.CHANGE
 */
/*[Event(name = "change", type = "laya.events.Event")]*/
/**
 * <p> <code>Text</code> 类用于创建显示对象以显示文本。</p>
 * <p>
 * 注意：如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。
 * </p>
 * @example
 * package
 * {
 * 	import laya.display.Text;
 * 	public class Text_Example
 * 	{
 * 		public function Text_Example()
 * 		{
 * 			Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 * 			Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 * 			onInit();
 * 		}
 * 		private function onInit():void
 * 		{
 * 			var text:Text = new Text();//创建一个 Text 类的实例对象 text 。
 * 			text.text = "这个是一个 Text 文本示例。";
 * 			text.color = "#008fff";//设置 text 的文本颜色。
 * 			text.font = "Arial";//设置 text 的文本字体。
 * 			text.bold = true;//设置 text 的文本显示为粗体。
 * 			text.fontSize = 30;//设置 text 的字体大小。
 * 			text.wordWrap = true;//设置 text 的文本自动换行。
 * 			text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。
 * 			text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。
 * 			text.width = 300;//设置 text 的宽度。
 * 			text.height = 200;//设置 text 的高度。
 * 			text.italic = true;//设置 text 的文本显示为斜体。
 * 			text.borderColor = "#fff000";//设置 text 的文本边框颜色。
 * 			Laya.stage.addChild(text);//将 text 添加到显示列表。
 * 		}
 * 	}
 * }
 * @example
 * Text_Example();
 * function Text_Example()
 * {
 *     Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *     Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *     onInit();
 * }
 * function onInit()
 * {
 *     var text = new laya.display.Text();//创建一个 Text 类的实例对象 text 。
 *     text.text = "这个是一个 Text 文本示例。";
 *     text.color = "#008fff";//设置 text 的文本颜色。
 *     text.font = "Arial";//设置 text 的文本字体。
 *     text.bold = true;//设置 text 的文本显示为粗体。
 *     text.fontSize = 30;//设置 text 的字体大小。
 *     text.wordWrap = true;//设置 text 的文本自动换行。
 *     text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。
 *     text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。
 *     text.width = 300;//设置 text 的宽度。
 *     text.height = 200;//设置 text 的高度。
 *     text.italic = true;//设置 text 的文本显示为斜体。
 *     text.borderColor = "#fff000";//设置 text 的文本边框颜色。
 *     Laya.stage.addChild(text);//将 text 添加到显示列表。
 * }
 * @example
 * class Text_Example {
 *     constructor() {
 *         Laya.init(640, 800);//设置游戏画布宽高、渲染模式。
 *         Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。
 *         this.onInit();
 *     }
 *     private onInit(): void {
 *         var text: laya.display.Text = new laya.display.Text();//创建一个 Text 类的实例对象 text 。
 *         text.text = "这个是一个 Text 文本示例。";
 *         text.color = "#008fff";//设置 text 的文本颜色。
 *         text.font = "Arial";//设置 text 的文本字体。
 *         text.bold = true;//设置 text 的文本显示为粗体。
 *         text.fontSize = 30;//设置 text 的字体大小。
 *         text.wordWrap = true;//设置 text 的文本自动换行。
 *         text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。
 *         text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。
 *         text.width = 300;//设置 text 的宽度。
 *         text.height = 200;//设置 text 的高度。
 *         text.italic = true;//设置 text 的文本显示为斜体。
 *         text.borderColor = "#fff000";//设置 text 的文本边框颜色。
 *         Laya.stage.addChild(text);//将 text 添加到显示列表。
 *     }
 * }
 */
export class Text extends Sprite {
    /**
     * 创建一个新的 <code>Text</code> 实例。
     */
    constructor() {
        super();
        /**@private 表示文本的宽度，以像素为单位。*/
        this._textWidth = 0;
        /**@private 表示文本的高度，以像素为单位。*/
        this._textHeight = 0;
        /**@private 存储文字行数信息。*/
        this._lines = [];
        /**@private 保存每行宽度*/
        this._lineWidths = [];
        /**@private 文本的内容位置 X 轴信息。*/
        this._startX = 0;
        /**@private 文本的内容位置X轴信息。 */
        this._startY = 0;
        /**@private */
        this._charSize = {};
        /**@private */
        this._valign = "top";
        /**@internal */
        this._fontSize = Text.defaultFontSize;
        /**@internal */
        this._font = Text.defaultFont;
        /**@internal */
        this._color = "#000000";
        /**@private */
        this._singleCharRender = false; // 拆分渲染
        /**
         * <p>overflow 指定文本超出文本域后的行为。其值为"hidden"、"visible"和"scroll"之一。</p>
         * <p>性能从高到低依次为：hidden > visible > scroll。</p>
         */
        this.overflow = Text.VISIBLE;
        this._style = TextStyle.EMPTY;
    }
    /**@private */
    static defaultFontStr() {
        return Text.defaultFontSize + "px " + Text.defaultFont;
    }
    /**
     * @private
     * 获取样式。
     * @return  样式 Style 。
     */
    /*override*/ getStyle() {
        this._style === TextStyle.EMPTY && (this._style = TextStyle.create());
        return this._style;
    }
    _getTextStyle() {
        if (this._style === TextStyle.EMPTY) {
            this._style = TextStyle.create();
        }
        return this._style;
    }
    /**
     * 注册位图字体。
     * @param	name		位图字体的名称。
     * @param	bitmapFont	位图字体文件。
     */
    static registerBitmapFont(name, bitmapFont) {
        Text._bitmapFonts || (Text._bitmapFonts = {});
        Text._bitmapFonts[name] = bitmapFont;
    }
    /**
     * 移除注册的位图字体文件。
     * @param	name		位图字体的名称。
     * @param	destroy		是否销毁指定的字体文件。
     */
    static unregisterBitmapFont(name, destroy = true) {
        if (Text._bitmapFonts && Text._bitmapFonts[name]) {
            var tBitmapFont = Text._bitmapFonts[name];
            if (destroy)
                tBitmapFont.destroy();
            delete Text._bitmapFonts[name];
        }
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._clipPoint = null;
        this._lines = null;
        this._lineWidths = null;
        // 注意_words是一个数组（例如有换行）
        this._words && this._words.forEach(function (w) {
            w.cleanCache();
        });
        this._words = null;
        this._charSize = null;
    }
    /**
     * @internal
     * @inheritDoc
     */
    /*override*/ _getBoundPointsM(ifRotate = false) {
        var rec = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec._getBoundPoints();
    }
    /**
     * @inheritDoc
     */
    /*override*/ getGraphicBounds(realSize = false) {
        var rec = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec;
    }
    /**
     * @inheritDoc
     */
    /*override*/ get width() {
        if (this._width)
            return this._width;
        return this.textWidth + this.padding[1] + this.padding[3];
    }
    /*override*/ set width(value) {
        if (value != this._width) {
            super.set_width(value);
            this.isChanged = true;
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    /**
     * @internal
     */
    _getCSSStyle() {
        return this._style;
    }
    /**
     * @inheritDoc
     */
    /*override*/ get height() {
        if (this._height)
            return this._height;
        return this.textHeight;
    }
    /*override*/ set height(value) {
        if (value != this._height) {
            super.set_height(value);
            this.isChanged = true;
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    /**
     * 表示文本的宽度，以像素为单位。
     */
    get textWidth() {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textWidth;
    }
    /**
     * 表示文本的高度，以像素为单位。
     */
    get textHeight() {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textHeight;
    }
    /** 当前文本的内容字符串。*/
    get text() {
        return this._text || "";
    }
    // 为了转ts。ts不支持super.get set
    get_text() {
        return this._text || "";
    }
    set_text(value) {
        if (this._text !== value) {
            this.lang(value + "");
            this.isChanged = true;
            this.event(Event.CHANGE);
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }
    set text(value) {
        this.set_text(value);
    }
    /**
     * <p>根据指定的文本，从语言包中取当前语言的文本内容。并对此文本中的{i}文本进行替换。</p>
     * <p>设置Text.langPacks语言包后，即可使用lang获取里面的语言</p>
     * <p>例如：
     * <li>（1）text 的值为“我的名字”，先取到这个文本对应的当前语言版本里的值“My name”，将“My name”设置为当前文本的内容。</li>
     * <li>（2）text 的值为“恭喜你赢得{0}个钻石，{1}经验。”，arg1 的值为100，arg2 的值为200。
     * 			则先取到这个文本对应的当前语言版本里的值“Congratulations on your winning {0} diamonds, {1} experience.”，
     * 			然后将文本里的{0}、{1}，依据括号里的数字从0开始替换为 arg1、arg2 的值。
     * 			将替换处理后的文本“Congratulations on your winning 100 diamonds, 200 experience.”设置为当前文本的内容。
     * </li>
     * </p>
     * @param	text 文本内容。
     * @param	...args 文本替换参数。
     */
    lang(text, arg1 = null, arg2 = null, arg3 = null, arg4 = null, arg5 = null, arg6 = null, arg7 = null, arg8 = null, arg9 = null, arg10 = null) {
        text = Text.langPacks && Text.langPacks[text] ? Text.langPacks[text] : text;
        if (arguments.length < 2) {
            this._text = text;
        }
        else {
            for (var i = 0, n = arguments.length; i < n; i++) {
                text = text.replace("{" + i + "}", arguments[i + 1]);
            }
            this._text = text;
        }
    }
    /**
     * <p>文本的字体名称，以字符串形式表示。</p>
     * <p>默认值为："Arial"，可以通过Text.defaultFont设置默认字体。</p>
     * <p>如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。</p>
     * @see laya.display.Text#defaultFont
     */
    get font() {
        return this._font;
    }
    set font(value) {
        if (this._style.currBitmapFont) {
            this._getTextStyle().currBitmapFont = null;
            this.scale(1, 1);
        }
        if (Text._bitmapFonts && Text._bitmapFonts[value]) {
            this._getTextStyle().currBitmapFont = Text._bitmapFonts[value];
        }
        this._font = value;
        this.isChanged = true;
    }
    /**
     * <p>指定文本的字体大小（以像素为单位）。</p>
     * <p>默认为20像素，可以通过 <code>Text.defaultFontSize</code> 设置默认大小。</p>
     */
    get fontSize() {
        return this._fontSize;
    }
    set fontSize(value) {
        if (this._fontSize != value) {
            this._fontSize = value;
            this.isChanged = true;
        }
    }
    /**
     * <p>指定文本是否为粗体字。</p>
     * <p>默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。</p>
     */
    get bold() {
        return this._style.bold;
    }
    set bold(value) {
        this._getTextStyle().bold = value;
        this.isChanged = true;
    }
    /**
     * <p>表示文本的颜色值。可以通过 <code>Text.defaultColor</code> 设置默认颜色。</p>
     * <p>默认值为黑色。</p>
     */
    get color() {
        return this._color;
    }
    set color(value) {
        this.set_color(value);
    }
    // for转ts。 ts不支持 super.get/set
    get_color() {
        return this._color;
    }
    set_color(value) {
        if (this._color != value) {
            this._color = value;
            //如果仅仅更新颜色，无需重新排版
            if (!this._isChanged && this._graphics) {
                this._graphics.replaceTextColor(this.color);
            }
            else {
                this.isChanged = true;
            }
        }
    }
    /**
     * <p>表示使用此文本格式的文本是否为斜体。</p>
     * <p>默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。</p>
     */
    get italic() {
        return this._style.italic;
    }
    set italic(value) {
        this._getTextStyle().italic = value;
        this.isChanged = true;
    }
    /**
     * <p>表示文本的水平显示方式。</p>
     * <p><b>取值：</b>
     * <li>"left"： 居左对齐显示。</li>
     * <li>"center"： 居中对齐显示。</li>
     * <li>"right"： 居右对齐显示。</li>
     * </p>
     */
    get align() {
        return this._style.align;
    }
    set align(value) {
        this._getTextStyle().align = value;
        this.isChanged = true;
    }
    /**
     * <p>表示文本的垂直显示方式。</p>
     * <p><b>取值：</b>
     * <li>"top"： 居顶部对齐显示。</li>
     * <li>"middle"： 居中对齐显示。</li>
     * <li>"bottom"： 居底部对齐显示。</li>
     * </p>
     */
    get valign() {
        return this._valign;
    }
    set valign(value) {
        this._valign = value;
        this.isChanged = true;
    }
    /**
     * <p>表示文本是否自动换行，默认为false。</p>
     * <p>若值为true，则自动换行；否则不自动换行。</p>
     */
    get wordWrap() {
        return this._style.wordWrap;
    }
    set wordWrap(value) {
        this._getTextStyle().wordWrap = value;
        this.isChanged = true;
    }
    /**
     * 垂直行间距（以像素为单位）。
     */
    get leading() {
        return this._style.leading;
    }
    set leading(value) {
        this._getTextStyle().leading = value;
        this.isChanged = true;
    }
    /**
     * <p>边距信息。</p>
     * <p>数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。</p>
     */
    get padding() {
        return this._style.padding;
    }
    set padding(value) {
        if (typeof (value) == 'string') {
            var arr;
            arr = value.split(",");
            var i, len;
            len = arr.length;
            while (arr.length < 4) {
                arr.push(0);
            }
            for (i = 0; i < len; i++) {
                arr[i] = parseFloat(arr[i]) || 0;
            }
            value = arr;
        }
        this._getTextStyle().padding = value;
        this.isChanged = true;
    }
    /**
     * 文本背景颜色，以字符串表示。
     */
    get bgColor() {
        return this._style.bgColor;
    }
    set bgColor(value) {
        this.set_bgColor(value);
    }
    // fot ts
    set_bgColor(value) {
        this._getTextStyle().bgColor = value;
        this._renderType |= SpriteConst.STYLE;
        this._setBgStyleColor(0, 0, this.width, this.height, value);
        this._setRenderType(this._renderType);
        this.isChanged = true;
    }
    get_bgColor() {
        return this._style.bgColor;
    }
    /**
     * 文本边框背景颜色，以字符串表示。
     */
    get borderColor() {
        return this._style.borderColor;
    }
    set borderColor(value) {
        this._getTextStyle().borderColor = value;
        this._renderType |= SpriteConst.STYLE;
        this._setBorderStyleColor(0, 0, this.width, this.height, value, 1);
        this._setRenderType(this._renderType);
        this.isChanged = true;
    }
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * <p>默认值0，表示不描边。</p>
     */
    get stroke() {
        return this._style.stroke;
    }
    set stroke(value) {
        this._getTextStyle().stroke = value;
        this.isChanged = true;
    }
    /**
     * <p>描边颜色，以字符串表示。</p>
     * <p>默认值为 "#000000"（黑色）;</p>
     */
    get strokeColor() {
        return this._style.strokeColor;
    }
    set strokeColor(value) {
        this._getTextStyle().strokeColor = value;
        this.isChanged = true;
    }
    /**
     * @private
     * 一个布尔值，表示文本的属性是否有改变。若为true表示有改变。
     */
    set isChanged(value) {
        if (this._isChanged !== value) {
            this._isChanged = value;
            value && ILaya.systemTimer.callLater(this, this.typeset);
        }
    }
    /**
     * @private
     */
    _getContextFont() {
        return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
    }
    /**
     * @private
     */
    _isPassWordMode() {
        var style = this._style;
        var password = style.asPassword;
        if (("prompt" in this) && this['prompt'] == this._text)
            password = false;
        return password;
    }
    /**
     * @private
     */
    _getPassWordTxt(txt) {
        var len = txt.length;
        var word;
        word = "";
        for (var j = len; j > 0; j--) {
            word += "●";
        }
        return word;
    }
    /**
     * @private
     * 渲染文字。
     * @param	begin 开始渲染的行索引。
     * @param	visibleLineCount 渲染的行数。
     */
    _renderText() {
        var padding = this.padding;
        var visibleLineCount = this._lines.length;
        // overflow为scroll或visible时会截行
        if (this.overflow != Text.VISIBLE) {
            visibleLineCount = Math.min(visibleLineCount, Math.floor((this.height - padding[0] - padding[2]) / (this.leading + this._charSize.height)) + 1);
        }
        var beginLine = this.scrollY / (this._charSize.height + this.leading) | 0;
        var graphics = this.graphics;
        graphics.clear(true);
        var ctxFont = this._getContextFont();
        ILaya.Browser.context.font = ctxFont;
        //处理垂直对齐
        var startX = padding[3];
        var textAlgin = "left";
        var lines = this._lines;
        var lineHeight = this.leading + this._charSize.height;
        var tCurrBitmapFont = this._style.currBitmapFont;
        if (tCurrBitmapFont) {
            lineHeight = this.leading + tCurrBitmapFont.getMaxHeight();
        }
        var startY = padding[0];
        //处理水平对齐
        if ((!tCurrBitmapFont) && this._width > 0 && this._textWidth <= this._width) {
            if (this.align == "right") {
                textAlgin = "right";
                startX = this._width - padding[1];
            }
            else if (this.align == "center") {
                textAlgin = "center";
                startX = this._width * 0.5 + padding[3] - padding[1];
            }
        }
        if (this._height > 0) {
            var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
            if (tempVAlign === "middle")
                startY = (this._height - visibleLineCount * lineHeight) * 0.5 + padding[0] - padding[2];
            else if (tempVAlign === "bottom")
                startY = this._height - visibleLineCount * lineHeight - padding[2];
        }
        var style = this._style;
        //drawBg(style);
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            var bitmapScale = tCurrBitmapFont.fontSize / this.fontSize;
        }
        //渲染
        if (this._clipPoint) {
            graphics.save();
            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                var tClipWidth;
                var tClipHeight;
                this._width ? tClipWidth = (this._width - padding[3] - padding[1]) : tClipWidth = this._textWidth;
                this._height ? tClipHeight = (this._height - padding[0] - padding[2]) : tClipHeight = this._textHeight;
                tClipWidth *= bitmapScale;
                tClipHeight *= bitmapScale;
                graphics.clipRect(padding[3], padding[0], tClipWidth, tClipHeight);
            }
            else {
                graphics.clipRect(padding[3], padding[0], this._width ? (this._width - padding[3] - padding[1]) : this._textWidth, this._height ? (this._height - padding[0] - padding[2]) : this._textHeight);
            }
            this.repaint();
        }
        var password = style.asPassword;
        // 输入框的prompt始终显示明文
        if (("prompt" in this) && this['prompt'] == this._text)
            password = false;
        var x = 0, y = 0;
        var end = Math.min(this._lines.length, visibleLineCount + beginLine) || 1;
        for (var i = beginLine; i < end; i++) {
            var word = lines[i];
            var _word;
            if (password) {
                var len = word.length;
                word = "";
                for (var j = len; j > 0; j--) {
                    word += "●";
                }
            }
            if (word == null)
                word = "";
            x = startX - (this._clipPoint ? this._clipPoint.x : 0);
            y = startY + lineHeight * i - (this._clipPoint ? this._clipPoint.y : 0);
            this.underline && this._drawUnderline(textAlgin, x, y, i);
            if (tCurrBitmapFont) {
                var tWidth = this.width;
                if (tCurrBitmapFont.autoScaleSize) {
                    tWidth = this.width * bitmapScale;
                }
                tCurrBitmapFont._drawText(word, this, x, y, this.align, tWidth);
            }
            else {
                this._words || (this._words = []);
                if (this._words.length > (i - beginLine)) {
                    _word = this._words[i - beginLine];
                }
                else {
                    _word = new WordText();
                    this._words.push(_word);
                }
                _word.setText(word);
                _word.splitRender = this._singleCharRender;
                style.stroke ? graphics.fillBorderText(_word, x, y, ctxFont, this.color, style.strokeColor, style.stroke, textAlgin) : graphics.fillText(_word, x, y, ctxFont, this.color, textAlgin);
            }
        }
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            var tScale = 1 / bitmapScale;
            this.scale(tScale, tScale);
        }
        if (this._clipPoint)
            graphics.restore();
        this._startX = startX;
        this._startY = startY;
    }
    /**
     * @private
     * 绘制下划线
     * @param	x 本行坐标
     * @param	y 本行坐标
     * @param	lineIndex 本行索引
     */
    _drawUnderline(align, x, y, lineIndex) {
        var lineWidth = this._lineWidths[lineIndex];
        switch (align) {
            case 'center':
                x -= lineWidth / 2;
                break;
            case 'right':
                x -= lineWidth;
                break;
            case 'left':
            default:
                break;
        }
        y += this._charSize.height;
        this._graphics.drawLine(x, y, x + lineWidth, y, this.underlineColor || this.color, 1);
    }
    /**
     * <p>排版文本。</p>
     * <p>进行宽高计算，渲染、重绘文本。</p>
     */
    typeset() {
        this._isChanged = false;
        if (!this._text) {
            this._clipPoint = null;
            this._textWidth = this._textHeight = 0;
            this.graphics.clear(true);
            return;
        }
        if (ILaya.Render.isConchApp) {
            window.conchTextCanvas.font = this._getContextFont();
            ;
        }
        else {
            ILaya.Browser.context.font = this._getContextFont();
        }
        this._lines.length = 0;
        this._lineWidths.length = 0;
        if (this._isPassWordMode()) //如果是password显示状态应该使用密码符号计算
         {
            this._parseLines(this._getPassWordTxt(this._text));
        }
        else
            this._parseLines(this._text);
        this._evalTextSize();
        //启用Viewport
        if (this._checkEnabledViewportOrNot())
            this._clipPoint || (this._clipPoint = new Point(0, 0));
        //否则禁用Viewport
        else
            this._clipPoint = null;
        this._renderText();
    }
    /**@private */
    _evalTextSize() {
        var nw, nh;
        nw = Math.max.apply(this, this._lineWidths);
        //计算textHeight
        if (this._style.currBitmapFont)
            nh = this._lines.length * (this._style.currBitmapFont.getMaxHeight() + this.leading) + this.padding[0] + this.padding[2];
        else
            nh = this._lines.length * (this._charSize.height + this.leading) + this.padding[0] + this.padding[2];
        if (nw != this._textWidth || nh != this._textHeight) {
            this._textWidth = nw;
            this._textHeight = nh;
            //TODO:
            //if (!_width || !_height)
            //conchModel && conchModel.size(_width || _textWidth, _height || _textHeight);
        }
    }
    /**@private */
    _checkEnabledViewportOrNot() {
        return this.overflow == Text.SCROLL && ((this._width > 0 && this._textWidth > this._width) || (this._height > 0 && this._textHeight > this._height)); // 设置了宽高并且超出了
    }
    /**
     * <p>快速更改显示文本。不进行排版计算，效率较高。</p>
     * <p>如果只更改文字内容，不更改文字样式，建议使用此接口，能提高效率。</p>
     * @param text 文本内容。
     */
    changeText(text) {
        if (this._text !== text) {
            this.lang(text + "");
            if (this._graphics && this._graphics.replaceText(this._text)) {
                //repaint();
            }
            else {
                this.typeset();
            }
        }
    }
    /**
     * @private
     * 分析文本换行。
     */
    _parseLines(text) {
        //自动换行和HIDDEN都需要计算换行位置或截断位置
        var needWordWrapOrTruncate = this.wordWrap || this.overflow == Text.HIDDEN;
        if (needWordWrapOrTruncate) {
            var wordWrapWidth = this._getWordWrapWidth();
        }
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont) {
            this._charSize.width = bitmapFont.getMaxWidth();
            this._charSize.height = bitmapFont.getMaxHeight();
        }
        else {
            var measureResult = null;
            if (ILaya.Render.isConchApp) {
                measureResult = window.conchTextCanvas.measureText(Text._testWord);
            }
            else {
                measureResult = ILaya.Browser.context.measureText(Text._testWord);
            }
            if (!measureResult)
                measureResult = { width: 100 };
            this._charSize.width = measureResult.width;
            this._charSize.height = (measureResult.height || this.fontSize);
        }
        var lines = text.replace(/\r\n/g, "\n").split("\n");
        for (var i = 0, n = lines.length; i < n; i++) {
            var line = lines[i];
            // 开启了自动换行需要计算换行位置
            // overflow为hidden需要计算截断位置
            if (needWordWrapOrTruncate)
                this._parseLine(line, wordWrapWidth);
            else {
                this._lineWidths.push(this._getTextWidth(line));
                this._lines.push(line);
            }
        }
    }
    /**
     * @private
     * 解析行文本。
     * @param	line 某行的文本。
     * @param	wordWrapWidth 文本的显示宽度。
     */
    _parseLine(line, wordWrapWidth) {
        var lines = this._lines;
        var maybeIndex = 0;
        var charsWidth;
        var wordWidth;
        var startIndex;
        charsWidth = this._getTextWidth(line);
        //优化1，如果一行小于宽度，则直接跳过遍历
        if (charsWidth <= wordWrapWidth) {
            lines.push(line);
            this._lineWidths.push(charsWidth);
            return;
        }
        charsWidth = this._charSize.width;
        //优化2，预算第几个字符会超出，减少遍历及字符宽度度量
        maybeIndex = Math.floor(wordWrapWidth / charsWidth);
        (maybeIndex == 0) && (maybeIndex = 1);
        charsWidth = this._getTextWidth(line.substring(0, maybeIndex));
        wordWidth = charsWidth;
        for (var j = maybeIndex, m = line.length; j < m; j++) {
            // 逐字符测量后加入到总宽度中，在某些情况下自动换行不准确。
            // 目前已知在全是字符1的自动换行就会出现这种情况。
            // 考虑性能，保留这种非方式。
            charsWidth = this._getTextWidth(line.charAt(j));
            wordWidth += charsWidth;
            if (wordWidth > wordWrapWidth) {
                if (this.wordWrap) {
                    //截断换行单词
                    var newLine = line.substring(startIndex, j);
                    if (newLine.charCodeAt(newLine.length - 1) < 255) {
                        //按照英文单词字边界截取 因此将会无视中文
                        var execResult = /(?:\w|-)+$/.exec(newLine);
                        if (execResult) {
                            j = execResult.index + startIndex;
                            //此行只够容纳这一个单词 强制换行
                            if (execResult.index == 0)
                                j += newLine.length;
                            //此行有多个单词 按单词分行
                            else
                                newLine = line.substring(startIndex, j);
                        }
                    }
                    //如果自动换行，则另起一行
                    lines.push(newLine);
                    this._lineWidths.push(wordWidth - charsWidth);
                    //如果非自动换行，则只截取字符串
                    startIndex = j;
                    if (j + maybeIndex < m) {
                        j += maybeIndex;
                        charsWidth = this._getTextWidth(line.substring(startIndex, j));
                        wordWidth = charsWidth;
                        j--;
                    }
                    else {
                        //此处执行将不会在循环结束后再push一次
                        lines.push(line.substring(startIndex, m));
                        this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                        startIndex = -1;
                        break;
                    }
                }
                else if (this.overflow == Text.HIDDEN) {
                    lines.push(line.substring(0, j));
                    this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                    return;
                }
            }
        }
        if (this.wordWrap && startIndex != -1) {
            lines.push(line.substring(startIndex, m));
            this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
        }
    }
    /**@private */
    _getTextWidth(text) {
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont)
            return bitmapFont.getTextWidth(text);
        else {
            if (ILaya.Render.isConchApp) {
                return window.conchTextCanvas.measureText(text).width;
                ;
            }
            else
                return ILaya.Browser.context.measureText(text).width;
        }
    }
    /**
     * @private
     * 获取换行所需的宽度。
     */
    _getWordWrapWidth() {
        var p = this.padding;
        var w;
        var bitmapFont = this._style.currBitmapFont;
        if (bitmapFont && bitmapFont.autoScaleSize)
            w = this._width * (bitmapFont.fontSize / this.fontSize);
        else
            w = this._width;
        if (w <= 0) {
            w = this.wordWrap ? 100 : ILaya.Browser.width;
        }
        w <= 0 && (w = 100);
        return w - p[3] - p[1];
    }
    /**
     * 返回字符在本类实例的父坐标系下的坐标。
     * @param charIndex	索引位置。
     * @param out		（可选）输出的Point引用。
     * @return Point 字符在本类实例的父坐标系下的坐标。如果out参数不为空，则将结果赋值给指定的Point对象，否则创建一个新的Point对象返回。建议使用Point.TEMP作为out参数，可以省去Point对象创建和垃圾回收的开销，尤其是在需要频繁执行的逻辑中，比如帧循环和MOUSE_MOVE事件回调函数里面。
     */
    getCharPoint(charIndex, out = null) {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        var len = 0, lines = this._lines, startIndex = 0;
        for (var i = 0, n = lines.length; i < n; i++) {
            len += lines[i].length;
            if (charIndex < len) {
                var line = i;
                break;
            }
            startIndex = len;
        }
        //计算字符的宽度
        var ctxFont = (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + this.font;
        ILaya.Browser.context.font = ctxFont;
        var width = this._getTextWidth(this._text.substring(startIndex, charIndex));
        var point = out || new Point();
        return point.setTo(this._startX + width - (this._clipPoint ? this._clipPoint.x : 0), this._startY + line * (this._charSize.height + this.leading) - (this._clipPoint ? this._clipPoint.y : 0));
    }
    /**
     * <p>设置横向滚动量。</p>
     * <p>即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。</p>
     */
    set scrollX(value) {
        if (this.overflow != Text.SCROLL || (this.textWidth < this._width || !this._clipPoint))
            return;
        value = value < this.padding[3] ? this.padding[3] : value;
        var maxScrollX = this._textWidth - this._width;
        value = value > maxScrollX ? maxScrollX : value;
        this._clipPoint.x = value;
        this._renderText();
    }
    /**
     * 获取横向滚动量。
     */
    get scrollX() {
        if (!this._clipPoint)
            return 0;
        return this._clipPoint.x;
    }
    /**
     * 设置纵向滚动量（px)。即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。
     */
    set scrollY(value) {
        if (this.overflow != Text.SCROLL || (this.textHeight < this._height || !this._clipPoint))
            return;
        value = value < this.padding[0] ? this.padding[0] : value;
        var maxScrollY = this._textHeight - this._height;
        value = value > maxScrollY ? maxScrollY : value;
        this._clipPoint.y = value;
        this._renderText();
    }
    /**
     * 获取纵向滚动量。
     */
    get scrollY() {
        if (!this._clipPoint)
            return 0;
        return this._clipPoint.y;
    }
    /**
     * 获取横向可滚动最大值。
     */
    get maxScrollX() {
        return (this.textWidth < this._width) ? 0 : this._textWidth - this._width;
    }
    /**
     * 获取纵向可滚动最大值。
     */
    get maxScrollY() {
        return (this.textHeight < this._height) ? 0 : this._textHeight - this._height;
    }
    /**返回文字行信息*/
    get lines() {
        if (this._isChanged)
            this.typeset();
        return this._lines;
    }
    /**下划线的颜色，为null则使用字体颜色。*/
    get underlineColor() {
        return this._style.underlineColor;
    }
    set underlineColor(value) {
        this._getTextStyle().underlineColor = value;
        if (!this._isChanged)
            this._renderText();
    }
    /**是否显示下划线。*/
    get underline() {
        return this._style.underline;
    }
    set underline(value) {
        this._getTextStyle().underline = value;
    }
    /** 设置是否单个字符渲染，如果Textd的内容一直改变，例如是一个增加的数字，就设置这个，防止无效占用缓存 */
    set singleCharRender(value) {
        this._singleCharRender = value;
    }
    get singleCharRender() {
        return this._singleCharRender;
    }
}
/**visible不进行任何裁切。*/
Text.VISIBLE = "visible";
/**scroll 不显示文本域外的字符像素，并且支持 scroll 接口。*/
Text.SCROLL = "scroll";
/**hidden 不显示超出文本域的字符。*/
Text.HIDDEN = "hidden";
/**默认文本大小，默认为12*/
Text.defaultFontSize = 12;
/**默认文本字体，默认为Arial*/
Text.defaultFont = "Arial";
/**WebGL下，文字会被拆分为单个字符进行渲染，一些语系不能拆开显示，比如阿拉伯文，这时可以设置isComplexText=true，禁用文字拆分。*/
Text.isComplexText = false;
/**在IOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加*/
Text.fontFamilyMap = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };
/**@private 预测长度的文字，用来提升计算效率，不同语言找一个最大的字符即可*/
Text._testWord = "游";
//TODO:
Text.CharacterCache = true;
/**是否是从右向左的显示顺序*/
Text.RightToLeft = false;
ILaya.regClass(Text);
