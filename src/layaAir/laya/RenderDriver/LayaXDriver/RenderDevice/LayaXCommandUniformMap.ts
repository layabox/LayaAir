import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { BaseTexture } from "../../../resource/BaseTexture";
import { CommandUniformMap, UniformOptions, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class LayaXCommandUniformMap extends CommandUniformMap {
    _nativeObj: any;
    /**@internal */
    _idata: Map<number, UniformProperty> = new Map<number, UniformProperty>();

    _stateName: string;

    _stateID: number;

    /** @internal */
    _hasUniformBuffer: boolean = false;

    /** @internal 纹理 propertyID → 在本 map 中的纹理位索引 */
    _textureBits: Map<number, number> = new Map<number, number>();

    /** @internal 本 map 中包含的纹理数量（不含 storage texture） */
    _textureCount: number = 0;

    constructor(stateName: string) {
        super(stateName);
        this._stateName = stateName;
        this._stateID = Shader3D.propertyNameToID(stateName);
        this._nativeObj = new (window as any).conchLayaXCommandUniformMap.create(stateName);
    }

    hasPtrID(propertyID: number): boolean {
        return this._stateID == propertyID || this._idata.has(propertyID);
    }

    /**
     * Add a Uniform parameter. For Uniform Array properties, use addShaderUniformArray.
     * @internal
     */
    addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, options?: UniformOptions): void {
        this._nativeObj.addShaderUniform(propertyID, propertyKey, uniformtype);

        let uniform = { id: propertyID, uniformtype: uniformtype, propertyName: propertyKey, arrayLength: 0, format: options?.format, access: options?.access };
        this._idata.set(propertyID, uniform);

        if (uniformtype < ShaderDataType.Texture2D
            && uniformtype != ShaderDataType.DeviceBuffer
            && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer
            && uniformtype != ShaderDataType.StorageTexture2D) {
            this._hasUniformBuffer = true;
        }
        if (uniformtype >= ShaderDataType.Texture2D) {
            this._textureBits.set(propertyID, this._textureCount);
            this._textureCount++;
        }
    }

    /**
     * Add a UniformArray parameter.
     */
    addShaderUniformArray(propertyID: number, propertyName: string, uniformtype: ShaderDataType, arrayLength: number): void {
        this._nativeObj.addShaderUniformArray(propertyID, propertyName, uniformtype, arrayLength);
        this._idata.set(propertyID, { id: propertyID, uniformtype: uniformtype, propertyName: propertyName, arrayLength: arrayLength });

        if (uniformtype < ShaderDataType.Texture2D
            && uniformtype != ShaderDataType.DeviceBuffer
            && uniformtype != ShaderDataType.ReadOnlyDeviceBuffer) {
            this._hasUniformBuffer = true;
        }
    }

    setDefaultTextureData(key: number, defaultTex: BaseTexture) {
        let rtNative: any = null;
        if (defaultTex) {
            let rt = (defaultTex as any)._renderTarget;
            if (rt) rtNative = rt._nativeObj;
        }
        this._nativeObj.setDefaultTextureData(key, rtNative);
    }
}
