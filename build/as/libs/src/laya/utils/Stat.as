/*[IF-FLASH]*/
package laya.utils {
	public class Stat {
		public static var FPS:Number;
		public static var loopCount:Number;
		public static var shaderCall:Number;
		public static var renderBatches:Number;
		public static var savedRenderBatches:Number;
		public static var trianglesFaces:Number;
		public static var spriteCount:Number;
		public static var spriteRenderUseCacheCount:Number;
		public static var frustumCulling:Number;
		public static var octreeNodeCulling:Number;
		public static var canvasNormal:Number;
		public static var canvasBitmap:Number;
		public static var canvasReCache:Number;
		public static var renderSlow:Boolean;
		public static var gpuMemory:Number;
		public static var cpuMemory:Number;
		public static var _fpsStr:String;
		public static var _canvasStr:String;
		public static var _spriteStr:String;
		public static var _fpsData:Array;
		public static var _timer:Number;
		public static var _count:Number;
		public static function show(x:Number = null,y:Number = null):void{}
		public static function enable():void{}
		public static function hide():void{}
		public static function clear():void{}
		public static var onclick:Function;
	}

}
