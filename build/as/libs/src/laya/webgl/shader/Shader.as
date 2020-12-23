package laya.webgl.shader {
	import laya.utils.StringKey;
	import laya.webgl.shader.BaseShader;
	import laya.webgl.shader.ShaderValue;
	public class Shader extends BaseShader {
		private static var _count:*;
		private var _attribInfo:*;
		public static var SHADERNAME2ID:Number;
		public static var nameKey:StringKey;
		public static var sharders:Array;
		public static function getShader(name:*):Shader{
			return null;
		}
		public static function create(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null):Shader{
			return null;
		}

		/**
		 * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
		 * @param name 
		 * @param vs 
		 * @param ps 
		 * @param define 宏定义，格式:{name:value...}
		 * @return 
		 */
		public static function withCompile(nameID:Number,define:*,shaderName:*,createShader:Function):Shader{
			return null;
		}

		/**
		 * 根据宏动态生成shader文件，支持#include?COLOR_FILTER "parts/ColorFilter_ps_logic.glsl";条件嵌入文件
		 * @param name 
		 * @param vs 
		 * @param ps 
		 * @param define 宏定义，格式:{name:value...}
		 * @return 
		 */
		public static function withCompile2D(nameID:Number,mainID:Number,define:*,shaderName:*,createShader:Function,bindAttrib:Array = null):Shader{
			return null;
		}
		public static function addInclude(fileName:String,txt:String):void{}

		/**
		 * 预编译shader文件，主要是处理宏定义
		 * @param nameID ,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
		 * @param vs 
		 * @param ps 
		 */
		public static function preCompile(nameID:Number,vs:String,ps:String,nameMap:*):void{}

		/**
		 * 预编译shader文件，主要是处理宏定义
		 * @param nameID ,一般是特殊宏+shaderNameID*0.0002组成的一个浮点数当做唯一标识
		 * @param vs 
		 * @param ps 
		 */
		public static function preCompile2D(nameID:Number,mainID:Number,vs:String,ps:String,nameMap:*):void{}
		private var customCompile:*;
		private var _nameMap:*;
		private var _vs:*;
		private var _ps:*;
		private var _curActTexIndex:*;
		private var _reCompile:*;
		public var tag:*;

		/**
		 * 根据vs和ps信息生成shader对象
		 * 把自己存储在 sharders 数组中
		 * @param vs 
		 * @param ps 
		 * @param name :
		 * @param nameMap 帮助里要详细解释为什么需要nameMap
		 */

		public function Shader(vs:String = undefined,ps:String = undefined,saveName:* = undefined,nameMap:* = undefined,bindAttrib:Array = undefined){}
		protected function recreateResource():void{}

		/**
		 * @override 
		 */
		override protected function _disposeResource():void{}
		private var _compile:*;
		private static var _createShader:*;

		/**
		 * 根据变量名字获得
		 * @param name 
		 * @return 
		 */
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

		/**
		 * 提交shader到GPU
		 * @param shaderValue 
		 */
		public function upload(shaderValue:ShaderValue,params:Array = null):void{}

		/**
		 * 按数组的定义提交
		 * @param shaderValue 数组格式[name,value,...]
		 */
		public function uploadArray(shaderValue:Array,length:Number,_bufferUsage:*):void{}

		/**
		 * 得到编译后的变量及相关预定义
		 * @return 
		 */
		public function getParams():Array{
			return null;
		}

		/**
		 * 设置shader里面的attribute绑定到哪个location，必须与mesh2d的对应起来，
		 * 这个必须在编译之前设置。
		 * @param attribDesc 属性描述，格式是 [attributeName, location, attributeName, location ... ]
		 */
		public function setAttributesLocation(attribDesc:Array):void{}
	}

}
