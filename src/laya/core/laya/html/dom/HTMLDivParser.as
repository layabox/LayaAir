package laya.html.dom {
	import laya.html.utils.HTMLParse;
	import laya.html.utils.HTMLStyle;
	import laya.html.utils.ILayout;
	import laya.html.utils.Layout;
	import laya.maths.Rectangle;
	import laya.utils.HTMLChar;
	import laya.utils.Handler;
	
	/**
	 * @private
	 */
	public class HTMLDivParser extends HTMLElement {
		/** 实际内容的高 */
		public var contextHeight:Number;
		/** 实际内容的宽 */
		public var contextWidth:Number;
		/** @private */
		private var _htmlBounds:Rectangle;
		/** @private */
		private var _boundsRec:Rectangle;
		/** 重绘回调 */
		public var repaintHandler:Handler = null;
		
		override public function reset():HTMLElement {
			HTMLStyleElement;
			HTMLLinkElement;
			super.reset();
			_style.block = true;
			_style.setLineElement(true);
			_style.width = 200;
			_style.height = 200;
			repaintHandler = null;
			contextHeight = 0;
			contextWidth = 0;
			return this;
		}
		
		/**
		 * 设置标签内容
		 */
		public function set innerHTML(text:String):void {
			this.destroyChildren();
			appendHTML(text);
		}
		
		override public function set width(value:Number):void {
			var changed:Boolean;
			if (value === 0) {
				changed = value != _width;
			} else {
				changed = value != width;
			}
			super.width = value;
			if (changed) layout();
		}
		
		/**
		 * 追加内容，解析并对显示对象排版
		 * @param	text
		 */
		public function appendHTML(text:String):void {
			HTMLParse.parse(this, text, URI);
			layout();
		}
		
		/**
		 * @private
		 * @param	out
		 * @return
		 */
		override public function _addChildsToLayout(out:Vector.<ILayout>):Boolean {
			var words:Vector.<HTMLChar> = _getWords();
			if (words == null && (!_children||_children.length == 0)) return false;
			words && words.forEach(function(o:*):void {
				out.push(o);
			});
			var tFirstKey:Boolean = true;
			
			for (var i:int = 0, len:int = _children.length; i < len; i++) {
				var o:HTMLElement = _children[i];
				if (tFirstKey) {
					tFirstKey = false;
				} else {
					out.push(null);
				}
				//o._style._enableLayout() && o._addToLayout(out);
				o._addToLayout(out)
			}
			return true;
		}
		
		/**
		 * @private
		 * @param	out
		 */
		//TODO:coverage
		override public function _addToLayout(out:Vector.<ILayout>):void {
			layout();
			!style.absolute && out.push(this);
		}
		
		/**
		 * 获取bounds
		 * @return
		 */
		public function getBounds():Rectangle {
			if (!_htmlBounds) return null;
			if (!_boundsRec) _boundsRec = Rectangle.create();
			return _boundsRec.copyFrom(_htmlBounds);
		}
		
		override public function parentRepaint(recreate:Boolean=false):void {
			super.parentRepaint();
			if (repaintHandler) repaintHandler.runWith(recreate);
		}
		
		/**
		 * @private
		 * 对显示内容进行排版
		 */
		public function layout():void {
			style._type |= HTMLStyle.ADDLAYOUTED;
			var tArray:Array = Layout.layout(this);
			if (tArray) {
				if (!_htmlBounds) _htmlBounds = Rectangle.create();
				var tRectangle:Rectangle = _htmlBounds;
				tRectangle.x = tRectangle.y = 0;
				tRectangle.width = this.contextWidth = tArray[0];
				tRectangle.height = this.contextHeight = tArray[1];
			}
		}
		
		/**
		 * 获取对象的高
		 */
		override public function get height():Number {
			if (_height) return _height;
			return contextHeight;
		}
		
		/**
		 * 获取对象的宽
		 */
		override public function get width():Number {
			if (_width) return _width;
			return contextWidth;
		}	
	}
}