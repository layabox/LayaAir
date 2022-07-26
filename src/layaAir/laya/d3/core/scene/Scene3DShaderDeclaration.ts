import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";

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
	static SHADERDEFINE_SHADOW_SPOT: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_LOW: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_SHADOW_SPOT_SOFT_SHADOW_HIGH: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_GI_LEGACYIBL: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_GI_IBL: ShaderDefine;
}

export class CommandUniformMap {

	static globalBlockMap: any = {};

	static createGlobalUniformMap(blockName: string): CommandUniformMap {
		let comMap = this.globalBlockMap[blockName];
		if (!comMap)
			comMap = this.globalBlockMap[blockName] = new CommandUniformMap(blockName);
		return comMap;
	}

	/**@internal */
	_idata: { [key: number]: string } = {};
	_stateName: string;

	constructor(stateName: string) {
		this._stateName = stateName;
	}

	hasPtrID(propertyID: number): boolean {
		return !!(this._idata[propertyID] != null);
	}

	getMap() {
		return this._idata;
	}

	/**
	 * 增加一个UniformMap
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string): void {
		this._idata[propertyID] = propertyKey;
	}

}

// native
if ((window as any).conch && !(window as any).conchConfig.conchWebGL) {
	//@ts-ignore
	CommandUniformMap = (window as any).conchCommandUniformMap;
}