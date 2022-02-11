import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { RenderTargetFormat } from "../resource/RenderTarget";
import { WebGLInternalRT } from "../d3/WebGL/WebGLInternalRT";
import { WebGLInternalTex } from "../d3/WebGL/WebGLInternalTex";
import { LayaGL } from "../layagl/LayaGL";
import { TextureFormat } from "../resource/TextureFormat";
import { DDSTextureInfo } from "../resource/DDSTextureInfo";
import { HDRTextureInfo } from "../resource/HDRTextureInfo";
import { LayaContext } from "./LayaContext";
import { SystemUtils } from "./SystemUtils";
import { WebGLContext } from "./WebGLContext";
import { KTXTextureInfo } from "../resource/KTXTextureInfo";
import { CompareMode } from "../resource/CompareMode";
import { InternalRenderTarget } from "../d3/WebGL/InternalRenderTarget";

export class LayaWebGLContext implements LayaContext {

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

    glTextureParam(format: TextureFormat, useSRGB: boolean) {
        let gl = this.gl;

        let layaGPU = LayaGL.layaGPUInstance;

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
            case TextureFormat.R32G32B32A32:
                this._glParam.internalFormat = gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.FLOAT;
                break;
            case TextureFormat.R32G32B32:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.FLOAT;
                break;
            case TextureFormat.R16G16B16A16:
                this._glParam.internalFormat = gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = layaGPU._oesTextureHalfFloat.HALF_FLOAT_OES;
                break;
            case TextureFormat.R16G16B16:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = layaGPU._oesTextureHalfFloat.HALF_FLOAT_OES;
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
            case TextureFormat.ETC1RGB:
                this._glParam.internalFormat = layaGPU._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGBA:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_RGBA8_ETC2_EAC;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGB:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_RGB8_ETC2;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_SRGB8_ETC2;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB_Alpha8:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC4x4:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_4x4_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_6x6_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC8x8:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_8x8_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC10x10:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_10x10_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC12x12:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_12x12_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC4x4SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC8x8SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC10x10SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC12x12SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            default:
                throw "Unknown Texture Format.";
        }

        return this._glParam;
    }

    // todo srgb ?
    glRenderTextureParam(format: RenderTargetFormat, useSRGB: boolean) {
        let gl = this.gl;

        let layaGPU = LayaGL.layaGPUInstance;

        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;

        switch (format) {
            case RenderTargetFormat.R8G8B8:
                this._glParam.internalFormat = useSRGB ? layaGPU._sRGB.SRGB_EXT : gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case RenderTargetFormat.R8G8B8A8:
                this._glParam.internalFormat = useSRGB ? layaGPU._sRGB.SRGB_EXT : gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case RenderTargetFormat.R16G16B16:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = layaGPU._oesTextureHalfFloat.HALF_FLOAT_OES;
                break;
            case RenderTargetFormat.R16G16B16A16:
                this._glParam.internalFormat = gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = layaGPU._oesTextureHalfFloat.HALF_FLOAT_OES;
                break;
            case RenderTargetFormat.R32G32B32:
                this._glParam.internalFormat = gl.RGB;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.FLOAT;
                break;
            case RenderTargetFormat.R32G32B32A32:
                this._glParam.internalFormat = gl.RGBA;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.FLOAT;
                break;
            case RenderTargetFormat.DEPTH_16:
                this._glParam.internalFormat = gl.DEPTH_COMPONENT;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_SHORT;
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                this._glParam.internalFormat = gl.DEPTH_STENCIL;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = layaGPU._webgl_depth_texture.UNSIGNED_INT_24_8_WEBGL;
                break;
            case RenderTargetFormat.DEPTH_32:
                this._glParam.internalFormat = gl.DEPTH_COMPONENT;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_INT;
                break;
            case RenderTargetFormat.STENCIL_8:
            default:
                throw "render texture format wrong."
        }

        return this._glParam;
    }

    glRenderBufferParam(format: RenderTargetFormat, useSRGB: boolean) {
        // todo
        let gl = this.gl;
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
                return { internalFormat: gl.DEPTH_COMPONENT16, attachment: gl.DEPTH_ATTACHMENT };
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                return { internalFormat: gl.DEPTH_STENCIL, attachment: gl.DEPTH_STENCIL_ATTACHMENT };
            case RenderTargetFormat.DEPTH_32:
                return { internalFormat: gl.DEPTH_STENCIL, attachment: gl.DEPTH_ATTACHMENT };
            case RenderTargetFormat.STENCIL_8:
                return { internalFormat: gl.STENCIL_INDEX8, attachment: gl.STENCIL_ATTACHMENT };
            default:
                return null;
        }
    }

    glRenderTargetAttachment(format: RenderTargetFormat) {
        let gl = this.gl;
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
                return gl.DEPTH_ATTACHMENT;
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                return gl.DEPTH_STENCIL_ATTACHMENT;
            case RenderTargetFormat.DEPTH_32:
                return gl.DEPTH_ATTACHMENT;
            case RenderTargetFormat.STENCIL_8:
                return gl.STENCIL_INDEX8;
            case RenderTargetFormat.R8G8B8:
            case RenderTargetFormat.R8G8B8A8:
            case RenderTargetFormat.R16G16B16:
            case RenderTargetFormat.R16G16B16A16:
            case RenderTargetFormat.R32G32B32:
            case RenderTargetFormat.R32G32B32A32:
                return gl.COLOR_ATTACHMENT0;
            default:
                throw "render format."
        }
    }

    protected getTarget(dimension: TextureDimension) {
        let gl = this.gl;
        switch (dimension) {
            case TextureDimension.Tex2D:
                return gl.TEXTURE_2D;
            case TextureDimension.Cube:
                return gl.TEXTURE_CUBE_MAP;
            default:
                throw "texture dimension wrong in WebGL1."
        }
    }

    // protected getRenderTargetDepthFormat(format: RenderTargetDepthFormat): { internalFormat: number, attachment: number } {
    //     let gl = this.gl;
    //     switch (format) {
    //         case RenderTargetDepthFormat.DEPTH_16:
    //             return { internalFormat: gl.DEPTH_COMPONENT16, attachment: gl.DEPTH_ATTACHMENT };
    //         case RenderTargetDepthFormat.DEPTHSTENCIL_24_8:
    //             return { internalFormat: gl.DEPTH_STENCIL, attachment: gl.DEPTH_STENCIL_ATTACHMENT };
    //         case RenderTargetDepthFormat.DEPTH_32:
    //             return { internalFormat: gl.DEPTH_STENCIL, attachment: gl.DEPTH_STENCIL_ATTACHMENT };
    //         case RenderTargetDepthFormat.STENCIL_8:
    //             return { internalFormat: gl.STENCIL_INDEX8, attachment: gl.STENCIL_ATTACHMENT };
    //         case RenderTargetDepthFormat.DEPTHSTENCIL_NONE:
    //             return null;
    //         default:
    //             throw "RenderTargetDepthFormat wrong."
    //     }
    // }

    /**
     * 根据 format 判断是否支持 SRGBload
     * @param format 
     * @returns 
     */
    supportSRGB(format: TextureFormat | RenderTargetFormat, mipmap: boolean): boolean {
        switch (format) {
            case TextureFormat.R8G8B8:
            case TextureFormat.R8G8B8A8:
                return SystemUtils.supportsRGB() && !mipmap;
            case TextureFormat.DXT1:
            case TextureFormat.DXT3:
            case TextureFormat.DXT5:
                // todo  验证 srgb format 和 mipmap webgl1 兼容问题
                return SystemUtils.supportDDS_srgb() && !mipmap;
            default:
                return false;
        }
    }

    supportGenerateMipmap(format: TextureFormat | RenderTargetFormat) {
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
            case RenderTargetFormat.DEPTH_32:
            case RenderTargetFormat.STENCIL_8:
                return false;
            default:
                return true;
        }
    }

    /**
     * 判断 纹理格式 本身是否是 SRGB格式
     * @param format 
     * @returns 
     */
    isSRGBFormat(format: TextureFormat | RenderTargetFormat) {
        switch (format) {
            case TextureFormat.ETC2SRGB:
            case TextureFormat.ETC2SRGB_Alpha8:
            case TextureFormat.ASTC4x4SRGB:
            case TextureFormat.ASTC6x6SRGB:
            case TextureFormat.ASTC8x8SRGB:
            case TextureFormat.ASTC10x10SRGB:
            case TextureFormat.ASTC12x12SRGB:
                return true;
            default:
                return false;
        }
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture {

        // todo  一些format 不支持自动生成mipmap

        // todo  这个判断, 若纹理本身格式不支持？
        let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, gengerateMipmap));

        let gammaCorrection = 1.0;
        if (!useSRGBExt && sRGB) {
            gammaCorrection = 2.2;
        }

        // let dimension = TextureDimension.Tex2D;
        let target = this.getTarget(dimension);
        let internalTex = new WebGLInternalTex(target, width, height, dimension, gengerateMipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glTextureParam(format, useSRGBExt);

        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;

        return internalTex;
    }

    setTextureImageData(texture: WebGLInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {

        if (texture.width != source.width || texture.height != source.height) {
            // todo ?
            console.warn("setTextureImageData: size not match");
        }

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;

        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texImage2D(target, 0, internalFormat, format, type, source);

        // gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, null);
        // gl.texSubImage2D(target, 0, 0, 0, format, type, source);

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setTexturePixelsData(texture: WebGLInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        // todo check pixels size

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        // gl.texImage2D(target, 0, internalFormat, format, type, source);

        gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, source);
        // gl.texSubImage2D(target, 0, 0, 0, format, type, source);

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureSubPixelsData(texture: WebGLInternalTex, source: ArrayBufferView, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        // todo check pixels size

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        // let width = texture.width;
        // let height = texture.height;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        // gl.texImage2D(target, 0, internalFormat, format, type, null);

        // gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, source);
        gl.texSubImage2D(target, 0, xOffset, yOffset, width, height, format, type, source);

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureDDSData(texture: WebGLInternalTex, ddsInfo: DDSTextureInfo) {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        let source = ddsInfo.source;
        let dataOffset = ddsInfo.dataOffset;
        let bpp = ddsInfo.bpp;
        let blockBytes = ddsInfo.blockBytes;
        let mipmapCount = ddsInfo.mipmapCount;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        let mipmapWidth = width;
        let mipmapHeight = height;
        for (let index = 0; index < mipmapCount; index++) {

            // todo  size 计算 方式
            let dataLength = Math.max(4, mipmapWidth) / 4 * Math.max(4, mipmapHeight) / 4 * blockBytes;
            let sourceData = new Uint8Array(source, dataOffset, dataLength);

            gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);

            dataOffset += bpp ? (mipmapWidth * mipmapHeight * (bpp / 8)) : dataLength;

            mipmapWidth *= 0.5;
            mipmapHeight *= 0.5;
            mipmapWidth = Math.max(1.0, mipmapWidth);
            mipmapHeight = Math.max(1.0, mipmapHeight);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureKTXData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo) {

        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = texture.mipmapCount;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;
        for (let index = 0; index < mipmapCount; index++) {
            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;
            // todo  cube 在一起？

            let sourceData = new Uint8Array(source, dataOffset, imageSize);

            compressed && gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);
            !compressed && gl.texImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, format, type, sourceData);

            dataOffset += imageSize;
            dataOffset += 3 - ((imageSize + 3) % 4);

            mipmapWidth = Math.max(1, mipmapWidth * 0.5);
            mipmapHeight = Math.max(1, mipmapHeight * 0.5);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureHDRData(texture: WebGLInternalTex, hdrInfo: HDRTextureInfo): void {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = texture.mipmapCount;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        // let hdrPixelData = hdrInfo.get_32_bit_rle_rgbe();
        let hdrPixelData = hdrInfo.readScanLine();

        let fourSize = width % 4 == 0 && height % 4 == 0;
        let gl = texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texImage2D(target, 0, internalFormat, width, height, 0, format, type, hdrPixelData);

        if (mipmapCount > 1) {
            gl.generateMipmap(target);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setCubeImageData(texture: WebGLInternalTex, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) {

        let gl = texture._gl;

        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
        ]

        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        for (let index = 0; index < cubeFace.length; index++) {
            let target = cubeFace[index];
            gl.texImage2D(target, 0, internalFormat, format, type, sources[index]);
        }

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setCubePixelsData(texture: WebGLInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
        let gl = texture._gl;

        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
        ]

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;

        let fourSize = width % 4 == 0;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        for (let index = 0; index < cubeFace.length; index++) {
            let t = cubeFace[index];
            // gl.texImage2D(t, 0, internalFormat, format, type, sources[index]);
            gl.texImage2D(t, 0, internalFormat, width, height, 0, format, type, source[index]);
        }

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setCubeDDSData(texture: WebGLInternalTex, ddsInfo: DDSTextureInfo) {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        // let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;

        let source = ddsInfo.source;
        let dataOffset = ddsInfo.dataOffset;
        let bpp = ddsInfo.bpp;
        let blockBytes = ddsInfo.blockBytes;
        let mipmapCount = ddsInfo.mipmapCount;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;

        // dds 标准顺序
        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
        ]

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        for (let face = 0; face < 6; face++) {

            let mipmapWidth = width;
            let mipmapHeight = height;

            let target = cubeFace[face];

            for (let index = 0; index < mipmapCount; index++) {

                let dataLength = Math.max(4, mipmapWidth) / 4 * Math.max(4, mipmapHeight) / 4 * blockBytes;

                let sourceData = new Uint8Array(source, dataOffset, dataLength);

                (texture.mipmap || index == 0) && gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);

                dataOffset += bpp ? (mipmapWidth * mipmapHeight * (bpp / 8)) : dataLength;

                mipmapWidth *= 0.5;
                mipmapHeight *= 0.5;
                mipmapWidth = Math.max(1.0, mipmapWidth);
                mipmapHeight = Math.max(1.0, mipmapHeight);
            }
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setCubeKTXData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo) {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        // let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = texture.mipmapCount;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = texture._gl;

        // ktx 标准顺序
        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
        ]

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;

        for (let index = 0; index < mipmapCount; index++) {
            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;
            // todo  cube 在一起？

            for (let face = 0; face < 6; face++) {
                let target = cubeFace[face];
                let sourceData = new Uint8Array(source, dataOffset, imageSize);

                compressed && gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);

                !compressed && gl.texImage2D(target, index, internalFormat, width, height, 0, format, type, sourceData);

                dataOffset += imageSize;
                dataOffset += 3 - ((imageSize + 3) % 4);
            }


            mipmapWidth = Math.max(1, mipmapWidth * 0.5);
            mipmapHeight = Math.max(1, mipmapHeight * 0.5);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureCompareMode(texture: WebGLInternalTex, compareMode: CompareMode): CompareMode {
        return CompareMode.None;
    }

    bindRenderTarget(renderTarget: WebGLInternalRT): void {

        // todo msaa

        let gl = renderTarget._gl;
        let framebuffer = renderTarget._framebuffer;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    }

    unbindRenderTarget(renderTarget: WebGLInternalRT): void {
        let gl = renderTarget._gl;

        if (renderTarget._generateMipmap) {
            renderTarget._textures.forEach(tex => {
                let target = (<WebGLInternalTex>tex).target;
                WebGLContext.bindTexture(gl, target, tex.resource);
                gl.generateMipmap(target);
                WebGLContext.bindTexture(gl, target, null);
            });
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    createRenderColorTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture {
        let useSRGBExt = false;

        gengerateMipmap = gengerateMipmap && this.supportGenerateMipmap(format);

        let gammaCorrection = 1.0;
        if (!useSRGBExt && sRGB) {
            gammaCorrection = 2.2;
        }

        // let dimension = TextureDimension.Tex2D;
        let target = this.getTarget(dimension);
        let internalTex = new WebGLInternalTex(target, width, height, dimension, gengerateMipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glRenderTextureParam(format, useSRGBExt);

        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;


        let internalFormat = internalTex.internalFormat;
        let glFormat = internalTex.format;
        let type = internalTex.type;

        let gl = internalTex._gl;

        WebGLContext.bindTexture(gl, internalTex.target, internalTex.resource);

        gl.texImage2D(target, 0, internalFormat, width, height, 0, glFormat, type, null);

        WebGLContext.bindTexture(gl, internalTex.target, null);

        return internalTex;
    }

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean) {

        let texture = this.createRenderColorTextureInternal(dimension, width, height, format, gengerateMipmap, sRGB);

        return texture;
    }

    createRenderTargetInternal(dimension: TextureDimension, width: number, height: number, renderFormat: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean, depthStencilFormat: RenderTargetFormat, multiSamples: number): WebGLInternalRT {
        multiSamples = 1;

        let texture = this.createRenderTextureInternal(dimension, width, height, renderFormat, gengerateMipmap, sRGB);

        let renderTarget = new WebGLInternalRT(false, false, texture.mipmap, multiSamples);
        renderTarget.colorFormat = renderFormat;
        renderTarget.depthStencilFormat = depthStencilFormat;
        renderTarget._textures.push(texture);

        let framebuffer = renderTarget._framebuffer;

        let gl = <WebGLRenderingContext>renderTarget._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        // color
        let colorAttachment = this.glRenderTargetAttachment(renderFormat);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, colorAttachment, gl.TEXTURE_2D, texture.resource, 0);
        // depth
        let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
        if (depthBufferParam) {
            let depthbuffer = this.createRenderbuffer(width, height, depthBufferParam.internalFormat);
            renderTarget._depthbuffer = depthbuffer;
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.RENDERBUFFER, depthbuffer);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return renderTarget;
    }

    createMultiRenderTargetInternal(dimension: TextureDimension, width: number, height: number, colorCount: number, renderFormats: RenderTargetFormat[], depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number) {

        let renderTarget = new WebGLInternalRT(false, false, generateMipmap, multiSamples);

        for (let index = 0; index < colorCount; index++) {
            let renderFormat = renderFormats[index];
            let texture = this.createRenderTextureInternal(dimension, width, height, renderFormat, generateMipmap, sRGB);

            renderTarget._textures.push(texture);
        }

        let framebuffer = renderTarget._framebuffer;

        let gl = <WebGLRenderingContext>renderTarget._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        for (let index = 0; index < colorCount; index++) {

            let texture = renderTarget._textures[index];
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture.resource, 0);
        }

        let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
        if (depthBufferParam) {
            let depthTexture = this.createRenderTextureInternal(dimension, width, height, depthStencilFormat, generateMipmap, false);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.TEXTURE_2D, depthTexture.resource, 0);

            renderTarget._depthTexture = depthTexture;
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return renderTarget;
    }

    createRenderbuffer(width: number, height: number, internalFormat: number) {

        // todo  多个 gl
        let gl = this.gl;

        let renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

        gl.renderbufferStorage(gl.RENDERBUFFER, internalFormat, width, height);

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return renderbuffer;
    }

    readRenderTargetPixelData(renderTarget: WebGLInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {

        let gl = renderTarget._gl;

        this.bindRenderTarget(renderTarget);

        let frameState = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;

        if (!frameState) {
            this.unbindRenderTarget(renderTarget);
            return null;
        }
        switch (renderTarget.colorFormat) {
            case RenderTargetFormat.R8G8B8:
                gl.readPixels(xOffset, yOffset, width, height, gl.RGB, gl.UNSIGNED_BYTE, out);
                break;
            case RenderTargetFormat.R8G8B8A8:
                gl.readPixels(xOffset, yOffset, width, height, gl.RGBA, gl.UNSIGNED_BYTE, out);
                break;
            case RenderTargetFormat.R16G16B16A16:
                gl.readPixels(xOffset, yOffset, width, height, gl.RGBA, gl.FLOAT, out);
                break;
        }
        this.unbindRenderTarget(renderTarget);

        return out;
    }

}