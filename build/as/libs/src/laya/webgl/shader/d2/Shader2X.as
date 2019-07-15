/*[IF-FLASH]*/
package laya.webgl.shader.d2 {
	improt laya.webgl.shader.Shader;
	improt laya.webgl.shader.ShaderValue;
	public class Shader2X extends laya.webgl.shader.Shader {
		public var _params2dQuick2:Array;
		public var _shaderValueWidth:Number;
		public var _shaderValueHeight:Number;

		public function Shader2X(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null){}
		protected function _disposeResource():void{}
		public function upload2dQuick2(shaderValue:ShaderValue):void{}
		public function _make2dQuick2():Array{}
		public static function create(vs:String,ps:String,saveName:* = null,nameMap:* = null,bindAttrib:Array = null):Shader{}
	}

}
