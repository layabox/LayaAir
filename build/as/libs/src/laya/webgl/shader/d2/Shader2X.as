package laya.webgl.shader.d2 {
	import laya.webgl.shader.Shader;
	import laya.webgl.shader.ShaderValue;
	public class Shader2X extends Shader {
		public var _params2dQuick2:Array;
		public var _shaderValueWidth:Number;
		public var _shaderValueHeight:Number;

		public function Shader2X(vs:String = undefined,ps:String = undefined,saveName:* = undefined,nameMap:* = undefined,bindAttrib:Array = undefined){}

		/**
		 * @override 
		 */
		override protected function _disposeResource():void{}
		public function upload2dQuick2(shaderValue:ShaderValue):void{}
		public function _make2dQuick2():Array{
			return null;
		}
		public static function create(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null):Shader{
			return null;
		}
	}

}
