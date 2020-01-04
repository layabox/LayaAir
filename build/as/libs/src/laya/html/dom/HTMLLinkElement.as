package laya.html.dom {
	import laya.html.dom.HTMLElement;
	import laya.display.Graphics;

	/**
	 * @private 
	 */
	public class HTMLLinkElement extends HTMLElement {
		public static var _cuttingStyle:RegExp;
		public var type:String;
		private var _loader:*;

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
