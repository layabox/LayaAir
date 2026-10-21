import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
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
    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): GLESInternalRT {
        return new GLESInternalRT(this._native.createRenderTargetArrayInternal(width, height, depth, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
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
        if ((source as any).conchImgId !== undefined) {//VideoDecoder
            this._native.setTextureImageData(texture._nativeObj, (source as any).conchImgId, premultiplyAlpha, invertY);
        }
        else {
             this._native.setTextureImageData(texture._nativeObj, (source as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
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

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): GLESInternalTex {
        return new GLESInternalTex(this._native.createTexture3DInternal(dimension, width, height, depth, format, generateMipmap, sRGB, premultipliedAlpha));
    }
    setTexture3DPixelsData(texture: GLESInternalTex, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
        this._native.setTexture3DPixelsData(texture._nativeObj, source, depth, premultiplyAlpha, invertY);
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
        if (renderTarget?.destroyed)
            throw new Error("Cannot bind a disposed OpenGLES render target.");
        if (renderTarget?.colorFormats && faceIndex !== 0)
            throw new RangeError("OpenGLES MRT only supports 2D attachments at mip level 0.");
        this._native.bindRenderTarget(renderTarget?._nativeObj ?? null, faceIndex);
    }

    bindoutScreenTarget(): void {
        this._native.bindoutScreenTarget();
    }

    unbindRenderTarget(renderTarget: GLESInternalRT): void {
        this._native.unbindRenderTarget(renderTarget?._nativeObj ?? null);
    }

    createMultiRenderTargetInternal(width: number, height: number, colorFormats: readonly (RenderTargetFormat | null)[], depthStencilFormat: RenderTargetFormat, color0SRGB: boolean = false): GLESInternalRT {
        if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > 0x7fffffff || height > 0x7fffffff)
            throw new RangeError("MRT dimensions must be positive integers.");
        if (!Array.isArray(colorFormats) || !colorFormats.length || colorFormats[0] == null)
            throw new RangeError("MRT requires color attachment 0 and a non-empty color layout.");
        // JSBind numeric vectors cannot represent null; use the explicit None sentinel
        // without compacting slots, so shader output locations keep their indices.
        const formats = Array.from(colorFormats, format => {
            if (format == null)
                return RenderTargetFormat.None;
            if (!Number.isInteger(format) || format === RenderTargetFormat.None)
                throw new TypeError("MRT color formats must be valid format values or null.");
            return format;
        });
        return new GLESInternalRT(this._native.createMultiRenderTargetInternal(width, height, formats, depthStencilFormat, color0SRGB));
    }

    createRenderTargetInternal(width: number, height: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number, storage: boolean): GLESInternalRT {
        return new GLESInternalRT(this._native.createRenderTargetInternal(width, height, colorFormat, depthStencilFormat ? depthStencilFormat : RenderTargetFormat.None, generateMipmap, sRGB, multiSamples));
    }

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): GLESInternalRT {
        return new GLESInternalRT(this._native.createRenderTargetCubeInternal(size, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples));
    }

    createRenderTextureCubeInternal(dimension: TextureDimension, size: number, format: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean): GLESInternalTex {
        return new GLESInternalTex(this._native.createRenderTextureCubeInternal(dimension, size, format, generateMipmap, sRGB));
    }

    createRenderTargetDepthTexture(renderTarget: GLESInternalRT, dimension: TextureDimension, width: number, height: number): GLESInternalTex {
        if (!renderTarget || renderTarget.destroyed || renderTarget._owner)
            throw new Error("Cannot replace depth storage on a disposed or borrowed OpenGLES render target.");
        if (renderTarget.colorFormats && (dimension !== TextureDimension.Tex2D ||
            width !== renderTarget._textures[0].width || height !== renderTarget._textures[0].height))
            throw new RangeError("MRT depth dimensions must match the 2D color attachments.");
        const nativeTexture = this._native.createRenderTargetDepthTexture(renderTarget._nativeObj, dimension, width, height);
        const texture = nativeTexture ? new GLESInternalTex(nativeTexture) : null;
        renderTarget._depthTextureRef = texture;
        return texture;
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

    async readRenderTargetPixelDataAsync(renderTarget: GLESInternalRT, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView, attachmentIndex: number = 0): Promise<ArrayBufferView> { //兼容WGSL
        if (!Number.isInteger(attachmentIndex) || attachmentIndex < 0)
            throw new RangeError("Color attachment index must be a non-negative integer.");
        if (!renderTarget || renderTarget.destroyed)
            throw new Error("Cannot read a missing or disposed OpenGLES render target.");
        if (!renderTarget.colorFormats) {
            if (attachmentIndex !== 0)
                throw new RangeError("An ordinary OpenGLES render target only has color attachment 0.");
            return this.readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out);
        }
        const format = renderTarget.colorFormats[attachmentIndex];
        if (attachmentIndex >= renderTarget.colorFormats.length || format == null)
            throw new RangeError("MRT color attachment is empty or out of range.");
        if (!Number.isInteger(xOffset) || !Number.isInteger(yOffset) || !Number.isInteger(width) || !Number.isInteger(height))
            throw new RangeError("MRT readback rectangle must use integer coordinates and dimensions.");
        const texture = renderTarget._textures[attachmentIndex];
        if (xOffset < 0 || yOffset < 0 || width <= 0 || height <= 0 ||
            width > texture.width || height > texture.height || xOffset > texture.width - width || yOffset > texture.height - height)
            throw new RangeError("MRT readback rectangle is outside the color attachment.");
        const bytePixels = format === RenderTargetFormat.R8G8B8 || format === RenderTargetFormat.R8G8B8A8;
        if (bytePixels ? !(out instanceof Uint8Array || out instanceof Uint8ClampedArray) : !(out instanceof Float32Array))
            throw new TypeError("MRT readback requires a byte view for byte attachments and Float32Array for floating-point attachments.");
        const byteLength = width * height * 4 * (bytePixels ? 1 : 4);
        if (out.byteLength < byteLength)
            throw new RangeError(`MRT readback output requires at least ${byteLength} bytes.`);
        return this._native.readMultiRenderTargetPixelData(renderTarget._nativeObj, xOffset, yOffset, width, height, out, attachmentIndex);
    }

    updateVideoTexture(texture: GLESInternalTex, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
        if (texture && video) {
            this._native.updateVideoTexture(texture._nativeObj, (video as any)._nativeObj.conchImgId, premultiplyAlpha, invertY);
        }
    }
}
