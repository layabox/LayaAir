import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";

export class WebGPUCapable {
    /**@internal */
    private _capabilityMap: Map<RenderCapable, boolean>;

    constructor(descriptor: GPUDeviceDescriptor) {
        this.initCapable(descriptor);
    }

    initCapable(descriptor: GPUDeviceDescriptor) {
        this._capabilityMap = new Map();
        //Index Uint32
        this._capabilityMap.set(RenderCapable.Element_Index_Uint32, true);
        //FLoat32Texture
        this._capabilityMap.set(RenderCapable.TextureFormat_R32G32B32A32, true);
        //halfFloatTexture
        this._capabilityMap.set(RenderCapable.TextureFormat_R16G16B16A16, true);
        //anistropic
        this._capabilityMap.set(RenderCapable.Texture_anisotropic, true);
        this._capabilityMap.set(RenderCapable.RenderTextureFormat_R16G16B16A16, true);
        this._capabilityMap.set(RenderCapable.RenderTextureFormat_Depth, true);
        this._capabilityMap.set(RenderCapable.RenderTextureFormat_ShadowMap, true);
        this._capabilityMap.set(RenderCapable.Vertex_VAO, true);
        this._capabilityMap.set(RenderCapable.DrawElement_Instance, true); //先关闭instance
        this._capabilityMap.set(RenderCapable.Shader_TextureLod, true);

        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_S3TC, false);
        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB, false);
        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_PVRTC, false);
        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ETC1, false);
        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ETC, false);
        this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ASTC, false);
        this._capabilityMap.set(RenderCapable.Texture_SRGB, true);
        this._capabilityMap.set(RenderCapable.MSAA, true);
        this._capabilityMap.set(RenderCapable.UnifromBufferObject, false);
        this._capabilityMap.set(RenderCapable.Texture3D, true);
        this._capabilityMap.set(RenderCapable.Texture_HalfFloatLinearFiltering, true);
        this._capabilityMap.set(RenderCapable.RenderTextureFormat_R32G32B32A32, true);
        this._capabilityMap.set(RenderCapable.RenderTextureFormat_R16G16B16A16, true);

        let features = descriptor.requiredFeatures;

        for (const iterator of features) {
            switch (iterator) {
                case "texture-compression-astc":
                    this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ASTC, true);
                    break;
                case "texture-compression-bc":
                    this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_S3TC, true);
                    this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB, true);
                    break;
                case "texture-compression-etc2":
                    this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ETC1, true);
                    this._capabilityMap.set(RenderCapable.COMPRESS_TEXTURE_ETC, true);
                    break;
                case "float32-filterable":
                    this._capabilityMap.set(RenderCapable.Texture_FloatLinearFiltering, true);
                    break;
                default:
                    break;
            }
        }

    }

    getCapable(type: RenderCapable) {
        return this._capabilityMap.get(type);
    }
}