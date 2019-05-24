package laya.html.dom {
	import laya.html.utils.HTMLStyle;
	
	/**
	 * @private
	 */
	public class HTMLDocument {
		public static var document:HTMLDocument = new HTMLDocument();
		public var all:Vector.<HTMLElement> = new Vector.<HTMLElement>;
		public var styleSheets:Object = HTMLStyle.styleSheets;
		
		//TODO:coverage
		public function getElementById(id:String):HTMLElement {
			return all[id];
		}
		
		//TODO:coverage
		public function setElementById(id:String, e:HTMLElement):void {
			all[id] = e;
		}
	}
}