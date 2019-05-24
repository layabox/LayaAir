package laya.html.dom {
	import laya.display.Graphics;
	import laya.html.utils.HTMLStyle;
	import laya.html.utils.ILayout;
	import laya.utils.Pool;
	
	/**
	 * @private
	 */
	public class HTMLBrElement {
		public static var brStyle:HTMLStyle;
		
		/**@private */
		public function _addToLayout(out:Vector.<ILayout>):void {
			out.push(this as ILayout);
		}
		
		//TODO:coverage
		public function reset():HTMLBrElement {
			return this;
		}
		
		public function destroy():void {
			Pool.recover(HTMLElement.getClassName(this), reset());
		}
		
		protected function _setParent(value:HTMLElement):void {
		
		}
		
		public function set parent(value:*):void {
		
		}
		
		public function set URI(value:*):void {
		}
		
		public function set href(value:*):void {
		
		}
		
		/**@private */
		//TODO:coverage
		public function _getCSSStyle():HTMLStyle {
			if (!brStyle) {
				brStyle = new HTMLStyle();
				brStyle.setLineElement(true);
				brStyle.block = true;
			}
			return brStyle;
		}
		
		public function renderSelfToGraphic(graphic:Graphics, gX:int, gY:int, recList:Array):void {
		
		}
	}
}