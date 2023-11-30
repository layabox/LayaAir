import { DDSTextureInfo } from "../DDSTextureInfo";
import { HDRTextureInfo } from "../HDRTextureInfo";
import { KTXTextureInfo } from "../KTXTextureInfo";
import { RenderTargetFormat } from "../RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../RenderEnum/TextureCompareMode";
import { TextureDimension } from "../RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEnum/TextureFormat";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { InternalTexture } from "./InternalTexture";


export interface ITextureContext {
    needBitmap: boolean;
    /**
     * 为 Texture 创建 InternalTexture
     * @param width 
     * @param height 
     * @param format 
     * @param generateMipmap 
     * @param sRGB 
     * @returns 
     */
    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture;

    setTextureImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean): void;

    setTextureSubImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexturePixelsData(texture: InternalTexture, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean): void;

    initVideoTextureData(texture: InternalTexture): void;

    setTextureSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;

    setTextureHDRData(texture: InternalTexture, hdrInfo: HDRTextureInfo): void;

    setCubeImageData(texture: InternalTexture, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubePixelsData(texture: InternalTexture, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void;

    setCubeSubPixelData(texture: InternalTexture, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void;

    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void;

    setTextureCompareMode(texture: InternalTexture, compareMode: TextureCompareMode): TextureCompareMode;

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): InternalTexture;

    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    setupRendertargetTextureAttachment(renderTarget: InternalRenderTarget, texture: InternalTexture): void;

    bindRenderTarget(renderTarget: InternalRenderTarget, faceIndex?: number): void;
    bindoutScreenTarget(): void;
    unbindRenderTarget(renderTarget: InternalRenderTarget): void;

    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView;

    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void;

    getRenderTextureData(internalTex: InternalRenderTarget, x: number, y: number, width: number, height: number): ArrayBufferView;

}

export interface ITexture3DContext extends ITextureContext {

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture;

    setTexture3DImageData(texture: InternalTexture, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexture3DPixelsData(texture: InternalTexture, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexture3DSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void;
}