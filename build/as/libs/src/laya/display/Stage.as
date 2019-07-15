/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Sprite;
	improt laya.display.Node;
	improt laya.maths.Matrix;
	improt laya.maths.Point;
	improt laya.resource.Context;
	public class Stage extends laya.display.Sprite {
		public static var SCALE_NOSCALE:String;
		public static var SCALE_EXACTFIT:String;
		public static var SCALE_SHOWALL:String;
		public static var SCALE_NOBORDER:String;
		public static var SCALE_FULL:String;
		public static var SCALE_FIXED_WIDTH:String;
		public static var SCALE_FIXED_HEIGHT:String;
		public static var SCALE_FIXED_AUTO:String;
		public static var ALIGN_LEFT:String;
		public static var ALIGN_RIGHT:String;
		public static var ALIGN_CENTER:String;
		public static var ALIGN_TOP:String;
		public static var ALIGN_MIDDLE:String;
		public static var ALIGN_BOTTOM:String;
		public static var SCREEN_NONE:String;
		public static var SCREEN_HORIZONTAL:String;
		public static var SCREEN_VERTICAL:String;
		public static var FRAME_FAST:String;
		public static var FRAME_SLOW:String;
		public static var FRAME_MOUSE:String;
		public static var FRAME_SLEEP:String;
		public var focus:Node;
		public var offset:Point;
		private var _frameRate:*;
		public var designWidth:Number;
		public var designHeight:Number;
		public var canvasRotation:Boolean;
		public var canvasDegree:Number;
		public var renderingEnabled:Boolean;
		public var screenAdaptationEnabled:Boolean;
		public var _canvasTransform:Matrix;
		private var _screenMode:*;
		private var _scaleMode:*;
		private var _alignV:*;
		private var _alignH:*;
		private var _bgColor:*;
		private var _mouseMoveTime:*;
		private var _renderCount:*;
		private var _safariOffsetY:*;
		private var _frameStartTime:*;
		private var _previousOrientation:*;
		private var _isFocused:*;
		private var _isVisibility:*;
		private var _globalRepaintSet:*;
		private var _globalRepaintGet:*;
		public static var _dbgSprite:Sprite;
		public var useRetinalCanvas:Boolean;

		public function Stage(){}
		private var _isInputting:*;
		public var width:Number;
		public var height:Number;
		public var transform:Matrix;
		public function get isFocused():Boolean{};
		public function get isVisibility():Boolean{};
		private var _changeCanvasSize:*;
		protected function _resetCanvas():void{}
		public function setScreenSize(screenWidth:Number,screenHeight:Number):void{}
		private var _formatData:*;
		public var scaleMode:String;
		public var alignH:String;
		public var alignV:String;
		public var bgColor:String;
		public function get mouseX():Number{};
		public function get mouseY():Number{};
		public function getMousePoint():Point{}
		public function get clientScaleX():Number{};
		public function get clientScaleY():Number{};
		public var screenMode:String;
		public function repaint(type:Number = null):void{}
		public function parentRepaint(type:Number = null):void{}
		public function getFrameTm():Number{}
		private var _onmouseMove:*;
		public function getTimeFromFrameStart():Number{}
		public var visible:Boolean;
		public static var clear:Function;
		public function render(context:Context,x:Number,y:Number):void{}
		public function renderToNative(context:Context,x:Number,y:Number):void{}
		private var _updateTimers:*;
		public var fullScreenEnabled:Boolean;
		public var frameRate:String;
		private var _requestFullscreen:*;
		private var _fullScreenChanged:*;
		public function exitFullscreen():void{}
		public function isGlobalRepaint():Boolean{}
		public function setGlobalRepaint():void{}
		public function add3DUI(uibase:Sprite):void{}
		public function remove3DUI(uibase:Sprite):Boolean{}
	}

}
