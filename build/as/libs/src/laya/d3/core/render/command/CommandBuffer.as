/*[IF-FLASH]*/
package laya.d3.core.render.command {
	improt laya.d3.resource.RenderTexture;
	improt laya.d3.shader.Shader3D;
	improt laya.d3.shader.ShaderData;
	improt laya.resource.BaseTexture;
	public class CommandBuffer {

		public function CommandBuffer(){}
		public function blitScreenQuad(source:BaseTexture,dest:RenderTexture,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null):void{}
		public function blitScreenTriangle(source:BaseTexture,dest:RenderTexture,shader:Shader3D = null,shaderData:ShaderData = null,subShader:Number = null):void{}
	}

}
