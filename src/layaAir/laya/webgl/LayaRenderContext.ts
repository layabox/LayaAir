import { InternalTexture } from "../d3/WebGL/InternalTexture";
import { Texture2D } from "../d3/WebGL/Texture2D";
import { FilterMode } from "../resource/FilterMode";;
import { TextureFormat } from "../resource/TextureFormat";
import { WarpMode } from "../resource/WrapMode";

export interface LayaRenderContext {

    createInternalTexture(width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    createImgTexture2D(sourceData: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    createArrayBufferTexture2D(sourceData: ArrayBufferView, width: number, height: number, format: TextureFormat, mipmap: boolean, warpU: WarpMode, warpV: WarpMode, filter: FilterMode, anisoLevel: number, premultiplyAlpha: boolean, invertY: boolean, sRGB: boolean): InternalTexture;

    updataSubImageData(texture: Texture2D, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, xoffset: number, yoffset: number, mipmapLevel: number): void;

    updataSubPixelsData(texture: Texture2D, source: ArrayBufferView, xoffset: number, yoffset: number, width: number, height: number, mipmapLevel: number): void;
}