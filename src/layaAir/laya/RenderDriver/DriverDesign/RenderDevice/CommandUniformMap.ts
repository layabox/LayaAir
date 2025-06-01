import { ShaderDataType } from "./ShaderData";

export type UniformProperty = {
    id: number,
    propertyName: string,
    uniformtype: ShaderDataType,
    arrayLength: number
    extParam:any;
};

export class CommandUniformMap {

    constructor(stateName: string) {

    }
    
    /**
     * 增加一个Uniform参数
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, extParam:any=null): void {
        throw "need override it";
    }

    /**
     * 增加一个UniformArray参数
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        throw "need override it";
    }
}
