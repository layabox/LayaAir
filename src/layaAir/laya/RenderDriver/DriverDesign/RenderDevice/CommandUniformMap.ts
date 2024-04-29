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
     * 增加一个UniformArray参数
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ""): void {
        throw "need override it";
    } //兼容WGSL

    /**
     * 增加一个Uniform
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
        throw "need override it";
    }
}