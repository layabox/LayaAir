package laya.d3.core {
	import laya.d3.shader.ShaderDefine;

	/**
	 * 类用来记录精灵数据宏
	 */
	public class MeshSprite3DShaderDeclaration {

		/**
		 * UV0通道顶点数据宏
		 */
		public static var SHADERDEFINE_UV0:ShaderDefine;

		/**
		 * 顶点色顶点数据宏
		 */
		public static var SHADERDEFINE_COLOR:ShaderDefine;

		/**
		 * UV1通道顶点数据宏
		 */
		public static var SHADERDEFINE_UV1:ShaderDefine;

		/**
		 * instance调用宏
		 */
		public static var SHADERDEFINE_GPU_INSTANCE:ShaderDefine;

		/**
		 * 盒子反射宏
		 */
		public static var SHADERDEFINE_SPECCUBE_BOX_PROJECTION:ShaderDefine;
	}

}
