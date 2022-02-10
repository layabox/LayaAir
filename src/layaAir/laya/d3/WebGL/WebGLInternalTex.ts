import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { WarpMode } from "../../resource/WrapMode";
import { WebGLContext } from "../../webgl/WebGLContext";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class WebGLInternalTex implements InternalTexture {

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    readonly resource: WebGLTexture;

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

    constructor(target: number, width: number, height: number, dimension: TextureDimension, mipmap: boolean, useSRGBLoader: boolean, gammaCorrection: number) {
        let gl = LayaGL.instance;
        this._gl = gl;

        this.resource = gl.createTexture();

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
        // this._warpU = WarpMode.Repeat;
        // this._warpV = WarpMode.Repeat;
        // this._warpW = WarpMode.Repeat;
        // this._anisoLevel = 4;

        this.filterMode = FilterMode.Bilinear;
        this.warpU = WarpMode.Repeat;
        // todo
        this.warpV = WarpMode.Repeat;
        this.warpW = WarpMode.Repeat;
        this.anisoLevel = 4;
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

    private _warpU: WarpMode;
    public get warpU(): WarpMode {
        return this._warpU;
    }
    public set warpU(value: WarpMode) {
        if (this._warpU != value && this.resource) {
            let gl = this._gl;
            let warpParam = this.getWarpParam(value);
            this._setWarpMode(gl.TEXTURE_WRAP_S, warpParam);
            this._warpU = value;
        }
    }

    private _warpV: WarpMode;
    public get warpV(): WarpMode {
        return this._warpV;
    }
    public set warpV(value: WarpMode) {
        if (this._warpV != value && this.resource) {
            let gl = this._gl;
            let warpParam = this.getWarpParam(value);
            this._setWarpMode(gl.TEXTURE_WRAP_T, warpParam);
            this._warpV = value;
        }
    }

    private _warpW: WarpMode;
    public get warpW(): WarpMode {
        return this._warpW;
    }
    public set warpW(value: WarpMode) {
        // todo
        // webgl1 unsupported 
        this._warpW = value;
    }

    private _anisoLevel: number;
    public get anisoLevel(): number {
        return this._anisoLevel;
    }
    public set anisoLevel(value: number) {
        let anisoExt = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
        if (anisoExt) {
            let gl = this._gl;
            let maxAnisoLevel = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            let level = Math.min(maxAnisoLevel, value);
            this._setTexParametexf(anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
            this._anisoLevel = value;
        }
        else {
            this._anisoLevel = 1;
        }
    }

    // todo 设置参数函数 放在 context 里面? 
    protected _setTexParameteri(pname: number, param: number) {
        let gl = this._gl;
        let target = this.target
        WebGLContext.bindTexture(gl, target, this.resource);
        gl.texParameteri(target, pname, param);
        WebGLContext.bindTexture(gl, target, null);
    }

    protected _setTexParametexf(pname: number, param: number) {
        let gl = this._gl;
        let target = this.target
        WebGLContext.bindTexture(gl, target, this.resource);
        gl.texParameterf(target, pname, param);
        WebGLContext.bindTexture(gl, target, null);
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

    protected getWarpParam(warpMode: WarpMode) {
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

    protected _setWarpMode(pname: number, param: number) {
        let gl = this._gl;
        if (!this.isPotSize) {
            param = gl.CLAMP_TO_EDGE;
        }
        this._setTexParameteri(pname, param);
    }

    dispose(): void {
        let gl = this._gl;
        gl.deleteTexture(this.resource);
    }
}