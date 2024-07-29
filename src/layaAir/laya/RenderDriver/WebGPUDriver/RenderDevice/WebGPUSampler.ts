import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

enum GPUAddressMode {
    clamp = "clamp-to-edge",
    repeat = "repeat",
    mirror = "mirror-repeat"
};

enum GPUFilterMode {
    nearest = "nearest",
    linear = "linear"
};

enum GPUCompareFunction {
    never = "never",
    less = "less",
    equal = "equal",
    less_equal = "less-equal",
    greater = "greater",
    not_equal = "not-equal",
    greater_equal = "greater-equal",
    always = "always"
};

export interface WebGPUSamplerParams {
    comparedMode: TextureCompareMode,
    wrapU: WrapMode,
    warpV: WrapMode,
    warpW: WrapMode,
    mipmapFilter: FilterMode,
    filterMode: FilterMode,
    anisoLevel: number
}

export class WebGPUSampler {
    static pointer_wrapU: number = 0;
    static pointer_warpV: number = 2;
    static pointer_warpW: number = 4;
    static pointer_filterMode: number = 6;
    static pointer_mipmapFilter: number = 8;
    static pointer_comparedMode: number = 10;
    static pointer_anisoLevel: number = 14; //0-16

    private static _cacheMap: { [key: number]: WebGPUSampler } = {}; //Sampler是全局缓存的，不能删除
    private _descriptor: GPUSamplerDescriptor
    source: GPUSampler;

    globalId: number;
    objectName: string = 'WebGPUSamper';

    constructor(obj: WebGPUSamplerParams) {
        this.source = this._createGPUSampler(obj);
        this.globalId = WebGPUGlobal.getId(this);
    }

    static getWebGPUSampler(params: WebGPUSamplerParams) {
        const cacheKey = WebGPUSampler._getCacheSamplerKey(params);
        if (!this._cacheMap[cacheKey])
            this._cacheMap[cacheKey] = new WebGPUSampler(params);
        return this._cacheMap[cacheKey];
    }

    private static _getCacheSamplerKey(params: WebGPUSamplerParams): number {
        return (params.wrapU << WebGPUSampler.pointer_wrapU) +
            (params.warpV << WebGPUSampler.pointer_warpV) +
            (params.warpW << WebGPUSampler.pointer_warpW) +
            (params.filterMode << WebGPUSampler.pointer_filterMode) +
            (params.mipmapFilter << WebGPUSampler.pointer_mipmapFilter) +
            (params.comparedMode << WebGPUSampler.pointer_comparedMode) +
            (params.anisoLevel << WebGPUSampler.pointer_anisoLevel);
    }

    private _createGPUSampler(params: WebGPUSamplerParams): GPUSampler {
        this._descriptor = this._getSamplerDescriptor(params);
        if (this._descriptor.maxAnisotropy < 1) //不能设成<1
            this._descriptor.maxAnisotropy = 1;
        return WebGPURenderEngine._instance.getDevice().createSampler(this._descriptor);
    }

    private _getSamplerDescriptor(params: WebGPUSamplerParams) {
        if (params.anisoLevel > 1 && params.mipmapFilter === FilterMode.Point)
            params.mipmapFilter = FilterMode.Bilinear; //支持各向异性不能设成点采样

        return {
            addressModeU: this._getSamplerAddressMode(params.wrapU),
            addressModeV: this._getSamplerAddressMode(params.wrapU),
            addressModeW: this._getSamplerAddressMode(params.warpW),
            magFilter: this._getFilterMode(params.filterMode),
            minFilter: this._getFilterMode(params.filterMode),
            mipmapFilter: this._getFilterMode(params.mipmapFilter),
            compare: this._getGPUCompareFunction(params.comparedMode),
            maxAnisotropy: params.anisoLevel
        }
    }

    private _getSamplerAddressMode(warpMode: WrapMode): GPUAddressMode {
        switch (warpMode) {
            case WrapMode.Repeat:
                return GPUAddressMode.repeat;
            case WrapMode.Mirrored:
                return GPUAddressMode.mirror;
            case WrapMode.Clamp:
            default:
                return GPUAddressMode.clamp;
        }
    }

    private _getFilterMode(filterMode: FilterMode): GPUFilterMode {
        switch (filterMode) {
            case FilterMode.Bilinear:
            case FilterMode.Trilinear:
                return GPUFilterMode.linear;
            case FilterMode.Point:
            default:
                return GPUFilterMode.nearest;
        }
    }

    private _getGPUCompareFunction(compareMode: TextureCompareMode): GPUCompareFunction {
        switch (compareMode) {
            case TextureCompareMode.ALWAYS:
                return GPUCompareFunction.always;
            case TextureCompareMode.EQUAL:
                return GPUCompareFunction.equal;
            case TextureCompareMode.GREATER:
                return GPUCompareFunction.greater;
            case TextureCompareMode.GEQUAL:
                return GPUCompareFunction.greater_equal;
            case TextureCompareMode.LESS:
                return GPUCompareFunction.less;
            case TextureCompareMode.LEQUAL:
                return GPUCompareFunction.less_equal;
            case TextureCompareMode.NEVER:
                return GPUCompareFunction.never;
            case TextureCompareMode.NOTEQUAL:
                return GPUCompareFunction.not_equal;
            case TextureCompareMode.None:
            default:
                return undefined;
        }
    }
}