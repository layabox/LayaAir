import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { Texture2D } from "../d3/WebGL/Texture2D";
import { WebGL1Texture } from "../d3/WebGL/WebGL1Texture";
import { LayaGL } from "../layagl/LayaGL";
import { FilterMode } from "../resource/FilterMode";
import { TextureFormat } from "../resource/TextureFormat";
import { WarpMode } from "../resource/WrapMode";
import { LayaRenderContext } from "./LayaRenderContext";
import { SystemUtils } from "./SystemUtils";
import { WebGLContext } from "./WebGLContext";

export class LayaWebGLRenderContext implements LayaRenderContext {

    gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }

    _glParam: {
        internalFormat: number,
        format: number,
        type: number,
    } = {
            internalFormat: 0,
            format: 0,
            type: 0,
        };

    glGLParam(format: TextureFormat, useSRGB: boolean) {
        let gl = this.gl;

        let sRGBExt = LayaGL.layaGPUInstance._sRGB;

        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;
        switch (format) {
            case TextureFormat.R8G8B8:
                this._glParam.internalFormat = useSRGB ? sRGBExt.SRGB_EXT : gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R8G8B8A8:
                this._glParam.internalFormat = useSRGB ? sRGBExt.SRGB_ALPHA_EXT : gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R5G6B5:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_SHORT_5_6_5;
                break;
        }

        return this._glParam;
    }

    supportSRGB(format: TextureFormat): boolean {
        switch (format) {
            case TextureFormat.R8G8B8:
            case TextureFormat.R8G8B8A8:
                return true;
            default:
                return false;
        }
    }

    createInternalTexture(width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {
        let gammaCorrection = 1.0;

        // 是否使用 sRGB 格式加载
        let useSRGBExt = SystemUtils.supportsRGB() && sRGB && !mipmap && this.supportSRGB(format);

        if (!useSRGBExt && sRGB) {
            // todo gamma correction value
            gammaCorrection = 2.2;
        }
        let internalTexture = new WebGL1Texture(width, height, TextureDimension.Tex2D, warpU, warpV, null, filter, anisoLevel, mipmap, premultiplyAlpha, invertY, gammaCorrection);
        internalTexture._useSRGBLoad = useSRGBExt;

        let glParam = this.glGLParam(format, useSRGBExt);
        let gl_internalFormat = internalTexture.gl_internalFormat = glParam.internalFormat;
        let gl_format = internalTexture.gl_format = glParam.format;
        let gl_type = internalTexture.gl_type = glParam.type;

        let gl = this.gl;
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);
        gl.texImage2D(internalTexture.gl_target, 0, gl_internalFormat, width, height, 0, gl_format, gl_type, null);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);
        return internalTexture;
    }

    createImgTexture2D(sourceData: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {
        let gammaCorrection = 1.0;

        // 是否使用 sRGB 格式加载
        let useSRGBExt = SystemUtils.supportsRGB() && sRGB && !mipmap && this.supportSRGB(format);

        if (!useSRGBExt && sRGB) {
            // todo gamma correction value
            gammaCorrection = 2.2;
        }

        let internalTexture = new WebGL1Texture(width, height, TextureDimension.Tex2D, warpU, warpV, null, filter, anisoLevel, mipmap, premultiplyAlpha, invertY, gammaCorrection);
        internalTexture._useSRGBLoad = useSRGBExt;


        let glParam = this.glGLParam(format, useSRGBExt);
        let gl_internalFormat = internalTexture.gl_internalFormat = glParam.internalFormat;
        let gl_format = internalTexture.gl_format = glParam.format;
        let gl_type = internalTexture.gl_type = glParam.type;

        let gl = this.gl;



        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(internalTexture.gl_target, 0, gl_internalFormat, gl_format, gl_type, sourceData);

        // gl.texImage2D(internalTexture.gl_target, 0, gl_internalFormat, width, height, 0, gl_format, gl_type, null);
        // gl.texSubImage2D(internalTexture.gl_target, 0, 0, 0, gl_format, gl_type, sourceData);

        internalTexture._setSampler();

        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);

        return internalTexture;
    }

    createArrayBufferTexture2D(sourceData: ArrayBufferView, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {
        let gammaCorrection = 1.0;

        // 是否使用 sRGB 格式加载
        let useSRGBExt = SystemUtils.supportsRGB() && sRGB && !mipmap && this.supportSRGB(format);

        if (!useSRGBExt && sRGB) {
            // todo gamma correction value
            gammaCorrection = 2.2;
        }

        let internalTexture = new WebGL1Texture(width, height, TextureDimension.Tex2D, warpU, warpV, null, filter, anisoLevel, mipmap, premultiplyAlpha, invertY, gammaCorrection);


        internalTexture._useSRGBLoad = useSRGBExt;
        let glParam = this.glGLParam(format, useSRGBExt);
        let gl_internalFormat = internalTexture.gl_internalFormat = glParam.internalFormat;
        let gl_format = internalTexture.gl_format = glParam.format;
        let gl_type = internalTexture.gl_type = glParam.type;

        let gl = this.gl;

        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);
        gl.texImage2D(internalTexture.gl_target, 0, gl_internalFormat, width, height, 0, gl_format, gl_type, sourceData);
        internalTexture._setSampler();
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        gl.texSubImage2D(internalTexture.gl_target, 0, 0, 0, width, height, gl_format, gl_type, sourceData);
        // gl.generateMipmap(internalTexture.gl_target);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);

        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);


        return internalTexture;
    }

    updataSubImageData(texture: Texture2D, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number) {
        let gl = this.gl;

        if (texture.mipmapCount <= mipmapLevel || source.width + xoffset > texture.width || source.height + yoffset > texture.height) {
            // todo 超范围
            console.warn("updataSubImageData failed");
            return;
        }
        // @ts-ignore
        let internalTexture = <WebGL1Texture>texture._texture;

        texture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        let gl_internalFormat = internalTexture.gl_internalFormat;
        let gl_format = internalTexture.gl_format;
        let gl_type = internalTexture.gl_type;

        gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, gl_format, gl_type, source);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    updataSubPixelsData(texture: Texture2D, source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number): void {
        let gl = this.gl;

        if (texture.mipmapCount <= mipmapLevel || width + xoffset > texture.width || height + yoffset > texture.height) {
            // todo 超范围
            console.warn("updataSubImageData failed");
            return;
        }

        // @ts-ignore
        let internalTexture = <WebGL1Texture>texture._texture;

        texture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        let gl_internalFormat = internalTexture.gl_internalFormat;
        let gl_format = internalTexture.gl_format;
        let gl_type = internalTexture.gl_type;

        // gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, gl_format, gl_type, source);
        // gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, width, height, gl_format, gl_type, source);
        gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, width, height, gl_format, gl_type, source);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);
        internalTexture.invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        internalTexture.premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

}