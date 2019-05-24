package laya.html.utils {
	import laya.display.Text;
	import laya.html.dom.HTMLElement;
	import laya.net.URL;
	import laya.utils.Browser;
	import laya.utils.Pool;
	
	/**
	 * @private
	 */
	public class HTMLStyle {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		private static var _CSSTOVALUE:Object =/*[STATIC SAFE]*/ {'letter-spacing': 'letterSpacing', 'white-space': 'whiteSpace', 'line-height': 'lineHeight', 'font-family': 'family', 'vertical-align': 'valign', 'text-decoration': 'textDecoration', 'background-color': 'bgColor', 'border-color': 'borderColor'};
		private static var _parseCSSRegExp:RegExp =/*[STATIC SAFE]*/ new RegExp("([\.\#]\\w+)\\s*{([\\s\\S]*?)}", "g");
		/**
		 * 需要继承的属性
		 */
		private static const _inheritProps:Array = ["italic", "align", "valign", "leading", "stroke", "strokeColor", "bold", "fontSize", "lineHeight", "wordWrap", "color"];
		
		/**水平居左对齐方式。 */
		public static const ALIGN_LEFT:String = "left";
		/**水平居中对齐方式。 */
		public static const ALIGN_CENTER:String = "center";
		/**水平居右对齐方式。 */
		public static const ALIGN_RIGHT:String = "right";
		/**垂直居中对齐方式。 */
		public static const VALIGN_TOP:String = "top";
		/**垂直居中对齐方式。 */
		public static const VALIGN_MIDDLE:String = "middle";
		/**垂直居底部对齐方式。 */
		public static const VALIGN_BOTTOM:String = "bottom";
		/** 样式表信息。*/
		public static var styleSheets:Object = {};
		/**添加布局。 */
		public static const ADDLAYOUTED:int = 0x200;
		private static var _PADDING:Array = /*[STATIC SAFE]*/ [0, 0, 0, 0];
		
		protected static const _HEIGHT_SET:int = 0x2000;
		protected static const _LINE_ELEMENT:int = 0x10000;
		protected static const _NOWARP:int = 0x20000;
		protected static const _WIDTHAUTO:int = 0x40000;
		
		protected static const _BOLD:int = 0x400;
		protected static const _ITALIC:int = 0x800;
		
		/**@private */
		protected static const _CSS_BLOCK:int = 0x1;
		/**@private */
		protected static const _DISPLAY_NONE:int = 0x2;
		/**@private */
		protected static const _ABSOLUTE:int = 0x4;
		/**@private */
		protected static const _WIDTH_SET:int = 0x8;
		
		protected static const alignVDic:Object = {"left": 0, "center": 0x10, "right": 0x20, "top": 0, "middle": 0x40, "bottom": 0x80};
		protected static const align_Value:Object = {0: "left", 0x10: "center", 0x20: "right"};
		protected static const vAlign_Value:Object = {0: "top", 0x40: "middle", 0x80: "bottom"};
		protected static const _ALIGN:int = 0x30;// 0x10 & 0x20;
		protected static const _VALIGN:int = 0xc0;//0x40 & 0x80;
		
		/**@private */
		public var _type:int;
		public var fontSize:int;
		public var family:String;
		public var color:String;
		public var ower:HTMLElement;
		private var _extendStyle:HTMLExtendStyle;
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
		public var padding:Array = _PADDING;
		
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
		
		public function HTMLStyle() {
			reset();
		}
		
		//TODO:coverage
		private function _getExtendStyle():HTMLExtendStyle {
			if (_extendStyle === HTMLExtendStyle.EMPTY) _extendStyle = HTMLExtendStyle.create();
			return _extendStyle;
		}
		
		public function get href():String {
			return _extendStyle.href;
		}
		
		public function set href(value:String):void {
			if (value === _extendStyle.href) return;
			_getExtendStyle().href = value;
		}
		
		/**
		 * <p>描边宽度（以像素为单位）。</p>
		 * 默认值0，表示不描边。
		 * @default 0
		 */
		public function get stroke():Number {
			return _extendStyle.stroke;
		}
		
		public function set stroke(value:Number):void {
			if (_extendStyle.stroke === value) return;
			_getExtendStyle().stroke = value;
		}
		
		/**
		 * <p>描边颜色，以字符串表示。</p>
		 * @default "#000000";
		 */
		public function get strokeColor():String {
			return _extendStyle.strokeColor;
		}
		
		public function set strokeColor(value:String):void {
			if (_extendStyle.strokeColor === value) return;
			_getExtendStyle().strokeColor = value;
		}
		
		/**
		 * <p>垂直行间距（以像素为单位）</p>
		 */
		public function get leading():Number {
			return _extendStyle.leading;
		}
		
		public function set leading(value:Number):void {
			if (_extendStyle.leading === value) return;
			_getExtendStyle().leading = value;
		}
		
		/**行高。 */
		public function get lineHeight():Number {
			return _extendStyle.lineHeight;
		}
		
		public function set lineHeight(value:Number):void {
			if (_extendStyle.lineHeight === value) return;
			_getExtendStyle().lineHeight = value;
		}
		
		public function set align(v:String):void {
			if (!(v in alignVDic)) return;
			_type &= (~_ALIGN);
			_type |= alignVDic[v];
		}
		
		/**
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default  "left"
		 */
		public function get align():String {
			var v:int = _type & _ALIGN;
			return align_Value[v];
		}
		
		public function set valign(v:String):void {
			if (!(v in alignVDic)) return;
			_type &= (~_VALIGN);
			_type |= alignVDic[v];
		}
		
		/**
		 * <p>表示使用此文本格式的文本段落的水平对齐方式。</p>
		 * @default  "left"
		 */
		public function get valign():String {
			var v:int = _type & _VALIGN;
			return vAlign_Value[v];
		}
		
		/**
		 * 字体样式字符串。
		 */
		public function set font(value:String):void {
			var strs:Array = value.split(' ');
			for (var i:int, n:int = strs.length; i < n; i++) {
				var str:String = strs[i];
				switch (str) {
				case 'italic': 
					italic = true;
					continue;
				case 'bold': 
					bold = true;
					continue;
				}
				if (str.indexOf('px') > 0) {
					fontSize = parseInt(str);
					family = strs[i + 1];
					i++;
					continue;
				}
			}
		}
		
		public function get font():String {
			return (italic ? "italic " : "") + (bold ? "bold " : "") + fontSize + "px " + (Browser.onIPhone ? (Text.fontFamilyMap[family] || family) : family);
		}
		
		/**
		 * 是否显示为块级元素。
		 */
		public function set block(value:Boolean):void {
			value ? (_type |= _CSS_BLOCK) : (_type &= (~_CSS_BLOCK));
		}
		
		/**表示元素是否显示为块级元素。*/
		public function get block():Boolean {
			return (_type & _CSS_BLOCK) != 0;
		}
		
		/**
		 * 重置，方便下次复用
		 */
		public function reset():HTMLStyle {
			ower = null;
			_type = 0;
			wordWrap = true;
			fontSize = Text.defaultFontSize;
			family = Text.defaultFont;
			color = "#000000";
			valign = VALIGN_TOP;
			
			padding = _PADDING;
			bold = false;
			italic = false;
			align = ALIGN_LEFT;
			
			textDecoration = null;
			bgColor = null;
			borderColor = null;
			
			if (_extendStyle) _extendStyle.recover();
			_extendStyle = HTMLExtendStyle.EMPTY;
			
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
		public function recover():void {
			Pool.recover("HTMLStyle", reset());
		}
		
		/**
		 * 从对象池中创建
		 */
		public static function create():HTMLStyle {
			return Pool.getItemByClass("HTMLStyle", HTMLStyle);
		}
		
		/**
		 * 复制传入的 CSSStyle 属性值。
		 * @param	src 待复制的 CSSStyle 对象。
		 */
		public function inherit(src:HTMLStyle):void {
			var i:int, len:int;
			var props:Array;
			props = _inheritProps;
			len = props.length;
			var key:String;
			for (i = 0; i < len; i++) {
				key = props[i];
				this[key] = src[key];
			}
		}
		
		/**
		 * 表示是否换行。
		 */
		public function get wordWrap():Boolean {
			return (_type & _NOWARP) === 0;
		}
		
		public function set wordWrap(value:Boolean):void {
			value ? (_type &= ~_NOWARP) : (_type |= _NOWARP);
		}
		
		/**是否为粗体*/
		public function get bold():Boolean {
			return (_type & _BOLD) != 0;
		}
		
		public function set bold(value:Boolean):void {
			value ? (_type |= _BOLD) : (_type &= ~_BOLD);
		}
		
		/**
		 * 表示使用此文本格式的文本是否为斜体。
		 * @default false
		 */
		public function get italic():Boolean {
			return (_type & _ITALIC) != 0;
		}
		
		public function set italic(value:Boolean):void {
			value ? (_type |= _ITALIC) : (_type &= ~_ITALIC);
		}
		
		/**@private */
		public function _widthAuto():Boolean {
			return (_type & _WIDTHAUTO) !== 0;// || (_type & _WIDTH_SET) === 0;
		}
		
		/**@inheritDoc	 */
		public function widthed(sprite:*):Boolean {
			return (_type & _WIDTH_SET) != 0;
		}
		
		public function set whiteSpace(type:String):void {
			type === "nowrap" && (_type |= _NOWARP);
			type === "none" && (_type &= ~_NOWARP);
		}
		
		/**
		 * 设置如何处理元素内的空白。
		 */
		public function get whiteSpace():String {
			return (_type & _NOWARP) ? "nowrap" : "";
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		public function _calculation(type:String, value:String):Boolean {
			return false;
		}
		
		/**
		 * 宽度。
		 */
		public function set width(w:*):void {
			_type |= _WIDTH_SET;
			if (w is String) {
				var offset:int = w.indexOf('auto');
				if (offset >= 0) {
					_type |= _WIDTHAUTO;
					w = w.substr(0, offset);
				}
				if (_calculation("width", w)) return;
				w = parseInt(w);
			}
			
			size(w, -1);
		}
		
		/**
		 * 高度。
		 */
		public function set height(h:*):void {
			_type |= _HEIGHT_SET;
			if (h is String) {
				if (_calculation("height", h)) return;
				h = parseInt(h);
			}
			size(-1, h);
		}
		
		/**
		 * 是否已设置高度。
		 * @param	sprite 显示对象 Sprite。
		 * @return 一个Boolean 表示是否已设置高度。
		 */
		public function heighted(sprite:*):Boolean {
			return (_type & _HEIGHT_SET) != 0;
		}
		
		/**
		 * 设置宽高。
		 * @param	w 宽度。
		 * @param	h 高度。
		 */
		public function size(w:Number, h:Number):void {
			var ower:HTMLElement = this.ower;
			var resize:Boolean = false;
			if (w !== -1 && w != ower.width) {
				_type |= _WIDTH_SET;
				ower.width = w;
				resize = true;
			}
			if (h !== -1 && h != ower.height) {
				_type |= _HEIGHT_SET;
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
		public function getLineElement():Boolean {
			return (_type & _LINE_ELEMENT) != 0;
		}
		
		public function setLineElement(value:Boolean):void {
			value ? (_type |= _LINE_ELEMENT) : (_type &= (~_LINE_ELEMENT));
		}
		
		/**@private */
		//TODO:coverage
		public function _enableLayout():Boolean {
			return (_type & _DISPLAY_NONE) === 0 && (_type & _ABSOLUTE) === 0;
		}
		
		/**
		 * 间距。
		 */
		public function get letterSpacing():int {
			return _extendStyle.letterSpacing;
		}
		
		public function set letterSpacing(d:int):void {
			(d is String) && (d = parseInt(d + ""));
			if (d == _extendStyle.letterSpacing) return;
			_getExtendStyle().letterSpacing = d;
		}
		
		/**
		 * 设置 CSS 样式字符串。
		 * @param	text CSS样式字符串。
		 */
		public function cssText(text:String):void {
			attrs(parseOneCSS(text, ';'));
		}
		
		/**
		 * 根据传入的属性名、属性值列表，设置此对象的属性值。
		 * @param	attrs 属性名与属性值列表。
		 */
		public function attrs(attrs:Array):void {
			if (attrs) {
				for (var i:int = 0, n:int = attrs.length; i < n; i++) {
					var attr:Array = attrs[i];
					this[attr[0]] = attr[1];
				}
			}
		}
		
		public function set position(value:String):void {
			value === "absolute" ? (_type |= _ABSOLUTE) : (_type &= ~_ABSOLUTE);
		}
		
		/**
		 * 元素的定位类型。
		 */
		public function get position():String {
			return (_type & _ABSOLUTE) ? "absolute" : "";
		}
		
		/**@inheritDoc	 */
		public function get absolute():Boolean {
			return (_type & _ABSOLUTE) !== 0;
		}
		
		/**@inheritDoc	 */
		public function get paddingLeft():Number {
			return padding[3];
		}
		
		/**@inheritDoc	 */
		public function get paddingTop():Number {
			return padding[0];
		}
		
		/**
		 * 通过传入的分割符，分割解析CSS样式字符串，返回样式列表。
		 * @param	text CSS样式字符串。
		 * @param	clipWord 分割符；
		 * @return 样式列表。
		 */
		public static function parseOneCSS(text:String, clipWord:String):Array {
			var out:Array = [];
			var attrs:Array = text.split(clipWord);
			var valueArray:Array;
			
			for (var i:int = 0, n:int = attrs.length; i < n; i++) {
				var attr:String = attrs[i];
				var ofs:int = attr.indexOf(':');
				var name:String = attr.substr(0, ofs).replace(/^\s+|\s+$/g, '');
				
				// 最后一个元素是空元素。
				if (name.length === 0) continue;
				
				var value:String = attr.substr(ofs + 1).replace(/^\s+|\s+$/g, '');//去掉前后空格和\n\t
				var one:Array = [name, value];
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
					(one[0] = _CSSTOVALUE[name]) || (one[0] = name);
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
		public static function parseCSS(text:String, uri:URL):void {
			var one:Array;
			while ((one = _parseCSSRegExp.exec(text)) != null) {
				styleSheets[one[1]] = parseOneCSS(one[2], ';');
			}
		}
	}
}