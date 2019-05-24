package laya.html.dom {
	import laya.display.Graphics;
	import laya.events.Event;
	import laya.html.utils.HTMLStyle;
	import laya.net.Loader;
	import laya.net.URL;
	
	/**
	 * @private
	 */
	public class HTMLLinkElement extends HTMLElement {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		public static var _cuttingStyle:RegExp =/*[STATIC SAFE]*/ new RegExp("((@keyframes[\\s\\t]+|)(.+))[\\t\\n\\r\\\s]*{", "g");
		public var type:String;
		private var _loader:Loader;
		
		override protected function _creates():void 
		{
		}
		
		override public function drawToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void 
		{
		}
		override public function reset():HTMLElement {
			if (_loader) _loader.off(Event.COMPLETE, this, _onload);
			_loader = null;
			return this;
		}
		
		public function _onload(data:String):void {
			if (_loader) _loader = null;
			switch (type) {
			case 'text/css': 
				HTMLStyle.parseCSS(data, URI);
				break;
			}
			repaint(true);
		}
		
		override public function set href(url:String):void {
			if (!url) return;
			url = formatURL(url);
			URI = new URL(url);
			if (_loader) _loader.off(Event.COMPLETE, this, _onload);
			if (Loader.getRes(url))
			{
				if (type == "text/css")
				{
					HTMLStyle.parseCSS(Loader.getRes(url), URI);
				}
				return;
			}
			_loader = new Loader();
			_loader.once(Event.COMPLETE, this, _onload);
			_loader.load(url, Loader.TEXT);
		}
	}
}