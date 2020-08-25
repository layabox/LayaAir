package laya.d3.core.render {
	import laya.d3.core.Camera;
	import laya.d3.core.render.command.CommandBuffer;
	import laya.d3.resource.RenderTexture;
	import laya.d3.shader.ShaderData;

	/**
	 * * <code>PostProcessRenderContext</code> 类用于创建后期处理渲染上下文。
	 */
	public class PostProcessRenderContext {

		/**
		 * 源纹理。
		 */
		public var source:RenderTexture;

		/**
		 * 输出纹理。
		 */
		public var destination:RenderTexture;

		/**
		 * 渲染相机。
		 */
		public var camera:Camera;

		/**
		 * 合成着色器数据。
		 */
		public var compositeShaderData:ShaderData;

		/**
		 * 后期处理指令流。
		 */
		public var command:CommandBuffer;

		/**
		 * 临时纹理数组。
		 */
		public var deferredReleaseTextures:Array;
	}

}
