package laya.display {
	import laya.display.Sprite;
	import laya.display.BitmapFont;
	import laya.display.css.SpriteStyle;
	import laya.display.css.TextStyle;
	import laya.maths.Point;
	import laya.maths.Rectangle;
	import laya.utils.WordText;

	/**
	 * 文本内容发生改变后调度。
	 * @eventType Event.CHANGE
	 */

	/**
	 * <p> <code>Text</code> 类用于创建显示对象以显示文本。</p>
	 * <p>
	 * 注意：如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。
	 * </p>
	 * @example package{	import laya.display.Text;	public class Text_Example	{		public function Text_Example()		{			Laya.init(640, 800);//设置游戏画布宽高、渲染模式。			Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。			onInit();		}		private function onInit():void		{			var text:Text = new Text();//创建一个 Text 类的实例对象 text 。			text.text = "这个是一个 Text 文本示例。";			text.color = "#008fff";//设置 text 的文本颜色。			text.font = "Arial";//设置 text 的文本字体。			text.bold = true;//设置 text 的文本显示为粗体。			text.fontSize = 30;//设置 text 的字体大小。			text.wordWrap = true;//设置 text 的文本自动换行。			text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。			text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。			text.width = 300;//设置 text 的宽度。			text.height = 200;//设置 text 的高度。			text.italic = true;//设置 text 的文本显示为斜体。			text.borderColor = "#fff000";//设置 text 的文本边框颜色。			Laya.stage.addChild(text);//将 text 添加到显示列表。		}	}}
	 * @example Text_Example();function Text_Example(){    Laya.init(640, 800);//设置游戏画布宽高、渲染模式。    Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。    onInit();}function onInit(){    var text = new laya.display.Text();//创建一个 Text 类的实例对象 text 。    text.text = "这个是一个 Text 文本示例。";    text.color = "#008fff";//设置 text 的文本颜色。    text.font = "Arial";//设置 text 的文本字体。    text.bold = true;//设置 text 的文本显示为粗体。    text.fontSize = 30;//设置 text 的字体大小。    text.wordWrap = true;//设置 text 的文本自动换行。    text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。    text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。    text.width = 300;//设置 text 的宽度。    text.height = 200;//设置 text 的高度。    text.italic = true;//设置 text 的文本显示为斜体。    text.borderColor = "#fff000";//设置 text 的文本边框颜色。    Laya.stage.addChild(text);//将 text 添加到显示列表。}
	 * @example class Text_Example {    constructor() {        Laya.init(640, 800);//设置游戏画布宽高、渲染模式。        Laya.stage.bgColor = "#efefef";//设置画布的背景颜色。        this.onInit();    }    private onInit(): void {        var text: laya.display.Text = new laya.display.Text();//创建一个 Text 类的实例对象 text 。        text.text = "这个是一个 Text 文本示例。";        text.color = "#008fff";//设置 text 的文本颜色。        text.font = "Arial";//设置 text 的文本字体。        text.bold = true;//设置 text 的文本显示为粗体。        text.fontSize = 30;//设置 text 的字体大小。        text.wordWrap = true;//设置 text 的文本自动换行。        text.x = 100;//设置 text 对象的属性 x 的值，用于控制 text 对象的显示位置。        text.y = 100;//设置 text 对象的属性 y 的值，用于控制 text 对象的显示位置。        text.width = 300;//设置 text 的宽度。        text.height = 200;//设置 text 的高度。        text.italic = true;//设置 text 的文本显示为斜体。        text.borderColor = "#fff000";//设置 text 的文本边框颜色。        Laya.stage.addChild(text);//将 text 添加到显示列表。    }}
	 */
	public class Text extends Sprite {

		/**
		 * visible不进行任何裁切。
		 */
		public static var VISIBLE:String;

		/**
		 * scroll 不显示文本域外的字符像素，并且支持 scroll 接口。
		 */
		public static var SCROLL:String;

		/**
		 * hidden 不显示超出文本域的字符。
		 */
		public static var HIDDEN:String;

		/**
		 * 默认文本大小，默认为12
		 */
		public static var defaultFontSize:Number;

		/**
		 * 默认文本字体，默认为Arial
		 */
		public static var defaultFont:String;

		/**
		 * @private 
		 */
		public static function defaultFontStr():String{
			return null;
		}

		/**
		 * 语言包，是一个包含key:value的集合，用key索引，替换为目标value语言
		 */
		public static var langPacks:*;

		/**
		 * WebGL下，文字会被拆分为单个字符进行渲染，一些语系不能拆开显示，比如阿拉伯文，这时可以设置isComplexText=true，禁用文字拆分。
		 */
		public static var isComplexText:Boolean;

		/**
		 * 在IOS下，一些字体会找不到，引擎提供了字体映射功能，比如默认会把 "黑体" 映射为 "黑体-简"，更多映射，可以自己添加
		 */
		public static var fontFamilyMap:*;

		/**
		 * @private 位图字体字典。
		 */
		private static var _bitmapFonts:*;
		public static var CharacterCache:Boolean;

		/**
		 * 是否是从右向左的显示顺序
		 */
		public static var RightToLeft:Boolean;

		/**
		 * @private 
		 */
		private var _clipPoint:*;

		/**
		 * @private 表示文本内容字符串。
		 */
		protected var _text:String;

		/**
		 * @private 表示文本内容是否发生改变。
		 */
		protected var _isChanged:Boolean;

		/**
		 * @private 表示文本的宽度，以像素为单位。
		 */
		protected var _textWidth:Number;

		/**
		 * @private 表示文本的高度，以像素为单位。
		 */
		protected var _textHeight:Number;

		/**
		 * @private 存储文字行数信息。
		 */
		protected var _lines:Array;

		/**
		 * @private 保存每行宽度
		 */
		protected var _lineWidths:Array;

		/**
		 * @private 文本的内容位置 X 轴信息。
		 */
		protected var _startX:Number;

		/**
		 * @private 文本的内容位置X轴信息。
		 */
		protected var _startY:Number;

		/**
		 * @private 
		 */
		protected var _words:Array;

		/**
		 * @private 
		 */
		protected var _charSize:*;

		/**
		 * @private 
		 */
		protected var _valign:String;

		/**
		 * @private 
		 */
		private var _singleCharRender:*;

		/**
		 * <p>overflow 指定文本超出文本域后的行为。其值为"hidden"、"visible"和"scroll"之一。</p>
		 * <p>性能从高到低依次为：hidden > visible > scroll。</p>
		 */
		public var overflow:String;

		/**
		 * 创建一个新的 <code>Text</code> 实例。
		 */

		public function Text(){}

		/**
		 * @private 获取样式。
		 * @return 样式 Style 。
		 * @override 
		 */
		override public function getStyle():SpriteStyle{
			return null;
		}
		protected function _getTextStyle():TextStyle{
			return null;
		}

		/**
		 * 注册位图字体。
		 * @param name 位图字体的名称。
		 * @param bitmapFont 位图字体文件。
		 */
		public static function registerBitmapFont(name:String,bitmapFont:BitmapFont):void{}

		/**
		 * 移除注册的位图字体文件。
		 * @param name 位图字体的名称。
		 * @param destroy 是否销毁指定的字体文件。
		 */
		public static function unregisterBitmapFont(name:String,destroy:Boolean = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function destroy(destroyChild:Boolean = null):void{}

		/**
		 * @inheritDoc 
		 * @override 
		 */
		override public function getGraphicBounds(realSize:Boolean = null):Rectangle{
			return null;
		}

		/**
		 * 表示文本的宽度，以像素为单位。
		 */
		public function get textWidth():Number{
				return null;
		}

		/**
		 * 表示文本的高度，以像素为单位。
		 */
		public function get textHeight():Number{
				return null;
		}

		/**
		 * 当前文本的内容字符串。
		 */
		public var text:String;
		public function get_text():String{
			return null;
		}
		public function set_text(value:String):void{}

		/**
		 * <p>根据指定的文本，从语言包中取当前语言的文本内容。并对此文本中的{i}文本进行替换。</p>
		 * <p>设置Text.langPacks语言包后，即可使用lang获取里面的语言</p>
		 * <p>例如：
		 * <li>（1）text 的值为“我的名字”，先取到这个文本对应的当前语言版本里的值“My name”，将“My name”设置为当前文本的内容。</li>
		 * <li>（2）text 的值为“恭喜你赢得{0}个钻石，{1}经验。”，arg1 的值为100，arg2 的值为200。
		 *  			则先取到这个文本对应的当前语言版本里的值“Congratulations on your winning {0} diamonds, {1} experience.”，
		 *  			然后将文本里的{0}、{1}，依据括号里的数字从0开始替换为 arg1、arg2 的值。
		 *  			将替换处理后的文本“Congratulations on your winning 100 diamonds, 200 experience.”设置为当前文本的内容。
		 * </li>
		 * </p>
		 * @param text 文本内容。
		 * @param ...args 文本替换参数。
		 */
		public function lang(text:String,arg1:* = null,arg2:* = null,arg3:* = null,arg4:* = null,arg5:* = null,arg6:* = null,arg7:* = null,arg8:* = null,arg9:* = null,arg10:* = null):void{}

		/**
		 * <p>文本的字体名称，以字符串形式表示。</p>
		 * <p>默认值为："Arial"，可以通过Text.defaultFont设置默认字体。</p>
		 * <p>如果运行时系统找不到设定的字体，则用系统默认的字体渲染文字，从而导致显示异常。(通常电脑上显示正常，在一些移动端因缺少设置的字体而显示异常)。</p>
		 * @see laya.display.Text#defaultFont
		 */
		public var font:String;

		/**
		 * <p>指定文本的字体大小（以像素为单位）。</p>
		 * <p>默认为20像素，可以通过 <code>Text.defaultFontSize</code> 设置默认大小。</p>
		 */
		public var fontSize:Number;

		/**
		 * <p>指定文本是否为粗体字。</p>
		 * <p>默认值为 false，这意味着不使用粗体字。如果值为 true，则文本为粗体字。</p>
		 */
		public var bold:Boolean;

		/**
		 * <p>表示文本的颜色值。可以通过 <code>Text.defaultColor</code> 设置默认颜色。</p>
		 * <p>默认值为黑色。</p>
		 */
		public var color:String;
		public function get_color():String{
			return null;
		}
		public function set_color(value:String):void{}

		/**
		 * <p>表示使用此文本格式的文本是否为斜体。</p>
		 * <p>默认值为 false，这意味着不使用斜体。如果值为 true，则文本为斜体。</p>
		 */
		public var italic:Boolean;

		/**
		 * <p>表示文本的水平显示方式。</p>
		 * <p><b>取值：</b>
		 * <li>"left"： 居左对齐显示。</li>
		 * <li>"center"： 居中对齐显示。</li>
		 * <li>"right"： 居右对齐显示。</li>
		 * </p>
		 */
		public var align:String;

		/**
		 * <p>表示文本的垂直显示方式。</p>
		 * <p><b>取值：</b>
		 * <li>"top"： 居顶部对齐显示。</li>
		 * <li>"middle"： 居中对齐显示。</li>
		 * <li>"bottom"： 居底部对齐显示。</li>
		 * </p>
		 */
		public var valign:String;

		/**
		 * <p>表示文本是否自动换行，默认为false。</p>
		 * <p>若值为true，则自动换行；否则不自动换行。</p>
		 */
		public var wordWrap:Boolean;

		/**
		 * 垂直行间距（以像素为单位）。
		 */
		public var leading:Number;

		/**
		 * <p>边距信息。</p>
		 * <p>数据格式：[上边距，右边距，下边距，左边距]（边距以像素为单位）。</p>
		 */
		public var padding:Array;

		/**
		 * 文本背景颜色，以字符串表示。
		 */
		public var bgColor:String;
		public function set_bgColor(value:String):void{}
		public function get_bgColor():String{
			return null;
		}

		/**
		 * 文本边框背景颜色，以字符串表示。
		 */
		public var borderColor:String;

		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * <p>默认值0，表示不描边。</p>
		 */
		public var stroke:Number;

		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * <p>默认值为 "#000000"（黑色）;</p>
		 */
		public var strokeColor:String;

		/**
		 * @private 一个布尔值，表示文本的属性是否有改变。若为true表示有改变。
		 */
		protected var isChanged:Boolean;

		/**
		 * @private 
		 */
		protected function _getContextFont():String{
			return null;
		}

		/**
		 * @private 
		 */
		protected function _isPassWordMode():Boolean{
			return null;
		}

		/**
		 * @private 
		 */
		protected function _getPassWordTxt(txt:String):String{
			return null;
		}

		/**
		 * @private 渲染文字。
		 * @param begin 开始渲染的行索引。
		 * @param visibleLineCount 渲染的行数。
		 */
		protected function _renderText():void{}

		/**
		 * @private 绘制下划线
		 * @param x 本行坐标
		 * @param y 本行坐标
		 * @param lineIndex 本行索引
		 */
		private var _drawUnderline:*;

		/**
		 * <p>排版文本。</p>
		 * <p>进行宽高计算，渲染、重绘文本。</p>
		 */
		public function typeset():void{}

		/**
		 * @private 
		 */
		private var _evalTextSize:*;

		/**
		 * @private 
		 */
		private var _checkEnabledViewportOrNot:*;

		/**
		 * <p>快速更改显示文本。不进行排版计算，效率较高。</p>
		 * <p>如果只更改文字内容，不更改文字样式，建议使用此接口，能提高效率。</p>
		 * @param text 文本内容。
		 */
		public function changeText(text:String):void{}

		/**
		 * @private 分析文本换行。
		 */
		protected function _parseLines(text:String):void{}

		/**
		 * @private 解析行文本。
		 * @param line 某行的文本。
		 * @param wordWrapWidth 文本的显示宽度。
		 */
		protected function _parseLine(line:String,wordWrapWidth:Number):void{}

		/**
		 * @private 
		 */
		private var _getTextWidth:*;

		/**
		 * @private 获取换行所需的宽度。
		 */
		private var _getWordWrapWidth:*;

		/**
		 * 返回字符在本类实例的父坐标系下的坐标。
		 * @param charIndex 索引位置。
		 * @param out （可选）输出的Point引用。
		 * @return Point 字符在本类实例的父坐标系下的坐标。如果out参数不为空，则将结果赋值给指定的Point对象，否则创建一个新的Point对象返回。建议使用Point.TEMP作为out参数，可以省去Point对象创建和垃圾回收的开销，尤其是在需要频繁执行的逻辑中，比如帧循环和MOUSE_MOVE事件回调函数里面。
		 */
		public function getCharPoint(charIndex:Number,out:Point = null):Point{
			return null;
		}

		/**
		 * <p>设置横向滚动量。</p>
		 * <p>即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。</p>
		 */

		/**
		 * 获取横向滚动量。
		 */
		public var scrollX:Number;

		/**
		 * 设置纵向滚动量（px)。即使设置超出滚动范围的值，也会被自动限制在可能的最大值处。
		 */

		/**
		 * 获取纵向滚动量。
		 */
		public var scrollY:Number;

		/**
		 * 获取横向可滚动最大值。
		 */
		public function get maxScrollX():Number{
				return null;
		}

		/**
		 * 获取纵向可滚动最大值。
		 */
		public function get maxScrollY():Number{
				return null;
		}

		/**
		 * 返回文字行信息
		 */
		public function get lines():Array{
				return null;
		}

		/**
		 * 下划线的颜色，为null则使用字体颜色。
		 */
		public var underlineColor:String;

		/**
		 * 是否显示下划线。
		 */
		public var underline:Boolean;

		/**
		 * 设置是否单个字符渲染，如果Textd的内容一直改变，例如是一个增加的数字，就设置这个，防止无效占用缓存
		 */
		public var singleCharRender:Boolean;
	}

}
