import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class GLESCommandUniformMap extends CommandUniformMap {
    _nativeObj: any;
    constructor(stateName: string) {
        super(stateName);
        this._nativeObj = new (window as any).conchGLESCommandUniformMap.create(stateName);
    }
    /**
     * 增加一个Uniform参数，如果Uniform属性是Array，请使用addShaderUniformArray
     * @internal
     * @param propertyID 
     * @param propertyKey 
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = ""): void {
        this._nativeObj.addShaderUniform(propertyID, propertyKey, uniformtype, block);
    }

    /**
     * 增加一个UniformArray参数
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number, block: string = ""): void {
        if (uniformtype !== ShaderDataType.Matrix4x4 && uniformtype !== ShaderDataType.Vector4)
            throw ('because of align rule, the engine does not support other types as arrays.');
        this._nativeObj.addShaderUniform(propertyID, propertyName, uniformtype, block);
    }
}