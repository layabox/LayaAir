import { InternalRenderTarget } from "../d3/WebGL/InternalRenderTarget";
import { InternalTexture, TextureDimension } from "../d3/WebGL/InternalTexture";
import { RenderTargetFormat } from "../resource/RenderTarget";
import { TextureFormat } from "../resource/TextureFormat";
import { DDSTextureInfo } from "../resource/DDSTextureInfo";
import { HDRTextureInfo } from "../resource/HDRTextureInfo";
import { KTXTextureInfo } from "../resource/KTXTextureInfo";
import { CompareMode } from "../resource/CompareMode";

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

    setTextureSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;

    setTextureHDRData(texture: InternalTexture, hdrInfo: HDRTextureInfo): void;

    setCubeImageData(texture: InternalTexture, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubePixelsData(texture: InternalTexture, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubeSubPixelData(texture: InternalTexture, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;

    setTextureCompareMode(texture: InternalTexture, compareMode: CompareMode): CompareMode;

    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    bindRenderTarget(renderTarget: InternalRenderTarget | null): void;
    unbindRenderTarget(renderTarget: InternalRenderTarget | null): void;

    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView;

}