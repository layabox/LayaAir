import { FilterMode } from "../../RenderEnum/FilterMode";
import { RenderCapable } from "../../RenderEnum/RenderCapable";
import { RenderParams } from "../../RenderEnum/RenderParams";
import { RenderStatisticsInfo } from "../../RenderEnum/RenderStatInfo";
import { TextureCompareMode } from "../../RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { WrapMode } from "../../RenderEnum/WrapMode";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { WebGLExtension } from "./GLEnum/WebGLExtension";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine";


export class WebGLInternalTex extends GLObject implements InternalTexture {

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    readonly resource: WebGLTexture;
    _resourceTarget: number;

    readonly width: number;
    readonly height: number;
    readonly isPotSize: boolean;

    private _mipmap: boolean;
    /**
     * 是否存在 mipmap 数据
     */
    get mipmap(): boolean {
        return this._mipmap;
    }

    private _mipmapCount: number;
    public get mipmapCount(): number {
        return this._mipmapCount;
    }

    readonly useSRGBLoad: boolean;
    readonly gammaCorrection: number;

    // webgl param
    readonly target: number;
    internalFormat: number;
    format: number;
    type: number;
    /**bytelength */
    _gpuMemory: number = 0;

    get gpuMemory(): number {
        return this._gpuMemory;
    }
    set gpuMemory(value: number) {
        this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, -this._gpuMemory);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.TextureMemeory, -this._gpuMemory);
        this._gpuMemory = value;
        this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, this._gpuMemory);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.TextureMemeory, this._gpuMemory);
    }

    constructor(engine: WebGLEngine, target: number, width: number, height: number, dimension: TextureDimension, mipmap: boolean, useSRGBLoader: boolean, gammaCorrection: number) {
        super(engine);

        this.resource = this._gl.createTexture();

        this.width = width;
        this.height = height;

        const isPot = (value: number): boolean => {
            return (value & (value - 1)) === 0;
        }

        this.isPotSize = isPot(width) && isPot(height);

        this._mipmap = mipmap && this.isPotSize;
        this._mipmapCount = this._mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;

        this.useSRGBLoad = useSRGBLoader;
        this.gammaCorrection = gammaCorrection;

        this.target = target;

        // default value
        // this._filterMode = FilterMode.Bilinear;
        // this._warpU = WrapMode.Repeat;
        // this._warpV = WrapMode.Repeat;
        // this._warpW = WrapMode.Repeat;
        // this._anisoLevel = 4;

        this.filterMode = FilterMode.Bilinear;
        this.wrapU = WrapMode.Repeat;
        this.wrapV = WrapMode.Repeat;
        this.wrapW = WrapMode.Repeat;
        this.anisoLevel = 4;

        this.compareMode = TextureCompareMode.None;
    }

    private _filterMode: FilterMode;
    public get filterMode(): FilterMode {
        return this._filterMode;
    }
    public set filterMode(value: FilterMode) {
        if (this._filterMode != value && this.resource) {
            let gl = this._gl;
            let mipmap = this.mipmap;
            let min = this.getFilteMinrParam(value, mipmap);
            this._setTexParameteri(gl.TEXTURE_MIN_FILTER, min);
            let mag = this.getFilterMagParam(value);
            this._setTexParameteri(gl.TEXTURE_MAG_FILTER, mag);

            this._filterMode = value;
        }
    }

    private _warpU: WrapMode;
    public get wrapU(): WrapMode {
        return this._warpU;
    }
    public set wrapU(value: WrapMode) {
        if (this._warpU != value && this.resource) {
            let gl = this._gl;
            let warpParam = this.getWrapParam(value);
            this._setWrapMode(gl.TEXTURE_WRAP_S, warpParam);
            this._warpU = value;
        }
    }

    private _warpV: WrapMode;

    public get wrapV(): WrapMode {
        return this._warpV;
    }

    public set wrapV(value: WrapMode) {
        if (this._warpV != value && this.resource) {
            let gl = this._gl;
            let warpParam = this.getWrapParam(value);
            this._setWrapMode(gl.TEXTURE_WRAP_T, warpParam);
            this._warpV = value;
        }
    }

    private _warpW: WrapMode;
    public get wrapW(): WrapMode {
        return this._warpW;
    }
    public set wrapW(value: WrapMode) {
        if (this._warpW != value && this.resource) {
            if (this._engine.getCapable(RenderCapable.Texture3D)) {
                let gl = <WebGL2RenderingContext>this._gl;
                let warpParam = this.getWrapParam(value);
                this._setWrapMode(gl.TEXTURE_WRAP_R, warpParam);
            }
            this._warpW = value;
        }
    }

    private _anisoLevel: number;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        let anisoExt = this._engine._supportCapatable.getExtension(WebGLExtension.EXT_texture_filter_anisotropic);
        if (anisoExt) {
            let gl = this._gl;
            //let maxAnisoLevel = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            let maxAnisoLevel = this._engine.getParams(RenderParams.Max_AnisoLevel_Count);
            
            let level = Math.max(1, Math.min(maxAnisoLevel, value));
            this._setTexParametexf(anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
            this._anisoLevel = level;
        }
        else {
            this._anisoLevel = 1;
        }
    }

    private _baseMipmapLevel: number = 0;
    public set baseMipmapLevel(value: number) {
        if (this._engine.isWebGL2) {
            this._setTexParameteri((<WebGL2RenderingContext>this._gl).TEXTURE_BASE_LEVEL, value);
        }
    }

    public get baseMipmapLevel() {
        return this._baseMipmapLevel;
    }

    private _maxMipmapLevel: number = 0;
    public set maxMipmapLevel(value: number) {
        if (this._engine.isWebGL2) {
            this._setTexParameteri((<WebGL2RenderingContext>this._gl).TEXTURE_MAX_LEVEL, value);
        }
    }

    public get maxMipmapLevel() {
        return this._maxMipmapLevel;
    }


    private _compareMode: TextureCompareMode;
    public get compareMode(): TextureCompareMode {
        return this._compareMode;
    }
    public set compareMode(value: TextureCompareMode) {
        this._compareMode = value;
    }

    // todo 设置参数函数 放在 context 里面? 
    public _setTexParameteri(pname: number, param: number) {
        let gl = this._gl;
        let target = this.target
        this._engine._bindTexture(target, this.resource);
        gl.texParameteri(target, pname, param);
        this._engine._bindTexture(target, null);
    }

    public _setTexParametexf(pname: number, param: number) {
        let gl = this._gl;
        let target = this.target
        this._engine._bindTexture(target, this.resource);
        gl.texParameterf(target, pname, param);
        this._engine._bindTexture(target, null);
    }

    protected getFilteMinrParam(filterMode: FilterMode, mipmap: boolean) {
        let gl = this._gl;
        switch (filterMode) {
            case FilterMode.Point:
                return mipmap ? gl.NEAREST_MIPMAP_NEAREST : gl.NEAREST;
            case FilterMode.Bilinear:
                return mipmap ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
            case FilterMode.Trilinear:
                return mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
            default:
                return mipmap ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR;
        }
    }

    protected getFilterMagParam(filterMode: FilterMode) {
        let gl = this._gl;
        switch (filterMode) {
            case FilterMode.Point:
                return gl.NEAREST;
            case FilterMode.Bilinear:
                return gl.LINEAR;
            case FilterMode.Trilinear:
                return gl.LINEAR;
            default:
                return gl.LINEAR;
        }
    }

    protected getWrapParam(wrapMode: WrapMode) {
        let gl = this._gl;
        switch (wrapMode) {
            case WrapMode.Repeat:
                return gl.REPEAT;
            case WrapMode.Clamp:
                return gl.CLAMP_TO_EDGE;
            case WrapMode.Mirrored:
                return gl.MIRRORED_REPEAT;
            default:
                return gl.REPEAT;
        }
    }

    protected _setWrapMode(pname: number, param: number) {
        let gl = this._gl;
        if (!this.isPotSize) {
            param = gl.CLAMP_TO_EDGE;
        }
        this._setTexParameteri(pname, param);
    }

    dispose(): void {
        let gl = this._gl;
        gl.deleteTexture(this.resource);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, -this._gpuMemory);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.TextureMemeory, -this._gpuMemory);
        this._gpuMemory = 0;
    }
}