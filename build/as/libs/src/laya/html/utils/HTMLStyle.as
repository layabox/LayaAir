package laya.html.utils {
	import laya.html.dom.HTMLElement;
	import laya.net.URL;

	/**
	 * @private 
	 */
	public class HTMLStyle {
		private static var _CSSTOVALUE:*;
		private static var _parseCSSRegExp:*;

		/**
		 * 需要继承的属性
		 */
		private static var _inheritProps:*;

		/**
		 * 水平居左对齐方式。
		 */
		public static var ALIGN_LEFT:String;

		/**
		 * 水平居中对齐方式。
		 */
		public static var ALIGN_CENTER:String;

		/**
		 * 水平居右对齐方式。
		 */
		public static var ALIGN_RIGHT:String;

		/**
		 * 垂直居中对齐方式。
		 */
		public static var VALIGN_TOP:String;

		/**
		 * 垂直居中对齐方式。
		 */
		public static var VALIGN_MIDDLE:String;

		/**
		 * 垂直居底部对齐方式。
		 */
		public static var VALIGN_BOTTOM:String;

		/**
		 * 样式表信息。
		 */
		public static var styleSheets:*;

		/**
		 * 添加布局。
		 */
		public static var ADDLAYOUTED:Number;
		private static var _PADDING:*;
		protected static var _HEIGHT_SET:Number;
		protected static var _LINE_ELEMENT:Number;
		protected static var _NOWARP:Number;
		protected static var _WIDTHAUTO:Number;
		protected static var _BOLD:Number;
		protected static var _ITALIC:Number;

		/**
		 * @private 
		 */
		protected static var _CSS_BLOCK:Number;

		/**
		 * @private 
		 */
		protected static var _DISPLAY_NONE:Number;

		/**
		 * @private 
		 */
		protected static var _ABSOLUTE:Number;

		/**
		 * @private 
		 */
		protected static var _WIDTH_SET:Number;
		protected static var alignVDic:*;
		protected static var align_Value:*;
		protected static var vAlign_Value:*;
		protected static var _ALIGN:Number;
		protected static var _VALIGN:Number;
		public var fontSize:Number;
		public var family:String;
		public var color:String;
		public var ower:HTMLElement;
		private var _extendStyle:*;
		public var textDecoration:String;

		/**
		 * 文本背景颜色，以字符串表示。
		 */
		public var bgColor:String;

		/**
		 * 文本边框背景颜色，以字符串表示。
		 */
		public var borderColor:String;

		/**
		 * 边距信息。
		 */
		public var padding:Array;

		public function HTMLStyle(){}
		private var _getExtendStyle:*;
		public function get href():String{return null;}
		public function set href(value:String):void{}

		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @default 0
		 */
		public function get stroke():Number{return null;}
		public function set stroke(value:Number):void{}

		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * @default "#000000";
		 */
		public function get strokeColor():String{return null;}
		public function set strokeColor(value:String):void{}

		/**
		 * <p>垂直行间距（以像素为单位）</p>
		 */
		public function get leading():Number{return null;}
		public function set leading(value:Number):void{}

		/**
		 * 行高。
		 */
		public function get lineHeight():Number{return null;}
		public function set lineHeight(value:Number):void{}
		public function set align(v:String):void{}

		/**
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default "left"
		 */
		public function get align():String{return null;}
		public function set valign(v:String):void{}

		/**
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default "left"
		 */
		public function get valign():String{return null;}

		/**
		 * 字体样式字符串。
		 */
		public function set font(value:String):void{}
		public function get font():String{return null;}

		/**
		 * 是否显示为块级元素。
		 */
		public function set block(value:Boolean):void{}

		/**
		 * 表示元素是否显示为块级元素。
		 */
		public function get block():Boolean{return null;}

		/**
		 * 重置，方便下次复用
		 */
		public function reset():HTMLStyle{
			return null;
		}

		/**
		 * 回收
		 */
		public function recover():void{}

		/**
		 * 从对象池中创建
		 */
		public static function create():HTMLStyle{
			return null;
		}

		/**
		 * 复制传入的 CSSStyle 属性值。
		 * @param src 待复制的 CSSStyle 对象。
		 */
		public function inherit(src:HTMLStyle):void{}

		/**
		 * 表示是否换行。
		 */
		public function get wordWrap():Boolean{return null;}
		public function set wordWrap(value:Boolean):void{}

		/**
		 * 是否为粗体
		 */
		public function get bold():Boolean{return null;}
		public function set bold(value:Boolean):void{}
		public function get fontWeight():String{return null;}
		public function set fontWeight(value:String):void{}

		/**
		 * 表示使用此文本格式的文本是否为斜体。
		 * @default false
		 */
		public function get italic():Boolean{return null;}
		public function set italic(value:Boolean):void{}

		/**
		 * @inheritDoc 
		 */
		public function widthed(sprite:*):Boolean{
			return null;
		}
		public function set whiteSpace(type:String):void{}

		/**
		 * 设置如何处理元素内的空白。
		 */
		public function get whiteSpace():String{return null;}

		/**
		 * 宽度。
		 */
		public function set width(w:*):void{}

		/**
		 * 高度。
		 */
		public function set height(h:*):void{}

		/**
		 * 是否已设置高度。
		 * @param sprite 显示对象 Sprite。
		 * @return 一个Boolean 表示是否已设置高度。
		 */
		public function heighted(sprite:*):Boolean{
			return null;
		}

		/**
		 * 设置宽高。
		 * @param w 宽度。
		 * @param h 高度。
		 */
		public function size(w:Number,h:Number):void{}

		/**
		 * 是否是行元素。
		 */
		public function getLineElement():Boolean{
			return null;
		}
		public function setLineElement(value:Boolean):void{}

		/**
		 * 间距。
		 */
		public function get letterSpacing():Number{return null;}
		public function set letterSpacing(d:Number):void{}

		/**
		 * 设置 CSS 样式字符串。
		 * @param text CSS样式字符串。
		 */
		public function cssText(text:String):void{}

		/**
		 * 根据传入的属性名、属性值列表，设置此对象的属性值。
		 * @param attrs 属性名与属性值列表。
		 */
		public function attrs(attrs:Array):void{}
		public function set position(value:String):void{}

		/**
		 * 元素的定位类型。
		 */
		public function get position():String{return null;}

		/**
		 * @inheritDoc 
		 */
		public function get absolute():Boolean{return null;}

		/**
		 * @inheritDoc 
		 */
		public function get paddingLeft():Number{return null;}

		/**
		 * @inheritDoc 
		 */
		public function get paddingTop():Number{return null;}

		/**
		 * 通过传入的分割符，分割解析CSS样式字符串，返回样式列表。
		 * @param text CSS样式字符串。
		 * @param clipWord 分割符；
		 * @return 样式列表。
		 */
		public static function parseOneCSS(text:String,clipWord:String):Array{
			return null;
		}

		/**
		 * 解析 CSS 样式文本。
		 * @param text CSS 样式文本。
		 * @param uri URL对象。
		 */
		public static function parseCSS(text:String,uri:URL):void{}
	}

}
