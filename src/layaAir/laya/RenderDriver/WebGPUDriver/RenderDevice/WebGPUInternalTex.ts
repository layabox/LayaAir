import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGLEngine } from "../../WebGLDriver/RenderDevice/WebGLEngine";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
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
    useSRGBLoad: boolean;
    gammaCorrection: number;
    multiSamplers: number;

    _webGPUFormat: WebGPUTextureFormat;

    private _engine: WebGPURenderEngine;
    private _statistics_M_TextureX: GPUEngineStatisticsInfo; //分类
    private _statistics_M_TextureA: GPUEngineStatisticsInfo; //不分类
    private _statistics_RC_TextureX: GPUEngineStatisticsInfo;
    private _statistics_RC_TextureA: GPUEngineStatisticsInfo;

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
            this._webGPUSamplerParams.wrapV = value;
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
            this._webGPUSamplerParams.wrapW = value;
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
        wrapV: WrapMode.Repeat,
        wrapW: WrapMode.Repeat,
        mipmapFilter: FilterMode.Bilinear,
        filterMode: FilterMode.Bilinear,
        anisoLevel: 1
    };

    private _webgpuSampler: WebGPUSampler;
    get sampler() {
        return this._webgpuSampler;
    }

    private _gpuMemory: number = 0;
    get gpuMemory(): number {
        return this._gpuMemory;
    }
    set gpuMemory(value: number) {
        this._changeTexMemory(value);
        this._gpuMemory = value;
    }

    constructor(width: number, height: number, depth: number, dimension: TextureDimension, mipmap: boolean, multiSamples: number, useSRGBLoader: boolean, gammaCorrection: number) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.dimension = dimension;
        this.multiSamplers = multiSamples;

        const _isPot = (value: number): boolean => {
            return (value & (value - 1)) === 0;
        }

        this.isPotSize = _isPot(width) && _isPot(height);
        if (dimension === TextureDimension.Tex3D) {
            this.isPotSize = this.isPotSize && _isPot(this.depth);
        }

        this.mipmap = mipmap && this.isPotSize;
        this.mipmapCount = this.mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;
        this.maxMipmapLevel = this.mipmapCount - 1;
        this.baseMipmapLevel = 0;
        this.useSRGBLoad = useSRGBLoader;
        this.gammaCorrection = gammaCorrection;

        this._engine = WebGPURenderEngine._instance;
        this._webgpuSampler = WebGPUSampler.getWebGPUSampler(this._webGPUSamplerParams);

        switch (dimension) {
            case TextureDimension.Tex2D:
                this._statistics_M_TextureX = GPUEngineStatisticsInfo.M_Texture2D;
                this._statistics_RC_TextureX = GPUEngineStatisticsInfo.RC_Texture2D;
                break;
            case TextureDimension.Tex3D:
                this._statistics_M_TextureX = GPUEngineStatisticsInfo.M_Texture3D;
                this._statistics_RC_TextureX = GPUEngineStatisticsInfo.RC_Texture3D;
                break;
            case TextureDimension.Cube:
                this._statistics_M_TextureX = GPUEngineStatisticsInfo.M_TextureCube;
                this._statistics_RC_TextureX = GPUEngineStatisticsInfo.RC_TextureCube;
                break;
            case TextureDimension.Texture2DArray:
                this._statistics_M_TextureX = GPUEngineStatisticsInfo.M_Texture2DArray;
                this._statistics_RC_TextureX = GPUEngineStatisticsInfo.RC_Texture2DArray;
                break;
        }
        this._statistics_M_TextureA = GPUEngineStatisticsInfo.M_ALLTexture;
        this._statistics_RC_TextureA = GPUEngineStatisticsInfo.RC_ALLTexture;

        this.globalId = WebGPUGlobal.getId(this);
        WebGPUStatis.addTexture(this);
    }

    statisAsRenderTexture() {
        this._statistics_M_TextureA = GPUEngineStatisticsInfo.M_ALLRenderTexture;
        this._statistics_RC_TextureA = GPUEngineStatisticsInfo.RC_ALLRenderTexture;
    }

    getTextureView(): GPUTextureView {
        let dimension: GPUTextureViewDimension;
        switch (this.dimension) {
            case TextureDimension.Tex2D:
                dimension = '2d';
                break;
            case TextureDimension.Cube:
                dimension = 'cube';
                break;
            case TextureDimension.Tex3D:
                dimension = '3d';
                break;
            case TextureDimension.Texture2DArray:
                dimension = '2d-array';
                break;
            case TextureDimension.CubeArray:
                dimension = 'cube-array';
                break;
            default:
                dimension = '2d';
                break;
        }

        const descriptor: GPUTextureViewDescriptor = {
            format: this._webGPUFormat,
            dimension,
            baseMipLevel: this.baseMipmapLevel,
            mipLevelCount: this.maxMipmapLevel - this.baseMipmapLevel + 1,
        }
        return this.resource.createView(descriptor);
    }

    private _changeTexMemory(memory: number) {
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this._gpuMemory + memory);
        if (this._statistics_M_TextureA !== GPUEngineStatisticsInfo.M_ALLRenderTexture)
            this._engine._addStatisticsInfo(this._statistics_M_TextureX, -this._gpuMemory + memory);
        this._engine._addStatisticsInfo(this._statistics_M_TextureA, -this._gpuMemory + memory);
        // if (this._statistics_RC_TextureA !== GPUEngineStatisticsInfo.RC_ALLRenderTexture)
        //     this._engine._addStatisticsInfo(this._statistics_RC_TextureX, -this._gpuMemory + memory);
        // this._engine._addStatisticsInfo(this._statistics_RC_TextureA, -this._gpuMemory + memory);
    }

    dispose(): void {
        //TODO好像需要延迟删除
        this.gpuMemory = 0;
        WebGPUGlobal.releaseId(this);
        this.resource.destroy(); //如果有报错，就需要采取延迟删除措施
    }
}