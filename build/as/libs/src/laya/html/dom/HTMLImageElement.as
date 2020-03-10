package laya.html.dom {
	import laya.html.dom.HTMLElement;
	import laya.display.Graphics;

	/**
	 * @private 
	 */
	public class HTMLImageElement extends HTMLElement {
		private var _tex:*;
		private var _url:*;

		public function HTMLImageElement(){}

		/**
		 * @override 
		 */
		override public function reset():HTMLElement{
			return null;
		}
		public var src:String;
		private var onloaded:*;

		/**
		 * @param graphic 
		 * @param gX 
		 * @param gY 
		 * @param recList 
		 * @override 
		 */
		override public function renderSelfToGraphic(graphic:Graphics,gX:Number,gY:Number,recList:Array):void{}
	}

}
