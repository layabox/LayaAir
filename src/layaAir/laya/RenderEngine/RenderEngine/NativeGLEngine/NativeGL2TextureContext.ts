import { NativeGLTextureContext } from "./NativeGLTextureContext";
import { NativeWebGLEngine } from "./NativeWebGLEngine";
import { NativeWebGLInternalTex } from "./NativeWebGLInternalTex";
import { NativeWebGLInternalRT } from "./NativeWebGLInternalRT";
import { TextureDimension } from "../../RenderEnum/TextureDimension";
import { HDRTextureInfo } from "../../HDRTextureInfo";
import { FilterMode } from "../../RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../RenderEnum/TextureCompareMode";
import { TextureFormat } from "../../RenderEnum/TextureFormat";
import { KTXTextureInfo } from "../../KTXTextureInfo";

/**
 * 将继承修改为类似 WebGLRenderingContextBase, WebGLRenderingContextOverloads 多继承 ?
 */
export class NativeGL2TextureContext extends NativeGLTextureContext {

    constructor(engine: NativeWebGLEngine, native: any) {
        super(engine, native);
    }

    setTextureImageData(texture: NativeWebGLInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTextureImageData((texture as any).id, (source as any)._nativeObj.conchImgId , premultiplyAlpha, invertY);
    }

    setTexturePixelsData(texture: NativeWebGLInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTexturePixelsData((texture as any).id, source , premultiplyAlpha, invertY);
    }

    setTextureHDRData(texture: NativeWebGLInternalTex, hdrInfo: HDRTextureInfo): void {
        let sourceData = hdrInfo.readScanLine();

        this.setTexturePixelsData(texture, sourceData, false, false);
    }

    setTextureKTXData(texture: NativeWebGLInternalTex, ktxInfo: KTXTextureInfo) {

    }

    setCubeImageData(texture: NativeWebGLInternalTex, sources: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], premultiplyAlpha: boolean, invertY: boolean): void {
       
    }

    setCubePixelsData(texture: NativeWebGLInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {

    }

    setCubeKTXData(texture: NativeWebGLInternalTex, ktxInfo: KTXTextureInfo): void {
       
    }

    setTextureCompareMode(texture: NativeWebGLInternalTex, compareMode: TextureCompareMode): TextureCompareMode {
        return null;
    }

    createRenderbuffer(width: number, height: number, internalFormat: number, samples: number): WebGLRenderbuffer {
        return null;
    }

    createRenderTextureInternal(dimension: TextureDimension, width: number, height: number, format: RenderTargetFormat, gengerateMipmap: boolean, sRGB: boolean): NativeWebGLInternalTex {
        return null;
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): NativeWebGLInternalRT {
        return null;
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): NativeWebGLInternalRT {
        return null;
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): NativeWebGLInternalTex {
        return null;
    }

    bindRenderTarget(renderTarget: NativeWebGLInternalRT): void {
      
    }

    unbindRenderTarget(renderTarget: NativeWebGLInternalRT): void {

    }

}