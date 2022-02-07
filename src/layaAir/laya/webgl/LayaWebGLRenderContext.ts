import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { Texture2D } from "../d3/WebGL/Texture2D";
import { WebGL1Texture } from "../d3/WebGL/WebGL1Texture";
import { LayaGL } from "../layagl/LayaGL";
import { FilterMode } from "../resource/FilterMode";
import { RenderTextureFormat } from "../resource/RenderTextureFormat";
import { TextureFormat } from "../resource/TextureFormat";
import { WarpMode } from "../resource/WrapMode";
import { DDSTextureInfo } from "./DDSTextureInfo";
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

        let layaGPU = LayaGL.layaGPUInstance;
        ;
        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;
        switch (format) {
            case TextureFormat.R8G8B8:
                this._glParam.internalFormat = useSRGB ? layaGPU._sRGB.SRGB_EXT : gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R8G8B8A8:
                this._glParam.internalFormat = useSRGB ? layaGPU._sRGB.SRGB_ALPHA_EXT : gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R5G6B5:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_SHORT_5_6_5;
                break;
            case TextureFormat.DXT1:
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT3:
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT5:
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
        }

        return this._glParam;
    }

    supportSRGB(format: TextureFormat): boolean {
        switch (format) {
            case TextureFormat.R8G8B8:
            case TextureFormat.R8G8B8A8:
                return true;
            case TextureFormat.DXT1:
            case TextureFormat.DXT3:
            case TextureFormat.DXT5:
                return SystemUtils.supportDDS_srgb();
            default:
                return false;
        }
    }

    createTextureInternal(width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {

        // todo
        // format 判断  不支持 format ?
        let gammaCorrection = 1.0;

        // 是否使用 sRGB 格式加载
        let useSRGBExt = SystemUtils.supportsRGB() && sRGB && !mipmap && this.supportSRGB(format);
        if (!useSRGBExt && sRGB) {
            // todo gamma correction value
            gammaCorrection = 2.2;
        }

        let internalTexture = new WebGL1Texture(width, height, TextureDimension.Tex2D, mipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glGLParam(format, useSRGBExt);
        let gl_internalFormat = internalTexture.gl_internalFormat = glParam.internalFormat;
        let gl_format = internalTexture.gl_format = glParam.format;
        let gl_type = internalTexture.gl_type = glParam.type;

        let gl = this.gl;
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);
        gl.texImage2D(internalTexture.gl_target, 0, gl_internalFormat, width, height, 0, gl_format, gl_type, null);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);

        // @ts-ignore
        return internalTexture;
    }

    createCompressTextureInternal(source: ArrayBufferView, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {

        // todo
        // format 判断  不支持 format ?

        let gammaCorrection = 1.0;

        // 是否使用 sRGB 格式加载
        let useSRGBExt = SystemUtils.supportsRGB() && sRGB && !mipmap && this.supportSRGB(format);
        if (!useSRGBExt && sRGB) {
            // todo gamma correction value
            gammaCorrection = 2.2;
        }

        let internalTexture = new WebGL1Texture(width, height, TextureDimension.Tex2D, mipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glGLParam(format, useSRGBExt);
        let gl_internalFormat = internalTexture.gl_internalFormat = glParam.internalFormat;
        let gl_format = internalTexture.gl_format = glParam.format;
        let gl_type = internalTexture.gl_type = glParam.type;

        let gl = this.gl;
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        gl.compressedTexImage2D(internalTexture.gl_target, 0, gl_internalFormat, width, height, 0, source);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);

        // internalTexture._setSampler();
        // @ts-ignore

        return internalTexture;
    }

    createDDSTexture(source: ArrayBuffer, ddsInfo: DDSTextureInfo, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {

        let width = ddsInfo.width;
        let height = ddsInfo.height;
        let mipmapCount = ddsInfo.mipmapCount;
        let blockBytes = ddsInfo.blockBytes;
        let textureFormat = ddsInfo.format;
        let bpp = 0;
        let dataOffset = ddsInfo.dataOffset;

        let internalTexture;

        for (let mip = 0; mip < mipmapCount; mip++) {
            let dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
            let byteArray = new Uint8Array(source, dataOffset, dataLength);

            if (mip == 0) {
                internalTexture = this.createCompressTextureInternal(byteArray, width, height, textureFormat, false, warpU, warpV, filter, anisoLevel, premultiplyAlpha, invertY, sRGB);
            } else {

                // @ts-ignore

                internalTexture.updataCompressSubPixelsData(byteArray, 0, 0, width, height, mip, premultiplyAlpha, invertY);
            }

            dataOffset += bpp ? (width * height * (bpp / 8)) : dataLength;
            width *= 0.5;
            height *= 0.5;

            width = Math.max(1.0, width);
            height = Math.max(1.0, height);
        }

        return internalTexture;

    }

    createRenderTargetInternal(width: number, height: number, format: RenderTextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture {
        throw new Error("Method not implemented.");
    }


    updataSubImageData(texture: Texture2D, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number, premultiplyAlpha: boolean, invertY: boolean) {
        let gl = this.gl;

        if (texture.mipmapCount <= mipmapLevel || source.width + xoffset > texture.width || source.height + yoffset > texture.height) {
            // todo 超范围
            console.warn("updataSubImageData failed");
            return;
        }
        // @ts-ignore
        let internalTexture = <WebGL1Texture>texture._texture;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        let gl_internalFormat = internalTexture.gl_internalFormat;
        let gl_format = internalTexture.gl_format;
        let gl_type = internalTexture.gl_type;

        gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, gl_format, gl_type, source);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

    updataSubPixelsData(texture: Texture2D, source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number, premultiplyAlpha: boolean, invertY: boolean): void {
        let gl = this.gl;

        if (texture.mipmapCount <= mipmapLevel || width + xoffset > texture.width || height + yoffset > texture.height) {
            // todo 超范围
            console.warn("updataSubImageData failed");
            return;
        }
        // @ts-ignore
        let internalTexture = <WebGL1Texture>texture._texture;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        WebGLContext.bindTexture(gl, internalTexture.gl_target, internalTexture.resource);

        let gl_internalFormat = internalTexture.gl_internalFormat;
        let gl_format = internalTexture.gl_format;
        let gl_type = internalTexture.gl_type;

        // gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, gl_format, gl_type, source);
        // gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, width, height, gl_format, gl_type, source);
        gl.texSubImage2D(internalTexture.gl_target, mipmapLevel, xoffset, yoffset, width, height, gl_format, gl_type, source);

        WebGLContext.bindTexture(gl, internalTexture.gl_target, null);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }

}