package laya.html.dom {
	import laya.display.Graphics;
	import laya.html.utils.HTMLStyle;
	import laya.html.utils.ILayout;
	import laya.html.utils.Layout;
	import laya.net.URL;
	import laya.utils.HTMLChar;
	import laya.utils.Pool;
	import laya.utils.Utils;
	
	/**
	 * @private
	 */
	public class HTMLElement {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		private static var _EMPTYTEXT:Object = /*[STATIC SAFE]*/ {text: null, words: null};
		
		public var URI:URL;
		public var parent:HTMLElement;
		public var _style:HTMLStyle;
		
		protected var _text:Object;
		protected var _children:Array;
		protected var _x:Number;
		protected var _y:Number;
		protected var _width:Number;
		protected var _height:Number;
		
		/**
		 * 格式化指定的地址并返回。
		 * @param	url 地址。
		 * @param	base 基础路径，如果没有，则使用basePath。
		 * @return	格式化处理后的地址。
		 */
		public static function formatURL1(url:String,basePath:String=null):String {
			if (!url) return "null path";
			if (!basePath) basePath = URL.basePath;
			//如果是全路径，直接返回，提高性能
			if (url.indexOf(":") > 0) return url;
			//自定义路径格式化
			if (URL.customFormat != null) url = URL.customFormat(url);			
			//如果是全路径，直接返回，提高性能
			if (url.indexOf(":") > 0) return url;
			
			var char1:String = url.charAt(0);
			if (char1 === ".") {
				return URL._formatRelativePath (basePath + url);
			} else if (char1 === '~') {
				return URL.rootPath + url.substring(1);
			} else if (char1 === "d") {
				if (url.indexOf("data:image") === 0) return url;
			} else if (char1 === "/") {
				return url;
			}
			return basePath + url;
		}
		
		public function HTMLElement() {
			_creates();
			reset();
		}
		
		protected function _creates():void {
			_style = HTMLStyle.create();
		}
		
		/**
		 * 重置
		 */
		public function reset():HTMLElement {
			URI = null;
			parent = null;
			_style.reset();
			_style.ower = this;
			_style.valign = "middle";
			if (_text && _text.words) {
				var words:Array = _text.words;
				var i:int, len:int;
				len = words.length;
				var tChar:HTMLChar;
				for (i = 0; i < len; i++) {
					tChar = words[i];
					if (tChar) tChar.recover();
				}
			}
			_text = _EMPTYTEXT;
			if (_children) _children.length = 0;
			_x = _y = _width = _height = 0;
			return this;
		}
		
		/**@private */
		public function _getCSSStyle():HTMLStyle {
			return _style as HTMLStyle;
		}
		
		/**@private */
		public function _addChildsToLayout(out:Vector.<ILayout>):Boolean {
			var words:Vector.<HTMLChar> = _getWords();
			if (words == null && (!_children || _children.length == 0))
				return false;
			if (words) {
				for (var i:int = 0, n:int = words.length; i < n; i++) {
					out.push(words[i]);
				}
			}
			if (_children)
				_children.forEach(function(o:HTMLElement, index:int, array:Array):void {
					var _style:HTMLStyle = o._style as HTMLStyle;
					_style._enableLayout && _style._enableLayout() && o._addToLayout(out);
				});
			return true;
		}
		
		/**@private */
		public function _addToLayout(out:Vector.<ILayout>):void {
			if (!_style) return;
			var style:HTMLStyle = _style as HTMLStyle;
			if (style.absolute) return;
			style.block ? out.push(this) : (_addChildsToLayout(out) && (x = y = 0));
		}
		
		public function set id(value:String):void {
			HTMLDocument.document.setElementById(value, this);
		}
		
		public function repaint(recreate:Boolean = false):void {
			parentRepaint(recreate);
		}
		
		public function parentRepaint(recreate:Boolean = false):void {
			if (parent) parent.repaint(recreate);
		}
		
		public function set innerTEXT(value:String):void {
			if (_text === _EMPTYTEXT) {
				_text = {text: value, words: null};
			} else {
				_text.text = value;
				_text.words && (_text.words.length = 0);
			}
			repaint();
		}
		
		public function get innerTEXT():String {
			return _text.text;
		}
		
		protected function _setParent(value:HTMLElement):void {
			if (value is HTMLElement) {
				var p:HTMLElement = value as HTMLElement;
				URI || (URI = p.URI);
				if (style)
					style.inherit(p.style);
			}
		}
		
		public function appendChild(c:HTMLElement):HTMLElement {
			return addChild(c) as HTMLElement;
		}
		
		public function addChild(c:HTMLElement):HTMLElement {
			if (c.parent) c.parent.removeChild(c);
			if (!_children) _children = [];
			_children.push(c);
			c.parent = this;
			c._setParent(this);
			repaint();
			return c;
		}
		
		public function removeChild(c:HTMLElement):HTMLElement {
			if (!_children) return null;
			var i:int, len:int;
			len = _children.length;
			for (i = 0; i < len; i++) {
				if (_children[i] == c) {
					_children.splice(i, 1);
					return c;
				}
			}
			return null;
		}
		
		public static function getClassName(tar:Object):String {
			if (tar is Function) return tar.name;
			return tar["constructor"].name;
		}
		
		/**
		 * <p>销毁此对象。destroy对象默认会把自己从父节点移除，并且清理自身引用关系，等待js自动垃圾回收机制回收。destroy后不能再使用。</p>
		 * <p>destroy时会移除自身的事情监听，自身的timer监听，移除子对象及从父节点移除自己。</p>
		 * @param destroyChild	（可选）是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
		 */
		public function destroy():void {
			//销毁子节点
			if (_children) {
				destroyChildren();
				this._children.length = 0;
			}
			Pool.recover(getClassName(this), reset());
		}
		
		/**
		 * 销毁所有子对象，不销毁自己本身。
		 */
		public function destroyChildren():void {
			//销毁子节点
			if (_children) {
				for (var i:int = this._children.length - 1; i > -1; i--) {
					this._children[i].destroy();
				}
				_children.length = 0;
			}
		}
		
		public function get style():HTMLStyle {
			return _style as HTMLStyle;
		}
		
		public function _getWords():Vector.<HTMLChar> {
			if (!_text) return null;
			var txt:String = _text.text;
			if (!txt || txt.length === 0)
				return null;
			
			var words:Vector.<HTMLChar> = _text.words;
			if (words && words.length === txt.length)
				return words as Vector.<HTMLChar>;
			words === null && (_text.words = words = new Vector.<HTMLChar>());
			words.length = txt.length;
			var size:Object;
			var style:HTMLStyle = this.style;
			var fontStr:String = style.font;
			for (var i:int = 0, n:int = txt.length; i < n; i++) {
				size = Utils.measureText(txt.charAt(i), fontStr);
				words[i] = HTMLChar.create().setData(txt.charAt(i), size.width, size.height || style.fontSize, style);
			}
			return words;
		}
		
		//TODO:coverage
		public function _isChar():Boolean {
			return false;
		}
		
		public function _layoutLater():void {
			var style:HTMLStyle = this.style;
			
			if ((style._type & HTMLStyle.ADDLAYOUTED))
				return;
			
			if (style.widthed(this) && ((_children && _children.length > 0) || _getWords() != null) && style.block) {
				Layout.later(this);
				style._type |= HTMLStyle.ADDLAYOUTED;
			} else {
				parent && parent._layoutLater();
			}
		}
		
		public function set x(v:Number):void {
			if (_x != v) {
				_x = v;
				parentRepaint();
			}
		}
		
		public function get x():Number {
			return _x;
		}
		
		public function set y(v:Number):void {
			if (_y != v) {
				_y = v;
				parentRepaint();
			}
		}
		
		public function get y():Number {
			return _y;
		}
		
		public function get width():Number {
			return this._width;
		}
		
		public function set width(value:Number):void {
			if (this._width !== value) {
				this._width = value;
				repaint();
			}
		}
		
		public function get height():Number {
			return this._height;
		
		}
		
		public function set height(value:Number):void {
			if (this._height !== value) {
				this._height = value;
				repaint();
			}
		}
		
		public function _setAttributes(name:String, value:String):void {
			switch (name) {
			case 'style': 
				style.cssText(value);
				break;
			case 'class': 
				className = value;
				break;
			case 'x': 
				x = parseFloat(value);
				break;
			case 'y': 
				y = parseFloat(value);
				break;
			case 'width': 
				width = parseFloat(value);
				break;
			case 'height': 
				height = parseFloat(value);
				break;
			default: 
				this[name] = value;
			}
		}
		
		public function set href(url:String):void {
			if (!_style) return;
			if (url != _style.href) {
				_style.href = url;
				repaint();
			}
		}
		
		public function get href():String {
			if (!_style) return null;
			return _style.href;
		}
		
		public function formatURL(url:String):String {
			if (!URI) return url;
			return formatURL1(url, URI ? URI.path : null);
		}
		
		public function set color(value:String):void {
			style.color = value;
		}
		
		public function set className(value:String):void {
			style.attrs(HTMLDocument.document.styleSheets['.' + value]);
		}
		
		public function drawToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void {
			gX += this.x;
			gY += this.y;
			var cssStyle:HTMLStyle = this.style;
			if (cssStyle.paddingLeft) {
				gX += cssStyle.paddingLeft;
			}
			if (cssStyle.paddingTop) {
				gY += cssStyle.paddingTop;
			}
			if (cssStyle.bgColor != null || cssStyle.borderColor) {
				graphic.drawRect(gX, gY, this.width, this.height, cssStyle.bgColor, cssStyle.borderColor, 1);
			}
			
			renderSelfToGraphic(graphic, gX, gY, recList);
			var i:int, len:int;
			var tChild:HTMLElement;
			if (_children && _children.length > 0) {
				len = _children.length;
				for (i = 0; i < len; i++) {
					tChild = _children[i];
					if (tChild.drawToGraphic != null)
						tChild.drawToGraphic(graphic, gX, gY, recList);
				}
			}
		}
		
		public function renderSelfToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void {
			var cssStyle:HTMLStyle = this.style;
			var words:Vector.<HTMLChar> = this._getWords();
			var i:int, len:int;
			
			if (words) {
				len = words.length;
				var a:HTMLChar;
				if (cssStyle) {
					var font:String = cssStyle.font;
					var color:String = cssStyle.color;
					if (cssStyle.stroke) {
						var stroke:* = cssStyle.stroke;
						stroke = parseInt(stroke);
						var strokeColor:String = cssStyle.strokeColor;
						//for (i = 0; i < len; i++) {
						//a = words[i];
						//graphic.strokeText(a.char, a.x + gX, a.y + gY, font, strokeColor, stroke, 'left');
						//graphic.fillText(a.char, a.x + gX, a.y + gY, font, color, 'left');
						//}
						graphic.fillBorderWords(words as Array, gX, gY, font, color, strokeColor, stroke);
					} else {
						//for (i = 0; i < len; i++) {
						//a = words[i];
						//graphic.fillText(a.char, a.x + gX, a.y + gY, font, color, 'left');
						//}
						graphic.fillWords(words as Array, gX, gY, font, color);
					}
					if (href) {
						var lastIndex:int = words.length - 1;
						var lastWords:HTMLChar = words[lastIndex];
						var lineY:Number = lastWords.y + lastWords.height;
						
						if (lastWords.y == words[0].y)
						{
							if(cssStyle.textDecoration!="none")
							graphic.drawLine(words[0].x, lineY, lastWords.x + lastWords.width, lineY, color, 1);
							var hitRec:HTMLHitRect = HTMLHitRect.create();
							hitRec.rec.setTo(words[0].x, lastWords.y, lastWords.x + lastWords.width - words[0].x, lastWords.height);
							hitRec.href = href;
							recList.push(hitRec);
						}else
						{
							workLines(words as Array,graphic,recList);
						}
						
						
					}
				}
				
			}
		}
		
		private function workLines(wordList:Array,g:Graphics,recList:Array):void
		{
			var cssStyle:HTMLStyle = this.style;
			var hasLine:Boolean;
			hasLine = cssStyle.textDecoration != "none";
			var i:int, len:int;
			len = wordList.length;
			var tStartWord:HTMLChar;
			tStartWord = wordList[i];
			var tEndWord:HTMLChar;
			tEndWord = tStartWord;
			if (!tStartWord) return;
			var tword:HTMLChar;
			for (i = 1; i < len; i++)
			{
				tword = wordList[i];
				if (tword.y != tStartWord.y)
				{
					createOneLine(tStartWord, tEndWord,hasLine,g,recList);
					tStartWord = tword;
					tEndWord = tword;
				}else
				{
					tEndWord = tword;
				}
			}
			createOneLine(tStartWord, tEndWord,hasLine,g,recList);
		}
		private function createOneLine(startWord:HTMLChar, lastWords:HTMLChar,hasLine:Boolean,graphic:Graphics,recList:Array):void
		{
			var lineY:Number = lastWords.y + lastWords.height;
			if(hasLine)
				graphic.drawLine(startWord.x, lineY, lastWords.x + lastWords.width, lineY, color, 1);
			var hitRec:HTMLHitRect = HTMLHitRect.create();
			hitRec.rec.setTo(startWord.x, lastWords.y, lastWords.x + lastWords.width - startWord.x, lastWords.height);
			hitRec.href = href;
			recList.push(hitRec);
		}
	}
}