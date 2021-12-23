import { ShaderDefine } from "../../shader/ShaderDefine";

/**
 * @internal
 * 场景宏集合
 */
export class Scene3DShaderDeclaration {
	/**@internal */
	static SHADERDEFINE_FOG: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_DIRECTIONLIGHT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_POINTLIGHT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SPOTLIGHT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_CASCADE: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SOFT_SHADOW_LOW: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SOFT_SHADOW_HIGH: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SPOT:ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW:ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH:ShaderDefine;
	/**@internal */
	static SHADERDEFINE_GI_AMBIENT_SH: ShaderDefine;
}