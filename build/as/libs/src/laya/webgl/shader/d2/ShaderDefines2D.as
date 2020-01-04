package laya.webgl.shader.d2 {
	import laya.webgl.shader.ShaderDefinesBase;
	public class ShaderDefines2D extends ShaderDefinesBase {
		public static var TEXTURE2D:Number;
		public static var PRIMITIVE:Number;
		public static var FILTERGLOW:Number;
		public static var FILTERBLUR:Number;
		public static var FILTERCOLOR:Number;
		public static var COLORADD:Number;
		public static var WORLDMAT:Number;
		public static var FILLTEXTURE:Number;
		public static var SKINMESH:Number;
		public static var MVP3D:Number;
		public static var NOOPTMASK:Number;
		private static var __name2int:*;
		private static var __int2name:*;
		private static var __int2nameMap:*;
		public static function __init__():void{}

		public function ShaderDefines2D(){}
		public static function reg(name:String,value:Number):void{}
		public static function toText(value:Number,int2name:Array,int2nameMap:*):*{}
		public static function toInt(names:String):Number{
			return null;
		}
	}

}
