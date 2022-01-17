import { InternalTexture } from "../d3/WebGL/InternalTexture";
import { Texture2D } from "../d3/WebGL/Texture2D";
import { FilterMode } from "../resource/FilterMode"; import { RenderTextureFormat } from "../resource/RenderTextureFormat";
;
import { TextureFormat } from "../resource/TextureFormat";
import { WarpMode } from "../resource/WrapMode";
import { DDSTextureInfo } from "./DDSTextureInfo";

export interface LayaRenderContext {

    createTextureInternal(width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    createCompressTextureInternal(source: ArrayBufferView, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    createImgTexture2D(sourceData: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    updataSubImageData(texture: Texture2D, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number): void;

    createArrayBufferTexture2D(sourceData: ArrayBufferView, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    updataSubPixelsData(texture: Texture2D, source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number): void;

    createDDSTexture(source: ArrayBuffer, ddsInfo: DDSTextureInfo, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    // todo
    createRenderTargetInternal(width: number, height: number, format: RenderTextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;
}