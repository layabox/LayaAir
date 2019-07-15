/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.html.dom.HTMLElement;
	improt laya.display.Graphics;
	public class HTMLStyleElement extends laya.html.dom.HTMLElement {
		protected function _creates():void{}
		public function drawToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
		public function reset():HTMLElement{}
		public var innerTEXT:String;
	}

}
