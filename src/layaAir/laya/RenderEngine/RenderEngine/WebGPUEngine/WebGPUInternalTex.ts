import { FilterMode } from "../../RenderEnum/FilterMode";
import { TextureCompareMode } from "../../RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { WrapMode } from "../../RenderEnum/WrapMode";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { WebGPUEngine } from "./WebGPUEngine";
import { WebGPUObject } from "./WebGPUObject";
import { WebGPUSamplerParams } from "./WebGPUSamplerContext";
import { GPUTextureFormat } from "./WebGPUTextureContext";

export class WebGPUInternalTex extends WebGPUObject implements InternalTexture {
    resource: GPUTexture;
    target: number;//可能没有用了
    width: number;
    height: number;
    mipmap: boolean;
    mipmapCount: number;
    webGPUFormat: GPUTextureFormat;
    view: GPUTextureView;
    descriptor: GPUTextureDescriptor;
    webgpuSampler: GPUSampler;
    webGPUSamplerParams: WebGPUSamplerParams;

    isPotSize: boolean;//TODO`
    baseMipmapLevel: number;//TODO
    maxMipmapLevel: number;//TODO

    gpuMemory: number;//TODO
    useSRGBLoad: boolean;//TODO                                                                                                                                                                                                                                                                                                                    
    gammaCorrection: number;//TODO


    _cacheBindGroup:GPUBindGroup;
    _cacheSampler:GPUSampler;

    //constructor(engine: WebGPUEngine, target: number, width: number, height: number, dimension: TextureDimension, mipmap: boolean, useSRGBLoader: boolean, gammaCorrection: number){
    constructor(engine: WebGPUEngine, width: number, height: number, dimension: TextureDimension, mipmap: boolean) {
        super(engine);
        this.width = width;
        this.height = height;
        this.mipmap = mipmap;
        this.webGPUSamplerParams = {
            comparedMode: TextureCompareMode.None,
            wrapU: WrapMode.Repeat,
            warpV: WrapMode.Repeat,
            warpW: WrapMode.Repeat,
            mipmapFilter: FilterMode.Bilinear,
            filterMode: FilterMode.Bilinear,
            anisoLevel: 1
        }
        this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
    }

    get textureView():GPUTextureView{
        let des:GPUTextureViewDescriptor = {
            mipLevelCount:0,
        }
        if(!this.view){
            this.view = this.resource.createView();
            //let descriptor:GPUTextureViewDescriptor = {format:this.webGPUFormat,dimension:this.descriptor.dimension,baseMipLevel:this.baseMipmapLevel,mipLevelCount:this.mipmapCount}
        }
        return this.view;//TODO  根据设置得到不同的View
        //GPUTextureViewDescriptor{   }
        //aspect?: GPUTextureAspect;
        //baseMipLevel?: GPUIntegerCoordinate;
        //mipLevelCount?: GPUIntegerCoordinate;
        //baseArrayLayer?: GPUIntegerCoordinate;
        //arrayLayerCount?: GPUIntegerCoordinate;
    }

    public releaseTexture(texture: InternalTexture | GPUTexture): void {

    }

    private _filterMode: FilterMode;
    public get filterMode(): FilterMode {
        return this._filterMode;
    }
    public set filterMode(value: FilterMode) {
        if (this._filterMode != value && this.resource) {
            switch (value) {
                case FilterMode.Point:
                    this.webGPUSamplerParams.filterMode = FilterMode.Point;
                    this.webGPUSamplerParams.mipmapFilter = FilterMode.Point;
                    break;
                case FilterMode.Bilinear:
                    this.webGPUSamplerParams.filterMode = FilterMode.Bilinear;
                    this.webGPUSamplerParams.mipmapFilter = FilterMode.Point;
                    break;
                case FilterMode.Trilinear:
                    this.webGPUSamplerParams.filterMode = FilterMode.Bilinear;
                    this.webGPUSamplerParams.mipmapFilter = FilterMode.Bilinear;
                    break;
            }
            this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
            this._filterMode = value;
        }
    }

    private _warpU: WrapMode;
    public get wrapU(): WrapMode {
        return this._warpU;
    }
    public set wrapU(value: WrapMode) {
        if (this._warpU != value && this.resource) {
            this.webGPUSamplerParams.wrapU = value;
            this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
            this._warpU = value;
        }
    }

    private _warpV: WrapMode;

    public get wrapV(): WrapMode {
        return this._warpV;
    }

    public set wrapV(value: WrapMode) {
        if (this._warpV != value && this.resource) {
            this.webGPUSamplerParams.warpV = value;
            this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
            this._warpV = value;
        }
    }

    private _warpW: WrapMode;
    public get wrapW(): WrapMode {
        return this._warpW;
    }
    public set wrapW(value: WrapMode) {
        if (this._warpW != value && this.resource) {
            this.webGPUSamplerParams.warpW = value;
            this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
            this._warpW = value;
        }
    }

    private _anisoLevel: number;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        if (this._anisoLevel != value) {
            this.webGPUSamplerParams.anisoLevel = value;
        }
        this._anisoLevel = value;
      //todo anisolevel
    }

    private _compareMode: TextureCompareMode;
    public get compareMode(): TextureCompareMode {
        return this._compareMode;
    }
    public set compareMode(value: TextureCompareMode) {
        if (this._compareMode != value) {
            this.webGPUSamplerParams.comparedMode = value;
            this.webgpuSampler = this._engine._samplerContext.getcacheSampler(this.webGPUSamplerParams);
            this._compareMode = value;
        }
    }




    dispose(): void {
        // this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, -this._gpuMemory);
        // this._engine._addStatisticsInfo(RenderStatisticsInfo.TextureMemeory, -this._gpuMemory);
        // this._gpuMemory = 0;
        let defferdArray = this._engine._deferredDestroyTextures;
        if (defferdArray.indexOf(this) == -1)
            defferdArray.push(this);
    }

    disposDerredDispose(): void {
        if (!this.destroyed)
            this.resource.destroy();
    }

}