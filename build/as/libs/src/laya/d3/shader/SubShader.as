/*[IF-FLASH]*/
package laya.d3.shader {
	improt laya.d3.shader.ShaderPass;
	improt laya.d3.shader.ShaderDefines;
	public class SubShader {

		public function SubShader(attributeMap:*,uniformMap:*,spriteDefines:ShaderDefines = null,materialDefines:ShaderDefines = null){}
		public function getMaterialDefineByName(name:String):Number{}
		public function setFlag(key:String,value:String):void{}
		public function getFlag(key:String):String{}
		public function addShaderPass(vs:String,ps:String,stateMap:* = null):ShaderPass{}
	}

}
