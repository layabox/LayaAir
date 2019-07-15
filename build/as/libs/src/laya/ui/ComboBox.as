/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.Button;
	improt laya.ui.List;
	improt laya.ui.VScrollBar;
	improt laya.events.Event;
	improt laya.utils.Handler;
	public class ComboBox extends laya.ui.UIComponent {
		protected var _visibleNum:Number;
		protected var _button:Button;
		protected var _list:List;
		protected var _isOpen:Boolean;
		protected var _itemColors:Array;
		protected var _itemSize:Number;
		protected var _labels:Array;
		protected var _selectedIndex:Number;
		protected var _selectHandler:Handler;
		protected var _itemHeight:Number;
		protected var _listHeight:Number;
		protected var _listChanged:Boolean;
		protected var _itemChanged:Boolean;
		protected var _scrollBarSkin:String;
		protected var _isCustomList:Boolean;
		public var itemRender:*;

		public function ComboBox(skin:String = null,labels:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		private var _createList:*;
		private var _setListEvent:*;
		private var onListDown:*;
		private var onScrollBarDown:*;
		private var onButtonMouseDown:*;
		public var skin:String;
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		protected function changeList():void{}
		protected function onlistItemMouse(e:Event,index:Number):void{}
		private var switchTo:*;
		protected function changeOpen():void{}
		public var width:Number;
		public var height:Number;
		public var labels:String;
		protected function changeItem():void{}
		public var selectedIndex:Number;
		private var changeSelected:*;
		public var selectHandler:Handler;
		public var selectedLabel:String;
		public var visibleNum:Number;
		public var itemColors:String;
		public var itemSize:Number;
		public var isOpen:Boolean;
		private var _onStageMouseWheel:*;
		protected function removeList(e:Event):void{}
		public var scrollBarSkin:String;
		public var sizeGrid:String;
		public function get scrollBar():VScrollBar{};
		public function get button():Button{};
		public var list:List;
		public var dataSource:*;
		public var labelColors:String;
		public var labelPadding:String;
		public var labelSize:Number;
		public var labelBold:Boolean;
		public var labelFont:String;
		public var stateNum:Number;
	}

}
