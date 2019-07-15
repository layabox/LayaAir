/*[IF-FLASH]*/
package laya.resource {
	improt laya.resource.BaseTexture;
	public class RenderTexture2D extends laya.resource.BaseTexture {
		private static var _currentActive:*;
		private var _lastRT:*;
		private var _lastWidth:*;
		private var _lastHeight:*;
		private static var rtStack:*;
		public static var defuv:Array;
		public static var flipyuv:Array;
		public static function get currentActive():RenderTexture2D{};
		private var _frameBuffer:*;
		private var _depthStencilBuffer:*;
		private var _depthStencilFormat:*;
		public function get depthStencilFormat():Number{};
		public function get defaulteTexture():BaseTexture{};
		public function getIsReady():Boolean{}
		public function get sourceWidth():Number{};
		public function get sourceHeight():Number{};
		public function get offsetX():Number{};
		public function get offsetY():Number{};

		public function RenderTexture2D(width:Number,height:Number,format:Number = null,depthStencilFormat:Number = null){}
		private var _create:*;
		public function generateMipmap():void{}
		public static function pushRT():void{}
		public static function popRT():void{}
		public function start():void{}
		public function end():void{}
		public function restore():void{}
		public function clear(r:Number = null,g:Number = null,b:Number = null,a:Number = null):void{}
		public function getData(x:Number,y:Number,width:Number,height:Number):Uint8Array{}
		public function getDataAsync(x:Number,y:Number,width:Number,height:Number,callBack:Function):void{}
		public function recycle():void{}
		public function _disposeResource():void{}
	}

}
