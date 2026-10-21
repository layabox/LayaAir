import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { HalfFloatUtils } from "../../../utils/HalfFloatUtils";
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

    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): LayaXInternalRT {
        return new LayaXInternalRT(this._native.createRenderTargetArrayInternal(width, height, depth, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
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
        if (renderTarget?.destroyed)
            throw new Error("Cannot bind a disposed LayaX render target.");
        if (renderTarget?.colorFormats && faceIndex !== 0)
            throw new RangeError("LayaX MRT only supports 2D attachments at mip level 0.");
        this._native.bindRenderTarget(renderTarget?._nativeObj ?? null, faceIndex);
    }

    bindoutScreenTarget(): void {
        this._native.bindoutScreenTarget();
    }

    unbindRenderTarget(renderTarget: LayaXInternalRT): void {
        this._native.unbindRenderTarget(renderTarget?._nativeObj ?? null);
    }

    createMultiRenderTargetInternal(width: number, height: number, colorFormats: readonly (RenderTargetFormat | null)[], depthStencilFormat: RenderTargetFormat, color0SRGB: boolean = false): LayaXInternalRT {
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 0x7fffffff || height > 0x7fffffff)
            throw new RangeError("MRT dimensions must be positive integers.");
        if (!Array.isArray(colorFormats) || !colorFormats.length || colorFormats[0] == null)
            throw new RangeError("MRT requires color attachment 0 and a non-empty color layout.");
        const formats = Array.from(colorFormats, format => {
            if (format == null)
                return RenderTargetFormat.None;
            if (!Number.isInteger(format) || format === RenderTargetFormat.None)
                throw new TypeError("MRT color formats must be valid format values or null.");
            return format;
        });
        return new LayaXInternalRT(this._native.createMultiRenderTargetInternal(width, height, formats,
            depthStencilFormat ?? RenderTargetFormat.None, color0SRGB));
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
        if (!renderTarget || renderTarget.destroyed || renderTarget._owner)
            throw new Error("Cannot replace depth storage on a disposed or borrowed LayaX render target.");
        if (renderTarget.colorFormats && (dimension !== TextureDimension.Tex2D ||
            width !== renderTarget._textures[0].width || height !== renderTarget._textures[0].height))
            throw new RangeError("LayaX MRT depth dimensions must match its 2D color attachments.");
        const nativeTexture = this._native.createRenderTargetDepthTexture(renderTarget._nativeObj, dimension, width, height);
        // LayaX render surfaces are already sampleable; reuse the existing depth
        // wrapper so creating a sampling view does not change shared attachment storage.
        if (nativeTexture && renderTarget._depthTextureRef &&
            (renderTarget._depthTextureRef as LayaXInternalTex)._nativeObj === nativeTexture)
            return renderTarget._depthTextureRef as LayaXInternalTex;
        const texture = nativeTexture ? new LayaXInternalTex(nativeTexture) : null;
        renderTarget._depthTextureRef = texture;
        return texture;
    }

    /** @deprecated 用 readRenderTargetPixelDataAsync */
    readRenderTargetPixelData(renderTarget: LayaXInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        // FFI 是异步的，同步签名不再可用；保留接口防 NPE，真正读必须走 async API
        return out;
    }

    /**
     * 异步回读 RT color attachment 像素到 `out`。
     * 走 LayaXReadbackDispatcher 等 ReadbackCompleted 事件，不阻塞主线程。
     * 按附件真实格式分配 256 字节对齐行；RGBA16F 解码为 Float32Array。
     */
    async readRenderTargetPixelDataAsync(renderTarget: LayaXInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView, attachmentIndex: number = 0): Promise<ArrayBufferView> {
        if (!renderTarget || renderTarget.destroyed)
            throw new Error("Cannot read a missing or disposed LayaX render target.");
        if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0 ||
            (!renderTarget.colorFormats && attachmentIndex !== 0))
            throw new RangeError("Color attachment index is out of range.");
        const texture = renderTarget._textures[attachmentIndex];
        if (!texture)
            throw new RangeError("LayaX color attachment is empty or out of range.");
        if (!Number.isInteger(xOffset) || !Number.isInteger(yOffset) || !Number.isInteger(width) || !Number.isInteger(height) ||
            xOffset < 0 || yOffset < 0 || width <= 0 || height <= 0 || width > texture.width || height > texture.height ||
            xOffset > texture.width - width || yOffset > texture.height - height)
            throw new RangeError("LayaX readback rectangle must be within the color attachment.");
        const format = renderTarget.colorFormats ? renderTarget.colorFormats[attachmentIndex] : renderTarget.colorFormat;
        const bytePixels = format === RenderTargetFormat.R8G8B8 || format === RenderTargetFormat.R8G8B8A8;
        const halfPixels = format === RenderTargetFormat.R16G16B16 || format === RenderTargetFormat.R16G16B16A16;
        const floatPixels = format === RenderTargetFormat.R32G32B32 || format === RenderTargetFormat.R32G32B32A32;
        if (!bytePixels && !halfPixels && !floatPixels)
            throw new TypeError("Unsupported LayaX color format for readback.");
        if (bytePixels ? !(out instanceof Uint8Array || out instanceof Uint8ClampedArray) : !(out instanceof Float32Array))
            throw new TypeError("LayaX color readback requires a byte view for byte attachments and Float32Array for floating-point attachments.");
        const outputBytes = width * height * 4 * (bytePixels ? 1 : 4);
        if (out.byteLength < outputBytes)
            throw new RangeError(`LayaX readback output requires at least ${outputBytes} bytes.`);
        const bytesPerPixel = bytePixels ? 4 : halfPixels ? 8 : 16;
        const unpaddedRow = width * bytesPerPixel;
        const paddedRow = Math.ceil(unpaddedRow / 256) * 256;
        const padded = new Uint8Array(paddedRow * height);
        return new Promise<ArrayBufferView>((resolve, reject) => {
            const id: number = renderTarget.colorFormats
                ? this._native.readMultiRenderTargetPixelData(renderTarget._nativeObj, xOffset, yOffset, width, height, paddedRow, padded.buffer, attachmentIndex)
                : this._native.readRenderTargetPixelData(renderTarget._nativeObj, xOffset, yOffset, width, height, paddedRow, padded.buffer);
            if (!id || id <= 0) {
                reject(new Error("readRenderTargetPixelDataAsync: submit failed"));
                return;
            }

            // 闭包持 padded/out 引用防 GC（FFI 只持裸指针）
            LayaXReadbackDispatcher.register(
                id,
                () => {
                    if (halfPixels) {
                        const source = new Uint16Array(padded.buffer);
                        const destination = out as Float32Array;
                        for (let row = 0; row < height; row++)
                            for (let i = 0; i < width * 4; i++)
                                destination[row * width * 4 + i] = HalfFloatUtils.convertToNumber(source[row * paddedRow / 2 + i]);
                    } else if (floatPixels) {
                        const source = new Float32Array(padded.buffer);
                        const destination = out as Float32Array;
                        for (let row = 0; row < height; row++)
                            destination.set(source.subarray(row * paddedRow / 4, row * paddedRow / 4 + width * 4), row * width * 4);
                    } else {
                        const destination = new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
                        for (let row = 0; row < height; row++)
                            destination.set(padded.subarray(row * paddedRow, row * paddedRow + unpaddedRow), row * unpaddedRow);
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
