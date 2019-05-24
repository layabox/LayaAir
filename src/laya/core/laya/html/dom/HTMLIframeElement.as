package laya.html.dom
{
	import laya.net.Loader;
	import laya.net.URL;
	import laya.events.Event;

	/**
	 * iframe标签类，目前用于加载外并解析数据
	 */
	public class HTMLIframeElement extends HTMLDivElement 
	{
		
		public function HTMLIframeElement() 
		{
			super();
			_element._getCSSStyle().valign = "middle";
		}
		
		/**
		 * 加载html文件，并解析数据
		 * @param	url
		 */
		public function set href(url:String):void
		{
			url = _element.formatURL(url);
			var l:Loader = new Loader();
			l.once(Event.COMPLETE, null, function(data:String):void {
				var pre:URL = _element.URI;
				_element.URI = new URL(url);
				innerHTML = data;
				!pre || (_element.URI = pre);
			});
			l.load(url, Loader.TEXT);
		}
		
	}

}