/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.html.dom.HTMLElement;
	improt laya.display.Graphics;
	public class HTMLLinkElement extends laya.html.dom.HTMLElement {
		public static var _cuttingStyle:RegExp;
		public var type:String;
		private var _loader:*;
		protected function _creates():void{}
		public function drawToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		public function reset():HTMLElement{}
		public var href:String;
	}

}
