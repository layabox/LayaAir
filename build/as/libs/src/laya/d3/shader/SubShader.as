package laya.d3.shader {
	import laya.d3.shader.ShaderPass;

	/**
	 * <code>SubShader</code> 类用于创建SubShader。
	 */
	public class SubShader {

		/**
		 * 创建一个 <code>SubShader</code> 实例。
		 * @param attributeMap 顶点属性表。
		 * @param uniformMap uniform属性表。
		 */

		public function SubShader(attributeMap:* = undefined,uniformMap:* = undefined){}

		/**
		 * 添加标记。
		 * @param key 标记键。
		 * @param value 标记值。
		 */
		public function setFlag(key:String,value:String):void{}

		/**
		 * 获取标记值。
		 * @return key 标记键。
		 */
		public function getFlag(key:String):String{
			return null;
		}

		/**
		 * 添加着色器Pass
		 * @param vs 
		 * @param ps 
		 * @param stateMap 
		 * @param pipelineMode 渲染管线模式。
		 */
		public function addShaderPass(vs:String,ps:String,stateMap:Object = null,pipelineMode:String = null):ShaderPass{
			return null;
		}
	}

}
