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

    private static _cacheMap: { [key: number]: WebGPUSampler } = {};

    static getWebGPUSampler(params: WebGPUSamplerParams) {
        let cacheKey = WebGPUSampler._getCatchSamplerKey(params);
        if (!this._cacheMap[cacheKey])
            this._cacheMap[cacheKey] = new WebGPUSampler(params);
        return this._cacheMap[cacheKey];
    }

    private static _getCatchSamplerKey(params: WebGPUSamplerParams): number {
        return (params.wrapU << WebGPUSampler.pointer_wrapU) +
            (params.warpV << WebGPUSampler.pointer_warpV) +
            (params.warpW << WebGPUSampler.pointer_warpW) +
            (params.filterMode << WebGPUSampler.pointer_filterMode) +
            (params.mipmapFilter << WebGPUSampler.pointer_mipmapFilter) +
            (params.comparedMode << WebGPUSampler.pointer_comparedMode) +
            (params.anisoLevel << WebGPUSampler.pointer_anisoLevel);
    }

    private _descriptor: GPUSamplerDescriptor
    source: GPUSampler;

    globalId: number;
    objectName: string = 'WebGPUSamper';

    constructor(obj: WebGPUSamplerParams) {
        this.source = this._createGPUSampler(obj);

        this.globalId = WebGPUGlobal.getId(this);
    }

    private _createGPUSampler(params: WebGPUSamplerParams): GPUSampler {
        this._descriptor = this._getSamplerDescriptor(params);
        return WebGPURenderEngine._instance.getDevice().createSampler(this._descriptor);
    }

    private _getSamplerDescriptor(params: WebGPUSamplerParams) {
        let CompareSamplerFun = this._getGPUCompareFunction(params.comparedMode);
        if (CompareSamplerFun)
            return {
                addressModeU: this._getSamplerAddressMode(params.wrapU),
                addressModeV: this._getSamplerAddressMode(params.wrapU),
                addressModeW: this._getSamplerAddressMode(params.warpW),
                magFilter: this._getFilterMode(params.filterMode),
                minFilter: this._getFilterMode(params.filterMode),
                mipmapFilter: this._getFilterMode(params.mipmapFilter),
                compare: CompareSamplerFun,
                maxAnisotropy: params.anisoLevel
            }
        else
            return {
                addressModeU: this._getSamplerAddressMode(params.wrapU),
                addressModeV: this._getSamplerAddressMode(params.wrapU),
                addressModeW: this._getSamplerAddressMode(params.warpW),
                magFilter: this._getFilterMode(params.filterMode),
                minFilter: this._getFilterMode(params.filterMode),
                mipmapFilter: this._getFilterMode(params.mipmapFilter),
                maxAnisotropy: params.anisoLevel
            }
    }

    private _getSamplerAddressMode(warpmode: WrapMode): GPUAddressMode {
        let mode = GPUAddressMode.clamp;
        switch (warpmode) {
            case WrapMode.Repeat:
                mode = GPUAddressMode.repeat;
                break;
            case WrapMode.Clamp:
                mode = GPUAddressMode.clamp;
                break;
            case WrapMode.Mirrored:
                mode = GPUAddressMode.mirror;
                break;
        }
        return mode;
    }

    private _getFilterMode(mode: FilterMode): GPUFilterMode {
        switch (mode) {
            case FilterMode.Point:
                return GPUFilterMode.nearest;
            case FilterMode.Bilinear:
                return GPUFilterMode.linear;
            default:
                return GPUFilterMode.nearest;
        }
    }

    private _getGPUCompareFunction(comparedMode: TextureCompareMode): GPUCompareFunction {
        switch (comparedMode) {
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
            default:
                return null;
        }
    }
}