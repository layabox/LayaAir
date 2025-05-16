import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGPUCommandUniformMap extends CommandUniformMap {

    /** @internal */
    _idata: Map<number, UniformProperty> = new Map<number, UniformProperty>();

    /** @internal */
    _defaultData: Map<number, BaseTexture> = new Map();

    _ishasBuffer: boolean = false;

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
        if (uniformtype < ShaderDataType.Texture2D && uniformtype != ShaderDataType.DeviceBuffer && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer) {
            this._ishasBuffer = true;
        }
    }

    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        this._idata.set(propertyID, { id: propertyID, uniformtype, propertyName, arrayLength });
        if (uniformtype < ShaderDataType.Texture2D && uniformtype != ShaderDataType.DeviceBuffer && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer) {
            this._ishasBuffer = true;
        }
    }
}
