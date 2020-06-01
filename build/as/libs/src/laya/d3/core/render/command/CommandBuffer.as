package laya.d3.core.render.command {
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.Shader3D;
	import laya.d3.shader.ShaderData;
	import laya.resource.BaseTexture;
	import laya.d3.math.Vector4;

	/**
	 * <code>CommandBuffer</code> 类用于创建命令流。
	 */
	public class CommandBuffer {

		/**
		 * 创建一个 <code>CommandBuffer</code> 实例。
		 */

		public function CommandBuffer(){}

		/**
		 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param offsetScale 偏移缩放。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		public function blitScreenQuad(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null):void{}

		/**
		 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
		 * @param source 源纹理。
		 * @param dest 目标纹理。
		 * @param offsetScale 偏移缩放。
		 * @param shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param subShader subShader索引,默认值为0。
		 */
		public function blitScreenTriangle(source:BaseTexture,dest:RenderTexture,offsetScale:Vector4 = null,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null):void{}
	}

}
