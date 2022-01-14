import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { WarpMode } from "../../resource/WrapMode";
import { WebGLContext } from "../../webgl/WebGLContext";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class WebGL1Texture implements InternalTexture {

    _gl: WebGLRenderingContext;

    readonly resource: WebGLTexture;
    readonly dimension: TextureDimension;

    width: number;

    height: number;
    /**
     * 图片 宽高是否是 2的幂次方
     */
    // todo
    private _isPotSize: boolean;
    get isPotSize(): boolean {
        return this._isPotSize;
    }

    // gl param
    gl_target: number;

    gl_internalFormat: number;
    gl_format: number;
    gl_type: number;

    private _gammaCorrection: number;
    get gammaCorrection(): number {
        return this._gammaCorrection;
    }

    // @internal
    _useSRGBLoad: boolean;
    public get useSRGBLoad(): boolean {
        return this._useSRGBLoad;
    }

    private _mipmap: boolean;
    get mipmap(): boolean {
        return this._mipmap;
    }

    private _mipmapCount: number;
    get mipmapCount(): number {
        return this._mipmapCount;
    }

    private _premultiplyAlpha: boolean;
    public get premultiplyAlpha(): boolean {
        return this._premultiplyAlpha;
    }

    private _invertY: boolean;
    public get invertY(): boolean {
        return this._invertY;
    }

    constructor(width: number, height: number, dimension: TextureDimension, warpU: WarpMode, warpV: WarpMode, warpW: WarpMode, filter: FilterMode, anisoLevel: number, mipmap: boolean, premultiplyAlpha: boolean, invertY: boolean, gammaCorrection: number) {
        let gl = LayaGL.instance;
        this._gl = gl;

        this.width = width;
        this.height = height;
        this.dimension = dimension;

        const isPot = (value: number): boolean => {
            return (value & (value - 1)) === 0;
        }

        this._isPotSize = isPot(width) && isPot(width);

        this._warpModeU = warpU;
        this._warpModeV = warpV;
        this._warpModeW = warpW;
        this._filterMode = filter;
        this._anisoLevel = anisoLevel;
        this._mipmap = mipmap && this.isPotSize;
        this._mipmapCount = this._mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;

        this._premultiplyAlpha = premultiplyAlpha;
        this._invertY = invertY;
        this._gammaCorrection = gammaCorrection

        this.gl_target = this.getTarget(dimension);

        this.resource = gl.createTexture();
    }

    getTarget(dimension: TextureDimension) {
        let gl = this._gl;
        switch (dimension) {
            case TextureDimension.Tex2D:
                return gl.TEXTURE_2D;
            case TextureDimension.Cube:
                return gl.TEXTURE_CUBE_MAP;
            default:
                return gl.TEXTURE_2D;
        }
    }

    /**
     * Laya waroMode ==> gl.warp param
     * @param warpMode 
     * @returns 
     */
    getWarpParam(warpMode: WarpMode) {
        let gl = this._gl;
        switch (warpMode) {
            case WarpMode.Repeat:
                return gl.REPEAT;
            case WarpMode.Clamp:
                return gl.CLAMP_TO_EDGE;
            case WarpMode.Mirrored:
                return gl.MIRRORED_REPEAT;
            default:
                return gl.REPEAT;
        }
    }

    getFilteMinrParam(filterMode: FilterMode, mipmap: boolean) {
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

    getFilterMagParam(filterMode: FilterMode) {
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

    protected _setTexParameteri(pname: number, param: number) {
        let gl = this._gl;
        let target = this.gl_target
        WebGLContext.bindTexture(gl, target, this.resource);
        gl.texParameteri(target, pname, param);
        WebGLContext.bindTexture(gl, target, null);
    }

    protected _setTexParametexf(pname: number, param: number) {
        let gl = this._gl;
        let target = this.gl_target
        WebGLContext.bindTexture(gl, target, this.resource);
        gl.texParameterf(target, pname, param);
        WebGLContext.bindTexture(gl, target, null);
    }

    // todo
    // 初始化成 mipmap false 的 是否变成 true 
    generateMipmap(): boolean {
        // webgl1 srgb 不支持生成mipmap
        // todo 有其他 format 不支持 生成 mipmap ?
        if (this.isPotSize && !this.useSRGBLoad) {
            let gl = this._gl;
            let target = this.gl_target
            // WebGLContext.bindTexture(gl, target, this.resource);
            // gl.generateMipmap(target);
            // WebGLContext.bindTexture(gl, target, null);

            this._mipmap = true;
            this._mipmapCount = Math.max(Math.ceil(Math.log2(this.width)) + 1, Math.ceil(Math.log2(this.height)) + 1);

            this._setSampler();
            return true;
        }
        return false;
    }

    protected _setWarpMode(pname: number, param: number) {
        let gl = this._gl;
        if (!this._isPotSize) {
            param = gl.CLAMP_TO_EDGE;
        }
        this._setTexParameteri(pname, param);
    }

    private _warpModeU: WarpMode;
    public get warpModeU(): WarpMode {
        return this._warpModeU;
    }
    public set warpModeU(value: WarpMode) {
        if (this._warpModeU != value && this.resource) {
            let gl = this._gl;
            let warp = this.getWarpParam(value);
            this._setWarpMode(gl.TEXTURE_WRAP_S, warp);
            this._warpModeU = value;
        }
    }

    private _warpModeV: WarpMode;
    public get warpModeV(): WarpMode {
        return this._warpModeV;
    }
    public set warpModeV(value: WarpMode) {
        if (this._warpModeV != value && this.resource) {
            let gl = this._gl;
            let warp = this.getWarpParam(value);
            this._setWarpMode(gl.TEXTURE_WRAP_T, warp);
            this._warpModeV = value;
        }
    }

    private _warpModeW: WarpMode;
    public get warpModeW(): WarpMode {
        // webgl 1 not support
        return this._warpModeW;
    }
    public set warpModeW(value: WarpMode) {
        // webgl 1 not support
        this._warpModeW = -1;
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

    private _anisoLevel: number;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        if (this._anisoLevel != value && this.resource) {
            let anisoExt = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
            if (anisoExt) {
                let gl = this._gl;
                let maxAnisoLevel = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                let level = Math.min(maxAnisoLevel, value);
                this._setTexParametexf(anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
            }

            this._anisoLevel = value;
        }
    }

    private _compareMode: number;
    public get compareMode(): number {
        // webgl1 not support
        return this._compareMode;
    }
    public set compareMode(value: number) {
        // webgl1 not support
        this._compareMode = -1;
    }

    private _compareFunc: number;
    public get compareFunc(): number {
        // webgl1 not support
        return this._compareFunc;
    }
    public set compareFunc(value: number) {
        // webgl1 not support
        this._compareFunc = -1;
    }

    _setSampler() {
        let gl = this._gl;

        let target = this.gl_target;
        // todo mipmap
        let mipmap = this.mipmap;

        WebGLContext.bindTexture(gl, target, this.resource);

        // warp
        let warpModeU = this._warpModeU;
        let warpU = this.getWarpParam(warpModeU);
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, warpU);

        let warpModeV = this._warpModeV;
        let warpR = this.getWarpParam(warpModeV);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, warpR);

        // filter
        let filterMode = this._filterMode;
        let minFilter = this.getFilteMinrParam(filterMode, mipmap);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);

        let magFilter = this.getFilterMagParam(filterMode);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magFilter);

        if (mipmap) {
            gl.generateMipmap(target);
        }

        // ansio level
        let anisoLevel = this._anisoLevel;
        let anisoExt = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
        if (anisoExt) {
            let gl = this._gl;
            let maxAnisoLevel = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            let level = Math.min(maxAnisoLevel, anisoLevel);
            gl.texParameterf(target, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
        }

        WebGLContext.bindTexture(gl, target, null);
    }


    dispose(): void {
        let gl = this._gl;
        gl.deleteTexture(this.resource);
    }
}