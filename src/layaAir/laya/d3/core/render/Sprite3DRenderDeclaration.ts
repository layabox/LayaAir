import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";


export class Sprite3DRenderDeclaration{
	/**@internal */
	static SHADERDEFINE_GI_LEGACYIBL: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_GI_IBL: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_IBL_RGBD: ShaderDefine;
    /**盒子反射宏 */
	static SHADERDEFINE_SPECCUBE_BOX_PROJECTION: ShaderDefine;

	/// Volumetric GI
	static SHADERDEFINE_VOLUMETRICGI: ShaderDefine;

}