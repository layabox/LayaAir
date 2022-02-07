import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { WebGLInternalTex } from "../d3/WebGL/WebGLInternalTex";
import { LayaGL } from "../layagl/LayaGL";
import { TextureFormat } from "../resource/TextureFormat";
import { DDSTextureInfo } from "./DDSTextureInfo";
import { HDRTextureInfo } from "./HDRTextureInfo";
import { KTXTextureInfo } from "./KTXTextureInfo";
import { LayaContext } from "./LayaContext";
import { SystemUtils } from "./SystemUtils";
import { WebGLContext } from "./WebGLContext";

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

    glGLParam(format: TextureFormat, useSRGB: boolean) {
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



    /**
     * 根据 format 判断是否支持 SRGBload
     * @param format 
     * @returns 
     */
    supportSRGB(format: TextureFormat, mipmap: boolean): boolean {
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

    /**
     * 判断 纹理格式 本身是否是 SRGB格式
     * @param format 
     * @returns 
     */
    isSRGBFormat(format: TextureFormat) {
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

        let glParam = this.glGLParam(format, useSRGBExt);

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

}