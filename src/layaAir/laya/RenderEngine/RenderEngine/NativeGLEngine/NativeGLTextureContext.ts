
import { WebGLExtension } from "../WebGLEngine/GLEnum/WebGLExtension";
import { FilterMode } from "../../RenderEnum/FilterMode";
import { RenderCapable } from "../../RenderEnum/RenderCapable";
import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { TextureFormat } from "../../RenderEnum/TextureFormat";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { ITextureContext } from "../../RenderInterface/ITextureContext";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine";
import { DDSTextureInfo } from "../../DDSTextureInfo";
import { HDRTextureInfo } from "../../HDRTextureInfo";
import { KTXTextureInfo } from "../../KTXTextureInfo";
import { InternalRenderTarget } from "../../RenderInterface/InternalRenderTarget";

export class NativeGLTextureContext extends NativeGLObject implements ITextureContext {
    protected _native: any;

    constructor(engine: NativeWebGLEngine, native: any) {
        super(engine);
        this._native = native;
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture {
        return this._native.createTextureInternal(dimension, width, height, format, gengerateMipmap, sRGB);
    }

    setTextureImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTextureImageData(texture, (source as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
    }

    setTexturePixelsData(texture: InternalTexture, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTexturePixelsData(texture, source, premultiplyAlpha, invertY);
    }

    initVideoTextureData(texture: InternalTexture): void{
        this._native.initVideoTextureData(texture);
    }

    setTextureSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTextureSubPixelsData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    setTexturebySubImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void{
        //TODO
    }

    setTextureHDRData(texture: InternalTexture, hdrInfo: HDRTextureInfo): void {
        let sourceData = hdrInfo.readScanLine();

        this.setTexturePixelsData(texture, sourceData, false, false);
    }
    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo) {
        this._native.setTextureKTXData(texture, ddsInfo);
    }

    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo) {
        this._native.setTextureKTXData(texture, ktxInfo);
    }
    setCubeImageData(texture: InternalTexture, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
        var images: any[] = [];
        var length = sources.length;
        for (let index = 0; index < length; index++) {
            images.push((sources[index] as any)._nativeObj);
        }
        this._native.setCubeImageData(texture, images, premultiplyAlpha, invertY);
    }

    setCubePixelsData(texture: InternalTexture, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubePixelsData(texture, source, premultiplyAlpha, invertY);
    }
    setCubeSubPixelData(texture: InternalTexture, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubeSubPixelData(texture, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }


    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo) {
        throw new Error("setCubeDDSData Method not implemented.");
    }

    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo) {
        throw new Error("setCubeKTXData Method not implemented.");
    }

    setTextureCompareMode(texture: InternalTexture, compareMode: TextureCompareMode): TextureCompareMode {
        return this._native.setTextureCompareMode(texture, compareMode);
    }

    bindRenderTarget(renderTarget: InternalRenderTarget): void {
        this._native.bindRenderTarget(renderTarget);
    }

    bindoutScreenTarget(): void {
        this._native.bindoutScreenTarget();
    }

    unbindRenderTarget(renderTarget: InternalRenderTarget): void {
        this._native.unbindRenderTarget(renderTarget);
    }

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): InternalTexture {
        return this._native.createRenderTextureInternal(dimension, width, height, format, generateMipmap, sRGB);
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        return this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples);
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        return this._native.createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples);
    }
    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): InternalTexture {
        throw new Error("createRenderTextureCubeInternal Method not implemented.");
    }
    // todo  color 0, 1, 2, 3 ?
    setupRendertargetTextureAttachment(renderTarget: InternalRenderTarget, texture: InternalTexture) {
        this._native.setupRendertargetTextureAttachment(renderTarget, texture);
    }

    // todo 不同 格式
    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        return this._native.readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out);
    }

    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.updateVideoTexture(texture, (video as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
    }

    getRenderTextureData(internalTex: InternalRenderTarget, x: number, y: number, width: number, height: number): ArrayBufferView {
        return this._native.getRenderTextureData(internalTex, x, y, width, height);
    }
}