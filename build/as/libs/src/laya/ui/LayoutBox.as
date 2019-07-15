/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	improt laya.display.Node;
	public class LayoutBox extends laya.ui.Box {
		protected var _space:Number;
		protected var _align:String;
		protected var _itemChanged:Boolean;
		public function addChild(child:Node):Node{}
		private var onResize:*;
		public function addChildAt(child:Node,index:Number):Node{}
		public function removeChildAt(index:Number):Node{}
		public function refresh():void{}
		protected function changeItems():void{}
		public var space:Number;
		public var align:String;
		protected function sortItem(items:Array):void{}
		protected function _setItemChanged():void{}
	}

}
