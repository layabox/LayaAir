/*[IF-FLASH]*/
package laya.webgl.shader {
	improt laya.utils.StringKey;
	improt laya.webgl.shader.BaseShader;
	improt laya.webgl.shader.ShaderValue;
	public class Shader extends laya.webgl.shader.BaseShader {
		private static var _count:*;
		private var _attribInfo:*;
		public static var SHADERNAME2ID:Number;
		public static var nameKey:StringKey;
		public static var sharders:Array;
		public static function getShader(name:*):Shader{}
		public static function create(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null):Shader{}
		public static function withCompile(nameID:Number,define:*,shaderName:*,createShader:Function):Shader{}
		public static function withCompile2D(nameID:Number,mainID:Number,define:*,shaderName:*,createShader:Function,bindAttrib:Array = null):Shader{}
		public static function addInclude(fileName:String,txt:String):void{}
		public static function preCompile(nameID:Number,vs:String,ps:String,nameMap:*):void{}
		public static function preCompile2D(nameID:Number,mainID:Number,vs:String,ps:String,nameMap:*):void{}
		private var customCompile:*;
		private var _nameMap:*;
		private var _vs:*;
		private var _ps:*;
		private var _curActTexIndex:*;
		private var _reCompile:*;
		public var tag:*;

		public function Shader(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null){}
		protected function recreateResource():void{}
		protected function _disposeResource():void{}
		private var _compile:*;
		private static var _createShader:*;
		public function getUniform(name:String):*{}
		private var _uniform1f:*;
		private var _uniform1fv:*;
		private var _uniform_vec2:*;
		private var _uniform_vec2v:*;
		private var _uniform_vec3:*;
		private var _uniform_vec3v:*;
		private var _uniform_vec4:*;
		private var _uniform_vec4v:*;
		private var _uniformMatrix2fv:*;
		private var _uniformMatrix3fv:*;
		private var _uniformMatrix4fv:*;
		private var _uniform1i:*;
		private var _uniform1iv:*;
		private var _uniform_ivec2:*;
		private var _uniform_ivec2v:*;
		private var _uniform_vec3i:*;
		private var _uniform_vec3vi:*;
		private var _uniform_vec4i:*;
		private var _uniform_vec4vi:*;
		private var _uniform_sampler2D:*;
		private var _uniform_samplerCube:*;
		private var _noSetValue:*;
		public function uploadOne(name:String,value:*):void{}
		public function uploadTexture2D(value:*):void{}
		public function upload(shaderValue:ShaderValue,params:Array = null):void{}
		public function uploadArray(shaderValue:Array,length:Number,_bufferUsage:*):void{}
		public function getParams():Array{}
		public function setAttributesLocation(attribDesc:Array):void{}
	}

}
