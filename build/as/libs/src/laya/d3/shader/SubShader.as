package laya.d3.shader {
	import laya.d3.shader.ShaderPass;
	import laya.d3.shader.ShaderDefines;

	/*
	 * <code>SubShader</code> 类用于创建SubShader。
	 */
	public class SubShader {

		/*
		 * 创建一个 <code>SubShader</code> 实例。
		 * @param attributeMap 顶点属性表。
		 * @param uniformMap uniform属性表。
		 * @param spriteDefines spriteDefines 精灵宏定义。
		 * @param materialDefines materialDefines 材质宏定义。
		 */

		public function SubShader(attributeMap:* = undefined,uniformMap:* = undefined,spriteDefines:ShaderDefines = undefined,materialDefines:ShaderDefines = undefined){}

		/*
		 * 通过名称获取宏定义值。
		 * @param name 名称。
		 * @return 宏定义值。
		 */
		public function getMaterialDefineByName(name:String):Number{
			return null;
		}

		/*
		 * 添加标记。
		 * @param key 标记键。
		 * @param value 标记值。
		 */
		public function setFlag(key:String,value:String):void{}

		/*
		 * 获取标记值。
		 * @return key 标记键。
		 */
		public function getFlag(key:String):String{
			return null;
		}

		/*
		 * 添加着色器Pass
		 * @param vs 
		 * @param ps 
		 * @param stateMap 
		 */
		public function addShaderPass(vs:String,ps:String,stateMap:* = null):ShaderPass{
			return null;
		}
	}

}
