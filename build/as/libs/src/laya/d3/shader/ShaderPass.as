package laya.d3.shader {
	import laya.d3.shader.SubShader;
	import laya.d3.core.material.RenderState;
	import laya.webgl.utils.ShaderCompile;
	import laya.webgl.utils.ShaderNode;

	/*
	 * <code>ShaderPass</code> 类用于实现ShaderPass。
	 */
	public class ShaderPass extends laya.webgl.utils.ShaderCompile {

		/*
		 * 获取渲染状态。
		 * @return 渲染状态。
		 */
		public function get renderState():RenderState{
				return null;
		}

		public function ShaderPass(owner:SubShader = undefined,vs:String = undefined,ps:String = undefined,stateMap:* = undefined){}

		/*
		 * @inheritDoc 
		 * @override 
		 */
		override protected function _compileToTree(parent:ShaderNode,lines:Array,start:Number,includefiles:Array,defs:*):void{}
	}

}
