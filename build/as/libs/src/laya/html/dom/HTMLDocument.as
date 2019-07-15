/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.html.dom.HTMLElement;
	public class HTMLDocument {
		public static var document:HTMLDocument;
		public var all:Array;
		public var styleSheets:*;
		public function getElementById(id:String):HTMLElement{}
		public function setElementById(id:String,e:HTMLElement):void{}
	}

}
