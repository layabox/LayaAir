package laya.html.dom {
	import laya.display.Graphics;
	import laya.events.Event;
	import laya.html.utils.HTMLStyle;
	import laya.html.utils.ILayout;
	import laya.net.Loader;
	import laya.resource.Texture;
	
	/**
	 * @private
	 */
	public class HTMLImageElement extends HTMLElement {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		private var _tex:Texture;
		private var _url:String;
		
		override public function reset():HTMLElement {
			super.reset();
			if (_tex) {
				_tex.off(Event.LOADED, this, onloaded);
			}
			_tex = null;
			_url = null;
			return this;
		}
		
		public function set src(url:String):void {
			url = formatURL(url);
			if (_url === url) return;
			_url = url;
			
			var tex:Texture = _tex = Loader.getRes(url);
			if (!tex) {
				_tex = tex = new Texture();
				tex.load(url);
				Loader.cacheRes(url, tex);
			}
			
			tex.getIsReady() ? onloaded() : tex.once(Event.READY, this, onloaded);
		}
		
		//TODO:coverage
		private function onloaded():void {
			if (!_style) return;
			var style:HTMLStyle = _style as HTMLStyle;
			var w:Number = style.widthed(this) ? -1 : _tex.width;
			var h:Number = style.heighted(this) ? -1 : _tex.height;
			
			if (!style.widthed(this) && _width != _tex.width) {
				width = _tex.width;
				parent && parent._layoutLater();
			}
			
			if (!style.heighted(this) && _height != _tex.height) {
				height = _tex.height;
				parent && parent._layoutLater();
			}
			repaint();
		}
		
		//TODO:coverage
		public override function _addToLayout(out:Vector.<ILayout>):void {
			var style:HTMLStyle = _style as HTMLStyle;
			!style.absolute && out.push(this);
		}
		
		//TODO:coverage
		override public function renderSelfToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void {
			if (!_tex) return;		
			graphic.drawImage(_tex, gX, gY, width || _tex.width, height || _tex.height);
		}
	}
}