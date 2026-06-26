import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { LayaXReadbackDispatcher } from "./LayaXReadbackDispatcher";
import { LayaXInternalRT } from "./LayaXInternalRT";
import { LayaXInternalTex } from "./LayaXInternalTex";

export class LayaXTextureContext implements ITextureContext {
    needBitmap: boolean;
    protected _native: any;

    constructor(native: any) {
        this._native = native;
        this.needBitmap = false;
    }

    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        if (this._native && typeof this._native.createRenderTargetArrayInternal === "function") {
            return this._native.createRenderTargetArrayInternal(width, height, depth, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples);
        }
        throw "not implemented";
    }
    createRenderTargetFromArrayLayer(arrayTex: InternalTexture, layer: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, sRGB: boolean): InternalRenderTarget {
        throw new Error("Method not implemented.");
    }

    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): LayaXInternalTex {
        var tex = new LayaXInternalTex(this._native.createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha));
        return tex;
    }

    setTextureImageData(texture: LayaXInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean) {
        if (source instanceof HTMLCanvasElement) {
            throw "native cant draw HTMLCanvasElement";
        }
        if ((source as any).conchImgId !== undefined) {
            this._native.setTextureImageData(texture._nativeObj, (source as any).conchImgId, premultiplyAlpha, invertY);
        } else {
            this._native.setTextureImageData(texture._nativeObj, (source as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
    }

    setTexturePixelsData(texture: LayaXInternalTex, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean) {
        this._native.setTexturePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
    }

    initVideoTextureData(texture: LayaXInternalTex): void {
        this._native.initVideoTextureData(texture._nativeObj);
    }

    setTextureSubPixelsData(texture: LayaXInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTextureSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    setTextureSubImageData(texture: LayaXInternalTex, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void {
        if (source instanceof HTMLCanvasElement) {
            throw "native cant draw HTMLCanvasElement";
        }
        throw "native not need this function";
    }

    setTexture3DImageData(texture: LayaXInternalTex, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DImageData(texture._nativeObj, (source as any[]).map(function (s) { return s._nativeObj; }), depth, premultiplyAlpha, invertY);
    }

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): LayaXInternalTex {
        return new LayaXInternalTex(this._native.createTexture3DInternal(dimension, width, height, depth, format, generateMipmap, sRGB, premultipliedAlpha));
    }

    setTexture3DPixelsData(texture: LayaXInternalTex, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DPixelsData(texture._nativeObj, source, depth, premultiplyAlpha, invertY);
    }

    setTexture3DSubPixelsData(texture: LayaXInternalTex, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DSubPixelsData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, zOffset, width, height, depth, premultiplyAlpha, invertY);
    }

    setTextureHDRData(texture: LayaXInternalTex, hdrInfo: HDRTextureInfo): void {
        let sourceData = hdrInfo.readScanLine();
        this.setTexturePixelsData(texture, sourceData, false, false);
    }

    setTextureDDSData(texture: LayaXInternalTex, ddsInfo: DDSTextureInfo) {
        this._native.setTextureDDSData(texture._nativeObj, ddsInfo);
    }

    setTextureKTXData(texture: LayaXInternalTex, ktxInfo: KTXTextureInfo) {
        this._native.setTextureKTXData(texture._nativeObj, ktxInfo);
    }

    setCubeImageData(texture: LayaXInternalTex, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
        var images: any[] = [];
        var length = sources.length;
        for (let index = 0; index < length; index++) {
            images.push((sources[index] as any)._nativeObj);
        }
        this._native.setCubeImageData(texture._nativeObj, images, premultiplyAlpha, invertY);
    }

    setCubePixelsData(texture: LayaXInternalTex, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubePixelsData(texture._nativeObj, source, premultiplyAlpha, invertY);
    }

    setCubeSubPixelData(texture: LayaXInternalTex, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setCubeSubPixelData(texture._nativeObj, source, mipmapLevel, generateMipmap, xOffset, yOffset, width, height, premultiplyAlpha, invertY);
    }

    setCubeDDSData(texture: LayaXInternalTex, ddsInfo: DDSTextureInfo) {
        this._native.setCubeDDSData(texture._nativeObj, ddsInfo);
    }

    setCubeKTXData(texture: LayaXInternalTex, ktxInfo: KTXTextureInfo) {
        this._native.setCubeKTXData(texture._nativeObj, ktxInfo);
    }

    setTextureCompareMode(texture: LayaXInternalTex, compareMode: TextureCompareMode): TextureCompareMode {
        return this._native.setTextureCompareMode(texture._nativeObj, compareMode);
    }

    bindRenderTarget(renderTarget: LayaXInternalRT, faceIndex: number = 0): void {
        this._native.bindRenderTarget(renderTarget._nativeObj, faceIndex);
    }

    bindoutScreenTarget(): void {
        this._native.bindoutScreenTarget();
    }

    unbindRenderTarget(renderTarget: LayaXInternalRT): void {
        this._native.unbindRenderTarget(renderTarget._nativeObj);
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number, storage: boolean): LayaXInternalRT {
        return new LayaXInternalRT(this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): LayaXInternalRT {
        return new LayaXInternalRT(this._native.createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples));
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): LayaXInternalTex {
        return new LayaXInternalTex(this._native.createRenderTextureCubeInternal(dimension, size, format, generateMipmap, sRGB));
    }

    createRenderTargetDepthTexture(renderTarget: LayaXInternalRT, dimension: TextureDimension, width: number, height: number): LayaXInternalTex {
        return new LayaXInternalTex(this._native.createRenderTargetDepthTexture(renderTarget._nativeObj, dimension, width, height));
    }

    /** @deprecated 用 readRenderTargetPixelDataAsync */
    readRenderTargetPixelData(renderTarget: LayaXInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        // FFI 是异步的，同步签名不再可用；保留接口防 NPE，真正读必须走 async API
        return out;
    }

    /**
     * 异步回读 RT color attachment 像素到 `out`。
     * 走 LayaXReadbackDispatcher 等 ReadbackCompleted 事件，不阻塞主线程。
     * bpp 由 `out.byteLength / (w*h)` 推断；wgpu 行宽 256 对齐，回来按行 strip padding 拷贝到 `out`。
     */
    readRenderTargetPixelDataAsync(renderTarget: LayaXInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): Promise<ArrayBufferView> {
        return new Promise<ArrayBufferView>((resolve, reject) => {
            if (!renderTarget || !renderTarget._nativeObj || width <= 0 || height <= 0) {
                reject(new Error("readRenderTargetPixelDataAsync: invalid args"));
                return;
            }
            const pixelCount = width * height;
            if (pixelCount <= 0 || out.byteLength % pixelCount !== 0) {
                reject(new Error("readRenderTargetPixelDataAsync: out.byteLength not divisible by width*height"));
                return;
            }
            const bpp = out.byteLength / pixelCount;
            const unpaddedRow = width * bpp;
            const paddedRow = (unpaddedRow + 255) & ~255;
            const padded = new Uint8Array(paddedRow * height);

            const id: number = this._native.readRenderTargetPixelData(
                renderTarget._nativeObj, xOffset, yOffset, width, height, paddedRow, padded.buffer);
            if (!id || id <= 0) {
                reject(new Error("readRenderTargetPixelDataAsync: submit failed"));
                return;
            }

            // 闭包持 padded/out 引用防 GC（FFI 只持裸指针）
            LayaXReadbackDispatcher.register(
                id,
                () => {
                    const dstU8 = new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
                    if (paddedRow === unpaddedRow) {
                        dstU8.set(padded.subarray(0, unpaddedRow * height));
                    } else {
                        for (let row = 0; row < height; row++) {
                            dstU8.set(padded.subarray(row * paddedRow, row * paddedRow + unpaddedRow), row * unpaddedRow);
                        }
                    }
                    resolve(out);
                },
                (e) => reject(e),
            );
        });
    }

    updateVideoTexture(texture: LayaXInternalTex, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
        if (texture && video) {
            this._native.updateVideoTexture(texture._nativeObj, (video as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
    }
}
