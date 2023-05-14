import { Sprite } from "./Sprite";
import { BitmapFont } from "./BitmapFont";
import { TextStyle } from "./css/TextStyle"
import { Event } from "../events/Event"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { WordText } from "../utils/WordText"
import { ILaya } from "../../ILaya";
import { LayaEnv } from "../../LayaEnv";
import { Config } from "../../Config";
import { Utils } from "../utils/Utils";
import { DrawRectCmd } from "./cmd/DrawRectCmd";
import { HtmlElement, HtmlElementType } from "../html/HtmlElement";
import { HtmlImage } from "../html/HtmlImage";
import { HtmlLink } from "../html/HtmlLink";
import { Pool } from "../utils/Pool";
import { IHtmlObject } from "../html/IHtmlObject";
import { HideFlags } from "../Const";
import { HtmlParser } from "../html/HtmlParser";
import { UBBParser } from "../html/UBBParser";

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

    static FIT_HEIGHT = "height";
    static FIT_BOTH = "both";

    /**语言包，是一个包含key:value的集合，用key索引，替换为目标value语言*/
    static langPacks: Record<string, string>;
    /**是否是从右向左的显示顺序*/
    static RightToLeft: boolean = false;

    /**@internal 预测长度的文字，用来提升计算效率，不同语言找一个最大的字符即可*/
    static _testWord: string = "游";
    static _passwordChar = "●";

    /**@private 位图字体字典。*/
    private static _bitmapFonts: any;

    /** 标记此文本是否忽略语言包 */
    ignoreLang: boolean;

    /**表示文本内容字符串。*/
    protected _text: string;
    protected _overflow: string = Text.VISIBLE;
    protected _singleCharRender: boolean = false;	// 拆分渲染
    protected _textStyle: TextStyle;
    protected _prompt: string = '';
    /**输入提示符颜色。*/
    protected _promptColor: string;
    /**
     * 文本背景颜色，以字符串表示。
     */
    protected _bgColor: string;
    /**
     * 文本边框背景颜色，以字符串表示。
     */
    protected _borderColor: string;
    /**
     * <p>默认边距信息</p>
     * <p>[左边距，上边距，右边距，下边距]（边距以像素为单位）</p>
     */
    protected _padding: number[];
    /**
     * <p>表示使用此文本格式的文本字段是否自动换行。</p>
     * 如果 wordWrap 的值为 true，则该文本字段自动换行；如果值为 false，则该文本字段不自动换行。
     * @default false。
     */
    protected _wordWrap: boolean;

    /**
     * <p>指定文本字段是否是密码文本字段。</p>
     * 如果此属性的值为 true，则文本字段被视为密码文本字段，并使用星号而不是实际字符来隐藏输入的字符。如果为 false，则不会将文本字段视为密码文本字段。
     */
    protected _asPassword: boolean;

    /**表示文本内容是否发生改变。*/
    protected _isChanged: boolean;
    /**表示文本的宽度，以像素为单位。*/
    protected _textWidth: number = 0;
    /**表示文本的高度，以像素为单位。*/
    protected _textHeight: number = 0;
    protected _realFont: string;
    protected _bitmapFont: BitmapFont;
    protected _scrollPos: Point | null;
    protected _bgDrawCmd: DrawRectCmd;
    protected _html: boolean;
    protected _ubb: boolean;
    protected _lines: Array<ITextLine>;
    protected _elements: Array<HtmlElement>;
    protected _objContainer: Sprite;
    protected _maxWidth: number;

    private _updatingLayout: boolean;

    /** @internal */
    _onPostLayout: () => void;

    /**
     * 创建一个新的 <code>Text</code> 实例。
     */
    constructor() {
        super();

        this._textStyle = new TextStyle();
        this._textStyle.fontSize = Config.defaultFontSize;
        this.font = "";
        this._elements = [];
        this._lines = [];
        this._padding = [0, 0, 0, 0];
    }

    /**
     * 注册位图字体。
     * @param	name		位图字体的名称。
     * @param	bitmapFont	位图字体文件。
     */
    static registerBitmapFont(name: string, bitmapFont: BitmapFont): void {
        Text._bitmapFonts || (Text._bitmapFonts = {});
        bitmapFont._addReference();
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
            tBitmapFont._removeReference();
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

        recoverLines(this._lines);
        HtmlElement.returnToPool(this._elements);
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
    get_width(): number {
        if (this._isWidthSet) return this._width;
        return this.textWidth;
    }
    /**
     * @override
     */
    _setWidth(value: number) {
        super._setWidth(value);
        if (!this._updatingLayout)
            this.markChanged();
        else
            this.drawBg();
    }

    /**
     * @inheritDoc
     * @override
     */
    get_height(): number {
        if (this._isHeightSet) return this._height;
        return this.textHeight;
    }
    /**
     * @override
     */
    _setHeight(value: number) {
        super._setHeight(value);
        if (!this._updatingLayout)
            this.markChanged();
        else
            this.drawBg();
    }

    /**
     * 表示文本的宽度，以像素为单位。
     */
    get textWidth(): number {
        this.typeset();
        return this._textWidth;
    }

    /**
     * 表示文本的高度，以像素为单位。
     */
    get textHeight(): number {
        this.typeset();
        return this._textHeight;
    }

    /** 当前文本的内容字符串。*/
    get text(): string {
        return this._text || "";
    }

    set_text(value: string): void {
        if (this._text !== value) {
            this.lang(value + "");
            this.markChanged();
            this.event(Event.CHANGE);
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
     * @param	args 文本替换参数。
     */
    lang(text: string, ...args: any[]): void {
        if (this.ignoreLang) {
            this._text = text;
            return;
        }

        text = Text.langPacks?.[text] || text;
        if (args.length == 0) {
            this._text = text;
        } else {
            for (let i = 0, n = args.length; i < n; i++)
                text = text.replace("{" + i + "}", args[i]);
            this._text = text;
        }
    }

    /** @deprecated **/
    changeText(text: string): void {
        this.text = text;
    }

    /**
     * <p>文本的字体名称，以字符串形式表示。</p>
     * <p>默认值为："Arial"，可以通过Config.defaultFont设置默认字体。</p>
     * <p>如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。</p>
     */
    get font(): string {
        return this._textStyle.font;
    }

    set font(value: string) {
        this._textStyle.font = value;
        if (!value) {
            value = Config.defaultFont;
            if (!value)
                value = "Arial";
        }

        if (Text._bitmapFonts && Text._bitmapFonts[value]) {
            this._realFont = value;
            this._bitmapFont = Text._bitmapFonts[value];
            if (this._text)
                this.markChanged();
        }
        else if (value && (Utils.getFileExtension(value) || value.startsWith("res://"))) {
            ILaya.loader.load(value).then(fontObj => {
                if (!fontObj)
                    return;

                if (fontObj instanceof BitmapFont)
                    this._bitmapFont = fontObj;
                else
                    this._realFont = fontObj.family;
                if (this._text)
                    this.markChanged();
            });
        }
        else {
            this._realFont = (ILaya.Browser.onIPhone ? (Config.fontFamilyMap[value] || value) : value);
            if (this._text)
                this.markChanged();
        }
    }

    /**
     * <p>指定文本的字体大小（以像素为单位）。</p>
     * <p>默认为20像素，可以通过 <code>Config.defaultFontSize</code> 设置默认大小。</p>
     */
    get fontSize(): number {
        return this._textStyle.fontSize;
    }

    set fontSize(value: number) {
        if (this._textStyle.fontSize != value) {
            this._textStyle.fontSize = value;
            this.markChanged();
        }
    }

    /**
     * <p>表示文本的颜色值。可以通过 <code>Text.defaultColor</code> 设置默认颜色。</p>
     * <p>默认值为黑色。</p>
     */
    get color(): string {
        return this._textStyle.color;
    }

    set color(value: string) {
        this.set_color(value);
    }

    set_color(value: string): void {
        if (this._textStyle.color != value) {
            this._textStyle.color = value;
            //如果仅仅更新颜色，无需重新排版
            if (!this._isChanged && this._graphics && this._elements.length == 0)
                this._graphics.replaceTextColor(this._textStyle.color);
            else
                this.markChanged();
        }
    }

    /**
     * <p>指定文本是否为粗体字。</p>
     * <p>默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。</p>
     */
    get bold(): boolean {
        return this._textStyle.bold;
    }

    set bold(value: boolean) {
        if (this._textStyle.bold != value) {
            this._textStyle.bold = value;
            this.markChanged();
        }
    }

    /**
     * <p>表示使用此文本格式的文本是否为斜体。</p>
     * <p>默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。</p>
     */
    get italic(): boolean {
        return this._textStyle.italic;
    }

    set italic(value: boolean) {
        if (this._textStyle.italic != value) {
            this._textStyle.italic = value;
            this.markChanged();
        }
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
        return this._textStyle.align;
    }

    set align(value: string) {
        if (this._textStyle.align != value) {
            this._textStyle.align = value;
            this.markChanged();
        }
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
        return this._textStyle.valign;
    }

    set valign(value: string) {
        if (this._textStyle.valign != value) {
            this._textStyle.valign = value;
            this.markChanged();
        }
    }

    /**
     * <p>表示文本是否自动换行，默认为false。</p>
     * <p>若值为true，则自动换行；否则不自动换行。</p>
     */
    get wordWrap(): boolean {
        return this._wordWrap;
    }

    set wordWrap(value: boolean) {
        if (this._wordWrap != value) {
            this._wordWrap = value;
            this.markChanged();
        }
    }

    /**
     * 垂直行间距（以像素为单位）。
     */
    get leading(): number {
        return this._textStyle.leading;
    }

    set leading(value: number) {
        if (this._textStyle.leading != value) {
            this._textStyle.leading = value;
            this.markChanged();
        }
    }

    /**
     * <p>边距信息。</p>
     * <p>数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。</p>
     */
    get padding(): number[] {
        return this._padding;
    }

    set padding(value: number[] | string) {
        if (typeof (value) == 'string') {
            let arr = value.split(",");
            this._padding.length = 0;
            for (let i = 0; i < 4; i++) {
                let v = parseFloat(arr[i]);
                if (isNaN(v))
                    v = 0;
                this._padding.push(v);
            }
        }
        else
            this._padding = value;
        this.markChanged();
    }

    /**
     * 文本背景颜色，以字符串表示。
     */
    get bgColor(): string {
        return this._bgColor;
    }

    set bgColor(value: string) {
        this._bgColor = value;
        this.drawBg();
    }

    /**
     * 文本边框背景颜色，以字符串表示。
     */
    get borderColor(): string {
        return this._borderColor;
    }

    set borderColor(value: string) {
        this._borderColor = value;
        this.drawBg();
    }

    /**
     * <p>描边宽度（以像素为单位）。</p>
     * <p>默认值0，表示不描边。</p>
     */
    get stroke(): number {
        return this._textStyle.stroke;
    }

    set stroke(value: number) {
        if (this._textStyle.stroke != value) {
            this._textStyle.stroke = value;
            this.markChanged();
        }
    }

    /**
     * <p>描边颜色，以字符串表示。</p>
     * <p>默认值为 "#000000"（黑色）;</p>
     */
    get strokeColor(): string {
        return this._textStyle.strokeColor;
    }

    set strokeColor(value: string) {
        if (this._textStyle.strokeColor != value) {
            this._textStyle.strokeColor = value;
            this.markChanged();
        }
    }

    /**
     * <p>overflow 指定文本超出文本域后的行为。其值为"hidden"、"visible"和"scroll"之一。</p>
     * <p>性能从高到低依次为：hidden > visible > scroll。</p>
     */
    get overflow(): string {
        return this._overflow;
    }

    set overflow(value: string) {
        if (this._overflow != value) {
            this._overflow = value;
            this.markChanged();
        }
    }

    /**是否显示下划线。*/
    get underline(): boolean {
        return this._textStyle.underline;
    }

    set underline(value: boolean) {
        if (this._textStyle.underline != value) {
            this._textStyle.underline = value;
            this.markChanged();
        }
    }

    /**下划线的颜色，为null则使用字体颜色。*/
    get underlineColor(): string {
        return this._textStyle.underlineColor;
    }

    set underlineColor(value: string) {
        if (this._textStyle.underlineColor != value) {
            this._textStyle.underlineColor = value;
            this.markChanged();
        }
    }

    get singleCharRender(): boolean {
        return this._singleCharRender;
    }

    /** 设置是否单个字符渲染，如果Textd的内容一直改变，例如是一个增加的数字，就设置这个，防止无效占用缓存 */
    set singleCharRender(value: boolean) {
        this._singleCharRender = value;
    }

    get html(): boolean {
        return this._html;
    }

    /** 设置是否富文本，支持html语法 */
    set html(value: boolean) {
        if (this._html != value) {
            this._html = value;
            this.markChanged();
        }
    }

    get ubb(): boolean {
        return this._ubb;
    }

    /** 设置是否使用UBB语法解析文本 */
    set ubb(value: boolean) {
        if (this._ubb != value) {
            this._ubb = value;
            this.markChanged();
        }
    }

    get maxWidth(): number {
        return this._maxWidth;
    }

    /** 设置当文本达到最大允许的宽度时，自定换行，设置为0则此限制不生效。*/
    set maxWidth(value: number) {
        if (this._maxWidth != value) {
            this._maxWidth = value;
            this.typeset();
        }
    }

    /**
    * <p>设置横向滚动量。</p>
    * <p>即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。</p>
    */
    set scrollX(value: number) {
        this.typeset();
        if (!this._scrollPos) return;

        let maxScrollX = this.maxScrollX;
        value = value < 0 ? 0 : value;
        value = value > maxScrollX ? maxScrollX : value;

        this._scrollPos.x = value;
        this.renderText();
    }

    /**
     * 获取横向滚动量。
     */
    get scrollX(): number {
        if (!this._scrollPos) return 0;
        return this._scrollPos.x;
    }

    /**
     * 设置纵向滚动量（px)。即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。
     */
    set scrollY(value: number) {
        this.typeset();
        if (!this._scrollPos) return;

        let maxScrollY = this.maxScrollY;
        value = value < 0 ? 0 : value;
        value = value > maxScrollY ? maxScrollY : value;

        this._scrollPos.y = value;
        this.renderText();
    }

    /**
     * 获取纵向滚动量。
     */
    get scrollY(): number {
        if (!this._scrollPos) return 0;
        return this._scrollPos.y;
    }

    /**
     * 获取横向可滚动最大值。
     */
    get maxScrollX(): number {
        let r = this.textWidth - this._width;
        return r < 0 ? 0 : r;
    }

    /**
     * 获取纵向可滚动最大值。
     */
    get maxScrollY(): number {
        let r = this.textHeight - this._height;
        return r < 0 ? 0 : r;
    }

    /**返回文字行信息*/
    get lines(): any[] {
        this.typeset();
        return this._lines;
    }

    /**
     * @private
     */
    protected markChanged() {
        if (!this._isChanged) {
            this._isChanged = true;
            ILaya.systemTimer.callLater(this, this._typeset);
        }
    }

    typeset() {
        this._isChanged && ILaya.systemTimer.runCallLater(this, this._typeset);
    }

    refreshLayout() {
        ILaya.systemTimer.callLater(this, this.doLayout);
    }

    get objContainer(): Sprite {
        if (!this._objContainer) {
            this._objContainer = new Sprite();
            this._objContainer.hideFlags |= HideFlags.HideAndDontSave;
            this.addChild(this._objContainer);
        }
        return this._objContainer;
    }

    /**
     * <p>排版文本。</p>
     * <p>进行宽高计算，渲染、重绘文本。</p>
     */
    private _typeset(): void {
        this._isChanged = false;
        if (this._destroyed)
            return;

        HtmlElement.returnToPool(this._elements);
        if (this._objContainer)
            this._objContainer.removeChildren();

        let text = this._text;
        let isPrompt: boolean;
        if (!text && this._prompt) {
            text = this._prompt;
            isPrompt = true;
        }

        if (!text) {
            this._textWidth = this._textHeight = 0;
            this._scrollPos = null;
            if (this._onPostLayout) {
                this._updatingLayout = true;
                this._onPostLayout();
                this._updatingLayout = false;
            }
            this.graphics.clear(true);
            this.drawBg();
            return;
        }

        let html = this._html;
        text = text.replace(/\r\n/g, "\n");
        if (this._ubb) {
            text = UBBParser.defaultParser.parse(text);
            html = true;
        }
        if (!isPrompt && this._asPassword)
            text = Text._passwordChar.repeat(text.length);

        let saveColor: string;
        if (isPrompt) {
            saveColor = this._textStyle.color;
            this._textStyle.color = this._promptColor;
        }
        if (html)
            HtmlParser.defaultParser.parse(text, this._textStyle, this._elements, null);
        else {
            let ele = HtmlElement.getFromPool(HtmlElementType.Text);
            Object.assign(ele.style, this._textStyle);
            ele.text = text;
            this._elements.push(ele);
        }
        if (isPrompt)
            this._textStyle.color = saveColor;

        this.doLayout();
    }

    /**
     * @private
     * 分析文本换行。
     */
    protected doLayout(): void {
        if (this._destroyed)
            return;

        this._updatingLayout = true;

        let wordWrap = this._wordWrap;
        let padding = this._padding;
        let wrapWidth: number;
        if (this._isWidthSet && (wordWrap || this._overflow == Text.HIDDEN)) {
            wrapWidth = this._width - padding[3] - padding[1];
            if (this._maxWidth > 0 && this._maxWidth < wrapWidth)
                wrapWidth = this._maxWidth;
        }
        else if (this._maxWidth > 0)
            wrapWidth = this._maxWidth;

        recoverLines(this._lines);

        let lineX = 0, lineY = 0;
        let curLine: ITextLine;
        let lastCmd: ITextCmd;
        let bfont = this._bitmapFont;
        let charWidth: number, charHeight: number;

        let getTextWidth = (text: string, style: TextStyle) => {
            if (bfont)
                return bfont.getTextWidth(text, style.fontSize);
            else {
                if (LayaEnv.isConch)
                    return (window as any).conchTextCanvas.measureText(text).width;
                else {
                    let ret = ILaya.Browser.context.measureText(text);
                    return ret ? ret.width : 100;
                }
            }
        };

        let buildLines = (text: string, style: TextStyle) => {
            if (bfont) {
                charWidth = bfont.getMaxWidth(style.fontSize);
                charHeight = bfont.getMaxHeight(style.fontSize);
            } else {
                let ctxFont = (style.italic ? "italic " : "") + (style.bold ? "bold " : "") + style.fontSize + "px " + this._realFont;
                (<any>style)._ctxFont = ctxFont; //缓存起来，避免renderText里又拼一次

                let mr: any;
                if (LayaEnv.isConch) {
                    (window as any).conchTextCanvas.font = ctxFont;
                    mr = (window as any).conchTextCanvas.measureText(Text._testWord);
                }
                else {
                    ILaya.Browser.context.font = ctxFont;
                    mr = ILaya.Browser.context.measureText(Text._testWord);
                }

                if (mr) {
                    charWidth = mr.width;
                    charHeight = Math.ceil(mr.height || style.fontSize);
                }
                else {
                    charWidth = 100;
                    charHeight = style.fontSize;
                }
            }

            let lines = text.split("\n");
            if (wrapWidth != null) {
                for (let i = 0, n = lines.length; i < n; i++) {
                    let line = lines[i];
                    wrapText(line, style);
                }
            }
            else {
                for (let i = 0, n = lines.length; i < n; i++) {
                    let line = lines[i];
                    if (line.length > 0)
                        addCmd(line, style, null);
                    endLine();
                    if (i != n - 1)
                        startLine();
                }
            }
        };

        let addCmd = (target: string | IHtmlObject, style: TextStyle, width?: number) => {
            let cmd: ITextCmd = cmdPool.length > 0 ? cmdPool.pop() : <any>{};
            lastCmd = cmd;
            cmd.x = lineX;
            cmd.y = lineY;
            if (typeof (target) === "string") {
                if (!width)
                    width = getTextWidth(target, style);
                if (!cmd.wt)
                    cmd.wt = new WordText();
                cmd.wt.setText(target);
                cmd.wt.width = width;
                cmd.wt.splitRender = this._singleCharRender;
                cmd.width = width;
                cmd.height = charHeight;
            }
            else {
                cmd.obj = target;
                cmd.x++;
                cmd.width = target.width + 2;
                cmd.height = target.height;
            }
            cmd.style = style;
            cmd.linkEnd = false;
            curLine.cmds.push(cmd);
            lineX += Math.round(cmd.width);
        };

        let endLine = () => {
            //计算行高
            let lineHeight = 0;
            for (let cmd of curLine.cmds) {
                if (cmd.height > lineHeight) lineHeight = cmd.height;
            }

            //调整元素y位置
            for (let cmd of curLine.cmds) {
                cmd.y = Math.floor((lineHeight - cmd.height) * 0.5);
            }

            if (lineHeight == 0)
                lineHeight = charHeight;
            lineHeight++; //预览一个像素用来放下划线

            curLine.height = lineHeight;
            curLine.width = lineX;
        };

        let startLine = () => {
            lineX = 0;
            if (curLine)
                lineY += curLine.height + this._textStyle.leading;

            curLine = linePool.length > 0 ? linePool.pop() : <any>{ cmds: [] };
            curLine.x = 0;
            curLine.y = lineY;
            this._lines.push(curLine);

            return curLine;
        };

        let wrapText = (text: string, style: TextStyle) => {
            let remainWidth = wrapWidth - lineX;
            if (remainWidth < charWidth && lineX != 0) {
                endLine();
                startLine();
                remainWidth = wrapWidth;
            }

            let tw = getTextWidth(text, style);
            //优化1，如果一行小于宽度，则直接跳过遍历
            if (tw <= remainWidth) {
                addCmd(text, style, tw);
                return;
            }

            let maybeIndex = 0;
            let wordWidth = 0;
            let startIndex = 0;

            let isEmoji = testEmoji(text);
            if (!isEmoji) {
                //优化2，预算第几个字符会超出，减少遍历及字符宽度度量
                maybeIndex = Math.floor(remainWidth / charWidth);
                (maybeIndex == 0) && (maybeIndex = 1);
                wordWidth = getTextWidth(text.substring(0, maybeIndex), style);
            }

            let len = text.length;
            for (let j = maybeIndex; j < len; j++) {
                // 逐字符测量后加入到总宽度中，在某些情况下自动换行不准确。
                // 目前已知在全是字符1的自动换行就会出现这种情况。
                // 考虑性能，保留这种非方式。
                tw = getTextWidth(text.charAt(j), style);
                wordWidth += tw;
                let isEmojiChar = false;
                if (isEmoji && j + 1 < len && testEmoji(text.charAt(j) + text.charAt(j + 1))) {
                    wordWidth += tw >> 1;
                    j++;
                    isEmojiChar = true;
                }

                // 如果j的位置已经超出范围，要从startIndex到j找到一个能拆分的地方
                if (wordWidth > remainWidth) {
                    if (isEmojiChar) {
                        if (wordWidth == tw + (tw >> 1)) {
                            //这里是代表第一个就是emoji表情的逻辑
                            j++;
                        } else {
                            j--;
                        }
                    }
                    if (wordWrap) {
                        //截断换行单词
                        let newLine = text.substring(startIndex, j);
                        // 如果最后一个是中文则直接截断，否则找空格或者-来拆分
                        let ccode = newLine.charCodeAt(newLine.length - 1)
                        if (ccode < 0x4e00 || ccode > 0x9fa5) {
                            //按照英文单词字边界截取 因此将会无视中文
                            let execResult = wordBoundaryTest.exec(newLine);// 找不是 空格和标点符号的
                            if (execResult) {
                                j = execResult.index + startIndex;
                                //此行只够容纳这一个单词 强制换行
                                if (execResult.index == 0)
                                    j += newLine.length;
                                //此行有多个单词 按单词分行
                                else
                                    newLine = text.substring(startIndex, j);
                            }
                        }

                        //如果自动换行，则另起一行
                        addCmd(newLine, style, wordWidth - tw);
                        endLine();
                        startLine();
                        remainWidth = wrapWidth;
                        //如果非自动换行，则只截取字符串

                        startIndex = j;
                        if (j + maybeIndex < len) {
                            j += maybeIndex;

                            tw = getTextWidth(text.substring(startIndex, j), style);
                            wordWidth = tw;
                            j--;
                        } else {
                            //此处执行将不会在循环结束后再push一次
                            addCmd(text.substring(startIndex, len), style);
                            startIndex = -1;
                            break;
                        }
                    } else if (this._overflow == Text.HIDDEN) {
                        addCmd(text.substring(0, j), style);
                        return;
                    }
                }
            }
            if (this.wordWrap && startIndex != -1)
                addCmd(text.substring(startIndex, len), style);
        };

        startLine();

        let elements = this._elements;
        for (let i = 0, n = elements.length; i < n; i++) {
            let ele = elements[i];
            if (ele.type == HtmlElementType.Text) {
                buildLines(ele.text, ele.style);
            }
            else if (ele.type == HtmlElementType.LinkEnd) {
                if (lastCmd)
                    lastCmd.linkEnd = true;
            }
            else {
                let htmlObj = ele.obj;
                if (!htmlObj) {
                    let cls: any;
                    if (ele.type == HtmlElementType.Image)
                        cls = HtmlImage;
                    else if (ele.type == HtmlElementType.Link)
                        cls = HtmlLink;
                    if (cls) {
                        htmlObj = Pool.createByClass(cls);
                        htmlObj.create(this, ele);
                        ele.obj = htmlObj;
                    }
                }

                if (htmlObj) {
                    if (wrapWidth != null) {
                        let remainWidth = wrapWidth - lineX;
                        if (remainWidth < htmlObj.width + 1) {
                            if (lineX > 0) { //如果已经是开始位置了，就算放不下也不换行
                                endLine();
                                startLine();
                            }
                        }
                    }
                    addCmd(htmlObj, ele.style);
                }
            }
        }

        endLine();

        //计算textWidth和textHeight

        let nw: number = 0, nh: number;
        for (let line of this._lines) {
            if (line.width > nw)
                nw = line.width;
        }
        if (nw > 0)
            nw += padding[1] + padding[3];
        this._textWidth = nw;

        let lastLine = this._lines[this._lines.length - 1];
        nh = lastLine.y + lastLine.height;
        if (nh > 0)
            nh += padding[0] + padding[2];
        this._textHeight = nh;

        if (this._onPostLayout)
            this._onPostLayout();

        //处理水平对齐
        let align = this._textStyle.align == "center" ? 1 : (this._textStyle.align == "right" ? 2 : 0);
        if (align != 0 && this._isWidthSet) {
            let rectWidth = this._width - padding[3] - padding[1];
            for (let line of this._lines) {
                let offsetX = 0;
                if (align == 1)
                    offsetX = Math.floor((rectWidth - line.width) * 0.5);
                else if (align == 2)
                    offsetX = rectWidth - line.width;

                if (offsetX > 0)
                    line.x = offsetX;
            }
        }

        //处理垂直对齐
        if (this._isHeightSet && this._textHeight < this._height) {
            let offsetY = 0;
            if (this._textStyle.valign === "middle")
                offsetY = Math.floor((this._height - this._textHeight) * 0.5);
            else if (this._textStyle.valign === "bottom")
                offsetY = this._height - this._textHeight;

            if (offsetY > 0) {
                for (let line of this._lines) {
                    line.y += offsetY;
                }
            }
        }

        if (this._overflow == Text.SCROLL
            && (this._isWidthSet && this._textWidth > this._width || this._isHeightSet && this._textHeight > this._height)) {
            if (!this._scrollPos)
                this._scrollPos = new Point(0, 0);
            else {
                let maxScrollX = this.maxScrollX;
                let maxScrollY = this.maxScrollY;
                if (this._scrollPos.x > maxScrollX)
                    this._scrollPos.x = maxScrollX;
                if (this._scrollPos.y > maxScrollY)
                    this._scrollPos.y = maxScrollY;
            }
        }
        else
            this._scrollPos = null;

        if (this._objContainer) {
            this._objContainer.size(this._width, this._height);

            if (this._scrollPos) {
                if (!this._objContainer.scrollRect)
                    this._objContainer.scrollRect = new Rectangle();
                this._objContainer.scrollRect.setTo(0, 0, this._width, this._height);
            }
            else
                this._objContainer.scrollRect = null;
        }

        this._updatingLayout = false;

        this.renderText();
    }

    /**
    * @private
    * 渲染文字。
    * @param	begin 开始渲染的行索引。
    * @param	visibleLineCount 渲染的行数。
    */
    protected renderText(): void {
        let graphics = this.graphics;
        graphics.clear(true);
        this.drawBg();

        let padding = this._padding;
        let paddingLeft = padding[3];
        let paddingTop = padding[0];
        let bfont = this._bitmapFont;
        let scrollPos = this._scrollPos;
        let rectWidth = (this._isWidthSet ? this._width : this._textWidth) - padding[3] - padding[1];
        let rectHeight = (this._isHeightSet ? this._height : this._textHeight) - padding[0] - padding[2];
        let bottom = paddingTop + rectHeight;
        let clipped = this._overflow != Text.VISIBLE && rectWidth > 0 && rectHeight > 0;

        if (clipped) {
            graphics.save();
            graphics.clipRect(paddingLeft, paddingTop, rectWidth, rectHeight);
            this.repaint();
        }

        let x = 0, y = 0;
        let lines = this._lines;
        let lineCnt = lines.length;
        let curLink: HtmlLink;
        let linkStartX: number;
        for (let i = 0; i < lineCnt; i++) {
            let line = lines[i];
            x = paddingLeft + line.x;
            y = paddingTop + line.y;
            if (scrollPos) {
                x -= scrollPos.x;
                y -= scrollPos.y;
            }
            let lineClipped = clipped && ((y + line.height) <= paddingTop || y >= bottom);

            for (let cmd of line.cmds) {
                if (cmd.linkEnd) {
                    if (curLink) {
                        curLink.addRect(linkStartX, y, x + cmd.x + cmd.width - linkStartX, line.height);
                        curLink = null;
                    }
                }

                if (cmd.obj) {
                    cmd.obj.pos(x + cmd.x, y + cmd.y);

                    if (cmd.obj.element.type == HtmlElementType.Link) {
                        curLink = <HtmlLink>cmd.obj;
                        curLink.resetArea();
                        linkStartX = x + cmd.x;
                    }
                }
                else if (!lineClipped) {
                    if (bfont) {
                        let tx: number = 0;
                        let str = cmd.wt.text;
                        for (let i = 0, n = str.length; i < n; i++) {
                            let c = str.charCodeAt(i);
                            let tex = bfont.getCharTexture(c);
                            if (tex) {
                                let w = bfont.getCharWidth(c, cmd.style.fontSize);
                                let scale = bfont.autoScaleSize ? (cmd.style.fontSize / bfont.fontSize) : 1;
                                graphics.drawImage(tex, x + cmd.x + tx, y + cmd.y, tex.sourceWidth * scale, tex.sourceHeight * scale, cmd.style.color);
                                tx += w;
                            }
                        }
                    } else {
                        let ctxFont = (<any>cmd.style)._ctxFont;
                        if (cmd.style.stroke)
                            graphics.fillBorderText(cmd.wt, x + cmd.x, y + cmd.y, ctxFont, cmd.style.color, null, cmd.style.stroke, cmd.style.strokeColor);
                        else
                            graphics.fillText(cmd.wt, x + cmd.x, y + cmd.y, ctxFont, cmd.style.color, null);
                    }
                }

                if (!lineClipped && cmd.style.underline) {
                    let thickness = Math.max(1, cmd.style.fontSize / 16);
                    graphics.drawLine(x + cmd.x, y + line.height - thickness, x + cmd.x + cmd.width, y + line.height - thickness, cmd.style.underlineColor || cmd.style.color, thickness);
                }
            }

            if (curLink) {
                curLink.addRect(linkStartX, y, rectWidth - linkStartX + paddingLeft, line.height);
                linkStartX = paddingLeft;
            }
        }

        if (clipped)
            graphics.restore();
    }

    protected drawBg() {
        let cmd = this._bgDrawCmd;
        if (this._bgColor || this._borderColor) {
            if (!cmd) {
                cmd = new DrawRectCmd();
                cmd.x = cmd.y = 0;
                cmd.width = cmd.height = 1;
                cmd.percent = true;
                this._bgDrawCmd = cmd;
            }
            cmd.fillColor = this._bgColor;
            cmd.lineColor = this._borderColor;
            cmd.lineWidth = this._borderColor ? 1 : 0;

            let cmds = this.graphics.cmds;
            let i = cmds.indexOf(cmd);
            if (i != 0) {
                cmds.splice(i, 1);
                cmds.unshift(cmd);
                this.graphics.cmds = cmds;
            }
        }
        else if (cmd) {
            this.graphics.removeCmd(cmd);
        }
    }
}
interface ITextCmd {
    x: number;
    y: number;
    width: number;
    height: number;
    style: TextStyle;
    wt: WordText;
    obj: IHtmlObject;
    linkEnd: boolean;
}

interface ITextLine {
    x: number;
    y: number;
    height: number;
    width: number;
    cmds: Array<ITextCmd>;
}

var cmdPool: Array<ITextCmd> = [];
var linePool: Array<ITextLine> = [];

function recoverLines(lines: Array<ITextLine>) {
    for (let line of lines) {
        for (let cmd of line.cmds) {
            cmd.obj = null;
            if (cmd.wt)
                cmd.wt.cleanCache();
        }
        cmdPool.push(...line.cmds);
        line.cmds.length = 0;
    }

    linePool.push(...lines);
    lines.length = 0;
}

var emojiTest = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
function testEmoji(str: string) {
    if (null == str) return false;
    return emojiTest.test(str);
}

var wordBoundaryTest = /(?:[^\s\!-\/])+$/;