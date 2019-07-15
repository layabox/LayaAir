/*[IF-FLASH]*/
package laya.d3.shader {
	improt laya.d3.shader.SubShader;
	public class Shader3D {
		public static var RENDER_STATE_CULL:Number;
		public static var RENDER_STATE_BLEND:Number;
		public static var RENDER_STATE_BLEND_SRC:Number;
		public static var RENDER_STATE_BLEND_DST:Number;
		public static var RENDER_STATE_BLEND_SRC_RGB:Number;
		public static var RENDER_STATE_BLEND_DST_RGB:Number;
		public static var RENDER_STATE_BLEND_SRC_ALPHA:Number;
		public static var RENDER_STATE_BLEND_DST_ALPHA:Number;
		public static var RENDER_STATE_BLEND_CONST_COLOR:Number;
		public static var RENDER_STATE_BLEND_EQUATION:Number;
		public static var RENDER_STATE_BLEND_EQUATION_RGB:Number;
		public static var RENDER_STATE_BLEND_EQUATION_ALPHA:Number;
		public static var RENDER_STATE_DEPTH_TEST:Number;
		public static var RENDER_STATE_DEPTH_WRITE:Number;
		public static var PERIOD_CUSTOM:Number;
		public static var PERIOD_MATERIAL:Number;
		public static var PERIOD_SPRITE:Number;
		public static var PERIOD_CAMERA:Number;
		public static var PERIOD_SCENE:Number;
		public static var debugMode:Boolean;
		public static function propertyNameToID(name:String):Number{}
		public static function compileShader(name:String,subShaderIndex:Number,passIndex:Number,publicDefine:Number,spriteDefine:Number,materialDefine:Number):void{}
		public static function add(name:String,attributeMap:* = null,uniformMap:* = null,enableInstancing:Boolean = null):Shader3D{}
		public static function find(name:String):Shader3D{}

		public function Shader3D(name:String,attributeMap:*,uniformMap:*,enableInstancing:Boolean){}
		public function addSubShader(subShader:SubShader):void{}
		public function getSubShaderAt(index:Number):SubShader{}
	}

}
