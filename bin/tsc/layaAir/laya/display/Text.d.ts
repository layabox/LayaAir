import { Sprite } from "./Sprite";
import { BitmapFont } from "./BitmapFont";
import { SpriteStyle } from "./css/SpriteStyle";
import { TextStyle } from "./css/TextStyle";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { WordText } from "../utils/WordText";
/**
 * 文本内容发生改变后调度。
 * @eventType Event.CHANGE
 */
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
export declare class Text extends Sprite {
    /**visible不进行任何裁切。*/
    static VISIBLE: string;
    /**scroll 不显示文本域外的字符像素，并且支持 scroll 接口。*/
    static SCROLL: string;
    /**hidden 不显示超出文本域的字符。*/
    static HIDDEN: string;
    /**默认文本大小，默认为12*/
    static defaultFontSize: number;
    /**默认文本字体，默认为Arial*/
    static defaultFont: string;
    /**@private */
    static defaultFontStr(): string;
    /**语言包，是一个包含key:value的集合，用key索引，替换为目标value语言*/
    static langPacks: any;
    /**WebGL下，文字会被拆分为单个字符进行渲染，一些语系不能拆开显示，比如阿拉伯文，这时可以设置isComplexText=true，禁用文字拆分。*/
    static isComplexText: boolean;
    /**在IOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加*/
    static fontFamilyMap: any;
    /**@private 预测长度的文字，用来提升计算效率，不同语言找一个最大的字符即可*/
    static _testWord: string;
    /**@private 位图字体字典。*/
    private static _bitmapFonts;
    static CharacterCache: boolean;
    /**是否是从右向左的显示顺序*/
    static RightToLeft: boolean;
    /**@private */
    private _clipPoint;
    /**@private 表示文本内容字符串。*/
    protected _text: string;
    /**@private 表示文本内容是否发生改变。*/
    protected _isChanged: boolean;
    /**@private 表示文本的宽度，以像素为单位。*/
    protected _textWidth: number;
    /**@private 表示文本的高度，以像素为单位。*/
    protected _textHeight: number;
    /**@private 存储文字行数信息。*/
    protected _lines: any[];
    /**@private 保存每行宽度*/
    protected _lineWidths: any[];
    /**@private 文本的内容位置 X 轴信息。*/
    protected _startX: number;
    /**@private 文本的内容位置X轴信息。 */
    protected _startY: number;
    /**@private */
    protected _words: WordText[];
    /**@private */
    protected _charSize: any;
    /**@private */
    protected _valign: string;
    /**@private */
    private _singleCharRender;
    /**
     * <p>overflow 指定文本超出文本域后的行为。其值为"hidden"、"visible"和"scroll"之一。</p>
     * <p>性能从高到低依次为：hidden > visible > scroll。</p>
     */
    overflow: string;
    /**
     * 创建一个新的 <code>Text</code> 实例。
     */
    constructor();
    /**
     * @private
     * 获取样式。
     * @return  样式 Style 。
     */
    getStyle(): SpriteStyle;
    protected _getTextStyle(): TextStyle;
    /**
     * 注册位图字体。
     * @param	name		位图字体的名称。
     * @param	bitmapFont	位图字体文件。
     */
    static registerBitmapFont(name: string, bitmapFont: BitmapFont): void;
    /**
     * 移除注册的位图字体文件。
     * @param	name		位图字体的名称。
     * @param	destroy		是否销毁指定的字体文件。
     */
    static unregisterBitmapFont(name: string, destroy?: boolean): void;
    /**@inheritDoc */
    destroy(destroyChild?: boolean): void;
    /**
     * @inheritDoc
     */
    getGraphicBounds(realSize?: boolean): Rectangle;
    /**
     * @inheritDoc
     */
    /*override*/ width: number;
    /**
     * @inheritDoc
     */
    /*override*/ height: number;
    /**
     * 表示文本的宽度，以像素为单位。
     */
    readonly textWidth: number;
    /**
     * 表示文本的高度，以像素为单位。
     */
    readonly textHeight: number;
    /** 当前文本的内容字符串。*/
    text: string;
    get_text(): string;
    set_text(value: string): void;
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
    lang(text: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any, arg9?: any, arg10?: any): void;
    /**
     * <p>文本的字体名称，以字符串形式表示。</p>
     * <p>默认值为："Arial"，可以通过Text.defaultFont设置默认字体。</p>
     * <p>如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。</p>
     * @see laya.display.Text#defaultFont
     */
    font: string;
    /**
     * <p>指定文本的字体大小（以像素为单位）。</p>
     * <p>默认为20像素，可以通过 <code>Text.defaultFontSize</code> 设置默认大小。</p>
     */
    fontSize: number;
    /**
     * <p>指定文本是否为粗体字。</p>
     * <p>默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。</p>
     */
    bold: boolean;
    /**
     * <p>表示文本的颜色值。可以通过 <code>Text.defaultColor</code> 设置默认颜色。</p>
     * <p>默认值为黑色。</p>
     */
    color: string;
    get_color(): string;
    set_color(value: string): void;
    /**
     * <p>表示使用此文本格式的文本是否为斜体。</p>
     * <p>默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。</p>
     */
    italic: boolean;
    /**
     * <p>表示文本的水平显示方式。</p>
     * <p><b>取值：</b>
     * <li>"left"： 居左对齐显示。</li>
     * <li>"center"： 居中对齐显示。</li>
     * <li>"right"： 居右对齐显示。</li>
     * </p>
     */
    align: string;
    /**
     * <p>表示文本的垂直显示方式。</p>
     * <p><b>取值：</b>
     * <li>"top"： 居顶部对齐显示。</li>
     * <li>"middle"： 居中对齐显示。</li>
     * <li>"bottom"： 居底部对齐显示。</li>
     * </p>
     */
    valign: string;
    /**
     * <p>表示文本是否自动换行，默认为false。</p>
     * <p>若值为true，则自动换行；否则不自动换行。</p>
     */
    wordWrap: boolean;
    /**
     * 垂直行间距（以像素为单位）。
     */
    leading: number;
    /**
     * <p>边距信息。</p>
     * <p>数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。</p>
     */
    padding: any[];
    /**
     * 文本背景颜色，以字符串表示。
     */
    bgColor: string;
    set_bgColor(value: string): void;
    get_bgColor(): string;
    /**
     * 文本边框背景颜色，以字符串表示。
     */
    borderColor: string;
    /**
     * <p>描边宽度（以像素为单位）。</p>
     * <p>默认值0，表示不描边。</p>
     */
    stroke: number;
    /**
     * <p>描边颜色，以字符串表示。</p>
     * <p>默认值为 "#000000"（黑色）;</p>
     */
    strokeColor: string;
    /**
     * @private
     * 一个布尔值，表示文本的属性是否有改变。若为true表示有改变。
     */
    protected isChanged: boolean;
    /**
     * @private
     */
    protected _getContextFont(): string;
    /**
     * @private
     */
    protected _isPassWordMode(): boolean;
    /**
     * @private
     */
    protected _getPassWordTxt(txt: string): string;
    /**
     * @private
     * 渲染文字。
     * @param	begin 开始渲染的行索引。
     * @param	visibleLineCount 渲染的行数。
     */
    protected _renderText(): void;
    /**
     * @private
     * 绘制下划线
     * @param	x 本行坐标
     * @param	y 本行坐标
     * @param	lineIndex 本行索引
     */
    private _drawUnderline;
    /**
     * <p>排版文本。</p>
     * <p>进行宽高计算，渲染、重绘文本。</p>
     */
    typeset(): void;
    /**@private */
    private _evalTextSize;
    /**@private */
    private _checkEnabledViewportOrNot;
    /**
     * <p>快速更改显示文本。不进行排版计算，效率较高。</p>
     * <p>如果只更改文字内容，不更改文字样式，建议使用此接口，能提高效率。</p>
     * @param text 文本内容。
     */
    changeText(text: string): void;
    /**
     * @private
     * 分析文本换行。
     */
    protected _parseLines(text: string): void;
    /**
     * @private
     * 解析行文本。
     * @param	line 某行的文本。
     * @param	wordWrapWidth 文本的显示宽度。
     */
    protected _parseLine(line: string, wordWrapWidth: number): void;
    /**@private */
    private _getTextWidth;
    /**
     * @private
     * 获取换行所需的宽度。
     */
    private _getWordWrapWidth;
    /**
     * 返回字符在本类实例的父坐标系下的坐标。
     * @param charIndex	索引位置。
     * @param out		（可选）输出的Point引用。
     * @return Point 字符在本类实例的父坐标系下的坐标。如果out参数不为空，则将结果赋值给指定的Point对象，否则创建一个新的Point对象返回。建议使用Point.TEMP作为out参数，可以省去Point对象创建和垃圾回收的开销，尤其是在需要频繁执行的逻辑中，比如帧循环和MOUSE_MOVE事件回调函数里面。
     */
    getCharPoint(charIndex: number, out?: Point): Point;
    /**
     * <p>设置横向滚动量。</p>
     * <p>即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。</p>
     */
    /**
    * 获取横向滚动量。
    */
    scrollX: number;
    /**
     * 设置纵向滚动量（px)。即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。
     */
    /**
    * 获取纵向滚动量。
    */
    scrollY: number;
    /**
     * 获取横向可滚动最大值。
     */
    readonly maxScrollX: number;
    /**
     * 获取纵向可滚动最大值。
     */
    readonly maxScrollY: number;
    /**返回文字行信息*/
    readonly lines: any[];
    /**下划线的颜色，为null则使用字体颜色。*/
    underlineColor: string;
    /**是否显示下划线。*/
    underline: boolean;
    /** 设置是否单个字符渲染，如果Textd的内容一直改变，例如是一个增加的数字，就设置这个，防止无效占用缓存 */
    singleCharRender: boolean;
}
