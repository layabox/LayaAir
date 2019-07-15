/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.ISelect;
	improt laya.display.Text;
	improt laya.events.Event;
	improt laya.ui.AutoBitmap;
	improt laya.utils.Handler;
	public class Button extends laya.ui.UIComponent implements laya.ui.ISelect {
		protected static var stateMap:*;
		public var toggle:Boolean;
		protected var _bitmap:AutoBitmap;
		protected var _text:Text;
		protected var _labelColors:Array;
		protected var _strokeColors:Array;
		protected var _state:Number;
		protected var _selected:Boolean;
		protected var _skin:String;
		protected var _autoSize:Boolean;
		protected var _stateNum:Number;
		protected var _sources:Array;
		protected var _clickHandler:Handler;
		protected var _stateChanged:Boolean;

		public function Button(skin:String = null,label:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		protected function createText():void{}
		protected function initialize():void{}
		protected function onMouse(e:Event):void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		public var stateNum:Number;
		protected function changeClips():void{}
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public var label:String;
		public var selected:Boolean;
		protected var state:Number;
		protected function changeState():void{}
		public var labelColors:String;
		public var strokeColors:String;
		public var labelPadding:String;
		public var labelSize:Number;
		public var labelStroke:Number;
		public var labelStrokeColor:String;
		public var labelBold:Boolean;
		public var labelFont:String;
		public var labelAlign:String;
		public var clickHandler:Handler;
		public function get text():Text{};
		public var sizeGrid:String;
		public var width:Number;
		public var height:Number;
		public var dataSource:*;
		public var iconOffset:String;
		protected function _setStateChanged():void{}
	}

}
