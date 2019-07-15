/*[IF-FLASH]*/
package laya.utils {
	improt laya.display.Sprite;
	improt laya.display.Stage;
	improt laya.maths.Rectangle;
	public class Utils {
		public static var gStage:Stage;
		private static var _gid:*;
		private static var _pi:*;
		private static var _pi2:*;
		protected static var _extReg:RegExp;
		public static function toRadian(angle:Number):Number{}
		public static function toAngle(radian:Number):Number{}
		public static function toHexColor(color:Number):String{}
		public static function getGID():Number{}
		public static var parseXMLFromString:Function;
		public static function concatArray(source:Array,array:Array):Array{}
		public static function clearArray(array:Array):Array{}
		public static function copyArray(source:Array,array:Array):Array{}
		public static function getGlobalRecByPoints(sprite:Sprite,x0:Number,y0:Number,x1:Number,y1:Number):Rectangle{}
		public static function getGlobalPosAndScale(sprite:Sprite):Rectangle{}
		public static function bind(fun:Function,scope:*):Function{}
		public static function updateOrder(array:Array):Boolean{}
		public static function transPointList(points:Array,x:Number,y:Number):void{}
		public static function parseInt(str:String,radix:Number = null):Number{}
		public static function getFileExtension(path:String):String{}
		public static function getTransformRelativeToWindow(coordinateSpace:Sprite,x:Number,y:Number):*{}
		public static function fitDOMElementInArea(dom:*,coordinateSpace:Sprite,x:Number,y:Number,width:Number,height:Number):void{}
		public static function isOkTextureList(textureList:Array):Boolean{}
		public static function isOKCmdList(cmds:Array):Boolean{}
		public static function getQueryString(name:String):String{}
	}

}
