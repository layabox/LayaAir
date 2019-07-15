/*[IF-FLASH]*/
package laya.display {
	improt laya.display.Node;
	improt laya.display.Graphics;
	improt laya.display.Stage;
	improt laya.display.css.SpriteStyle;
	improt laya.events.EventDispatcher;
	improt laya.maths.Matrix;
	improt laya.maths.Point;
	improt laya.maths.Rectangle;
	improt laya.resource.Context;
	improt laya.resource.HTMLCanvas;
	improt laya.resource.Texture;
	improt laya.utils.Handler;
	improt laya.resource.Texture2D;
	public class Sprite extends laya.display.Node {
		public var _width:Number;
		public var _height:Number;
		protected var _tfChanged:Boolean;
		protected var _repaint:Number;
		private var _texture:*;
		public var mouseThrough:Boolean;
		public var autoSize:Boolean;
		public var hitTestPrior:Boolean;
		public function destroy(destroyChild:Boolean = null):void{}

		public function Sprite(){}
		public function updateZOrder():void{}
		public var customRenderEnable:Boolean;
		public var cacheAs:String;
		private var _checkCanvasEnable:*;
		public var staticCache:Boolean;
		public function reCache():void{}
		public function getRepaint():Number{}
		public var x:Number;
		public var y:Number;
		public var width:Number;
		public function set_width(value:Number):void{}
		public function get_width():Number{}
		public var height:Number;
		public function set_height(value:Number):void{}
		public function get_height():Number{}
		public function get displayWidth():Number{};
		public function get displayHeight():Number{};
		public function setSelfBounds(bound:Rectangle):void{}
		public function getBounds():Rectangle{}
		public function getSelfBounds():Rectangle{}
		public function getGraphicBounds(realSize:Boolean = null):Rectangle{}
		public function getStyle():SpriteStyle{}
		public function setStyle(value:SpriteStyle):void{}
		public var scaleX:Number;
		public var scaleY:Number;
		public function set_scaleX(value:Number):void{}
		public function get_scaleX():Number{}
		public function set_scaleY(value:Number):void{}
		public function get_scaleY():Number{}
		public var rotation:Number;
		public var skewX:Number;
		public var skewY:Number;
		protected function _adjustTransform():Matrix{}
		public var transform:Matrix;
		public function get_transform():Matrix{}
		public function set_transform(value:Matrix):void{}
		public var pivotX:Number;
		public var pivotY:Number;
		public var alpha:Number;
		public var visible:Boolean;
		public function get_visible():Boolean{}
		public function set_visible(value:Boolean):void{}
		public var blendMode:String;
		public var graphics:Graphics;
		public var scrollRect:Rectangle;
		public function pos(x:Number,y:Number,speedMode:Boolean = null):Sprite{}
		public function pivot(x:Number,y:Number):Sprite{}
		public function size(width:Number,height:Number):Sprite{}
		public function scale(scaleX:Number,scaleY:Number,speedMode:Boolean = null):Sprite{}
		public function skew(skewX:Number,skewY:Number):Sprite{}
		public function render(ctx:Context,x:Number,y:Number):void{}
		public function drawToCanvas(canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number):HTMLCanvas{}
		public function drawToTexture(canvasWidth:Number,canvasHeight:Number,offsetX:Number,offsetY:Number):Texture{}
		public function drawToTexture3D(offx:Number,offy:Number,tex:Texture2D):void{}
		public static var drawToCanvas:Function;
		public static var drawToTexture:Function;
		public function customRender(context:Context,x:Number,y:Number):void{}
		public var filters:Array;
		public function localToGlobal(point:Point,createNewPoint:Boolean = null,globalNode:Sprite = null):Point{}
		public function globalToLocal(point:Point,createNewPoint:Boolean = null,globalNode:Sprite = null):Point{}
		public function toParentPoint(point:Point):Point{}
		public function fromParentPoint(point:Point):Point{}
		public function fromStagePoint(point:Point):Point{}
		public function on(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		public function once(type:String,caller:*,listener:Function,args:Array = null):EventDispatcher{}
		protected function _onDisplay(v:Boolean = null):void{}
		protected function _setParent(value:Node):void{}
		public function loadImage(url:String,complete:Handler = null):Sprite{}
		public static function fromImage(url:String):Sprite{}
		public function repaint(type:Number = null):void{}
		protected function _childChanged(child:Node = null):void{}
		public function parentRepaint(type:Number = null):void{}
		public function get stage():Stage{};
		public var hitArea:*;
		public var mask:Sprite;
		public var mouseEnabled:Boolean;
		public function startDrag(area:Rectangle = null,hasInertia:Boolean = null,elasticDistance:Number = null,elasticBackTime:Number = null,data:* = null,disableMouseEvent:Boolean = null,ratio:Number = null):void{}
		public function stopDrag():void{}
		public function hitTestPoint(x:Number,y:Number):Boolean{}
		public function getMousePoint():Point{}
		public function get globalScaleX():Number{};
		public function get globalRotation():Number{};
		public function get globalScaleY():Number{};
		public function get mouseX():Number{};
		public function get mouseY():Number{};
		public var zOrder:Number;
		public var texture:Texture;
		public var viewport:Rectangle;
		public function captureMouseEvent(exclusive:Boolean):void{}
		public function releaseMouseEvent():void{}
		public var drawCallOptimize:Boolean;
	}

}
