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
		public static function BlendNormal(gl:*):void{}
		public static function BlendAdd(gl:*):void{}
		public static function BlendMultiply(gl:*):void{}
		public static function BlendScreen(gl:*):void{}
		public static function BlendOverlay(gl:*):void{}
		public static function BlendLight(gl:*):void{}
		public static function BlendNormalTarget(gl:*):void{}
		public static function BlendAddTarget(gl:*):void{}
		public static function BlendMultiplyTarget(gl:*):void{}
		public static function BlendScreenTarget(gl:*):void{}
		public static function BlendOverlayTarget(gl:*):void{}
		public static function BlendLightTarget(gl:*):void{}
		public static function BlendMask(gl:*):void{}
		public static function BlendDestinationOut(gl:*):void{}
	}

}
