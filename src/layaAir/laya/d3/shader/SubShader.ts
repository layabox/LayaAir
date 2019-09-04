import { Shader3D } from "./Shader3D";
import { ShaderPass } from "./ShaderPass";

/**
 * <code>SubShader</code> 类用于创建SubShader。
 */
export class SubShader {
	/**@internal */
	_attributeMap: any;
	/**@internal */
	_uniformMap: any;

	/**@internal */
	_owner: Shader3D;
	/**@internal */
	_flags: any = {};
	/**@internal */
	_passes: ShaderPass[] = [];

	/**
	 * 创建一个 <code>SubShader</code> 实例。
	 * @param	attributeMap  顶点属性表。
	 * @param	uniformMap  uniform属性表。
	 */
	constructor(attributeMap: any, uniformMap: any) {
		this._attributeMap = attributeMap;
		this._uniformMap = uniformMap;
	}

	/**
	 *添加标记。
	 * @param key 标记键。
	 * @param value 标记值。
	 */
	setFlag(key: string, value: string): void {
		if (value)
			this._flags[key] = value;
		else
			delete this._flags[key];
	}

	/**
	 * 获取标记值。
	 * @return key 标记键。
	 */
	getFlag(key: string): string {
		return this._flags[key];
	}

	/**
	 * 添加着色器Pass
	 * @param vs 
	 * @param ps 
	 * @param stateMap 
	 */
	addShaderPass(vs: string, ps: string, stateMap: object = null): ShaderPass {
		var shaderPass: ShaderPass = new ShaderPass(this, vs, ps, stateMap);
		this._passes.push(shaderPass);
		return shaderPass;
	}

}



