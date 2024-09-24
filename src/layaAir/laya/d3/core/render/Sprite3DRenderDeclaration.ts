import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";


/**
 * @en The `Sprite3DRenderDeclaration` class contains shader defines used in 3D sprite rendering.
 * @zh `Sprite3DRenderDeclaration` 类包含了3D精灵渲染中使用的着色器定义。
 */
export class Sprite3DRenderDeclaration {
	/**@internal */
	static SHADERDEFINE_GI_LEGACYIBL: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_GI_IBL: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_IBL_RGBD: ShaderDefine;
	/**
	 * @en Box reflection macro
	 * @zh 盒子反射宏 */
	static SHADERDEFINE_SPECCUBE_BOX_PROJECTION: ShaderDefine;

	/**
	 * @en Volumetric Global Illumination macro
	 * @zh 体积全局光照宏
	 */
	static SHADERDEFINE_VOLUMETRICGI: ShaderDefine;

}