
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../../RenderEngine/RenderEnum/TextureCompareMode";
import { WrapMode } from "../../../../RenderEngine/RenderEnum/WrapMode";
import { WebGPUObject } from "./WebGPUObject";

enum GPUAddressMode {
    Clamp = "clamp-to-edge",
    repeat = "repeat",
    mirror = "mirror-repeat"
};

enum GPUFilterMode {
    Nearest = "nearest",
    Linear = "linear"
};

// enum GPUMipmapFilterMode {
//     Nearest = "nearest",
//     Linear = "linear"
// };

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
    anisoLevel: number;
}

export class WebGPUSamplerContext extends WebGPUObject {

    private _cacheMap = {};

    createGPUSampler(params: WebGPUSamplerParams): GPUSampler {
        let descriptor: GPUSamplerDescriptor = this._getSamplerDescriptor(params)
        return this._engine._device.createSampler(descriptor);
    }

    getcacheSampler(params: WebGPUSamplerParams) {
        let key = this._getCatchWrapKey(params);
        let cachmap = (this._cacheMap as any)[key] || ((this._cacheMap as any)[key] = {});
        key = params.anisoLevel;
        cachmap = (cachmap as any)[key] || ((cachmap as any)[key] = {});
        key = params.comparedMode;
        return (cachmap as any)[key] || ((cachmap as any)[key] = this.createGPUSampler(params));
    }

    private _getCatchWrapKey(params: WebGPUSamplerParams) {
        return params.wrapU + (params.warpV << 2) + (params.warpW << 4) + (params.filterMode << 7) + (params.mipmapFilter << 9);
    }

    private _anisoLevel() {

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
        let mode = GPUAddressMode.Clamp;
        switch (warpmode) {
            case WrapMode.Repeat:
                mode = GPUAddressMode.repeat;
                break;
            case WrapMode.Clamp:
                mode = GPUAddressMode.Clamp;
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
                return GPUFilterMode.Nearest;
            case FilterMode.Bilinear:
                return GPUFilterMode.Linear;
            default:
                return GPUFilterMode.Nearest;
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