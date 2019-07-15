/*[IF-FLASH]*/
package laya.d3.shader {
	improt laya.d3.shader.SubShader;
	improt laya.d3.core.material.RenderState;
	improt laya.webgl.utils.ShaderCompile;
	improt laya.webgl.utils.ShaderNode;
	public class ShaderPass extends laya.webgl.utils.ShaderCompile {
		public function get renderState():RenderState{};

		public function ShaderPass(owner:SubShader,vs:String,ps:String,stateMap:*){}
		protected function _compileToTree(parent:ShaderNode,lines:Array,start:Number,includefiles:Array,defs:*):void{}
	}

}
