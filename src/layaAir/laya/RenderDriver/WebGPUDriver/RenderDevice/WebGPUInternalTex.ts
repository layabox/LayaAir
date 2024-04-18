import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGPUSampler, WebGPUSamplerParams } from "./WebGPUSampler";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "./WebGPUStatis/WebGPUStatis";
import { WebGPUTextureFormat } from "./WebGPUTextureContext";

export class WebGPUInternalTex implements InternalTexture {
    resource: GPUTexture;
    dimension: TextureDimension;
    width: number;
    height: number;
    depth: number;
    isPotSize: boolean;
    mipmap: boolean;
    mipmapCount: number;
    baseMipmapLevel: number;
    maxMipmapLevel: number;
    gpuMemory: number;
    useSRGBLoad: boolean;
    gammaCorrection: number;
    multiSamplers: number;

    _webGPUFormat: WebGPUTextureFormat;

    globalId: number;
    objectName: string = 'WebGPUInternalTex';

    //sampler 
    private _filterMode: FilterMode;
    public get filterMode(): FilterMode {
        return this._filterMode;
    }
    public set filterMode(value: FilterMode) {
        if (this._filterMode !== value) {
            switch (value) {
                case FilterMode.Point:
                    this._webGPUSamplerParams.filterMode = FilterMode.Point;
                    this._webGPUSamplerParams.mipmapFilter = FilterMode.Point;
                    break;
                case FilterMode.Bilinear:
                    this._webGPUSamplerParams.filterMode = FilterMode.Bilinear;
                    this._webGPUSamplerParams.mipmapFilter = FilterMode.Point;
                    break;
                case FilterMode.Trilinear:
                    this._webGPUSamplerParams.filterMode = FilterMode.Bilinear;
                    this._webGPUSamplerParams.mipmapFilter = FilterMode.Bilinear;
                    break;
            }
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._filterMode = value;
        }
    }

    private _wrapU: WrapMode;
    public get wrapU(): WrapMode {
        return this._wrapU;
    }
    public set wrapU(value: WrapMode) {
        if (this._wrapU !== value) {
            this._webGPUSamplerParams.wrapU = value;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._wrapU = value;
        }
    }

    private _wrapV: WrapMode;
    public get wrapV(): WrapMode {
        return this._wrapV;
    }
    public set wrapV(value: WrapMode) {
        if (this._wrapV !== value) {
            this._webGPUSamplerParams.wrapU = value;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._wrapV = value;
        }
    }

    private _wrapW: WrapMode;
    public get wrapW(): WrapMode {
        return this._wrapW;
    }
    public set wrapW(value: WrapMode) {
        if (this._wrapW !== value) {
            this._webGPUSamplerParams.wrapU = value;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._wrapW = value;
        }
    }

    private _anisoLevel: number;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        if (this._anisoLevel !== value && this.resource) {
            this._webGPUSamplerParams.anisoLevel = value;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._anisoLevel = value;
        }
    }

    private _compareMode: TextureCompareMode;
    public get compareMode(): TextureCompareMode {
        return this._compareMode;
    }
    public set compareMode(value: TextureCompareMode) {
        if (this._compareMode !== value) {
            this._webGPUSamplerParams.comparedMode = value;
            this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);
            this._compareMode = value;
        }
    }

    private _webGPUSamplerParams: WebGPUSamplerParams = {
        comparedMode: TextureCompareMode.None,
        wrapU: WrapMode.Repeat,
        warpV: WrapMode.Repeat,
        warpW: WrapMode.Repeat,
        mipmapFilter: FilterMode.Bilinear,
        filterMode: FilterMode.Bilinear,
        anisoLevel: 1
    };

    private _webgpuSampler: WebGPUSampler;
    get sampler() {
        return this._webgpuSampler;
    }

    constructor(width: number, height: number, depth: number, dimension: TextureDimension, mipmap: boolean, multiSamples: number, useSRGBLoader: boolean, gammaCorrection: number) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.dimension = dimension;
        this.multiSamplers = multiSamples;

        const isPot = (value: number): boolean => {
            return (value & (value - 1)) === 0;
        }

        this.isPotSize = isPot(width) && isPot(height);
        if (dimension === TextureDimension.Tex3D) {
            this.isPotSize = this.isPotSize && isPot(this.depth);
        }

        this.mipmap = mipmap && this.isPotSize;
        this.mipmapCount = this.mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;
        this.maxMipmapLevel = this.mipmapCount - 1;
        this.baseMipmapLevel = 0;
        this.useSRGBLoad = useSRGBLoader;
        this.gammaCorrection = gammaCorrection;

        this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);

        this.globalId = WebGPUGlobal.getId(this);
        WebGPUStatis.addTexture(this);
    }

    getTextureView(): GPUTextureView {
        return this.resource.createView();
    }

    dispose(): void {
        //TODO好像需要延迟删除
        WebGPUGlobal.releaseId(this);
        this.resource.destroy();
    }
}