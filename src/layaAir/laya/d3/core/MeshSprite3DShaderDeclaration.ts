import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";

/**
 * @en Class used to record sprite data macros
 * @zh 类用来记录精灵数据宏
 */
export class MeshSprite3DShaderDeclaration {
    /**
     * @en Shader define for UV0 channel vertex data
     * @zh UV0通道顶点数据宏
     */
	static SHADERDEFINE_UV0: ShaderDefine;
    /**
     * @en Shader define for vertex color data
     * @zh 顶点色顶点数据宏
     */
	static SHADERDEFINE_COLOR: ShaderDefine;
    /**
     * @en Shader define for UV1 channel vertex data
     * @zh UV1通道顶点数据宏
     */
	static SHADERDEFINE_UV1: ShaderDefine;
    /**
     * @en Shader define for Tangent channel vertex data
     * @zh Tangent 通道顶点数据宏
     */
	static SHADERDEFINE_TANGENT: ShaderDefine;
    /**
     * @en Using instance
     * @zh instance调用宏
     */
	static SHADERDEFINE_GPU_INSTANCE: ShaderDefine;
	
}
