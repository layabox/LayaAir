package laya.html.dom {
	import laya.display.Graphics;
	import laya.html.utils.HTMLStyle;
	
	/**
	 * @private
	 */
	public class HTMLStyleElement extends HTMLElement {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		
		override protected function _creates():void 
		{
		}
		
		override public function drawToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void 
		{
		}
		//TODO:coverage
		override public function reset():HTMLElement {
			return this;
		}
		
		/**
		 * 解析样式
		 */
		override public function set innerTEXT(value:String):void {
			HTMLStyle.parseCSS(value, null);
		}
	}
}