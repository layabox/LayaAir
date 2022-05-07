
import { WebGLExtension } from "../WebGLEngine/GLEnum/WebGLExtension";
import { NativeWebGLInternalTex } from "./NativeWebGLInternalTex";
import { NativeWebGLInternalRT } from "./NativeWebGLInternalRT";
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

export class NativeGLTextureContext extends NativeGLObject implements ITextureContext {
    protected _native: any;

    constructor(engine: NativeWebGLEngine, native: any) {
        super(engine);
        this._native = native;
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, gengerateMipmap: boolean, sRGB: boolean): InternalTexture {
        return this._native.createTextureInternal(dimension, width, height, format, gengerateMipmap, sRGB);
    }

    setTextureImageData(texture: NativeWebGLInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTextureImageData((texture as any).id, (source as any)._nativeObj.conchImgId , premultiplyAlpha, invertY);
    }

    setTexturePixelsData(texture: NativeWebGLInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTexturePixelsData((texture as any).id, source , premultiplyAlpha, invertY);
    }

    setTextureSubPixelsData(texture: NativeWebGLInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }

    setTextureDDSData(texture: NativeWebGLInternalTex, ddsInfo: DDSTextureInfo) {
    }

    setTextureKTXData(texture: NativeWebGLInternalTex, ktxInfo: KTXTextureInfo) {
    }

    setTextureHDRData(texture: NativeWebGLInternalTex, hdrInfo: HDRTextureInfo): void {
    }

    setCubeImageData(texture: NativeWebGLInternalTex, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean) { 
    }

    setCubePixelsData(texture: NativeWebGLInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean) {
    }

    setCubeSubPixelData(texture: NativeWebGLInternalTex, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }


    setCubeDDSData(texture: NativeWebGLInternalTex, ddsInfo: DDSTextureInfo) {
    }

    setCubeKTXData(texture: NativeWebGLInternalTex, ktxInfo: KTXTextureInfo) {
    }

    setTextureCompareMode(texture: NativeWebGLInternalTex, compareMode: TextureCompareMode): TextureCompareMode {
        return TextureCompareMode.None;
    }

    bindRenderTarget(renderTarget: NativeWebGLInternalRT): void {

    }

    bindoutScreenTarget():void{
     
    }

    unbindRenderTarget(renderTarget: NativeWebGLInternalRT): void {
       
    }

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): NativeWebGLInternalTex {
        return null;
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): NativeWebGLInternalTex {
        return null;
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): NativeWebGLInternalRT {
        return  this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples);
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): NativeWebGLInternalRT {
        return null;
    }

    createRenderbuffer(width: number, height: number, internalFormat: number, samples: number) {
    }

    // todo  color 0, 1, 2, 3 ?
    setupRendertargetTextureAttachment(renderTarget: NativeWebGLInternalRT, texture: NativeWebGLInternalTex) {
    }

    // todo 不同 格式
    readRenderTargetPixelData(renderTarget: NativeWebGLInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        return null;
    }

    updateVideoTexture(texture: NativeWebGLInternalTex, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {

    }

}