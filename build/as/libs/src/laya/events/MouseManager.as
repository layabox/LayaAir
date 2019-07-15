/*[IF-FLASH]*/
package laya.events {
	improt laya.display.Sprite;
	improt laya.display.Stage;
	public class MouseManager {
		public static var instance:MouseManager;
		public static var enabled:Boolean;
		public static var multiTouchEnabled:Boolean;
		public var mouseX:Number;
		public var mouseY:Number;
		public var disableMouseEvent:Boolean;
		public var mouseDownTime:Number;
		public var mouseMoveAccuracy:Number;
		private static var _isTouchRespond:*;
		private var _stage:*;
		private var _captureSp:*;
		private var _captureChain:*;
		private var _captureExlusiveMode:*;
		private var _hitCaputreSp:*;
		private var _point:*;
		private var _rect:*;
		private var _target:*;
		private var _lastMoveTimer:*;
		private var _isLeftMouse:*;
		private var _prePoint:*;
		private var _touchIDs:*;
		private var _curTouchID:*;
		private var _id:*;
		private static var _isFirstTouch:*;
		public function __init__(stage:Stage,canvas:*):void{}
		private var _tTouchID:*;
		private var initEvent:*;
		private var checkMouseWheel:*;
		private var onMouseMove:*;
		private var onMouseDown:*;
		private var onMouseUp:*;
		private var check:*;
		private var hitTest:*;
		private var _checkAllBaseUI:*;
		public function check3DUI(mousex:Number,mousey:Number,callback:Function):Boolean{}
		public function handleExclusiveCapture(mousex:Number,mousey:Number,callback:Function):Boolean{}
		public function handleCapture(mousex:Number,mousey:Number,callback:Function):Boolean{}
		public function runEvent(evt:*):void{}
		public function setCapture(sp:Sprite,exclusive:Boolean = null):void{}
		public function releaseCapture():void{}
	}

}
