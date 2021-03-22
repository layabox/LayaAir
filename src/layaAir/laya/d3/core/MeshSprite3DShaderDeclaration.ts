import { ShaderDefine } from "../shader/ShaderDefine";

/**
 * 类用来记录精灵数据宏
 */
export class MeshSprite3DShaderDeclaration {
	/**UV0通道顶点数据宏 */
	static SHADERDEFINE_UV0: ShaderDefine;
	/**顶点色顶点数据宏 */
	static SHADERDEFINE_COLOR: ShaderDefine;
	/**UV1通道顶点数据宏 */
	static SHADERDEFINE_UV1: ShaderDefine;
	/**instance调用宏 */
	static SHADERDEFINE_GPU_INSTANCE: ShaderDefine;
	/**盒子反射宏 */
	static SHADERDEFINE_SPECCUBE_BOX_PROJECTION:ShaderDefine;
}