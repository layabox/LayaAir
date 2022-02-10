import { InternalRenderTarget } from "../d3/WebGL/InternalRenderTarget";
import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { RenderTargetFormat } from "../d3/WebGL/RenderTarget";
import { TextureFormat } from "../resource/TextureFormat";
import { DDSTextureInfo } from "./DDSTextureInfo";
import { HDRTextureInfo } from "./HDRTextureInfo";
import { KTXTextureInfo } from "./KTXTextureInfo";

export interface LayaContext {

    /**
     * 为 Texture 创建 InternalTexture
     * @param width 
     * @param height 
     * @param format 
     * @param gengerateMipmap 
     * @param sRGB 
     * @returns 
     */
    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture;

    setTextureImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexturePixelsData(texture: InternalTexture, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean): void;

    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;

    setTextureHDRData(texture: InternalTexture, hdrInfo: HDRTextureInfo): void;

    setCubeImageData(texture: InternalTexture, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubePixelsData(texture: InternalTexture, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;


    createRenderTargetInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean, depthStencilFormat: RenderTargetFormat, multiSamples: number): InternalRenderTarget;

    createMultiRenderTargetInternal(dimension: TextureDimension, width: number, height: number, colorCount: number, renderFormats: RenderTargetFormat[], depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture;

    bindRenderTarget(renderTarget: InternalRenderTarget | null): void;
    unbindRenderTarget(renderTarget: InternalRenderTarget | null): void;

}