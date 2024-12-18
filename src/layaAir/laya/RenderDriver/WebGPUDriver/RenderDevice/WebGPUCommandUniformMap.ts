import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGPUCommandUniformMap extends CommandUniformMap {

    /** @internal */
    _idata: Map<number, UniformProperty> = new Map<number, UniformProperty>();

    _stateName: string;
    _stateID: number;
    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
        this._stateID = Shader3D.propertyNameToID(stateName);
    }

    hasPtrID(propertyID: number): boolean {
        return this._stateID == propertyID || this._idata.has(propertyID);
    }

    /**
     * 增加一个Uniform参数，如果Uniform属性是Array，请使用addShaderUniformArray
     * @internal
     * @param propertyID 
     * @param propertyName 
     */
    addShaderUniform(propertyID: number, propertyName: string, uniformtype: ShaderDataType): void {
        this._idata.set(propertyID, { id: propertyID, uniformtype, propertyName, arrayLength: 0 });
    }

    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        if (uniformtype !== ShaderDataType.Matrix4x4 && uniformtype !== ShaderDataType.Vector4)
            throw ('because of align rule, the engine does not support other types as arrays./因为对其规则,引擎不支持除了Matreix4x4和Vector4之外的数据数组');

        this._idata.set(propertyID, { id: propertyID, uniformtype, propertyName, arrayLength });
    }
}
