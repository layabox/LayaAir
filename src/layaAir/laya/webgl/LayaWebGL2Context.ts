
import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { RenderTargetFormat } from "../d3/WebGL/RenderTarget";
import { WebGLInternalTex } from "../d3/WebGL/WebGLInternalTex";
import { LayaGL } from "../layagl/LayaGL";
import { TextureFormat } from "../resource/TextureFormat";
import { HDRTextureInfo } from "./HDRTextureInfo";
import { KTXTextureInfo } from "./KTXTextureInfo";
import { LayaWebGLContext } from "./LayaWebGLContext";
import { WebGLContext } from "./WebGLContext";

export class LayaWebGL2Context extends LayaWebGLContext {

    gl: WebGL2RenderingContext;
    constructor(gl: WebGL2RenderingContext) {
        super(gl);
    }


    glTextureParam(format: TextureFormat, useSRGB: boolean) {
        let gl = this.gl;

        let layaGPU = LayaGL.layaGPUInstance;

        this._glParam.internalFormat = null;
        this._glParam.format = null;
        this._glParam.type = null;
        switch (format) {
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
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                // this._glParam.format = gl.RGBA;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT3:
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.DXT5:
                this._glParam.internalFormat = useSRGB ? layaGPU._compressdTextureS3tc_srgb.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT : layaGPU._compressedTextureS3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC1RGB:
                this._glParam.internalFormat = layaGPU._compressedTextureEtc1.COMPRESSED_RGB_ETC1_WEBGL;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGBA:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_RGBA8_ETC2_EAC;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2RGB:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_RGB8_ETC2;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_SRGB8_ETC2;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ETC2SRGB_Alpha8:
                this._glParam.internalFormat = layaGPU._compressedTextureETC.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC4x4:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_4x4_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_6x6_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC8x8:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_8x8_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC10x10:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_10x10_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC12x12:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_RGBA_ASTC_12x12_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break
            case TextureFormat.ASTC4x4SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC6x6SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC8x8SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC10x10SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            case TextureFormat.ASTC12x12SRGB:
                this._glParam.internalFormat = layaGPU._compressedTextureASTC.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR;
                // this._glParam.format = this._glParam.internalFormat;
                // this._glParam.type = gl.UNSIGNED_BYTE;
                break;
            default:
                throw "Unknown Texture Format.";
        }

        return this._glParam;
    }

    glRenderTextureParam(format: RenderTargetFormat, useSRGB: boolean) {
        let gl = this.gl;

        let layaGPU = LayaGL.layaGPUInstance;

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
            case RenderTargetFormat.DEPTH_16:
                this._glParam.internalFormat = gl.DEPTH_COMPONENT16;
                this._glParam.format = this._glParam.internalFormat;
                this._glParam.type = gl.UNSIGNED_SHORT;
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
                throw "depht texture format wrong."
        }

        return this._glParam;
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

        let gl = <WebGL2RenderingContext>texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        gl.texSubImage2D(target, 0, 0, 0, width, height, format, type, source);

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

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
        let gl = <WebGL2RenderingContext>texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        gl.texSubImage2D(target, 0, 0, 0, width, height, format, type, source);

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

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
        let mipmapCount = texture.mipmapCount;
        // todo texture size 与 ddsInfo size
        let width = texture.width;
        let height = texture.height;

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;
        let fourSize = width % 4 == 0 && height % 4 == 0;

        let gl = <WebGL2RenderingContext>texture._gl;
        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        if (!compressed) {
            gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        }

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;
        for (let index = 0; index < mipmapCount; index++) {
            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;
            let sourceData = new Uint8Array(source, dataOffset, imageSize);

            compressed && gl.compressedTexImage2D(target, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);

            !compressed && gl.texSubImage2D(target, index, 0, 0, mipmapWidth, mipmapHeight, format, type, sourceData);

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

    setCubeImageData(texture: WebGLInternalTex, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean): void {
        let gl = <WebGL2RenderingContext>texture._gl;

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

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);

        for (let index = 0; index < cubeFace.length; index++) {
            let t = cubeFace[index];
            // gl.texSubImage2D(t, 0, 0, 0, format, type, sources[index]);
            gl.texSubImage2D(t, 0, 0, 0, format, type, sources[index]);
        }

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }

        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }

    setCubePixelsData(texture: WebGLInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        let gl = <WebGL2RenderingContext>texture._gl;

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

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        gl.texStorage2D(target, mipmapCount, internalFormat, width, height);

        for (let index = 0; index < cubeFace.length; index++) {
            let t = cubeFace[index];
            gl.texSubImage2D(t, 0, 0, 0, width, height, format, type, source[index]);
        }

        if (texture.mipmap) {
            gl.generateMipmap(texture.target);
        }
        WebGLContext.bindTexture(gl, texture.target, null);

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    }

    setCubeKTXData(texture: WebGLInternalTex, ktxInfo: KTXTextureInfo): void {
        //todo?
        let premultiplyAlpha = false;
        let invertY = false;

        let gl = <WebGL2RenderingContext>texture._gl;

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

        let source = ktxInfo.source;
        let compressed = ktxInfo.compress;

        let mipmapWidth = width;
        let mipmapHeight = height;
        let dataOffset = ktxInfo.headerOffset + ktxInfo.bytesOfKeyValueData;

        let fourSize = width % 4 == 0 && height % 4 == 0;

        premultiplyAlpha && gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        invertY && gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        fourSize || gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

        WebGLContext.bindTexture(gl, texture.target, texture.resource);

        if (!compressed) {
            gl.texStorage2D(target, mipmapCount, internalFormat, width, height);
        }

        for (let index = 0; index < mipmapCount; index++) {
            let imageSize = new Int32Array(source, dataOffset, 1)[0];

            dataOffset += 4;
            // todo  cube 在一起？

            for (let face = 0; face < 6; face++) {
                let t = cubeFace[face];
                let sourceData = new Uint8Array(source, dataOffset, imageSize);

                compressed && gl.compressedTexImage2D(t, index, internalFormat, mipmapWidth, mipmapHeight, 0, sourceData);

                !compressed && gl.texSubImage2D(target, index, 0, 0, width, height, format, type, sourceData);

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

    createRenderColorTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean): WebGLInternalTex {
        let useSRGBExt = false;

        gengerateMipmap = this.supportGenerateMipmap(format);

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

        let gl = <WebGL2RenderingContext>internalTex._gl;

        WebGLContext.bindTexture(gl, internalTex.target, internalTex.resource);

        gl.texStorage2D(target, internalTex.mipmapCount, internalFormat, width, height);

        WebGLContext.bindTexture(gl, internalTex.target, null);

        return internalTex;
    }

}