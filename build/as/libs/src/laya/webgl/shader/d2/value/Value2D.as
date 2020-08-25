package laya.webgl.shader.d2.value {
	import laya.resource.Texture;
	import laya.webgl.shader.Shader;
	import laya.webgl.shader.d2.Shader2D;
	import laya.webgl.shader.d2.ShaderDefines2D;
	public class Value2D {
		protected static var _cache:Array;
		protected static var _typeClass:*;
		public static var TEMPMAT4_ARRAY:Array;
		public static function _initone(type:Number,classT:*):void{}
		public static function __init__():void{}
		public var defines:ShaderDefines2D;
		public var size:Array;
		public var alpha:Number;
		public var mmat:Array;
		public var u_MvpMatrix:Array;
		public var texture:*;
		public var ALPHA:Number;
		public var shader:Shader;
		public var mainID:Number;
		public var subID:Number;
		public var filters:Array;
		public var textureHost:Texture;
		public var color:Array;
		public var colorAdd:Array;
		public var u_mmat2:Array;
		public var ref:Number;
		protected var _attribLocation:Array;
		private var _inClassCache:*;
		private var _cacheID:*;
		public var clipMatDir:Array;
		public var clipMatPos:Array;
		public var clipOff:Array;

		public function Value2D(mainID:Number = undefined,subID:Number = undefined){}
		public function setValue(value:Shader2D):void{}
		private var _ShaderWithCompile:*;
		public function upload():void{}
		public function setFilters(value:Array):void{}
		public function clear():void{}
		public function release():void{}
		public static function create(mainType:Number,subType:Number):Value2D{
			return null;
		}
	}

}
