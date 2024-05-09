import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { GLESInternalRT } from "./GLESInternalRT";
import { GLESInternalTex } from "./GLESInternalTex";


export class GLESTextureContext implements ITextureContext {
    needBitmap: boolean;
    protected _native: any;

    constructor(native: any) {
        this._native = native;
        this.needBitmap = false;
    }

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): GLESInternalTex {
        //return this._native.createTexture3DInternal
        return null;
    }

    setTexture3DPixelsData(texture: GLESInternalTex, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        //return this._native.setTexture3DPixelsData
        return null;
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): GLESInternalTex {
        var tex = new GLESInternalTex(this._native.createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha));
        return tex
    }

    setTextureImageData(texture: GLESInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        if (source instanceof HTMLCanvasElement) {
            throw "native cant draw HTMLCanvasElement";
            return;
        }
        this._native.setTextureImageData(texture._nativeObj, (source as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
    }

    setTexturePixelsData(texture: GLESInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTexturePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
    }

    initVideoTextureData(texture: GLESInternalTex): void {
        this._native.initVideoTextureData(texture._nativeObj);
    }

    setTextureSubPixelsData(texture: GLESInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTextureSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    setTextureSubImageData(texture: GLESInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void {
        if (source instanceof HTMLCanvasElement) {
            throw "native cant draw HTMLCanvasElement";
            return;
        }
        //TODO
        throw "native not need this function"
    }

    setTexture3DImageData(texture: GLESInternalTex, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DImageData(texture._nativeObj, (source as any[]).map(function (s) { return s._nativeObj }), depth, premultiplyAlpha, invertY);
    }

    setTexture3DPixlesData(texture: GLESInternalTex, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DPixlesData(texture._nativeObj, source, depth, premultiplyAlpha, invertY);
    }

    setTexture3DSubPixelsData(texture: GLESInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
    }

    setTextureHDRData(texture: GLESInternalTex, hdrInfo: HDRTextureInfo): void {
        let sourceData = hdrInfo.readScanLine();
        this.setTexturePixelsData(texture, sourceData, false, false);
    }
    
    setTextureDDSData(texture: GLESInternalTex, ddsInfo: DDSTextureInfo) {
        this._native.setTextureDDSData(texture._nativeObj, ddsInfo);
    }

    setTextureKTXData(texture: GLESInternalTex, ktxInfo: KTXTextureInfo) {
        this._native.setTextureKTXData(texture._nativeObj, ktxInfo);
    }

    setCubeImageData(texture: GLESInternalTex, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
        var images: any[] = [];
        var length = sources.length;
        for (let index = 0; index < length; index++) {
            images.push((sources[index] as any)._nativeObj);
        }
        this._native.setCubeImageData(texture._nativeObj, images, premultiplyAlpha, invertY);
    }

    setCubePixelsData(texture: GLESInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
    }

    setCubeSubPixelData(texture: GLESInternalTex, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubeSubPixelData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }


    setCubeDDSData(texture: GLESInternalTex, ddsInfo: DDSTextureInfo) {
        this._native.setCubeDDSData(texture._nativeObj, ddsInfo);
    }

    setCubeKTXData(texture: GLESInternalTex, ktxInfo: KTXTextureInfo) {
        this._native.setCubeKTXData(texture._nativeObj, ktxInfo);
    }

    setTextureCompareMode(texture: GLESInternalTex, compareMode: TextureCompareMode): TextureCompareMode {
        return this._native.setTextureCompareMode(texture._nativeObj, compareMode);
    }

    bindRenderTarget(renderTarget: GLESInternalRT, faceIndex: number = 0): void {
        this._native.bindRenderTarget(renderTarget._nativeObj, faceIndex);
    }

    bindoutScreenTarget(): void {
        this._native.bindoutScreenTarget();
    }

    unbindRenderTarget(renderTarget: GLESInternalRT): void {
        this._native.unbindRenderTarget(renderTarget._nativeObj);
    }

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): GLESInternalTex {
        return new GLESInternalTex(this._native.createRenderTextureInternal(dimension, width, height, format, generateMipmap, sRGB));
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): GLESInternalRT {
        return new GLESInternalRT(this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): GLESInternalRT {
        return new GLESInternalRT(this._native.createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples));
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): GLESInternalTex {
        return new GLESInternalTex(this._native.createRenderTextureCubeInternal(dimension, size, format, generateMipmap, sRGB));
    }

    setupRendertargetTextureAttachment(renderTarget: GLESInternalRT, texture: GLESInternalTex) {
        this._native.setupRendertargetTextureAttachment(renderTarget._nativeObj, texture._nativeObj);
    }

    /**
     * @deprecated 请使用readRenderTargetPixelDataAsync函数代替
     * @param renderTarget 
     * @param xOffset 
     * @param yOffset 
     * @param width 
     * @param height 
     * @param out 
     * @returns 
     */
    readRenderTargetPixelData(renderTarget: GLESInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        return this._native.readRenderTargetPixelData(renderTarget._nativeObj, xOffset, yOffset, width, height, out);
    }

    readRenderTargetPixelDataAsync(renderTarget: GLESInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): Promise<ArrayBufferView> { //兼容WGSL
        return Promise.resolve(this.readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out));
    }

    updateVideoTexture(texture: GLESInternalTex, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.updateVideoTexture(texture._nativeObj, (video as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
    }

    getRenderTextureData(internalTex: GLESInternalRT, x: number, y: number, width: number, height: number): ArrayBufferView {
        return this._native.getRenderTextureData(internalTex._nativeObj, x, y, width, height);
    }
}