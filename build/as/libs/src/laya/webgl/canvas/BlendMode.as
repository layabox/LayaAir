/*[IF-FLASH]*/
package laya.webgl.canvas {
	public class BlendMode {
		public static var activeBlendFunction:Function;
		public static var NAMES:Array;
		public static var TOINT:*;
		public static var NORMAL:String;
		public static var ADD:String;
		public static var MULTIPLY:String;
		public static var SCREEN:String;
		public static var OVERLAY:String;
		public static var LIGHT:String;
		public static var MASK:String;
		public static var DESTINATIONOUT:String;
		public static var LIGHTER:String;
		public static var fns:Array;
		public static var targetFns:Array;
		public static function BlendNormal(gl:WebGLRenderingContext):void{}
		public static function BlendAdd(gl:WebGLRenderingContext):void{}
		public static function BlendMultiply(gl:WebGLRenderingContext):void{}
		public static function BlendScreen(gl:WebGLRenderingContext):void{}
		public static function BlendOverlay(gl:WebGLRenderingContext):void{}
		public static function BlendLight(gl:WebGLRenderingContext):void{}
		public static function BlendNormalTarget(gl:WebGLRenderingContext):void{}
		public static function BlendAddTarget(gl:WebGLRenderingContext):void{}
		public static function BlendMultiplyTarget(gl:WebGLRenderingContext):void{}
		public static function BlendScreenTarget(gl:WebGLRenderingContext):void{}
		public static function BlendOverlayTarget(gl:WebGLRenderingContext):void{}
		public static function BlendLightTarget(gl:WebGLRenderingContext):void{}
		public static function BlendMask(gl:WebGLRenderingContext):void{}
		public static function BlendDestinationOut(gl:WebGLRenderingContext):void{}
	}

}
