/*[IF-FLASH]*/
package laya.d3.core.render {
	improt laya.d3.core.Camera;
	improt laya.d3.core.render.command.CommandBuffer;
	improt laya.d3.resource.RenderTexture;
	improt laya.d3.shader.ShaderData;
	public class PostProcessRenderContext {
		public var source:RenderTexture;
		public var destination:RenderTexture;
		public var camera:Camera;
		public var compositeShaderData:ShaderData;
		public var command:CommandBuffer;
		public var deferredReleaseTextures:Array;
	}

}
