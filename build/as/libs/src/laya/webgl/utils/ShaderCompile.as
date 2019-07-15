/*[IF-FLASH]*/
package laya.webgl.utils {
	improt laya.webgl.shader.Shader;
	improt laya.webgl.utils.ShaderNode;
	public class ShaderCompile {
		public static var IFDEF_NO:Number;
		public static var IFDEF_YES:Number;
		public static var IFDEF_ELSE:Number;
		public static var IFDEF_PARENT:Number;
		public static var _removeAnnotation:RegExp;
		public static var _reg:RegExp;
		public static var _splitToWordExps:RegExp;
		public static var includes:*;
		public static var shaderParamsMap:*;
		private var _nameMap:*;
		protected var _VS:ShaderNode;
		protected var _PS:ShaderNode;
		private static var _parseOne:*;
		public static function addInclude(fileName:String,txt:String):void{}
		public static function preGetParams(vs:String,ps:String):*{}
		public static function splitToWords(str:String,block:ShaderNode):Array{}
		public static var _clearCR:RegExp;
		public var defs:Object;

		public function ShaderCompile(vs:String,ps:String,nameMap:*){}
		public static var _splitToWordExps3:RegExp;
		protected function _compileToTree(parent:ShaderNode,lines:Array,start:Number,includefiles:Array,defs:*):void{}
		public function createShader(define:*,shaderName:*,createShader:Function,bindAttrib:Array):Shader{}
	}

}
