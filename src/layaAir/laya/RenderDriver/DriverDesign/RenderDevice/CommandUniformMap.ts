import { ShaderDataType } from "./ShaderData";

export type UniformProperty = { id: number, propertyName: string, uniformtype: ShaderDataType }
export class CommandUniformMap {

	constructor(stateName: string) {

	}
	/**
	 * 增加一个Uniform参数
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = null): void {
		throw "need override it";
	}

	/**
	 * 增加一个Uniform
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
		throw "need override it";
	}

}