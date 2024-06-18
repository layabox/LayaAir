import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGPUCommandUniformMap extends CommandUniformMap {
    /**@internal */
    _idata: {
        [key: number]: {
            propertyName: string,
            arrayLength: number,
            uniformtype: ShaderDataType,
        }
    } = {};
    _stateName: string;

    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
    }

    hasPtrID(propertyID: number): boolean {
        return !!(this._idata[propertyID] != null);
    }

    /**
     * 增加一个Uniform参数，如果Uniform属性是Array，请使用addShaderUniformArray
     * @internal
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniform(propertyID: number, propertyName: string, uniformtype: ShaderDataType, block: string = ''): void {
        this._idata[propertyID] = { uniformtype, propertyName, arrayLength: 0 };
    }

    /**
     * 增加一个UniformArray参数
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ''): void {
        if (uniformtype !== ShaderDataType.Matrix4x4 && uniformtype !== ShaderDataType.Vector4)
            throw ('because of align rule, the engine does not support other types as arrays.');
        this._idata[propertyID] = { uniformtype, propertyName, arrayLength };
    }

    /**
     * 增加一个Uniform
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
        return null;
    }
}