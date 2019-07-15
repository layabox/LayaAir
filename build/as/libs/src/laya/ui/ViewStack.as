/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.IItem;
	improt laya.display.Node;
	improt laya.ui.Box;
	improt laya.utils.Handler;
	public class ViewStack extends laya.ui.Box implements laya.ui.IItem {
		protected var _items:Array;
		protected var _setIndexHandler:Handler;
		protected var _selectedIndex:Number;
		public function setItems(views:Array):void{}
		public function initItems():void{}
		public var selectedIndex:Number;
		protected function setSelect(index:Number,selected:Boolean):void{}
		public var selection:Node;
		public var setIndexHandler:Handler;
		protected function setIndex(index:Number):void{}
		public function get items():Array{};
		public var dataSource:*;
	}

}
