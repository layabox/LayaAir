import { LayaGL } from "../../layagl/LayaGL";
import { FilterMode } from "../../resource/FilterMode";
import { WarpMode } from "../../resource/WrapMode";
import { WebGLContext } from "../../webgl/WebGLContext";
import { InternalTexture, TextureDimension } from "./InternalTexture";

export class WebGL1Texture implements InternalTexture {

    _gl: WebGLRenderingContext;

    readonly resource: WebGLTexture;

    readonly width: number;
    readonly height: number;
    readonly isPotSize: boolean;

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

    // gl param
    gl_target: number;
    gl_internalFormat: number;
    gl_format: number;
    gl_type: number;

    constructor(width: number, height: number, dimension: TextureDimension, mipmap: boolean, useSRGBLoader: boolean, gammaCorrection: number) {
        let gl = LayaGL.instance;
        this._gl = gl;

        this.width = width;
        this.height = height;

        const isPot = (value: number): boolean => {
            return (value & (value - 1)) === 0;
        }

        this.isPotSize = isPot(width) && isPot(height);

        this._mipmap = mipmap;
        this._mipmapCount = this._mipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;

        this._useSRGBLoad = useSRGBLoader;
        this._gammaCorrection = gammaCorrection;

        // todo  Cube ?
        this.gl_target = this.getTarget(dimension);

        this.resource = gl.createTexture();
    }
    filterMode: FilterMode;
    warpU: WarpMode;
    warpV: WarpMode;
    warpW: WarpMode;
    anisoLevel: number;
    setWarpModeU(warp: WarpMode): void {
        let warpParam = this.getWarpParam(warp);
        let gl = this._gl;
        this._setWarpMode(gl.TEXTURE_WRAP_S, warpParam);
    }
    setWarpModeV(warp: WarpMode): void {
        let warpParam = this.getWarpParam(warp);
        let gl = this._gl;
        this._setWarpMode(gl.TEXTURE_WRAP_T, warpParam);
    }
    setWarpModeW(warp: WarpMode): void {
        // webgl1 Unsupport
    }

    setFilterMode(filter: FilterMode): void {
        let gl = this._gl;
        let mipmap = this.mipmap;
        let min = this.getFilteMinrParam(filter, mipmap);
        this._setTexParameteri(gl.TEXTURE_MIN_FILTER, min);
        let mag = this.getFilterMagParam(filter);
        this._setTexParameteri(gl.TEXTURE_MAG_FILTER, mag);
    }
    setAnisoLevel(value: number): void {
        let anisoExt = LayaGL.layaGPUInstance._extTextureFilterAnisotropic;
        if (anisoExt) {
            let gl = this._gl;
            let maxAnisoLevel = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            let level = Math.min(maxAnisoLevel, value);
            this._setTexParametexf(anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, level);
        }
    }

    // todo 这个地方怎么搞
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
        // todo 创建时没有 mipmap 不允许后生成？
        /**
         * webgl2 gl.texStroe 初始化需要确定texture大小
         * 或者统一使用 texImage2D 允许后生成mipmap ？
         */
        if (this.mipmap) {

        }

        // todo 有其他 format 不支持 生成 mipmap ?
        if (this.isPotSize && !this.useSRGBLoad) {
            let gl = this._gl;
            let target = this.gl_target
            // WebGLContext.bindTexture(gl, target, this.resource);
            // gl.generateMipmap(target);
            // WebGLContext.bindTexture(gl, target, null);

            this._mipmap = true;
            // this._mipmapCount = Math.max(Math.ceil(Math.log2(this.width)) + 1, Math.ceil(Math.log2(this.height)) + 1);

            // this._setSampler();
            return true;
        }
        return false;
    }

    protected _setWarpMode(pname: number, param: number) {
        let gl = this._gl;
        if (!this.isPotSize) {
            param = gl.CLAMP_TO_EDGE;
        }
        this._setTexParameteri(pname, param);
    }

    updataSubImageData(source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number, premultiplyAlpha: boolean, invertY: boolean) {
        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        WebGLContext.bindTexture(gl, this.gl_target, this.resource);

        gl.texSubImage2D(this.gl_target, mipmapLevel, xoffset, yoffset, this.gl_format, this.gl_type, source);

        WebGLContext.bindTexture(gl, this.gl_target, null);

        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    updataSubPixelsData(source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number, premultiplyAlpha: boolean, invertY: boolean) {

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        let fourSize = width % 4 == 0 && height % 4 == 0;
        fourSize && gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, this.gl_target, this.resource);

        gl.texSubImage2D(this.gl_target, mipmapLevel, xoffset, yoffset, width, height, this.gl_format, this.gl_type, source);

        WebGLContext.bindTexture(gl, this.gl_target, null);

        fourSize && gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    updataCompressSubPixelsData(source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number, premultiplyAlpha: boolean, invertY: boolean): void {
        // if (this.mipmapCount <= mipmapLevel || width + xoffset > this.width || height + yoffset > this.height) {
        //     // todo 超范围
        //     console.warn("updataSubImageData failed");
        //     return;
        // }

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        let fourSize = width % 4 == 0 && height % 4 == 0;
        fourSize && gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, this.gl_target, this.resource);

        // gl.texSubImage2D(this.gl_target, mipmapLevel, xoffset, yoffset, width, height, this.gl_format, this.gl_type, source);
        gl.compressedTexSubImage2D(this.gl_target, mipmapLevel, xoffset, yoffset, width, height, this.gl_format, source);

        WebGLContext.bindTexture(gl, this.gl_target, null);

        fourSize && gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    dispose(): void {
        let gl = this._gl;
        gl.deleteTexture(this.resource);
    }
}