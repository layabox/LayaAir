import { LayaGL } from "../layagl/LayaGL";
import { TextureFormat } from "../resource/TextureFormat";
import { RenderTextureFormat } from "../resource/RenderTextureFormat";

/**
 * 系统工具。
 */
export class SystemUtils {
    /** @internal */
    static _maxTextureCount: number;
    /** @internal */
    static _maxTextureSize: number;
    /** @internal */
    static _shaderCapailityLevel: number;

    /**
     * 图形设备支持的最大纹理数量。
     */
    static get maxTextureCount(): number {
        return this._maxTextureCount;
    }

    /**
     * 图形设备支持的最大纹理尺寸。
     */
    static get maxTextureSize(): number {
        return this._maxTextureSize;
    }

    /**
     * 图形设备着色器的大致能力等级,类似于DirectX的shader model概念。
     */
    static get shaderCapailityLevel(): number {
        return this._shaderCapailityLevel;
    }

    /**
     * 是否支持纹理格式。
     * @param format 纹理格式。 
     * @returns 是否支持。
     */
    static supportTextureFormat(format: number): boolean {
        switch (format) {
            case TextureFormat.R32G32B32A32:
                return (!LayaGL.layaGPUInstance._isWebGL2 && !LayaGL.layaGPUInstance._oesTextureFloat) ? false : true;
            case TextureFormat.R16G16B16A16:
                return (!LayaGL.layaGPUInstance._isWebGL2 && !LayaGL.layaGPUInstance._oesTextureHalfFloat) ? false : true; 
            default:
                return true;
        }
    }

    /**
     * 是否支持渲染纹理格式。
     * @param format 渲染纹理格式。
     * @returns 是否支持。
     */
    static supportRenderTextureFormat(format: number): boolean {
        switch (format) {
            case RenderTextureFormat.R16G16B16A16:
                return (((!!LayaGL.layaGPUInstance._isWebGL2)&&(!!LayaGL.layaGPUInstance._extColorBufferFloat)) || LayaGL.layaGPUInstance._oesTextureHalfFloat && LayaGL.layaGPUInstance._oesTextureHalfFloatLinear) ? true : false;
            case RenderTextureFormat.Depth:
                return (LayaGL.layaGPUInstance._isWebGL2 || LayaGL.layaGPUInstance._webgl_depth_texture) ? true : false;
            case RenderTextureFormat.ShadowMap:
                return LayaGL.layaGPUInstance._isWebGL2 ? true : false;
            default:
                return true;
        }
    }
}