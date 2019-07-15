/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.Box;
	improt laya.ui.IItem;
	improt laya.ui.ISelect;
	improt laya.display.Sprite;
	improt laya.utils.Handler;
	public class UIGroup extends laya.ui.Box implements laya.ui.IItem {
		public var selectHandler:Handler;
		protected var _items:Array;
		protected var _selectedIndex:Number;
		protected var _skin:String;
		protected var _direction:String;
		protected var _space:Number;
		protected var _labels:String;
		protected var _labelColors:String;
		private var _labelFont:*;
		protected var _labelStrokeColor:String;
		protected var _strokeColors:String;
		protected var _labelStroke:Number;
		protected var _labelSize:Number;
		protected var _labelBold:Boolean;
		protected var _labelPadding:String;
		protected var _labelAlign:String;
		protected var _stateNum:Number;
		protected var _labelChanged:Boolean;

		public function UIGroup(labels:String = null,skin:String = null){}
		protected function preinitialize():void{}
		public function destroy(destroyChild:Boolean = null):void{}
		public function addItem(item:ISelect,autoLayOut:Boolean = null):Number{}
		public function delItem(item:ISelect,autoLayOut:Boolean = null):void{}
		public function initItems():void{}
		protected function itemClick(index:Number):void{}
		public var selectedIndex:Number;
		protected function setSelect(index:Number,selected:Boolean):void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		public var labels:String;
		protected function createItem(skin:String,label:String):Sprite{}
		public var labelColors:String;
		public var labelStroke:Number;
		public var labelStrokeColor:String;
		public var strokeColors:String;
		public var labelSize:Number;
		public var stateNum:Number;
		public var labelBold:Boolean;
		public var labelFont:String;
		public var labelPadding:String;
		public var direction:String;
		public var space:Number;
		protected function changeLabels():void{}
		protected function commitMeasure():void{}
		public function get items():Array{};
		public var selection:ISelect;
		public var dataSource:*;
		protected function _setLabelChanged():void{}
	}

}
