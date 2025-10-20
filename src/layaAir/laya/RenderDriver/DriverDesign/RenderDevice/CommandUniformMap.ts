import { BaseTexture } from "../../../resource/BaseTexture";
import { ShaderDataType } from "./ShaderData";

export type UniformProperty = {
    id: number,
    propertyName: string,
    uniformtype: ShaderDataType,
    arrayLength: number,
    format?: string
};

/**
 * @blueprintIgnore
 */
export class CommandUniformMap {

    constructor(stateName: string) {

    }

    /**
     * 增加一个Uniform参数
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, format?: string): void {
        throw "need override it";
    }

    /**
     * 增加一个UniformArray参数
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        throw "need override it";
    }

    /**
     * 设置默认值
     */
    setDefaultTextureData(key: number, defaultTex: BaseTexture) {
        throw "need override it";
    }
}
