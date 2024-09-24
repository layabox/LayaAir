import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";

/**
 * @en Class for Skinned Mesh Sprite3D Shader Declarations
 * @zh 蒙皮网格3D精灵着色器声明类
 */
export class SkinnedMeshSprite3DShaderDeclaration {
    /**
     * @en Sprite-level shader macro definition for skinned animation.
     * @zh 精灵级着色器宏定义，用于蒙皮动画。
     */
	static SHADERDEFINE_BONE: ShaderDefine;
    /**
     * @en Sprite-level shader macro definition for simple bone animation.
     * @zh 精灵级着色器宏定义，用于简单骨骼动画。
     */
	static SHADERDEFINE_SIMPLEBONE:ShaderDefine;
}