package laya.html.dom {
	import laya.html.dom.HTMLElement;
	import laya.display.Graphics;

	/**
	 * @private 
	 */
	public class HTMLStyleElement extends HTMLElement {

		/**
		 * @override 
		 */
		override protected function _creates():void{}

		/**
		 * @param graphic 
		 * @param gX 
		 * @param gY 
		 * @param recList 
		 * @override 
		 */
		override public function drawToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}

		/**
		 * @override 
		 */
		override public function reset():HTMLElement{
			return null;
		}
	}

}
