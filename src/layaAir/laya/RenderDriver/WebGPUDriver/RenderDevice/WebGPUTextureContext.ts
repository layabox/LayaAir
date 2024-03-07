import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { WebGPUInternalRT } from "./WebGPUInternalRT";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderPassHelper } from "./WebGPURenderPassHelper";

enum GPUTextureDimension {
    D1D = "1d",
    D2D = "2d",
    D3D = "3d"
};

export enum GPUTextureFormat {
    // 8-bit formats
    r8unorm = "r8unorm",
    r8snorm = "r8snorm",
    r8uint = "r8uint",
    r8sint = "r8sint",

    // 16-bit formats
    r16uint = "r16uint",
    r16sint = "r16sint",
    r16float = "r16float",
    rg8unorm = "rg8unorm",
    rg8snorm = "rg8snorm",
    rg8uint = "rg8uint",
    rg8sint = "rg8sint",

    // 32-bit formats
    r32uint = "r32uint",
    r32sint = "r32sint",
    r32float = "r32float",
    rg16uint = "rg16uint",
    rg16sint = "rg16sint",
    rg16float = "rg16float",
    rgba8unorm = "rgba8unorm",
    rgba8unorm_srgb = "rgba8unorm-srgb",
    rgba8snorm = "rgba8snorm",
    rgba8uint = "rgba8uint",
    rgba8sint = "rgba8sint",
    bgra8unorm = "bgra8unorm",
    bgra8unorm_srgb = "bgra8unorm-srgb",

    // Packed 32-bit formats
    rgb9e5ufloat = "rgb9e5ufloat",
    rgb10a2unorm = "rgb10a2unorm",
    rg11b10ufloat = "rg11b10ufloat",

    // 64-bit formats
    rg32uint = "rg32uint",
    rg32sint = "rg32sint",
    rg32float = "rg32float",
    rgba16uint = "rgba16uint",
    rgba16sint = "rgba16sint",
    rgba16float = "rgba16float",

    // 128-bit formats
    rgba32uint = "rgba32uint",
    rgba32sint = "rgba32sint",
    rgba32float = "rgba32float",

    // Depth/stencil formats
    stencil8 = "stencil8",
    depth16unorm = "depth16unorm",
    depth24plus = "depth24plus",
    depth24plus_stencil8 = "depth24plus-stencil8",
    depth32float = "depth32float",

    // "depth32float-stencil8" feature
    depth32float_stencil8 = "depth32float-stencil8",

    // BC compressed formats usable if "texture-compression-bc" is both
    // supported by the device/user agent and enabled in requestDevice.
    bc1_rgba_unorm = "bc1-rgba-unorm",
    bc1_rgba_unorm_srgb = "bc1-rgba-unorm-srgb",
    bc2_rgba_unorm = "bc2-rgba-unorm",
    bc2_rgba_unorm_srgb = "bc2-rgba-unorm-srgb",
    bc3_rgba_unorm = "bc3-rgba-unorm",
    bc3_rgba_unorm_srgb = "bc3-rgba-unorm-srgb",
    bc4_r_unorm = "bc4-r-unorm",
    bc4_r_snorm = "bc4-r-snorm",
    bc5_rg_unorm = "bc5-rg-unorm",
    bc5_rg_snorm = "bc5-rg-snorm",
    bc6h_rgb_ufloat = "bc6h-rgb-ufloat",
    bc6h_rgb_float = "bc6h-rgb-float",
    bc7_rgba_unorm = "bc7-rgba-unorm",
    bc7_rgba_unorm_srgb = "bc7-rgba-unorm-srgb",

    // ETC2 compressed formats usable if "texture-compression-etc2" is both
    // supported by the device/user agent and enabled in requestDevice.
    etc2_rgb8unorm = "etc2-rgb8unorm",
    etc2_rgb8unorm_srgb = "etc2-rgb8unorm-srgb",
    etc2_rgb8a1unorm = "etc2-rgb8a1unorm",
    etc2_rgb8a1unorm_srgb = "etc2-rgb8a1unorm-srgb",
    etc2_rgba8unorm = "etc2-rgba8unorm",
    etc2_rgba8unorm_srgb = "etc2-rgba8unorm-srgb",
    //etc2_rgba8unormal
    // "eac-r11unorm",
    // "eac-r11snorm",
    // "eac-rg11unorm",
    // "eac-rg11snorm",

    // ASTC compressed formats usable if "texture-compression-astc" is both
    // supported by the device/user agent and enabled in requestDevice.
    astc_4x4_unorm = "astc-4x4-unorm",
    astc_4x4_unorm_srgb = "astc-4x4-unorm-srgb",
    astc_5x4_unorm = "astc-5x4-unorm",
    astc_5x4_unorm_srgb = "astc-5x4-unorm-srgb",
    astc_5x5_unorm = "astc-5x5-unorm",
    astc_5x5_unorm_srgb = "astc-5x5-unorm-srgb",
    astc_6x5_unorm = "astc-6x5-unorm",
    astc_6x5_unorm_srgb = "astc-6x5-unorm-srgb",
    astc_6x6_unorm = "astc-6x6-unorm",
    astc_6x6_unorm_srgb = "astc-6x6-unorm-srgb",
    astc_8x5_unorm = "astc-8x5-unorm",
    astc_8x5_unorm_srgb = "astc-8x5-unorm-srgb",
    astc_8x6_unorm = "astc-8x6-unorm",
    astc_8x6_unorm_srgb = "astc-8x6-unorm-srgb",
    astc_8x8_unorm = "astc-8x8-unorm",
    astc_8x8_unorm_srgb = "astc-8x8-unorm-srgb",
    astc_10x5_unorm = "astc-10x5-unorm",
    astc_10x5_unorm_srgb = "astc-10x5-unorm-srgb",
    astc_10x6_unorm = "astc-10x6-unorm",
    astc_10x6_unorm_srgb = "astc-10x6-unorm-srgb",
    astc_10x8_unorm = "astc-10x8-unorm",
    astc_10x8_unorm_srgb = "astc-10x8-unorm-srgb",
    astc_10x10_unorm = "astc-10x10-unorm",
    astc_10x10_unorm_srgb = "astc-10x10-unorm-srgb",
    astc_12x10_unorm = "astc-12x10-unorm",
    astc_12x10_unorm_srgb = "astc-12x10-unorm-srgb",
    astc_12x12_unorm = "astc-12x12-unorm",
    astc_12x12_unorm_srgb = "astc-12x12-unorm-srgb"
};

export class WebGPUTextureContext implements ITextureContext {
    private _engine: WebGPURenderEngine;
    constructor(engine: WebGPURenderEngine) {
        this._engine = engine;
    }
    needBitmap: boolean;

    private _getGPUTextureFormat(format: TextureFormat, useSRGB: boolean): GPUTextureFormat {
        let webgpuTextureFormat = GPUTextureFormat.rgba8uint;
        switch (format) {
            case TextureFormat.R5G6B5:
                return null;
            case TextureFormat.R8G8B8://TODO
            case TextureFormat.R8G8B8A8:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.rgba8unorm : GPUTextureFormat.rgba8unorm_srgb;
                break;
            case TextureFormat.R32G32B32://TODO
            case TextureFormat.R32G32B32A32:
                webgpuTextureFormat = GPUTextureFormat.rgba32float;
                break;
            case TextureFormat.R16G16B16://TODO
            case TextureFormat.R16G16B16A16:
                webgpuTextureFormat = GPUTextureFormat.rgba16float;
                break;
            case TextureFormat.DXT1:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.bc1_rgba_unorm : GPUTextureFormat.bc1_rgba_unorm_srgb;
                break;
            case TextureFormat.DXT3:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.bc2_rgba_unorm : GPUTextureFormat.bc2_rgba_unorm_srgb;
                break;
            case TextureFormat.DXT5:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.bc3_rgba_unorm : GPUTextureFormat.bc3_rgba_unorm_srgb;
                break;
            case TextureFormat.ETC2RGBA:
            case TextureFormat.ETC1RGB:
            case TextureFormat.ETC2RGB:
            case TextureFormat.ETC2SRGB:
            case TextureFormat.ETC2SRGB_Alpha8:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.etc2_rgba8unorm : GPUTextureFormat.etc2_rgba8unorm_srgb;
                break;
            case TextureFormat.ASTC4x4:
            case TextureFormat.ASTC4x4SRGB:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.astc_4x4_unorm : GPUTextureFormat.astc_4x4_unorm_srgb;
                break;
            case TextureFormat.ASTC6x6:
            case TextureFormat.ASTC6x6SRGB:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.astc_6x6_unorm : GPUTextureFormat.astc_6x6_unorm_srgb;
                break
            case TextureFormat.ASTC8x8:
            case TextureFormat.ASTC8x8SRGB:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.astc_8x8_unorm : GPUTextureFormat.astc_8x8_unorm_srgb;
                break
            case TextureFormat.ASTC10x10:
            case TextureFormat.ASTC10x10SRGB:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.astc_10x10_unorm : GPUTextureFormat.astc_10x10_unorm_srgb;
                break
            case TextureFormat.ASTC12x12:
            case TextureFormat.ASTC12x12SRGB:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.astc_12x12_unorm : GPUTextureFormat.astc_12x12_unorm_srgb;
                break
            default:
                throw "unknow TextureFormat"
                break;
        }
        return webgpuTextureFormat;
    }

    private _getGPURenderTargetFormat(format: RenderTargetFormat, useSRGB: boolean): GPUTextureFormat {
        let webgpuTextureFormat = GPUTextureFormat.rgba8uint;
        switch (format) {
            case RenderTargetFormat.R8G8B8://TODO
            case RenderTargetFormat.R8G8B8A8:
                webgpuTextureFormat = !useSRGB ? GPUTextureFormat.rgba8unorm : GPUTextureFormat.rgba8unorm_srgb;
                break;
            case RenderTargetFormat.R32G32B32://TODO
            case RenderTargetFormat.R32G32B32A32:
                webgpuTextureFormat = GPUTextureFormat.rgba32float;
                break;
            case RenderTargetFormat.R16G16B16://TODO
            case RenderTargetFormat.R16G16B16A16:
                webgpuTextureFormat = GPUTextureFormat.rgba16float;
                break;
            default:
                throw "unknow TextureFormat";
        }
        return webgpuTextureFormat;
    }

    private isCompressTexture(format: TextureFormat) {
        switch (format) {
            case TextureFormat.DXT1:
            case TextureFormat.DXT3:
            case TextureFormat.DXT5:
            case TextureFormat.ETC2RGBA:
            case TextureFormat.ETC1RGB:
            case TextureFormat.ETC2RGB:
            case TextureFormat.ETC2SRGB:
            case TextureFormat.ETC2SRGB_Alpha8:
            case TextureFormat.ASTC4x4:
            case TextureFormat.ASTC4x4SRGB:
            case TextureFormat.ASTC6x6:
            case TextureFormat.ASTC6x6SRGB:
            case TextureFormat.ASTC8x8:
            case TextureFormat.ASTC8x8SRGB:
            case TextureFormat.ASTC10x10:
            case TextureFormat.ASTC10x10SRGB:
            case TextureFormat.ASTC12x12:
            case TextureFormat.ASTC12x12SRGB:
                return true
            default:
                return false;
        }
    }

    private _getGPUTextureDescriptor(dimension: TextureDimension, width: number, height: number, gpuFormat: GPUTextureFormat, layerCount: number, isCompressTexture: boolean): GPUTextureDescriptor {
        const textureSize = {
            width: width,
            height: height,
            depthOrArrayLayers: layerCount,
        };
        const cancopy = !isCompressTexture;
        let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
        let mipmapCount = 1; //TODO generateMipmap ? Math.max(Math.ceil(Math.log2(width)) + 1, Math.ceil(Math.log2(height)) + 1) : 1;
        if (cancopy) {
            usage |= GPUTextureUsage.COPY_DST;
        }
        let dimensionType: GPUTextureDimension;
        switch (dimension) {
            case TextureDimension.Tex2D:
            case TextureDimension.Cube:
            case TextureDimension.Texture2DArray:
                dimensionType = GPUTextureDimension.D2D;
                break;
            case TextureDimension.Tex3D:
                dimensionType = GPUTextureDimension.D3D;
                break;
            default:
                throw "DimensionType Unknown format";
        }
        const textureDescriptor: GPUTextureDescriptor = {
            size: textureSize,
            mipLevelCount: mipmapCount,
            sampleCount: 1,
            dimension: dimensionType,
            format: gpuFormat,
            usage,
        }
        return textureDescriptor
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        let layerCount;
        switch (dimension) {
            case TextureDimension.Tex2D:
                layerCount = 1;
                break;
            case TextureDimension.Cube:
                layerCount = 6;
                break;
        }
        if (dimension == TextureDimension.Tex3D) {
            throw "error";
        }
        //TODO
        // let useSRGBExt = this.isSRGBFormat(format) || (sRGB && this.supportSRGB(format, generateMipmap));
        // if (premultipliedAlpha) {//预乘法和SRGB同时开启，会有颜色白边问题
        //     useSRGBExt = false;
        // }
        // let gammaCorrection = 1.0;
        // if (!useSRGBExt && sRGB) {
        //     gammaCorrection = 2.2;
        // }

        const gpuTextureformat = this._getGPUTextureFormat(format, sRGB);
        let textureDescriptor = this._getGPUTextureDescriptor(dimension, width, height, gpuTextureformat, layerCount, this.isCompressTexture(format));
        const gpuTexture = this._engine.getDevice().createTexture(textureDescriptor);
        let internalTex = new WebGPUInternalTex(width, height, 1, dimension, generateMipmap, false, 1);
        internalTex.resource = gpuTexture;
        internalTex._webGPUFormat = gpuTextureformat;

        return internalTex;
    }

    setTextureImageData(texture: InternalTexture, source: HTMLCanvasElement | HTMLImageElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean): void {
        const imageBitmapSource = createImageBitmap(source);
        const image: GPUImageCopyExternalImage = { source: source as ImageBitmap, flipY: invertY, origin: [0, 0] };

        const textureCopyView: GPUImageCopyTextureTagged = {
            texture: texture.resource,
            origin: {
                x: 0,
                y: 0,
            },
            mipLevel: 0,
            premultipliedAlpha: premultiplyAlpha,
            colorSpace: texture.useSRGBLoad ? "srgb" : undefined

        };
        let copySize: GPUExtent3DStrict = { width: source.width, height: source.height };

        WebGPURenderEngine._instance.getDevice().queue.copyExternalImageToTexture(image, textureCopyView, copySize);

        //Generate mipmap TODO
    }

    setTextureSubImageData(texture: InternalTexture, source: HTMLCanvasElement | HTMLImageElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void {
        const image: GPUImageCopyExternalImage = { source: source as any, flipY: invertY, origin: { x: 0, y: 0 } };
        const textureCopyView: GPUImageCopyTextureTagged = {
            texture: texture.resource,
            origin: {
                x: x,
                y: y,
            },
            mipLevel: 0,
            premultipliedAlpha: premultiplyAlpha,
            colorSpace: texture.useSRGBLoad ? "srgb" : undefined

        };
        let copySize: GPUExtent3DStrict = { width: source.width, height: source.height };

        WebGPURenderEngine._instance.getDevice().queue.copyExternalImageToTexture(image, textureCopyView, copySize);
    }

    /**@internal */
    private _getBlockInformationFromFormat(format: GPUTextureFormat): { width: number; height: number; length: number } {
        switch (format) {
            // 8 bits formats
            case GPUTextureFormat.r8unorm:
            case GPUTextureFormat.r8snorm:
            case GPUTextureFormat.r8uint:
            case GPUTextureFormat.r8sint:
                return { width: 1, height: 1, length: 1 };
            // 16 bits formats
            case GPUTextureFormat.r16uint:
            case GPUTextureFormat.r16sint:
            case GPUTextureFormat.r16float:
            case GPUTextureFormat.rg8unorm:
            case GPUTextureFormat.rg8snorm:
            case GPUTextureFormat.rg8uint:
            case GPUTextureFormat.rg8sint:
                return { width: 1, height: 1, length: 2 };
            // 32 bits formats
            case GPUTextureFormat.r32uint:
            case GPUTextureFormat.r32sint:
            case GPUTextureFormat.r32float:
            case GPUTextureFormat.rg16uint:
            case GPUTextureFormat.rg16sint:
            case GPUTextureFormat.rg16float:
            case GPUTextureFormat.rgba8unorm:
            case GPUTextureFormat.rgba8unorm_srgb:
            case GPUTextureFormat.rgba8snorm:
            case GPUTextureFormat.rgba8uint:
            case GPUTextureFormat.rgba8sint:
            case GPUTextureFormat.bgra8unorm:
            case GPUTextureFormat.bgra8unorm_srgb:
            case GPUTextureFormat.rgb9e5ufloat:
            case GPUTextureFormat.rgb10a2unorm:
            case GPUTextureFormat.rg11b10ufloat:
                return { width: 1, height: 1, length: 4 };
            // 64 bits formats
            case GPUTextureFormat.rg32uint:
            case GPUTextureFormat.rg32sint:
            case GPUTextureFormat.rg32float:
            case GPUTextureFormat.rgba16uint:
            case GPUTextureFormat.rgba16sint:
            case GPUTextureFormat.rgba16float:
                return { width: 1, height: 1, length: 8 };
            // 128 bits formats
            case GPUTextureFormat.rgba32uint:
            case GPUTextureFormat.rgba32sint:
            case GPUTextureFormat.rgba32float:
                return { width: 1, height: 1, length: 16 };

            // Depth and stencil formats
            case GPUTextureFormat.stencil8:
                throw "No fixed size for Stencil8 format!";
            case GPUTextureFormat.depth16unorm:
                return { width: 1, height: 1, length: 2 };
            case GPUTextureFormat.depth24plus:
                throw "No fixed size for Depth24Plus format!";
            case GPUTextureFormat.depth24plus_stencil8:
                throw "No fixed size for Depth24PlusStencil8 format!";
            case GPUTextureFormat.depth32float:
                return { width: 1, height: 1, length: 4 };
            // case GPUTextureFormat.Depth24UnormStencil8:
            //     return { width: 1, height: 1, length: 4 };
            case GPUTextureFormat.depth32float_stencil8:
                return { width: 1, height: 1, length: 5 };

            // BC compressed formats usable if "texture-compression-bc" is both
            // supported by the device/user agent and enabled in requestDevice.
            case GPUTextureFormat.bc7_rgba_unorm:
            case GPUTextureFormat.bc7_rgba_unorm_srgb:
            case GPUTextureFormat.bc6h_rgb_float:
            case GPUTextureFormat.bc6h_rgb_ufloat:
            case GPUTextureFormat.bc5_rg_unorm:
            case GPUTextureFormat.bc5_rg_snorm:
            case GPUTextureFormat.bc3_rgba_unorm:
            case GPUTextureFormat.bc3_rgba_unorm_srgb:
            case GPUTextureFormat.bc2_rgba_unorm:
            case GPUTextureFormat.bc2_rgba_unorm_srgb:
                return { width: 4, height: 4, length: 16 };
            case GPUTextureFormat.bc4_r_unorm:
            case GPUTextureFormat.bc4_r_snorm:
            case GPUTextureFormat.bc1_rgba_unorm:
            case GPUTextureFormat.bc1_rgba_unorm_srgb:
                return { width: 4, height: 4, length: 8 };

            // ETC2 compressed formats usable if "texture-compression-etc2" is both
            // supported by the device/user agent and enabled in requestDevice.
            case GPUTextureFormat.etc2_rgb8unorm:
            case GPUTextureFormat.etc2_rgb8unorm_srgb:
            case GPUTextureFormat.etc2_rgb8a1unorm:
            case GPUTextureFormat.etc2_rgb8a1unorm_srgb:
                //case GPUTextureFormat.EACR11Unorm:
                //case GPUTextureFormat.EACR11Snorm:
                return { width: 4, height: 4, length: 8 };
            case GPUTextureFormat.etc2_rgb8unorm:
            case GPUTextureFormat.etc2_rgba8unorm_srgb:
                //case GPUTextureFormat.EACRG11Unorm:
                //case GPUTextureFormat.EACRG11Snorm:
                return { width: 4, height: 4, length: 16 };

            // ASTC compressed formats usable if "texture-compression-astc" is both
            // supported by the device/user agent and enabled in requestDevice.
            case GPUTextureFormat.astc_4x4_unorm:
            case GPUTextureFormat.astc_4x4_unorm_srgb:
                return { width: 4, height: 4, length: 16 };
            case GPUTextureFormat.astc_5x4_unorm:
            case GPUTextureFormat.astc_5x4_unorm_srgb:
                return { width: 5, height: 4, length: 16 };
            case GPUTextureFormat.astc_5x5_unorm:
            case GPUTextureFormat.astc_5x5_unorm_srgb:
                return { width: 5, height: 5, length: 16 };
            case GPUTextureFormat.astc_6x5_unorm:
            case GPUTextureFormat.astc_6x5_unorm_srgb:
                return { width: 6, height: 5, length: 16 };
            case GPUTextureFormat.astc_6x6_unorm:
            case GPUTextureFormat.astc_6x6_unorm_srgb:
                return { width: 6, height: 6, length: 16 };
            case GPUTextureFormat.astc_8x5_unorm:
            case GPUTextureFormat.astc_8x5_unorm_srgb:
                return { width: 8, height: 5, length: 16 };
            case GPUTextureFormat.astc_8x6_unorm:
            case GPUTextureFormat.astc_8x6_unorm_srgb:
                return { width: 8, height: 6, length: 16 };
            case GPUTextureFormat.astc_8x8_unorm:
            case GPUTextureFormat.astc_8x8_unorm_srgb:
                return { width: 8, height: 8, length: 16 };
            case GPUTextureFormat.astc_10x5_unorm:
            case GPUTextureFormat.astc_10x5_unorm_srgb:
                return { width: 10, height: 5, length: 16 };
            case GPUTextureFormat.astc_10x6_unorm:
            case GPUTextureFormat.astc_10x6_unorm_srgb:
                return { width: 10, height: 6, length: 16 };
            case GPUTextureFormat.astc_10x8_unorm:
            case GPUTextureFormat.astc_10x8_unorm_srgb:
                return { width: 10, height: 8, length: 16 };
            case GPUTextureFormat.astc_10x10_unorm:
            case GPUTextureFormat.astc_10x10_unorm_srgb:
                return { width: 10, height: 10, length: 16 };
            case GPUTextureFormat.astc_12x10_unorm:
            case GPUTextureFormat.astc_12x10_unorm_srgb:
                return { width: 12, height: 10, length: 16 };
            case GPUTextureFormat.astc_12x12_unorm:
            case GPUTextureFormat.astc_12x12_unorm_srgb:
                return { width: 12, height: 12, length: 16 };
        }

        return { width: 1, height: 1, length: 4 };
    }

    setTexturePixelsData(texture: WebGPUInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean): void {
        let imageCopy: GPUImageCopyTextureTagged = {
            texture: texture.resource,
            mipLevel: 0,
            premultipliedAlpha: premultiplyAlpha
        }
        let block = this._getBlockInformationFromFormat(texture._webGPUFormat);
        const bytesPerRow = Math.ceil(texture.width / block.width) * block.length;
        const height = texture.height;
        let dataLayout: GPUImageDataLayout = {
            offset: 0,
            bytesPerRow: bytesPerRow,
            rowsPerImage: height
        }
        let size = {
            width: Math.ceil(texture.width / block.width) * block.width,
            height: Math.ceil(height / block.height) * block.height,
        }
        if (source)
            WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, source.buffer, dataLayout, size);

        //Generate mipmap
        //TODO
    }

    setTextureSubPixelsData(texture: WebGPUInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        let imageCopy: GPUImageCopyTextureTagged = {
            texture: texture.resource,
            mipLevel: mipmapLevel,
            premultipliedAlpha: premultiplyAlpha,
            origin: {
                x: xOffset,
                y: yOffset,
            },
        }
        let block = this._getBlockInformationFromFormat(texture._webGPUFormat);
        const bytesPerRow = Math.ceil(width / block.width) * block.length;
        let dataLayout: GPUImageDataLayout = {
            offset: 0,
            bytesPerRow: bytesPerRow,
            rowsPerImage: height
        }
        let size = {
            width: Math.ceil(width / block.width) * block.width,
            height: Math.ceil(height / block.height) * block.height,
        }
        WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, source.buffer, dataLayout, size);

        //Generate mipmap TODO
        if (generateMipmap) {
            //TODO
        }
    }

    initVideoTextureData(texture: InternalTexture): void {
        throw new Error("Method not implemented.");
    }

    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void {
        throw new Error("Method not implemented.");
    }
    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void {
        throw new Error("Method not implemented.");
    }
    setTextureHDRData(texture: WebGPUInternalTex, hdrInfo: HDRTextureInfo): void {
        let hdrPixelData = hdrInfo.readScanLine();
        this.setTexturePixelsData(texture, hdrPixelData, false, false);
    }
    setCubeImageData(texture: InternalTexture, sources: (HTMLCanvasElement | HTMLImageElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
        for (let index = 0; index < 6; index++) {
            let source = sources[index];
            let image: GPUImageCopyExternalImage = { source: source as any, flipY: invertY, origin: { x: 0, y: 0 } };
            let textureCopyView: GPUImageCopyTextureTagged = {
                texture: texture.resource,
                origin: {
                    x: 0,
                    y: 0,
                    z: index
                },
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
                colorSpace: texture.useSRGBLoad ? "srgb" : undefined

            };
            let copySize: GPUExtent3DStrict = { width: source.width, height: source.height };
            WebGPURenderEngine._instance.getDevice().queue.copyExternalImageToTexture(image, textureCopyView, copySize);
        }
        //Generate mipmap
        //TODO
        if (texture.mipmap) {
            //TODO
        }
    }
    setCubePixelsData(texture: WebGPUInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        //invert TODO
        for (let index = 0; index < 6; index++) {
            let sourceData = source[index];
            let imageCopy: GPUImageCopyTextureTagged = {
                texture: texture.resource,
                mipLevel: 0,
                premultipliedAlpha: premultiplyAlpha,
                origin: {
                    x: 0,
                    y: 0,
                    z: Math.max(index, 0),
                }
            }
            let block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(texture.width / block.width) * block.length;
            const height = texture.height;
            let dataLayout: GPUImageDataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            }
            let size = {
                width: Math.ceil(texture.width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
                depthOrArrayLayers: 1
            }
            if (source)
                WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, sourceData.buffer, dataLayout, size);
        }

        //Generate mipmap
        //TODO
    }
    setCubeSubPixelData(texture: WebGPUInternalTex, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        //invert TODO
        generateMipmap = generateMipmap && mipmapLevel == 0;
        for (let index = 0; index < 6; index++) {
            let sourceData = source[index];
            let imageCopy: GPUImageCopyTextureTagged = {
                texture: texture.resource,
                mipLevel: mipmapLevel,
                premultipliedAlpha: premultiplyAlpha,
                origin: {
                    x: xOffset,
                    y: yOffset,
                    z: Math.max(index, 0)
                }
            }
            let block = this._getBlockInformationFromFormat(texture._webGPUFormat);
            const bytesPerRow = Math.ceil(width / block.width) * block.length;
            let dataLayout: GPUImageDataLayout = {
                offset: 0,
                bytesPerRow: bytesPerRow,
                rowsPerImage: height
            }
            let size = {
                width: Math.ceil(texture.width / block.width) * block.width,
                height: Math.ceil(height / block.height) * block.height,
                depthOrArrayLayers: 1
            }
            if (sourceData)
                WebGPURenderEngine._instance.getDevice().queue.writeTexture(imageCopy, sourceData.buffer, dataLayout, size);
            //this._engine._device.queue.writeTexture(image, textureCopyView, copySize);
        }

        if (texture.mipmap && generateMipmap) {
            //Generate mipmap
        }
    }
    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void {
        throw new Error("Method not implemented.");
    }
    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void {
        throw new Error("Method not implemented.");
    }
    setTextureCompareMode(texture: InternalTexture, compareMode: TextureCompareMode): TextureCompareMode {
        throw new Error("Method not implemented.");
    }
    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): InternalTexture {
        throw new Error("Method not implemented.");
    }
    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        //throw new Error("Method not implemented.");
        //rt  layout  internalTexture

        const gpuTextureformat = this._getGPURenderTargetFormat(format, sRGB);
        const textureDescriptor = this._getGPUTextureDescriptor(TextureDimension.Tex2D, width, height, gpuTextureformat, 1, false);
        const gpuTexture = this._engine.getDevice().createTexture(textureDescriptor);
        const internalRT = new WebGPUInternalRT(format, depthStencilFormat, false, generateMipmap, 1);
        internalRT._textures.push(new WebGPUInternalTex(width, height, 1, TextureDimension.Tex2D, generateMipmap, false, 1));
        internalRT._textures[0].resource = gpuTexture;
        WebGPURenderPassHelper.setColorAttachments(internalRT._renderPassDescriptor, internalRT._textures, true);
        //internalRT._webGPUFormat = gpuTextureformat;

        return internalRT;
    }
    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        throw new Error("Method not implemented.");
    }
    setupRendertargetTextureAttachment(renderTarget: InternalRenderTarget, texture: InternalTexture): void {
        throw new Error("Method not implemented.");
    }
    bindRenderTarget(renderTarget: InternalRenderTarget, faceIndex?: number): void {
        throw new Error("Method not implemented.");
    }
    bindoutScreenTarget(): void {
        throw new Error("Method not implemented.");
    }
    unbindRenderTarget(renderTarget: InternalRenderTarget): void {
        throw new Error("Method not implemented.");
    }
    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        throw new Error("Method not implemented.");
    }
    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
        throw new Error("Method not implemented.");
    }
    getRenderTextureData(internalTex: InternalRenderTarget, x: number, y: number, width: number, height: number): ArrayBufferView {
        throw new Error("Method not implemented.");
    }
}