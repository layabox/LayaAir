/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.html.dom.HTMLElement;
	improt laya.display.Graphics;
	public class HTMLImageElement extends laya.html.dom.HTMLElement {
		private var _tex:*;
		private var _url:*;

		public function HTMLImageElement(){}
		public function reset():HTMLElement{}
		public var src:String;
		private var onloaded:*;
		public function renderSelfToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
	}

}
