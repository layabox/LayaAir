/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.Label;
	improt laya.ui.Image;
	improt laya.ui.Button;
	improt laya.events.Event;
	improt laya.maths.Point;
	improt laya.utils.Handler;
	public class Slider extends laya.ui.UIComponent {
		public static var label:Label;
		public var changeHandler:Handler;
		public var isVertical:Boolean;
		public var showLabel:Boolean;
		protected var _allowClickBack:Boolean;
		protected var _max:Number;
		protected var _min:Number;
		protected var _tick:Number;
		protected var _value:Number;
		protected var _skin:String;
		protected var _bg:Image;
		protected var _progress:Image;
		protected var _bar:Button;
		protected var _tx:Number;
		protected var _ty:Number;
		protected var _maxMove:Number;
		protected var _globalSacle:Point;

		public function Slider(skin:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		protected function initialize():void{}
		protected function onBarMouseDown(e:Event):void{}
		protected function showValueText():void{}
		protected function hideValueText():void{}
		private var mouseUp:*;
		private var mouseMove:*;
		protected function sendChangeEvent(type:String = null):void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		protected function setBarPoint():void{}
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		protected function _sizeChanged():void{}
		public var sizeGrid:String;
		public function setSlider(min:Number,max:Number,value:Number):void{}
		public var tick:Number;
		public function changeValue():void{}
		public var max:Number;
		public var min:Number;
		public var value:Number;
		public var allowClickBack:Boolean;
		protected function onBgMouseDown(e:Event):void{}
		public var dataSource:*;
		public function get bar():Button{};
	}

}
