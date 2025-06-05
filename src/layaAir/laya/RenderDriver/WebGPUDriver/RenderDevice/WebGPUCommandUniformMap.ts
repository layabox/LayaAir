import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGPUCommandUniformMap extends CommandUniformMap {

    /** @internal */
    _idata: Map<number, UniformProperty> = new Map<number, UniformProperty>();

    /** @internal */
    _defaultData: Map<number, BaseTexture> = new Map();

    /** @internal */
    _hasUniformBuffer: boolean = false;

    /** @internal */
    _stateName: string;

    _stateID: number;

    /** 
     * @internal
     * map 中包含的纹理数量
     * 不包括 storage texture
     */
    _textureCount: number = 0;

    /** @internal */
    _textureBits: Map<number, number>;

    /** @internal */
    _textureExits: number;

    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
        this._stateID = Shader3D.propertyNameToID(stateName);
        this._textureBits = new Map<number, number>();
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
        let uniform = { id: propertyID, uniformtype, propertyName, arrayLength: 0 }
        this._idata.set(propertyID, uniform);
        if (uniformtype < ShaderDataType.Texture2D && uniformtype != ShaderDataType.DeviceBuffer && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer && uniformtype != ShaderDataType.StorageTexture2D) {
            this._hasUniformBuffer = true;
        }
        if (uniformtype >= ShaderDataType.Texture2D) {
            this._textureBits.set(propertyID, this._textureCount);
            this._textureExits |= (1 << this._textureCount);
            this._textureCount++;
            // todo 
            // max texture count 31
            if (this._textureCount > 31) {
                console.log(this._stateName, "max texture count 31", this._textureCount);
            }
        }
    }

    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        this._idata.set(propertyID, { id: propertyID, uniformtype, propertyName, arrayLength });
        if (uniformtype < ShaderDataType.Texture2D && uniformtype != ShaderDataType.DeviceBuffer && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer) {
            this._hasUniformBuffer = true;
        }
    }
}
