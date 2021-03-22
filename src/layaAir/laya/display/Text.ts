import { Sprite } from "./Sprite";
import { BitmapFont } from "./BitmapFont";
import { SpriteConst } from "./SpriteConst";
import { Graphics } from "./Graphics";
import { SpriteStyle } from "./css/SpriteStyle"
import { TextStyle } from "./css/TextStyle"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { WordText } from "../utils/WordText"
import { Timer } from "../utils/Timer";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";

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

    /**visible不进行任何裁切。*/
    static VISIBLE: string = "visible";
    /**scroll 不显示文本域外的字符像素，并且支持 scroll 接口。*/
    static SCROLL: string = "scroll";
    /**hidden 不显示超出文本域的字符。*/
    static HIDDEN: string = "hidden";

    /**默认文本大小，默认为12*/
    static defaultFontSize: number = 12;
    /**默认文本字体，默认为Arial*/
    static defaultFont: string = "Arial";

    /**@private */
    static defaultFontStr(): string {
        return Text.defaultFontSize + "px " + Text.defaultFont;
    }
    /**语言包，是一个包含key:value的集合，用key索引，替换为目标value语言*/
    static langPacks: any;
    /**WebGL下，文字会被拆分为单个字符进行渲染，一些语系不能拆开显示，比如阿拉伯文，这时可以设置isComplexText=true，禁用文字拆分。*/
    static isComplexText: boolean = false;
    /**在IOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加*/
    static fontFamilyMap: any = { "报隶": "报隶-简", "黑体": "黑体-简", "楷体": "楷体-简", "兰亭黑": "兰亭黑-简", "隶变": "隶变-简", "凌慧体": "凌慧体-简", "翩翩体": "翩翩体-简", "苹方": "苹方-简", "手札体": "手札体-简", "宋体": "宋体-简", "娃娃体": "娃娃体-简", "魏碑": "魏碑-简", "行楷": "行楷-简", "雅痞": "雅痞-简", "圆体": "圆体-简" };
    /**@internal 预测长度的文字，用来提升计算效率，不同语言找一个最大的字符即可*/
    static _testWord: string = "游";
    /**@private 位图字体字典。*/
    private static _bitmapFonts: any;
    //TODO:
    static CharacterCache: boolean = true;
    /**是否是从右向左的显示顺序*/
    static RightToLeft: boolean = false;

    /**@private */
    private _clipPoint: Point|null;
    /**@private 表示文本内容字符串。*/
    protected _text: string;
    /**@private 表示文本内容是否发生改变。*/
    protected _isChanged: boolean;
    /**@private 表示文本的宽度，以像素为单位。*/
    protected _textWidth: number = 0;
    /**@private 表示文本的高度，以像素为单位。*/
    protected _textHeight: number = 0;
    /**@private 存储文字行数信息。*/
    protected _lines: any[]|null = [];
    /**@private 保存每行宽度*/
    protected _lineWidths: number[]|null = [];
    /**@private 文本的内容位置 X 轴信息。*/
    protected _startX: number = 0;
    /**@private 文本的内容位置X轴信息。 */
    protected _startY: number = 0;
    /**@private */
    protected _words: WordText[]|null;
    /**@private */
    protected _charSize: any = {};
    /**@private */
    protected _valign: string = "top";
    /**@internal */
    _fontSize: number = Text.defaultFontSize;
    /**@internal */
    _font: string = Text.defaultFont;
    /**@internal */
    _color: string = "#000000";

    /**@private */
    private _singleCharRender: boolean = false;	// 拆分渲染

    /**
     * <p>overflow 指定文本超出文本域后的行为。其值为"hidden"、"visible"和"scroll"之一。</p>
     * <p>性能从高到低依次为：hidden > visible > scroll。</p>
     */
    overflow: string = Text.VISIBLE;

    /**
     * 创建一个新的 <code>Text</code> 实例。
     */
    constructor() {
        super();
        this._style = TextStyle.EMPTY;
    }

    /**
     * @private
     * 获取样式。
     * @return  样式 Style 。
     * @override
     */
    getStyle(): SpriteStyle {
        this._style === TextStyle.EMPTY && (this._style = TextStyle.create());
        return this._style;
    }

    protected _getTextStyle(): TextStyle {
        if (this._style === TextStyle.EMPTY) {
            this._style = TextStyle.create();
        }
        return (<TextStyle>this._style);
    }

    /**
     * 注册位图字体。
     * @param	name		位图字体的名称。
     * @param	bitmapFont	位图字体文件。
     */
    static registerBitmapFont(name: string, bitmapFont: BitmapFont): void {
        Text._bitmapFonts || (Text._bitmapFonts = {});
        Text._bitmapFonts[name] = bitmapFont;
    }

    /**
     * 移除注册的位图字体文件。
     * @param	name		位图字体的名称。
     * @param	destroy		是否销毁指定的字体文件。
     */
    static unregisterBitmapFont(name: string, destroy: boolean = true): void {
        if (Text._bitmapFonts && Text._bitmapFonts[name]) {
            var tBitmapFont: BitmapFont = Text._bitmapFonts[name];
            if (destroy) tBitmapFont.destroy();
            delete Text._bitmapFonts[name];
        }
    }

    /**
     * @inheritDoc 
     * @override
    */
    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
        this._clipPoint = null;
        this._lines = null;
        this._lineWidths = null;

        // 注意_words是一个数组（例如有换行）
        this._words && this._words.forEach(function (w: WordText): void {
            w.cleanCache();
        });
        this._words = null;

        this._charSize = null;
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    _getBoundPointsM(ifRotate: boolean = false): any[] {
        var rec: Rectangle = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec._getBoundPoints();
    }

    /**
     * @inheritDoc
     * @override
     */
    getGraphicBounds(realSize: boolean = false): Rectangle {
        var rec: Rectangle = Rectangle.TEMP;
        rec.setTo(0, 0, this.width, this.height);
        return rec;
    }

    /**
     * @inheritDoc
     * @override
     */
    get width(): number {
        if (this._width) return this._width;
        return this.textWidth + this.padding[1] + this.padding[3];
    }
    /**
     * @override
     */
    set width(value: number) {
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
    _getCSSStyle(): TextStyle {
        return (<TextStyle>this._style);
    }

    /**
     * @inheritDoc
     * @override
     */
    get height(): number {
        if (this._height) return this._height;
        return this.textHeight;
    }
    /**
     * @override
     */
    set height(value: number) {
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
    get textWidth(): number {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textWidth;
    }

    /**
     * 表示文本的高度，以像素为单位。
     */
    get textHeight(): number {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        return this._textHeight;
    }

    /** 当前文本的内容字符串。*/
    get text(): string {
        return this._text || "";
    }

    // 为了转ts。ts不支持super.get set
    get_text(): string {
        return this._text || "";
    }
    set_text(value: string): void {
        if (this._text !== value) {
            this.lang(value + "");
            this.isChanged = true;
            this.event(Event.CHANGE);
            if (this.borderColor) {
                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
            }
        }
    }

    set text(value: string) {
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
    lang(text: string, arg1: any = null, arg2: any = null, arg3: any = null, arg4: any = null, arg5: any = null, arg6: any = null, arg7: any = null, arg8: any = null, arg9: any = null, arg10: any = null): void {
        text = Text.langPacks && Text.langPacks[text] ? Text.langPacks[text] : text;
        if (arguments.length < 2) {
            this._text = text;
        } else {
            for (var i: number = 0, n: number = arguments.length; i < n; i++) {
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
    get font(): string {
        return this._font;
    }

    set font(value: string) {
        if (((<TextStyle>this._style)).currBitmapFont) {
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
    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(value: number) {
        if (this._fontSize != value) {
            this._fontSize = value;
            this.isChanged = true;
        }
    }

    /**
     * <p>指定文本是否为粗体字。</p>
     * <p>默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。</p>
     */
    get bold(): boolean {
        return ((<TextStyle>this._style)).bold;
    }

    set bold(value: boolean) {
        this._getTextStyle().bold = value;
        this.isChanged = true;
    }

    /**
     * <p>表示文本的颜色值。可以通过 <code>Text.defaultColor</code> 设置默认颜色。</p>
     * <p>默认值为黑色。</p>
     */
    get color(): string {
        return this._color;
    }

    set color(value: string) {
        this.set_color(value);
    }

    // for转ts。 ts不支持 super.get/set
    get_color(): string {
        return this._color;
    }
    set_color(value: string): void {
        if (this._color != value) {
            this._color = value;
            //如果仅仅更新颜色，无需重新排版
            if (!this._isChanged && this._graphics) {
                this._graphics.replaceTextColor(this.color)
            } else {
                this.isChanged = true;
            }
        }
    }

    /**
     * <p>表示使用此文本格式的文本是否为斜体。</p>
     * <p>默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。</p>
     */
    get italic(): boolean {
        return ((<TextStyle>this._style)).italic;
    }

    set italic(value: boolean) {
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
    get align(): string {
        return ((<TextStyle>this._style)).align;
    }

    set align(value: string) {
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
    get valign(): string {
        return this._valign;
    }

    set valign(value: string) {
        this._valign = value;
        this.isChanged = true;
    }

    /**
     * <p>表示文本是否自动换行，默认为false。</p>
     * <p>若值为true，则自动换行；否则不自动换行。</p>
     */
    get wordWrap(): boolean {
        return ((<TextStyle>this._style)).wordWrap;
    }

    set wordWrap(value: boolean) {
        this._getTextStyle().wordWrap = value;
        this.isChanged = true;
    }

    /**
     * 垂直行间距（以像素为单位）。
     */
    get leading(): number {
        return ((<TextStyle>this._style)).leading;
    }

    set leading(value: number) {
        this._getTextStyle().leading = value;
        this.isChanged = true;
    }

    /**
     * <p>边距信息。</p>
     * <p>数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。</p>
     */
    get padding(): any[] {
        return ((<TextStyle>this._style)).padding;
    }

    set padding(value: any[]) {
        if (typeof (value) == 'string') {
            var arr: any[];
            arr = ((<string>(value as any))).split(",");
            var i: number, len: number;
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
    get bgColor(): string {
        return ((<TextStyle>this._style)).bgColor;
    }

    set bgColor(value: string) {
        this.set_bgColor(value);
    }

    // fot ts
    set_bgColor(value: string): void {
        this._getTextStyle().bgColor = value;
        this._renderType |= SpriteConst.STYLE;
        this._setBgStyleColor(0, 0, this.width, this.height, value);
        this._setRenderType(this._renderType);
        this.isChanged = true;
    }
    get_bgColor(): string {
        return ((<TextStyle>this._style)).bgColor;
    }

    /**
     * 文本边框背景颜色，以字符串表示。
     */
    get borderColor(): string {
        return ((<TextStyle>this._style)).borderColor;
    }

    set borderColor(value: string) {
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
    get stroke(): number {
        return ((<TextStyle>this._style)).stroke;
    }

    set stroke(value: number) {
        this._getTextStyle().stroke = value;
        this.isChanged = true;
    }

    /**
     * <p>描边颜色，以字符串表示。</p>
     * <p>默认值为 "#000000"（黑色）;</p>
     */
    get strokeColor(): string {
        return ((<TextStyle>this._style)).strokeColor;
    }

    set strokeColor(value: string) {
        this._getTextStyle().strokeColor = value;
        this.isChanged = true;
    }

    /**
     * @private
     * 一个布尔值，表示文本的属性是否有改变。若为true表示有改变。
     */
    protected set isChanged(value: boolean) {
        if (this._isChanged !== value) {
            this._isChanged = value;
            value && ILaya.systemTimer.callLater(this, this.typeset);
        }
    }

    /**
     * @private
     */
    protected _getContextFont(): string {
        return (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + (ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
    }

    /**
     * @private
     */
    protected _isPassWordMode(): boolean {
        var style: TextStyle = (<TextStyle>this._style);
        var password: boolean = style.asPassword;
        if (("prompt" in (this as any)) && (this as any)['prompt'] == this._text)
            password = false;
        return password;
    }

    /**
     * @private
     */
    protected _getPassWordTxt(txt: string): string {
        var len: number = txt.length;
        var word: string;
        word = "";
        for (var j: number = len; j > 0; j--) {
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
    protected _renderText(): void {
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
        var tCurrBitmapFont = ((<TextStyle>this._style)).currBitmapFont;
        if (tCurrBitmapFont) {
            lineHeight = this.leading + tCurrBitmapFont.getMaxHeight();
        }
        var startY = padding[0];

        //处理水平对齐
        if ((!tCurrBitmapFont) && this._width > 0 && this._textWidth <= this._width) {
            if (this.align == "right") {
                textAlgin = "right";
                startX = this._width - padding[1];
            } else if (this.align == "center") {
                textAlgin = "center";
                startX = this._width * 0.5 + padding[3] - padding[1];
            }
        }

        //drawBg(style);
        let bitmapScale=1;
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            bitmapScale = tCurrBitmapFont.fontSize / this.fontSize;
        }

        if (this._height > 0) {
            var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
            if (tempVAlign === "middle")
                startY = (this._height - visibleLineCount /bitmapScale* lineHeight) * 0.5 + padding[0] - padding[2];
            else if (tempVAlign === "bottom")
                startY = this._height - visibleLineCount /bitmapScale* lineHeight - padding[2];
        }

        //渲染
        if (this._clipPoint) {
            graphics.save();
            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                var tClipWidth: number;
                var tClipHeight: number;

                this._width ? tClipWidth = (this._width - padding[3] - padding[1]) : tClipWidth = this._textWidth;
                this._height ? tClipHeight = (this._height - padding[0] - padding[2]) : tClipHeight = this._textHeight;

                tClipWidth *= bitmapScale;
                tClipHeight *= bitmapScale;

                graphics.clipRect(padding[3], padding[0], tClipWidth, tClipHeight);
            } else {
                graphics.clipRect(padding[3], padding[0], this._width ? (this._width - padding[3] - padding[1]) : this._textWidth, this._height ? (this._height - padding[0] - padding[2]) : this._textHeight);
            }
            this.repaint();
        }

        var style = <TextStyle>this._style;
        var password = style.asPassword;
        // 输入框的prompt始终显示明文
        if (("prompt" in (this as any)) && (this as any)['prompt'] == this._text)
            password = false;

        var x = 0, y = 0;
        var end = Math.min(this._lines.length, visibleLineCount + beginLine) || 1;
        for (var i = beginLine; i < end; i++) {
            var word = lines[i];
            var _word: any;
            if (password) {
                word = "";
                for (var j = word.length; j > 0; j--) {
                    word += "●";
                }
            }

            if (word == null) word = "";
            x = startX - (this._clipPoint ? this._clipPoint.x : 0);
            y = startY + lineHeight * i - (this._clipPoint ? this._clipPoint.y : 0);

            this.underline && this._drawUnderline(textAlgin, x, y, i);

            if (tCurrBitmapFont) {
                var tWidth = this.width;
                if (tCurrBitmapFont.autoScaleSize) {
                    tWidth = this.width * bitmapScale;
                    x*=bitmapScale;
                    y*=bitmapScale;
                }
                tCurrBitmapFont._drawText(word, this, x, y, this.align, tWidth);
            } else {
                this._words || (this._words = []);
                if (this._words.length > (i - beginLine)) {
                    _word = this._words[i - beginLine];
                } else {
                    _word = new WordText();
                    this._words.push(_word);
                }
                _word.setText(word);
                ((<WordText>_word)).splitRender = this._singleCharRender;
                style.stroke ? graphics.fillBorderText(_word, x, y, ctxFont, this.color, textAlgin, style.stroke, style.strokeColor) : graphics.fillText(_word, x, y, ctxFont, this.color, textAlgin);
            }
        }
        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
            var tScale = 1 / bitmapScale;
            this.scale(tScale, tScale);
        }

        if (this._clipPoint) graphics.restore();

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
    private _drawUnderline(align: string, x: number, y: number, lineIndex: number): void {
        var lineWidth: number = this._lineWidths[lineIndex];
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
    typeset(): void {
        this._isChanged = false;

        if (!this._text) {
            this._clipPoint = null;
            this._textWidth = this._textHeight = 0;
            this.graphics.clear(true);
            return;
        }

        if (ILaya.Render.isConchApp) {
            (window as any).conchTextCanvas.font = this._getContextFont();;
        } else {
            ILaya.Browser.context.font = this._getContextFont();
        }

        this._lines.length = 0;
        this._lineWidths.length = 0;
        if (this._isPassWordMode())//如果是password显示状态应该使用密码符号计算
        {
            this._parseLines(this._getPassWordTxt(this._text));
        } else
            this._parseLines(this._text);

        this._evalTextSize();
        //启用Viewport
        if (this._checkEnabledViewportOrNot()) this._clipPoint || (this._clipPoint = new Point(0, 0));
        //否则禁用Viewport
        else this._clipPoint = null;

        this._renderText();
    }

    /**@private */
    private _evalTextSize(): void {
        var nw: number, nh: number;
        nw = Math.max.apply(this, this._lineWidths);

        //计算textHeight
        let bmpFont = (this._style as TextStyle) .currBitmapFont;
        if (bmpFont){
            let h = bmpFont.getMaxHeight();
            if(bmpFont.autoScaleSize){
                h = this.fontSize;
            }
            nh = this._lines.length * (h + this.leading) + this.padding[0] + this.padding[2];
        }
        else{
			nh = this._lines.length * (this._charSize.height + this.leading) + this.padding[0] + this.padding[2];
			if(this._lines.length){
				nh-=this.leading; 	// 去掉最后一行的leading，否则多算了。
			}
		}
        if (nw != this._textWidth || nh != this._textHeight) {
            this._textWidth = nw;
            this._textHeight = nh;
            //TODO:
            //if (!_width || !_height)
            //conchModel && conchModel.size(_width || _textWidth, _height || _textHeight);
        }
    }

    /**@private */
    private _checkEnabledViewportOrNot(): boolean {
        return this.overflow == Text.SCROLL && ((this._width > 0 && this._textWidth > this._width) || (this._height > 0 && this._textHeight > this._height)); // 设置了宽高并且超出了
    }

    /**
     * <p>快速更改显示文本。不进行排版计算，效率较高。</p>
     * <p>如果只更改文字内容，不更改文字样式，建议使用此接口，能提高效率。</p>
     * @param text 文本内容。
     */
    changeText(text: string): void {
        if (this._text !== text) {
            this.lang(text + "");
            if (this._graphics && this._graphics.replaceText(this._text)) {
                //repaint();
            } else {
                this.typeset();
            }
        }
    }

    /**
     * @private
     * 分析文本换行。
     */
    protected _parseLines(text: string): void {
        //自动换行和HIDDEN都需要计算换行位置或截断位置
        var needWordWrapOrTruncate: boolean = this.wordWrap || this.overflow == Text.HIDDEN;
        if (needWordWrapOrTruncate) {
            var wordWrapWidth: number = this._getWordWrapWidth();
        }

        var bitmapFont: BitmapFont = ((<TextStyle>this._style)).currBitmapFont;
        if (bitmapFont) {
            this._charSize.width = bitmapFont.getMaxWidth();
            this._charSize.height = bitmapFont.getMaxHeight();
        } else {
            var measureResult: any = null;
            if (ILaya.Render.isConchApp) {
                measureResult = (window as any).conchTextCanvas.measureText(Text._testWord);
            } else {
                measureResult = ILaya.Browser.context.measureText(Text._testWord);
            }
            if (!measureResult) measureResult = { width: 100 };
            this._charSize.width = measureResult.width;
            this._charSize.height = (measureResult.height || this.fontSize);
        }

        var lines: any[] = text.replace(/\r\n/g, "\n").split("\n");
        for (var i: number = 0, n: number = lines.length; i < n; i++) {
            var line: string = lines[i];
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
    protected _parseLine(line: string, wordWrapWidth: number): void {
        var lines: any[] = this._lines;

        var maybeIndex: number = 0;
        var charsWidth: number = 0;
        var wordWidth: number = 0;
        var startIndex: number = 0;

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
        for (var j: number = maybeIndex, m: number = line.length; j < m; j++) {
            // 逐字符测量后加入到总宽度中，在某些情况下自动换行不准确。
            // 目前已知在全是字符1的自动换行就会出现这种情况。
            // 考虑性能，保留这种非方式。
            charsWidth = this._getTextWidth(line.charAt(j));
            wordWidth += charsWidth;
            if (wordWidth > wordWrapWidth) {
                if (this.wordWrap) {
                    //截断换行单词
                    var newLine: string = line.substring(startIndex, j);
                    if (newLine.charCodeAt(newLine.length - 1) < 255) {
                        //按照英文单词字边界截取 因此将会无视中文
                        var execResult = /(?:\w|-)+$/.exec(newLine);
                        if (execResult) {
                            j = execResult.index + startIndex;
                            //此行只够容纳这一个单词 强制换行
                            if (execResult.index == 0) j += newLine.length;
                            //此行有多个单词 按单词分行
                            else newLine = line.substring(startIndex, j);
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
                    } else {
                        //此处执行将不会在循环结束后再push一次
                        lines.push(line.substring(startIndex, m));
                        this._lineWidths.push(this._getTextWidth(lines[lines.length - 1]));
                        startIndex = -1;
                        break;
                    }
                } else if (this.overflow == Text.HIDDEN) {
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
    private _getTextWidth(text: string): number {
        var bitmapFont: BitmapFont = ((<TextStyle>this._style)).currBitmapFont;
        if (bitmapFont) return bitmapFont.getTextWidth(text);
        else {
            if (ILaya.Render.isConchApp) {
                return (window as any).conchTextCanvas.measureText(text).width;;
            }
            else{
				let ret = ILaya.Browser.context.measureText(text)||{width:100};
				return ret.width;
			}
        }
    }

    /**
     * @private
     * 获取换行所需的宽度。
     */
    private _getWordWrapWidth(): number {
        var p: any[] = this.padding;
        var w: number;
        var bitmapFont: BitmapFont = ((<TextStyle>this._style)).currBitmapFont;
        if (bitmapFont && bitmapFont.autoScaleSize) w = this._width * (bitmapFont.fontSize / this.fontSize);
        else w = this._width;

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
    getCharPoint(charIndex: number, out: Point = null): Point {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this.typeset);
        var len: number = 0, lines: any[] = this._lines, startIndex: number = 0;
        for (var i: number = 0, n: number = lines.length; i < n; i++) {
            len += lines[i].length;
            if (charIndex < len) {
                var line: number = i;
                break;
            }
            startIndex = len;
        }
        //计算字符的宽度
        var ctxFont: string = (this.italic ? "italic " : "") + (this.bold ? "bold " : "") + this.fontSize + "px " + this.font;
        ILaya.Browser.context.font = ctxFont;
        var width: number = this._getTextWidth(this._text.substring(startIndex, charIndex));
        var point: Point = out || new Point();
        return point.setTo(this._startX + width - (this._clipPoint ? this._clipPoint.x : 0), this._startY + line * (this._charSize.height + this.leading) - (this._clipPoint ? this._clipPoint.y : 0));
    }

    /**
     * <p>设置横向滚动量。</p>
     * <p>即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。</p>
     */
    set scrollX(value: number) {
        if (this.overflow != Text.SCROLL || (this.textWidth < this._width || !this._clipPoint)) return;

        value = value < this.padding[3] ? this.padding[3] : value;
        var maxScrollX: number = this._textWidth - this._width;
        value = value > maxScrollX ? maxScrollX : value;

        this._clipPoint.x = value;
        this._renderText();
    }

    /**
     * 获取横向滚动量。
     */
    get scrollX(): number {
        if (!this._clipPoint) return 0;
        return this._clipPoint.x;
    }

    /**
     * 设置纵向滚动量（px)。即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。
     */
    set scrollY(value: number) {
        if (this.overflow != Text.SCROLL || (this.textHeight < this._height || !this._clipPoint)) return;

        value = value < this.padding[0] ? this.padding[0] : value;
        var maxScrollY: number = this._textHeight - this._height;
        value = value > maxScrollY ? maxScrollY : value;

        this._clipPoint.y = value;
        this._renderText();
    }

    /**
     * 获取纵向滚动量。
     */
    get scrollY(): number {
        if (!this._clipPoint) return 0;
        return this._clipPoint.y;
    }

    /**
     * 获取横向可滚动最大值。
     */
    get maxScrollX(): number {
        return (this.textWidth < this._width) ? 0 : this._textWidth - this._width;
    }

    /**
     * 获取纵向可滚动最大值。
     */
    get maxScrollY(): number {
        return (this.textHeight < this._height) ? 0 : this._textHeight - this._height;
    }

    /**返回文字行信息*/
    get lines(): any[] {
        if (this._isChanged) this.typeset();
        return this._lines;
    }

    /**下划线的颜色，为null则使用字体颜色。*/
    get underlineColor(): string {
        return ((<TextStyle>this._style)).underlineColor;
    }

    set underlineColor(value: string) {
        this._getTextStyle().underlineColor = value;
        if (!this._isChanged) this._renderText();
    }

    /**是否显示下划线。*/
    get underline(): boolean {
        return ((<TextStyle>this._style)).underline;
    }

    set underline(value: boolean) {
        this._getTextStyle().underline = value;
    }

    /** 设置是否单个字符渲染，如果Textd的内容一直改变，例如是一个增加的数字，就设置这个，防止无效占用缓存 */
    set singleCharRender(value: boolean) {
        this._singleCharRender = value;
    }
    get singleCharRender(): boolean {
        return this._singleCharRender;
	}
/*	
	scale(scaleX: number, scaleY: number, speedMode: boolean = false): Sprite {
		super.scale(scaleX,scaleY, speedMode);
        // 注意_words是一个数组（例如有换行）
        this._words && this._words.forEach(function (w: WordText): void {
            w.cleanCache();
		});
		this.repaint();
		return this;
	}	
*/
}


ILaya.regClass(Text);
ClassUtils.regClass("laya.display.Text", Text);
ClassUtils.regClass("Laya.Text", Text);