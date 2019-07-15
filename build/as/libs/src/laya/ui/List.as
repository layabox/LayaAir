/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	improt laya.ui.IRender;
	improt laya.ui.IItem;
	improt laya.ui.ScrollBar;
	improt laya.events.Event;
	improt laya.maths.Point;
	improt laya.utils.Handler;
	public class List extends laya.ui.Box implements laya.ui.IRender,laya.ui.IItem {
		public var selectHandler:Handler;
		public var renderHandler:Handler;
		public var mouseHandler:Handler;
		public var selectEnable:Boolean;
		public var totalPage:Number;
		protected var _content:Box;
		protected var _scrollBar:ScrollBar;
		protected var _itemRender:*;
		protected var _repeatX:Number;
		protected var _repeatY:Number;
		protected var _repeatX2:Number;
		protected var _repeatY2:Number;
		protected var _spaceX:Number;
		protected var _spaceY:Number;
		protected var _cells:Array;
		protected var _array:Array;
		protected var _startIndex:Number;
		protected var _selectedIndex:Number;
		protected var _page:Number;
		protected var _isVertical:Boolean;
		protected var _cellSize:Number;
		protected var _cellOffset:Number;
		protected var _isMoved:Boolean;
		public var cacheContent:Boolean;
		protected var _createdLine:Number;
		protected var _cellChanged:Boolean;
		protected var _offset:Point;
		protected var _usedCache:String;
		protected var _elasticEnabled:Boolean;
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		public var cacheAs:String;
		private var onScrollStart:*;
		private var onScrollEnd:*;
		public function get content():Box{};
		public var vScrollBarSkin:String;
		private var _removePreScrollBar:*;
		public var hScrollBarSkin:String;
		public var scrollBar:ScrollBar;
		public var itemRender:*;
		public var width:Number;
		public var height:Number;
		public var repeatX:Number;
		public var repeatY:Number;
		public var spaceX:Number;
		public var spaceY:Number;
		private var _getOneCell:*;
		private var _createItems:*;
		protected function createItem():Box{}
		protected function addCell(cell:Box):void{}
		public function initItems():void{}
		public function setContentSize(width:Number,height:Number):void{}
		protected function onCellMouse(e:Event):void{}
		protected function changeCellState(cell:Box,visible:Boolean,index:Number):void{}
		protected function _sizeChanged():void{}
		protected function onScrollBarChange(e:Event = null):void{}
		private var posCell:*;
		public var selectedIndex:Number;
		protected function changeSelectStatus():void{}
		public var selectedItem:*;
		public var selection:Box;
		public var startIndex:Number;
		protected function renderItems(from:Number = null,to:Number = null):void{}
		protected function renderItem(cell:Box,index:Number):void{}
		private var _bindData:*;
		public var array:Array;
		private var _preLen:*;
		public function updateArray(array:Array):void{}
		public var page:Number;
		public function get length():Number{};
		public var dataSource:*;
		public function get cells():Array{};
		public var elasticEnabled:Boolean;
		public function refresh():void{}
		public function getItem(index:Number):*{}
		public function changeItem(index:Number,source:*):void{}
		public function setItem(index:Number,source:*):void{}
		public function addItem(souce:*):void{}
		public function addItemAt(souce:*,index:Number):void{}
		public function deleteItem(index:Number):void{}
		public function getCell(index:Number):Box{}
		public function scrollTo(index:Number):void{}
		public function tweenTo(index:Number,time:Number = null,complete:Handler = null):void{}
		protected function _setCellChanged():void{}
		protected function commitMeasure():void{}
	}

}
