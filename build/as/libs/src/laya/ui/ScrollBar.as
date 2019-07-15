/*[IF-FLASH]*/
package laya.ui {
	improt laya.ui.UIComponent;
	improt laya.ui.Button;
	improt laya.ui.Slider;
	improt laya.display.Sprite;
	improt laya.events.Event;
	improt laya.maths.Point;
	improt laya.utils.Handler;
	public class ScrollBar extends laya.ui.UIComponent {
		public var rollRatio:Number;
		public var changeHandler:Handler;
		public var scaleBar:Boolean;
		public var autoHide:Boolean;
		public var elasticDistance:Number;
		public var elasticBackTime:Number;
		public var upButton:Button;
		public var downButton:Button;
		public var slider:Slider;
		protected var _showButtons:Boolean;
		protected var _scrollSize:Number;
		protected var _skin:String;
		protected var _thumbPercent:Number;
		protected var _target:Sprite;
		protected var _lastPoint:Point;
		protected var _lastOffset:Number;
		protected var _checkElastic:Boolean;
		protected var _isElastic:Boolean;
		protected var _value:Number;
		protected var _hide:Boolean;
		protected var _clickOnly:Boolean;
		protected var _offsets:Array;
		protected var _touchScrollEnable:Boolean;
		protected var _mouseWheelEnable:Boolean;

		public function ScrollBar(skin:String = null){}
		public function destroy(destroyChild:Boolean = null):void{}
		protected function createChildren():void{}
		protected function initialize():void{}
		protected function onSliderChange():void{}
		protected function onButtonMouseDown(e:Event):void{}
		protected function startLoop(isUp:Boolean):void{}
		protected function slide(isUp:Boolean):void{}
		protected function onStageMouseUp(e:Event):void{}
		public var skin:String;
		protected function _skinLoaded():void{}
		protected function changeScrollBar():void{}
		protected function _sizeChanged():void{}
		private var resetPositions:*;
		protected function resetButtonPosition():void{}
		protected function measureWidth():Number{}
		protected function measureHeight():Number{}
		public function setScroll(min:Number,max:Number,value:Number):void{}
		public var max:Number;
		public var min:Number;
		public var value:Number;
		public var isVertical:Boolean;
		public var sizeGrid:String;
		public var scrollSize:Number;
		public var dataSource:*;
		public var thumbPercent:Number;
		public var target:Sprite;
		public var hide:Boolean;
		public var showButtons:Boolean;
		public var touchScrollEnable:Boolean;
		public var mouseWheelEnable:Boolean;
		protected function onTargetMouseWheel(e:Event):void{}
		public var isLockedFun:Function;
		protected function onTargetMouseDown(e:Event):void{}
		public function startDragForce():void{}
		private var cancelDragOp:*;
		public var triggerDownDragLimit:Function;
		public var triggerUpDragLimit:Function;
		private var checkTriggers:*;
		public function get lastOffset():Number{};
		public function startTweenMoveForce(lastOffset:Number):void{}
		protected function loop():void{}
		protected function onStageMouseUp2(e:Event):void{}
		private var elasticOver:*;
		protected function tweenMove(maxDistance:Number):void{}
		public function stopScroll():void{}
		public var tick:Number;
	}

}
