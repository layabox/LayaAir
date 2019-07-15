/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	improt laya.ui.IRender;
	improt laya.ui.List;
	improt laya.ui.ScrollBar;
	improt laya.events.Event;
	improt laya.utils.Handler;
	public class Tree extends laya.ui.Box implements laya.ui.IRender {
		protected var _list:List;
		protected var _source:Array;
		protected var _renderHandler:Handler;
		protected var _spaceLeft:Number;
		protected var _spaceBottom:Number;
		protected var _keepStatus:Boolean;

		public function Tree(){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		protected function onListChange(e:Event = null):void{}
		public var keepStatus:Boolean;
		public var array:Array;
		public function get source():Array{};
		public function get list():List{};
		public var itemRender:*;
		public var scrollBarSkin:String;
		public function get scrollBar():ScrollBar{};
		public var mouseHandler:Handler;
		public var renderHandler:Handler;
		public var spaceLeft:Number;
		public var spaceBottom:Number;
		public var selectedIndex:Number;
		public var selectedItem:*;
		public var width:Number;
		public var height:Number;
		protected function getArray():Array{}
		protected function getDepth(item:*,num:Number = null):Number{}
		protected function getParentOpenStatus(item:*):Boolean{}
		protected function renderItem(cell:Box,index:Number):void{}
		private var onArrowClick:*;
		public function setItemState(index:Number,isOpen:Boolean):void{}
		public function fresh():void{}
		public var dataSource:*;
		public var xml:XMLDocument;
		protected function parseXml(xml:ChildNode,source:Array,nodeParent:*,isRoot:Boolean):void{}
		protected function parseOpenStatus(oldSource:Array,newSource:Array):void{}
		protected function isSameParent(item1:*,item2:*):Boolean{}
		public function get selectedPath():String{};
		public function filter(key:String):void{}
		private var getFilterSource:*;
	}

}
