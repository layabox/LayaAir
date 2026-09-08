import { GLTextureContext } from "./GLTextureContext";
import { WebGLEngine } from "./WebGLEngine";
import { WebGLInternalTex } from "./WebGLInternalTex";
import { WebGLInternalRT } from "./WebGLInternalRT";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";

/**
 * 将继承修改为类似 WebGLRenderingContextBase, WebGLRenderingContextOverloads 多继承 ?
 */
export class GL2TextureContext extends GLTextureContext implements ITextureContext {

    declare protected _gl: WebGL2RenderingContext;

    constructor(engine: WebGLEngine) {
        super(engine);
    }

    protected getTarget(dimension: TextureDimension): number {
        let target: number = -1;
        switch (dimension) {
            case TextureDimension.Cube:
                target = this._gl.TEXTURE_CUBE_MAP;
                break;
            case TextureDimension.Tex2D:
                target = this._gl.TEXTURE_2D;
                break;
            case TextureDimension.Texture2DArray:
                target = this._gl.TEXTURE_2D_ARRAY;
                break;
            case TextureDimension.Tex3D:
                target = this._gl.TEXTURE_3D;
                break;
            default:
                throw "Unknow Texture Target";
        }
        return target;
    }

    glTextureParam(format: TextureFormat, useSRGB: boolean) {
        let gl = this._gl;
        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;
        switch (format) {
            case TextureFormat.Alpha8:
                // WebGL2 中 ALPHA 格式已被移除，使用 R8 格式（单通道红色，可用于存储 Alpha 数据）
                this._glParam.internalFormat = gl.R8;
                this._glParam.format = gl.RED;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R8G8B8:
                this._glParam.internalFormat = useSRGB ? gl.SRGB8 : gl.RGB8;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R8G8B8A8:
                this._glParam.internalFormat = useSRGB ? gl.SRGB8_ALPHA8 : gl.RGBA8;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.R5G6B5:
                this._glParam.internalFormat = gl.RGB565;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.UNSIGNED_SHORT_5_6_5;
                break;
            case TextureFormat.R32G32B32A32:
                this._glParam.internalFormat = gl.RGBA32F;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.FLOAT;
                break;
            case TextureFormat.R32G32B32:
                this._glParam.internalFormat = gl.RGB32F;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.FLOAT;
                break;
            case TextureFormat.R16G16B16:
                this._glParam.internalFormat = gl.RGB16F;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.HALF_FLOAT;
                break;
            case TextureFormat.R16G16B16A16:
                this._glParam.internalFormat = gl.RGBA16F;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.HALF_FLOAT;
                break;
            case TextureFormat.DXT1:
                this._glParam.internalFormat = useSRGB ? this._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : this._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                // this._glParam.format = gl.RGBA;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT3:
                this._glParam.internalFormat = useSRGB ? this._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT : this._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT5:
                this._glParam.internalFormat = useSRGB ? this._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : this._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC1RGB:
                this._glParam.internalFormat = this._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGBA:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_RGBA8_ETC2_EAC;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGB:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_RGB8_ETC2;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_SRGB8_ETC2;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB_Alpha8:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGB_Alpha1:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_RGB8_PUNCHTHROUGH_ALPHA1_ETC2;
                break;
            case TextureFormat.ETC2SRGB_Alpha1:
                this._glParam.internalFormat = this._compressedTextureETC.COMPRESSED_SRGB8_PUNCHTHROUGH_ALPHA1_ETC2;
                break;
            case TextureFormat.ASTC4x4:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_RGBA_ASTC_4x4_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_RGBA_ASTC_6x6_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC8x8:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_RGBA_ASTC_8x8_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC10x10:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_RGBA_ASTC_10x10_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC12x12:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_RGBA_ASTC_12x12_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC4x4SRGB:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6SRGB:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC8x8SRGB:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC10x10SRGB:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC12x12SRGB:
                this._glParam.internalFormat = this._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            default:
                throw "Unknown Texture Format.";
        }

        return this._glParam;
    }

    glRenderBufferParam(format: RenderTargetFormat, useSRGB: boolean): { internalFormat: number; attachment: number; } {
        let gl = this._gl;
        switch (format) {
            case RenderTargetFormat.DEPTH_16:
                return { internalFormat: gl.DEPTH_COMPONENT16, attachment: gl.DEPTH_ATTACHMENT };
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                return { internalFormat: gl.DEPTH24_STENCIL8, attachment: gl.DEPTH_STENCIL_ATTACHMENT };
            case RenderTargetFormat.DEPTH_32:
                return { internalFormat: gl.DEPTH_COMPONENT32F, attachment: gl.DEPTH_ATTACHMENT };
            case RenderTargetFormat.STENCIL_8:
                return { internalFormat: gl.STENCIL_INDEX8, attachment: gl.STENCIL_ATTACHMENT };
            case RenderTargetFormat.R8G8B8:
                return { internalFormat: useSRGB ? gl.SRGB8 : gl.RGB8, attachment: gl.COLOR_ATTACHMENT0 };
            case RenderTargetFormat.R8G8B8A8:
                return { internalFormat: useSRGB ? gl.SRGB8_ALPHA8 : gl.RGBA8, attachment: gl.COLOR_ATTACHMENT0 };
            case RenderTargetFormat.R16G16B16:
                return { internalFormat: gl.RGB16F, attachment: gl.COLOR_ATTACHMENT0 };
            case RenderTargetFormat.R16G16B16A16:
                return { internalFormat: gl.RGBA16F, attachment: gl.COLOR_ATTACHMENT0 };
            case RenderTargetFormat.R32G32B32:
                return { internalFormat: gl.RGB32F, attachment: gl.COLOR_ATTACHMENT0 };
            case RenderTargetFormat.R32G32B32A32:
                return { internalFormat: gl.RGBA32F, attachment: gl.COLOR_ATTACHMENT0 };
            default:
                return null;
        }
    }

    glRenderTextureParam(format: RenderTargetFormat, useSRGB: boolean) {
        let gl = this._gl;
        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;

        switch (format) {
            case RenderTargetFormat.R8G8B8:
                this._glParam.internalFormat = useSRGB ? gl.SRGB8 : gl.RGB8;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case RenderTargetFormat.R8G8B8A8:
                this._glParam.internalFormat = useSRGB ? gl.SRGB8_ALPHA8 : gl.RGBA8;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case RenderTargetFormat.R16G16B16:
                this._glParam.internalFormat = gl.RGB16F;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.HALF_FLOAT;
                break;
            case RenderTargetFormat.R16G16B16A16:
                this._glParam.internalFormat = gl.RGBA16F;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.HALF_FLOAT;
                break;
            case RenderTargetFormat.R32G32B32:
                this._glParam.internalFormat = gl.RGB32F;
                this._glParam.format = gl.RGB;
                this._glParam.type = gl.FLOAT;
                break;
            case RenderTargetFormat.R32G32B32A32:
                this._glParam.internalFormat = gl.RGBA32F;
                this._glParam.format = gl.RGBA;
                this._glParam.type = gl.FLOAT;
                break;
            case RenderTargetFormat.DEPTH_16:
                this._glParam.internalFormat = gl.DEPTH_COMPONENT16;
                this._glParam.format = gl.DEPTH_COMPONENT;
                this._glParam.type = gl.UNSIGNED_INT;
                break;
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
                this._glParam.internalFormat = gl.DEPTH24_STENCIL8;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_INT_24_8;
                break;
            case RenderTargetFormat.DEPTH_32:
                this._glParam.internalFormat = gl.DEPTH_COMPONENT32F;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_INT;
                break;
            case RenderTargetFormat.STENCIL_8:
                break;
            default:
                throw "depth texture format wrong."
        }

        return this._glParam;
    }

    getGLtexMemory(tex: WebGLInternalTex, depth: number = 1): number {
        let gl = this._gl;
        let channels = 0;
        let singlebyte = 0;
        let bytelength = 0;
        switch (tex.internalFormat) {
            case gl.R8:
            case gl.ALPHA:
                channels = 1;
                break;
            case gl.SRGB8:
            case gl.RGB8:
            case gl.RGB565:
            case gl.RGB32F:
            case gl.RGB16F:
                channels = 3;
                break;
            case gl.SRGB8_ALPHA8:
            case gl.RGBA8:
            case gl.RGBA32F:
            case gl.RGBA16F:
                channels = 4;
                break;
            default:
                channels = 0;
                break;
        }
        switch (tex.type) {
            case gl.UNSIGNED_BYTE:
                singlebyte = 1;
                break;
            case gl.UNSIGNED_SHORT_5_6_5:
                singlebyte = 2 / 3;
                break;
            case gl.FLOAT:
                singlebyte = 4;
                break;
            case gl.HALF_FLOAT:
                singlebyte = 2;
                break;
            default:
                singlebyte = 0;
                break;
        }
        bytelength = channels * singlebyte * tex.width * tex.height;
        if (tex.mipmap) {
            bytelength *= 1.333;
        }
        if (tex.target == gl.TEXTURE_CUBE_MAP)
            bytelength *= 6;
        else if (tex.target == gl.TEXTURE_2D)
            bytelength *= 1;
        else if (tex.target == gl.TEXTURE_2D_ARRAY)
            bytelength *= depth;
        return bytelength;
    }

    private _ensureTexture3DStorage(texture: WebGLInternalTex, depth: number = texture.depth): void {
        if (texture._texture3DStorageAllocated)
            return;

        let gl = this._gl;
        this._engine._bindTexture(texture.target, texture.resource);
        gl.texStorage3D(texture.target, texture.mipmapCount, texture.internalFormat, texture.width, texture.height, depth);
        texture.gpuMemory = this.getGLtexMemory(texture, depth);
        texture._texture3DStorageAllocated = true;
    }

    // todo webgl2 srgb 判断
    supportSRGB(format: TextureFormat | RenderTargetFormat, mipmap: boolean): boolean {
        switch (format) {
            case TextureFormat.R8G8B8:
                return this._engine.getCapable(RenderCapable.Texture_SRGB) && !mipmap;
            case TextureFormat.R8G8B8A8:
                return this._engine.getCapable(RenderCapable.Texture_SRGB);
            case TextureFormat.DXT1:
            case TextureFormat.DXT3:
            case TextureFormat.DXT5:
                // todo  验证 srgb format 和 mipmap webgl1 兼容问题
                return this._engine.getCapable(RenderCapable.COMPRESS_TEXTURE_S3TC_SRGB) && !mipmap;
            default:
                return false;
        }
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
        let mipmapCount = texture.mipmapCount;

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this._engine._bindTexture(texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        gl.texSubImage2D(target, 0, 0, 0, width, height, format, type, source);
        texture.gpuMemory = this.getGLtexMemory(texture);
        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setTextureSubImageData(texture: WebGLInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean) {
        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;
        let mipmapCount = texture.mipmapCount;

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this._engine._bindTexture(texture.target, texture.resource);

        //gl.texStorage2D(target, mipmapCount, internalFormat, source.width, source.height);
        gl.texSubImage2D(target, 0, x, y, source.width, source.height, format, type, source);
        texture.gpuMemory = this.getGLtexMemory(texture);
        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setTexturePixelsData(texture: WebGLInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;
        let mipmapCount = texture.mipmapCount;

        let fourSize = width % 4 == 0 && height % 4 == 0;
        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);
        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        texture.gpuMemory = this.getGLtexMemory(texture);
        if (source) {
            gl.texSubImage2D(target, 0, 0, 0, width, height, format, type, source);
            if (texture.mipmap) {
                gl.generateMipmap(texture.target);
            }
        }
        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        // todo  一些format 不支持自动生成mipmap

        // todo  这个判断, 若纹理本身格式不支持？
        let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));
        if (premultipliedAlpha) {//预乘法和SRGB同时开启，会有颜色白边问题
            useSRGBExt = false;
        }
        let gammaCorrection = 1.0;
        if (!useSRGBExt && sRGB) {
            gammaCorrection = 2.2;
        }

        // let dimension = TextureDimension.Tex2D;
        let target = this.getTarget(dimension);
        let internalTex = new WebGLInternalTex(this._engine, target, width, height, depth, dimension, generateMipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glTextureParam(format, useSRGBExt);

        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;

        return internalTex;
    }

    setTexture3DImageData(texture: WebGLInternalTex, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean) {
        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;
        let mipmapCount = texture.mipmapCount;

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this._engine._bindTexture(texture.target, texture.resource);

        this._ensureTexture3DStorage(texture, depth);
        for (let index = 0; index < depth; index++) {
            gl.texSubImage3D(target, 0, 0, 0, index, width, height, 1, format, type, sources[index]);
        }
        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setTexture3DPixelsData(texture: WebGLInternalTex, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean) {
        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;
        let mipmapCount = texture.mipmapCount;

        let fourSize = width % 4 == 0 && height % 4 == 0;
        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);
        this._ensureTexture3DStorage(texture, depth);
        if (source) {
            gl.texSubImage3D(target, 0, 0, 0, 0, width, height, depth, format, type, source);
            if (texture.mipmap) {
                gl.generateMipmap(texture.target);
            }
        }
        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTexture3DSubPixelsData(texture: WebGLInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean) {
        generateMipmap = generateMipmap && mipmapLevel == 0;

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);

        this._ensureTexture3DStorage(texture);
        gl.texSubImage3D(target, mipmapLevel, xOffset, yOffset, zOffset, width, height, depth, format, type, source);

        if (texture.mipmap && generateMipmap) {
            gl.generateMipmap(texture.target);
        }
        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureHDRData(texture: WebGLInternalTex, hdrInfo: HDRTextureInfo): void {
        let sourceData = hdrInfo.readScanLine();

        this.setTexturePixelsData(texture, sourceData, false, false);
    }

    setTextureKTXData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo) {

        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = Math.min(ktxInfo.mipmapCount, texture.mipmapCount);
        // todo texture size 
        let width = texture.width;
        let height = texture.height;

        texture.maxMipmapLevel = mipmapCount - 1;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        let gl = this._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        !compressed && gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

        this._engine._bindTexture(texture.target, texture.resource);

        if (!compressed) {
            gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        }

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;
        let memory = 0;
        for (let index = 0; index < mipmapCount; index++) {

            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;

            if (compressed) {
                let sourceData = new Uint8Array(source, dataOffset, imageSize);
                gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);
                memory += sourceData.byteLength;
            }
            else {
                let pixelParams = this.getFormatPixelsParams(ktxInfo.format);
                let typedSize = imageSize / pixelParams.typedSize;
                let sourceData = new pixelParams.dataTypedCons(source, dataOffset, typedSize);
                gl.texSubImage2D(target, index, 0, 0, mipmapWidth, mipmapHeight, format, type, sourceData);
                memory += sourceData.byteLength;
            }

            dataOffset += imageSize;
            dataOffset += 3 - ((imageSize + 3) % 4);

            mipmapWidth = Math.max(1, Math.floor(mipmapWidth * 0.5));
            mipmapHeight = Math.max(1, Math.floor(mipmapHeight * 0.5));

        }
        this._engine._bindTexture(texture.target, null);
        texture.gpuMemory = memory;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setCubeImageData(texture: WebGLInternalTex, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
        let gl = this._gl;

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
        let mipmapCount = texture.mipmapCount;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this._engine._bindTexture(texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        texture.gpuMemory = this.getGLtexMemory(texture);
        for (let index = 0; index < cubeFace.length; index++) {
            let t = cubeFace[index];
            // gl.texSubImage2D(t, 0, 0, 0, format, type, sources[index]);
            gl.texSubImage2D(t, 0, 0, 0, format, type, sources[index]);
        }

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setCubePixelsData(texture: WebGLInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        let gl = this._gl;

        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
        ];

        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let width = texture.width;
        let height = texture.height;
        let mipmapCount = texture.mipmapCount;

        let fourSize = width % 4 == 0;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);
        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        if (source) {
            for (let index = 0; index < cubeFace.length; index++) {
                let t = cubeFace[index];
                gl.texSubImage2D(t, 0, 0, 0, width, height, format, type, source[index]);
            }
            if (texture.mipmap) {
                gl.generateMipmap(texture.target);
            }
        }


        this._engine._bindTexture(texture.target, null);
        texture.gpuMemory = this.getGLtexMemory(texture);
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setCubeKTXData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo): void {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let gl = this._gl;

        // ktx 标准顺序
        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
        ]



        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = Math.min(ktxInfo.mipmapCount, texture.mipmapCount);
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        texture.maxMipmapLevel = mipmapCount - 1;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);

        if (!compressed) {
            gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        }
        let memory = 0;
        for (let index = 0; index < mipmapCount; index++) {

            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;

            for (let face = 0; face < 6; face++) {
                let t = cubeFace[face];

                if (compressed) {
                    let sourceData = new Uint8Array(source, dataOffset, imageSize);
                    gl.compressedTexImage2D(t, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);
                    memory += sourceData.byteLength;
                }
                else {
                    let pixelParams = this.getFormatPixelsParams(ktxInfo.format);
                    let typedSize = imageSize / pixelParams.typedSize;
                    let sourceData = new pixelParams.dataTypedCons(source, dataOffset, typedSize);
                    gl.texSubImage2D(t, index, 0, 0, mipmapWidth, mipmapHeight, format, type, sourceData);
                    memory += sourceData.byteLength;
                }
                dataOffset += imageSize;
                dataOffset += 3 - ((imageSize + 3) % 4);
            }

            mipmapWidth = Math.max(1, mipmapWidth * 0.5);
            mipmapHeight = Math.max(1, mipmapHeight * 0.5);
        }
        texture.gpuMemory = memory;
        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

    }


    //TODO miner
    getCubeKTXRGBMData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo) {
        let rightFaceData = [];
        let leftFaceData = [];
        let upFaceData = [];
        let downFaceData = [];
        let backFaceData = [];
        let frontFaceData = [];
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let gl = this._gl;

        // ktx 标准顺序
        const cubeFace = [
            gl.TEXTURE_CUBE_MAP_POSITIVE_X, // right
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, // left
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y, // up
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, // down
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z, // back
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, // front
        ]



        let target = texture.target;
        let internalFormat = texture.internalFormat;
        let format = texture.format;
        let type = texture.type;
        let mipmapCount = texture.mipmapCount;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        texture.maxMipmapLevel = mipmapCount - 1;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        this._engine._bindTexture(texture.target, texture.resource);

        if (!compressed) {
            gl.texStorage2D(target, ktxInfo.mipmapCount, internalFormat, width, height);
        }
        let memory = 0;
        for (let index = 0; index < ktxInfo.mipmapCount; index++) {

            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;

            for (let face = 0; face < 6; face++) {
                let t = cubeFace[face];
                let pixelParams = this.getFormatPixelsParams(ktxInfo.format);
                let typedSize = imageSize / pixelParams.typedSize;
                let sourceData = new pixelParams.dataTypedCons(source, dataOffset, typedSize);
                gl.texSubImage2D(t, index, 0, 0, mipmapWidth, mipmapHeight, format, type, sourceData);
                memory += sourceData.byteLength;
            }
            dataOffset += imageSize;
            dataOffset += 3 - ((imageSize + 3) % 4);
        }

        mipmapWidth = Math.max(1, mipmapWidth * 0.5);
        mipmapHeight = Math.max(1, mipmapHeight * 0.5);

        texture.gpuMemory = memory;
        this._engine._bindTexture(texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setTextureCompareMode(texture: WebGLInternalTex, compareMode: TextureCompareMode): TextureCompareMode {
        let gl = this._gl;
        switch (compareMode) {
            case TextureCompareMode.LEQUAL:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.GEQUAL:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.GEQUAL);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.LESS:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.LESS);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.GREATER:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.GREATER);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.EQUAL:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.EQUAL);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.NOTEQUAL:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.NOTEQUAL);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.ALWAYS:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.ALWAYS);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.NEVER:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.NEVER);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
                break;
            case TextureCompareMode.None:
            default:
                texture._setTexParameteri(gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
                texture._setTexParameteri(gl.TEXTURE_COMPARE_MODE, gl.NONE);
                break;
        }
        return compareMode;

    }

    createRenderbuffer(width: number, height: number, internalFormat: number, samples: number): WebGLRenderbuffer {
        // todo  多个 gl
        let gl = this._gl;

        let renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

        if (samples > 1) {
            gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, internalFormat, width, height);
        }
        else {
            gl.renderbufferStorage(gl.RENDERBUFFER, internalFormat, width, height);
        }

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return renderbuffer;
    }

    protected createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): WebGLInternalTex {

        generateMipmap = generateMipmap && this.supportGenerateMipmap(format);

        let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));

        let gammaCorrection = 1.0;
        // todo 非 srgb framebuffer 只能渲染 linear, 目前不支持手动矫正
        // if (!useSRGBExt && sRGB) {
        //     gammaCorrection = 2.2;
        // }

        let target = this.getTarget(dimension);
        let internalTex = new WebGLInternalTex(this._engine, target, width, height, 1, dimension, generateMipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glRenderTextureParam(format, useSRGBExt);

        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;

        let internalFormat = internalTex.internalFormat;
        let glFormat = internalTex.format;
        let type = internalTex.type;

        let gl = this._gl;

        this._engine._bindTexture(internalTex.target, internalTex.resource);

        gl.texStorage2D(target, internalTex.mipmapCount, internalFormat, width, height);

        this._engine._bindTexture(internalTex.target, null);

        if (format == RenderTargetFormat.DEPTH_16 || format == RenderTargetFormat.DEPTH_32 || format == RenderTargetFormat.DEPTHSTENCIL_24_8) {
            internalTex.filterMode = FilterMode.Point;
        }

        return internalTex;
    }

    createMultiRenderTargetInternal(width: number, height: number, colorFormats: readonly RenderTargetFormat[], depthStencilFormat: RenderTargetFormat): WebGLInternalRT {
        const gl = this._gl;
        if (!this._engine.getCapable(RenderCapable.MRT))
            throw new Error("WebGL2 MRT is not supported by this engine.");
        const maxSize = this._engine.getParams(RenderParams.MAX_Texture_Size);
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > maxSize || height > maxSize)
            throw new RangeError(`MRT dimensions must be positive integers no greater than ${maxSize}.`);
        const maxCount = this._engine.getParams(RenderParams.Max_Color_Attachment_Count);
        if (!Array.isArray(colorFormats) || colorFormats.length < 1 || colorFormats.length > maxCount)
            throw new RangeError(`MRT requires between 1 and ${maxCount} color attachments.`);
        const formats = colorFormats.slice();
        // Use ordinary RT mappings; the caller is responsible for device format support.
        const colorParams = Array.from(formats, format => {
            const params = this.glRenderTextureParam(format, false);
            if (params.format !== gl.RGB && params.format !== gl.RGBA)
                throw new Error(`Invalid WebGL2 MRT color format: ${format}.`);
            // glRenderTextureParam reuses a mutable result object.
            return { ...params };
        });
        switch (depthStencilFormat) {
            case RenderTargetFormat.None:
            case RenderTargetFormat.DEPTH_16:
            case RenderTargetFormat.DEPTH_32:
            case RenderTargetFormat.DEPTHSTENCIL_24_8:
            case RenderTargetFormat.STENCIL_8:
                break;
            default:
                throw new Error(`Unsupported WebGL2 MRT depth/stencil format: ${depthStencilFormat}.`);
        }
        const depthParams = this.glRenderBufferParam(depthStencilFormat, false);
        if (depthParams) {
            const maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
            if (width > maxRenderbufferSize || height > maxRenderbufferSize)
                throw new RangeError(`MRT depth/stencil dimensions exceed ${maxRenderbufferSize}.`);
        }

        // Resource creation must not disturb a render pass or a separate read framebuffer.
        const previousDraw = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
        const previousRead = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
        const previousRenderbuffer = gl.getParameter(gl.RENDERBUFFER_BINDING);
        const previousTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
        const textureUnit = this._engine._activedTextureID - gl.TEXTURE0;
        const previousCachedTexture = this._engine._activeTextures[textureUnit];
        let renderTarget: WebGLInternalRT;
        try {
            renderTarget = new WebGLInternalRT(this._engine, formats[0], depthStencilFormat, false, false, 1, formats);
            renderTarget.isSRGB = false;
            if (!renderTarget._framebuffer)
                throw new Error("Unable to allocate the MRT framebuffer.");
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, renderTarget._framebuffer);
            const drawBuffers: number[] = [];
            let memory = this.getGLRTTexMemory(width, height, RenderTargetFormat.None, depthStencilFormat, false, 1, false);
            for (let i = 0; i < formats.length; i++) {
                const texture = new WebGLInternalTex(this._engine, gl.TEXTURE_2D, width, height, 1, TextureDimension.Tex2D, false, false, 1);
                // Establish ownership before storage allocation, so a failure can release it.
                renderTarget._textures.push(texture);
                if (!texture.resource)
                    throw new Error(`Unable to allocate MRT color attachment ${i}.`);
                const params = colorParams[i];
                texture.internalFormat = params.internalFormat;
                texture.format = params.format;
                texture.type = params.type;
                this._engine._bindTexture(gl.TEXTURE_2D, texture.resource);
                gl.texStorage2D(gl.TEXTURE_2D, 1, texture.internalFormat, width, height);
                const attachment = gl.COLOR_ATTACHMENT0 + i;
                gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture.resource, 0);
                drawBuffers.push(attachment);
                memory += this.getGLRTTexMemory(width, height, formats[i], RenderTargetFormat.None, false, 1, false);
            }
            if (depthParams) {
                renderTarget._depthbuffer = gl.createRenderbuffer();
                if (!renderTarget._depthbuffer)
                    throw new Error("Unable to allocate MRT depth/stencil storage.");
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderTarget._depthbuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, depthParams.internalFormat, width, height);
                gl.framebufferRenderbuffer(gl.DRAW_FRAMEBUFFER, depthParams.attachment, gl.RENDERBUFFER, renderTarget._depthbuffer);
            }
            gl.drawBuffers(drawBuffers);
            const status = gl.checkFramebufferStatus(gl.DRAW_FRAMEBUFFER);
            if (status !== gl.FRAMEBUFFER_COMPLETE)
                throw new Error(`WebGL2 MRT framebuffer is incomplete (0x${status.toString(16)}).`);
            // Like ordinary 2D RTs, account colors and depth on the target, not again on its textures.
            renderTarget.gpuMemory = memory;
            return renderTarget;
        } catch (error) {
            renderTarget?.dispose();
            throw error;
        } finally {
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, previousDraw);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previousRead);
            gl.bindRenderbuffer(gl.RENDERBUFFER, previousRenderbuffer);
            gl.bindTexture(gl.TEXTURE_2D, previousTexture);
            // The engine cache tracks one texture per unit, which need not be the 2D binding.
            this._engine._activeTextures[textureUnit] = previousCachedTexture;
        }
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number, storage: boolean): WebGLInternalRT {
        let texture = this.createRenderTextureInternal(TextureDimension.Tex2D, width, height, colorFormat, generateMipmap, sRGB);

        let renderTarget = new WebGLInternalRT(this._engine, colorFormat, depthStencilFormat, false, texture.mipmap, multiSamples);
        renderTarget.gpuMemory = this.getGLRTTexMemory(width, height, colorFormat, depthStencilFormat, generateMipmap, multiSamples, false);
        renderTarget._textures.push(texture);

        let gl = <WebGLRenderingContext>renderTarget._gl;

        if (renderTarget._samples > 1) {
            let msaaFramebuffer = renderTarget._msaaFramebuffer;
            let renderbufferParam = this.glRenderBufferParam(colorFormat, sRGB);
            let msaaRenderbuffer = renderTarget._msaaRenderbuffer = this.createRenderbuffer(width, height, renderbufferParam.internalFormat, renderTarget._samples);
            gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, renderbufferParam.attachment, gl.RENDERBUFFER, msaaRenderbuffer);
            // depth
            let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
            if (depthBufferParam) {
                let depthbuffer = this.createRenderbuffer(width, height, depthBufferParam.internalFormat, renderTarget._samples);
                renderTarget._depthbuffer = depthbuffer;
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.RENDERBUFFER, depthbuffer);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);

            let framebuffer = renderTarget._framebuffer;
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            // color
            let colorAttachment = this.glRenderTargetAttachment(colorFormat);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, colorAttachment, gl.TEXTURE_2D, texture.resource, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);
        }
        else {
            let framebuffer = renderTarget._framebuffer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            // color
            let colorAttachment = this.glRenderTargetAttachment(colorFormat);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, colorAttachment, gl.TEXTURE_2D, texture.resource, 0);

            // depth
            let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
            if (depthBufferParam) {
                let depthbuffer = this.createRenderbuffer(width, height, depthBufferParam.internalFormat, renderTarget._samples);
                renderTarget._depthbuffer = depthbuffer;
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.RENDERBUFFER, depthbuffer);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);
        }

        return renderTarget;

    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): WebGLInternalRT {
        let texture = this.createRenderTextureCubeInternal(TextureDimension.Cube, size, colorFormat, generateMipmap, sRGB);

        let renderTarget = new WebGLInternalRT(this._engine, colorFormat, depthStencilFormat, true, texture.mipmap, multiSamples);
        renderTarget.gpuMemory = this.getGLRTTexMemory(size, size, colorFormat, depthStencilFormat, generateMipmap, multiSamples, true);
        renderTarget.colorFormat = colorFormat;
        renderTarget.depthStencilFormat = depthStencilFormat;
        renderTarget._textures.push(texture);
        renderTarget.isSRGB = sRGB;

        let gl = <WebGLRenderingContext>renderTarget._gl;

        if (renderTarget._samples > 1) {
            let msaaFramebuffer = renderTarget._msaaFramebuffer;
            let renderbufferParam = this.glRenderBufferParam(colorFormat, false);
            let msaaRenderbuffer = renderTarget._msaaRenderbuffer = this.createRenderbuffer(size, size, renderbufferParam.internalFormat, renderTarget._samples);
            gl.bindFramebuffer(gl.FRAMEBUFFER, msaaFramebuffer);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, renderbufferParam.attachment, gl.RENDERBUFFER, msaaRenderbuffer);
            // depth
            let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
            if (depthBufferParam) {
                let depthbuffer = this.createRenderbuffer(size, size, depthBufferParam.internalFormat, renderTarget._samples);
                renderTarget._depthbuffer = depthbuffer;
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.RENDERBUFFER, depthbuffer);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);
        }
        else {
            let framebuffer = renderTarget._framebuffer;

            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

            // depth
            let depthBufferParam = this.glRenderBufferParam(depthStencilFormat, false);
            if (depthBufferParam) {
                let depthbuffer = this.createRenderbuffer(size, size, depthBufferParam.internalFormat, renderTarget._samples);
                renderTarget._depthbuffer = depthbuffer;
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, depthBufferParam.attachment, gl.RENDERBUFFER, depthbuffer);
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);
        }


        return renderTarget;
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): WebGLInternalTex {
        generateMipmap = generateMipmap && this.supportGenerateMipmap(format);

        let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));

        let gammaCorrection = 1.0;
        // todo 非 srgb framebuffer 只能渲染 linear, 目前不支持手动矫正
        // if (!useSRGBExt && sRGB) {
        //     gammaCorrection = 2.2;
        // }

        let target = this.getTarget(dimension);
        let internalTex = new WebGLInternalTex(this._engine, target, size, size, 1, dimension, generateMipmap, useSRGBExt, gammaCorrection);

        let glParam = this.glRenderTextureParam(format, useSRGBExt);

        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;


        let internalFormat = internalTex.internalFormat;
        let glFormat = internalTex.format;
        let type = internalTex.type;

        let gl = this._gl;

        this._engine._bindTexture(internalTex.target, internalTex.resource);

        gl.texStorage2D(target, internalTex.mipmapCount, internalFormat, size, size);

        this._engine._bindTexture(internalTex.target, null);

        return internalTex;

    }

    /** 创建用作 RT 的 Texture2DArray 内部纹理(仅描述，存储分配延迟到 _ensureTexture3DStorage) */
    createRenderTextureArrayInternal(width: number, height: number, depth: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): WebGLInternalTex {
        let useSRGBExt = false;
        generateMipmap = generateMipmap && this.supportGenerateMipmap(format);
        let target = this._gl.TEXTURE_2D_ARRAY;
        let internalTex = new WebGLInternalTex(this._engine, target, width, height, depth, TextureDimension.Texture2DArray, generateMipmap, useSRGBExt, 1.0);
        let glParam = this.glRenderTextureParam(format, useSRGBExt);
        internalTex.internalFormat = glParam.internalFormat;
        internalTex.format = glParam.format;
        internalTex.type = glParam.type;
        return internalTex;
    }

    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): WebGLInternalRT {
        if (multiSamples > 1) {
            throw "createRenderTargetArrayInternal: MSAA for Texture2DArray RT is not implemented yet.";
        }
        let texture = this.createRenderTextureArrayInternal(width, height, depth, colorFormat, generateMipmap, sRGB);
        // 一次性分配整张 array 不可变存储
        this._ensureTexture3DStorage(texture, depth);
        this._engine._bindTexture(texture.target, null);

        let renderTarget = this._assembleLayeredRT(texture, width, height, colorFormat, depthStencilFormat, false);
        renderTarget.isSRGB = sRGB;
        // 内存语义:array 颜色按层计在纹理上(getGLRTTexMemory 无法表达层数);RT 只记 depth
        texture.gpuMemory = this.getGLtexMemory(texture, depth);
        renderTarget.gpuMemory = this.getGLRTTexMemory(width, height, RenderTargetFormat.None, depthStencilFormat, false, 1, false);
        return renderTarget;
    }


    bindRenderTarget(renderTarget: WebGLInternalRT, slice: number = 0): void {
        if (!renderTarget || renderTarget.destroyed || !renderTarget._framebuffer)
            throw new Error("Cannot bind a missing or destroyed WebGL render target.");
        if (renderTarget.colorFormats && slice !== 0)
            throw new RangeError("WebGL2 MRT only supports 2D attachments at mip level 0.");
        this.currentActiveRT && this.unbindRenderTarget(this.currentActiveRT);
        let gl = this._gl;

        let head = <WebGLInternalTex>renderTarget._textures[0];
        let needReattach = renderTarget._isCube || head.target === gl.TEXTURE_2D_ARRAY;
        if (needReattach) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget._framebuffer);
            let bufs: number[] = [];
            for (let i = 0; i < renderTarget._textures.length; i++) {
                let tex = <WebGLInternalTex>renderTarget._textures[i];
                let attach = gl.COLOR_ATTACHMENT0 + i;
                if (renderTarget._isCube)
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, gl.TEXTURE_CUBE_MAP_POSITIVE_X + slice, tex.resource, 0);
                else
                    gl.framebufferTextureLayer(gl.FRAMEBUFFER, attach, tex.resource, 0, slice);
                bufs.push(attach);
            }
            if (bufs.length > 1) gl.drawBuffers(bufs);
            if (head.target === gl.TEXTURE_2D_ARRAY) renderTarget._arrayLayerIndex = slice;
        }

        if (renderTarget._samples > 1) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget._msaaFramebuffer);
        }
        else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget._framebuffer);
        }
        this.currentActiveRT = renderTarget;
    }

    /** MRT RGBA8 reads into Uint8Array/Uint8ClampedArray; RGBA16F reads into Float32Array. */
    async readRenderTargetPixelDataAsync(renderTarget: WebGLInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView, attachmentIndex: number = 0): Promise<ArrayBufferView> {
        if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0)
            throw new RangeError("Color attachment index must be a non-negative integer.");
        if (!renderTarget || renderTarget.destroyed)
            throw new Error("Cannot read a missing or destroyed WebGL render target.");
        // Keep the existing single RT, MSAA, Cube and Array behavior out of this MRT-only path.
        if (!renderTarget.colorFormats)
            return super.readRenderTargetPixelDataAsync(renderTarget, xOffset, yOffset, width, height, out, attachmentIndex);
        const gl = this._gl;
        if (renderTarget._gl !== gl || !renderTarget._framebuffer)
            throw new Error("MRT does not belong to this WebGL context or has no framebuffer.");
        if (attachmentIndex >= renderTarget.colorFormats.length)
            throw new RangeError(`MRT color attachment index out of range: ${attachmentIndex}.`);
        const texture = renderTarget._textures[attachmentIndex] as WebGLInternalTex;
        if (!texture || !texture.resource || renderTarget._samples !== 1)
            throw new Error("MRT readback requires a valid single-sampled color attachment.");
        if (!Number.isInteger(xOffset) || !Number.isInteger(yOffset) || !Number.isInteger(width) || !Number.isInteger(height)
            || xOffset < 0 || yOffset < 0 || width <= 0 || height <= 0 || xOffset + width > texture.width || yOffset + height > texture.height)
            throw new RangeError("MRT readback rectangle must be positive-sized and within the attachment.");
        // Readback support is independent of creation. RGB attachments also return RGBA.
        const textureType = texture.type;
        let type: number;
        let byteLength: number;
        if (textureType === gl.UNSIGNED_BYTE) {
            if (!(out instanceof Uint8Array) && !(out instanceof Uint8ClampedArray))
                throw new TypeError("RGBA8 MRT readback requires Uint8Array or Uint8ClampedArray.");
            type = gl.UNSIGNED_BYTE;
            byteLength = width * height * 4;
        } else if (textureType === gl.HALF_FLOAT || textureType === gl.FLOAT) {
            if (!(out instanceof Float32Array))
                throw new TypeError("Floating-point MRT readback requires Float32Array.");
            type = gl.FLOAT;
            byteLength = width * height * 16;
        } else {
            throw new Error(`Unsupported MRT readback texture type: ${textureType}.`);
        }
        if (out.byteLength < byteLength)
            throw new RangeError(`MRT readback output requires at least ${byteLength} bytes.`);

        const previousRead = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
        const previousPackBuffer = gl.getParameter(gl.PIXEL_PACK_BUFFER_BINDING);
        const packParams = [gl.PACK_ALIGNMENT, gl.PACK_ROW_LENGTH, gl.PACK_SKIP_PIXELS, gl.PACK_SKIP_ROWS];
        const packValues = packParams.map(param => gl.getParameter(param));
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderTarget._framebuffer);
        const previousReadBuffer = gl.getParameter(gl.READ_BUFFER);
        try {
            gl.readBuffer(gl.COLOR_ATTACHMENT0 + attachmentIndex);
            if (gl.checkFramebufferStatus(gl.READ_FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
                throw new Error("Cannot read an incomplete MRT framebuffer.");
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            gl.pixelStorei(gl.PACK_ALIGNMENT, 1);
            gl.pixelStorei(gl.PACK_ROW_LENGTH, 0);
            gl.pixelStorei(gl.PACK_SKIP_PIXELS, 0);
            gl.pixelStorei(gl.PACK_SKIP_ROWS, 0);
            // This Promise API, like the legacy WebGL path, currently uses synchronous readPixels.
            gl.readPixels(xOffset, yOffset, width, height, gl.RGBA, type, out);
            return out;
        } finally {
            gl.readBuffer(previousReadBuffer);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, previousRead);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, previousPackBuffer);
            for (let i = 0; i < packParams.length; i++)
                gl.pixelStorei(packParams[i], packValues[i]);
        }
    }

    unbindRenderTarget(renderTarget: WebGLInternalRT): void {
        let gl = this._gl;
        if (renderTarget && renderTarget._samples > 1) {

            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, renderTarget._msaaFramebuffer);
            gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, renderTarget._framebuffer);

            let texture = renderTarget._textures[0];

            // todo 不用clear ?
            // gl.clearBufferfv(gl.COLOR, 0, [0, 0, 0, 0]);
            // gl.clearBufferfi(gl.DEPTH_STENCIL, 0, 1.0, 0);

            // todo  blit mask
            let biltMask = gl.COLOR_BUFFER_BIT;
            if (renderTarget._depthTexture) {
                biltMask |= gl.DEPTH_BUFFER_BIT;
            }

            gl.blitFramebuffer(0, 0, texture.width, texture.height, 0, 0, texture.width, texture.height, biltMask, gl.NEAREST);
        }
        if (renderTarget && renderTarget._generateMipmap) {
            renderTarget._textures.forEach(tex => {
                let target = (<WebGLInternalTex>tex).target;
                this._engine._bindTexture(target, tex.resource);
                gl.generateMipmap(target);
                this._engine._bindTexture(target, null);
            });
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, WebGLEngine._lastFrameBuffer_WebGLOBJ);
        this.currentActiveRT = WebGLEngine._lastFrameBuffer;
    }
}
