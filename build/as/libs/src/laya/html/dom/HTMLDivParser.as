/*[IF-FLASH]*/
package laya.html.dom {
	improt laya.html.dom.HTMLElement;
	improt laya.maths.Rectangle;
	improt laya.utils.Handler;
	public class HTMLDivParser extends laya.html.dom.HTMLElement {
		public var contextHeight:Number;
		public var contextWidth:Number;
		private var _htmlBounds:*;
		private var _boundsRec:*;
		public var repaintHandler:Handler;
		public function reset():HTMLElement{}
		public var innerHTML:String;
		public var width:Number;
		public function appendHTML(text:String):void{}
		public function getBounds():Rectangle{}
		public function parentRepaint(recreate:Boolean = null):void{}
		public function layout():void{}
		public var height:Number;
	}

}
