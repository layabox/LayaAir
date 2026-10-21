import { Config } from "../../../../Config";
import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";

export class NoRenderEngine implements IRenderEngine {
    _framePassCount: number = 0;
    _context: any;
    _isShaderDebugMode: boolean;
    _enableStatistics: boolean;
    _remapZ: boolean;
    _screenInvertY: boolean;
    _lodTextureSample: boolean;
    _breakTextureSample: boolean;
    initRenderEngine(canvas: HTMLCanvasElement): void {
    }
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
    }
    resizeOffScreen(width: number, height: number): void {
    }
    endFrame(): void {

    }
    startFrame(): void {

    }

    /**@internal */
    private _propertyNameMap: any = {};
    /**@internal */
    private _propertyNameCounter: number = 0;
    propertyNameToID(name: string): number {
        if (this._propertyNameMap[name] != null) {
            return this._propertyNameMap[name];
        } else {
            var id: number = this._propertyNameCounter++;
            this._propertyNameMap[name] = id;
            this._propertyNameMap[id] = name;
            return id;
        }
    }
    propertyIDToName(id: number): string {
        return this._propertyNameMap[id];
    }

    /**@internal */
    private static _defineMap: { [key: string]: ShaderDefine } = {};
    /**@internal */
    private static _defineCounter: number = 0;
    static _maskMap: Array<{ [key: number]: string }> = [];
    getDefineByName(name: string): ShaderDefine {
        var define: ShaderDefine = NoRenderEngine._defineMap[name];
        if (!define) {
            var maskMap = NoRenderEngine._maskMap;
            var counter: number = NoRenderEngine._defineCounter;
            var index: number = Math.floor(counter / 32);
            var value: number = 1 << counter % 32;
            define = new ShaderDefine(index, value);
            NoRenderEngine._defineMap[name] = define;
            if (index == maskMap.length) {
                maskMap.length++;
                maskMap[index] = {};
            }
            maskMap[index][value] = name;
            NoRenderEngine._defineCounter++;
        }
        return define;
    }
    getNamesByDefineData(defineData: IDefineDatas, out: string[]): void {
        var maskMap: Array<{ [key: number]: string }> = NoRenderEngine._maskMap;
        var mask: Array<number> = defineData._mask;
        out.length = 0;
        for (var i: number = 0, n: number = defineData._length; i < n; i++) {
            var subMaskMap: { [key: number]: string } = maskMap[i];
            var subMask: number = mask[i];
            for (var j: number = 0; j < 32; j++) {
                var d: number = 1 << j;
                if (subMask > 0 && d > subMask)
                    break;
                if (subMask & d)
                    out.push(subMaskMap[d]);
            }
        }
    }
    addTexGammaDefine(key: number, value: ShaderDefine): void {
    }
    getParams(params: RenderParams): number {
        return 0;
    }
    getCapable(capatableType: RenderCapable): boolean {
        return false;
    }
    getTextureContext(): ITextureContext {
        return new NoTextureContext();
    }
}

export class NoInternalTexture implements InternalTexture {
    resource: any;
    width: number;
    height: number;
    depth: number;
    isPotSize: boolean;
    mipmap: boolean;
    mipmapCount: number;
    filterMode: FilterMode = FilterMode.Bilinear;
    wrapU: WrapMode = WrapMode.Repeat;
    wrapV: WrapMode = WrapMode.Repeat;
    wrapW: WrapMode = WrapMode.Repeat;
    anisoLevel: number = 1;
    baseMipmapLevel: number = 0;
    maxMipmapLevel: number = 0;
    compareMode: TextureCompareMode = TextureCompareMode.None;
    gpuMemory: number = 0;
    useSRGBLoad: boolean = false;
    gammaCorrection: number = 1;
    dispose(): void {
    }
}

export class NoInternalRT implements InternalRenderTarget {
    _isCube: boolean = false;
    _samples: number = 1;
    _generateMipmap: boolean = false;
    _textures: InternalTexture[] = [];
    _texturesResolve?: InternalTexture[];
    _depthTexture: InternalTexture;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean;
    gpuMemory: number = 0;
    dispose(): void {
        for (const texture of this._textures) texture.dispose();
        this._textures.length = 0;
        this._depthTexture?.dispose();
        this._depthTexture = null;
    }

}


export class NoTextureContext implements ITextureContext {
    private _createRenderTarget(dimension: TextureDimension, width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): NoInternalRT {
        const texture = this.createTexture3DInternal(dimension, width, height, depth, <TextureFormat><number>colorFormat, generateMipmap, sRGB, false);
        const renderTarget = new NoInternalRT();
        renderTarget._textures.push(texture);
        renderTarget._isCube = dimension === TextureDimension.Cube;
        renderTarget._samples = Math.max(1, multiSamples);
        renderTarget._generateMipmap = texture.mipmap;
        renderTarget.colorFormat = colorFormat;
        renderTarget.depthStencilFormat = depthStencilFormat;
        renderTarget.isSRGB = sRGB;
        return renderTarget;
    }

    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        return this._createRenderTarget(TextureDimension.Texture2DArray, width, height, depth, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples);
    }
    needBitmap: boolean = false;
    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        let internalTex = new NoInternalTexture();
        internalTex.width = width;
        internalTex.height = height;
        internalTex.depth = 1;
        internalTex.isPotSize = width > 0 && height > 0 && (width & (width - 1)) === 0 && (height & (height - 1)) === 0;
        internalTex.mipmap = generateMipmap;
        internalTex.mipmapCount = generateMipmap ? 1 + Math.floor(Math.log2(Math.max(1, width, height))) : 1;
        internalTex.maxMipmapLevel = internalTex.mipmapCount - 1;
        internalTex.gammaCorrection = sRGB ? 2.2 : 1;
        return internalTex;
    }
    setTextureImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTextureSubImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTexturePixelsData(texture: InternalTexture, source: ArrayBufferView, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    initVideoTextureData(texture: InternalTexture): void {
    }
    setTextureSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTextureDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void {
    }
    setTextureKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void {
    }
    setTextureHDRData(texture: InternalTexture, hdrInfo: HDRTextureInfo): void {
    }
    setCubeImageData(texture: InternalTexture, sources: (HTMLImageElement | HTMLCanvasElement | ImageBitmap)[], premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setCubePixelsData(texture: InternalTexture, source: ArrayBufferView[], premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setCubeSubPixelData(texture: InternalTexture, source: ArrayBufferView[], mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, width: number, height: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setCubeDDSData(texture: InternalTexture, ddsInfo: DDSTextureInfo): void {
    }
    setCubeKTXData(texture: InternalTexture, ktxInfo: KTXTextureInfo): void {
    }
    setTextureCompareMode(texture: InternalTexture, compareMode: TextureCompareMode): TextureCompareMode {
        texture.compareMode = compareMode;
        return compareMode;
    }
    createMultiRenderTargetInternal(width: number, height: number, colorFormats: readonly RenderTargetFormat[], depthStencilFormat: RenderTargetFormat): InternalRenderTarget {
        throw new Error("NoRender createMultiRenderTargetInternal is not implemented.");
    }
    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number, storage: boolean): InternalRenderTarget {
        return this._createRenderTarget(TextureDimension.Tex2D, width, height, 1, format, depthStencilFormat, generateMipmap, sRGB, multiSamples);
    }
    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        return this._createRenderTarget(TextureDimension.Cube, size, size, 1, colorFormat, depthStencilFormat, generateMipmap, sRGB, multiSamples);
    }
    createRenderTargetDepthTexture(renderTarget: InternalRenderTarget, dimension: TextureDimension, width: number, height: number): InternalTexture {
        const texture = this.createTextureInternal(dimension, width, height, <TextureFormat><number>renderTarget.depthStencilFormat, false, false, false);
        renderTarget._depthTexture = texture;
        return texture;
    }
    bindRenderTarget(renderTarget: InternalRenderTarget, faceIndex?: number): void {
    }
    bindoutScreenTarget(): void {
    }
    unbindRenderTarget(renderTarget: InternalRenderTarget): void {
    }
    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        // No GPU pixels exist. Return a deterministic blank image using the caller's view.
        if (!out) {
            const format = renderTarget.colorFormat;
            const floatFormat = format === RenderTargetFormat.R16G16B16 || format === RenderTargetFormat.R16G16B16A16 ||
                format === RenderTargetFormat.R32G32B32 || format === RenderTargetFormat.R32G32B32A32;
            const channels = format === RenderTargetFormat.R8G8B8 || format === RenderTargetFormat.R16G16B16 ||
                format === RenderTargetFormat.R32G32B32 ? 3 : 4;
            out = floatFormat ? new Float32Array(width * height * channels) : new Uint8Array(width * height * channels);
        }
        new Uint8Array(out.buffer, out.byteOffset, out.byteLength).fill(0);
        return out;
    }
    readRenderTargetPixelDataAsync(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView, attachmentIndex: number = 0): Promise<ArrayBufferView> {
        if (attachmentIndex !== 0)
            return Promise.reject(new Error("NoRender readRenderTargetPixelDataAsync currently only supports color attachment 0."));
        return Promise.resolve(this.readRenderTargetPixelData(renderTarget, xOffset, yOffset, width, height, out));
    }
    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        const texture = this.createTextureInternal(dimension, width, height, format, generateMipmap, sRGB, premultipliedAlpha);
        texture.depth = depth;
        if (generateMipmap && dimension === TextureDimension.Tex3D) {
            texture.mipmapCount = 1 + Math.floor(Math.log2(Math.max(1, width, height, depth)));
            texture.maxMipmapLevel = texture.mipmapCount - 1;
        }
        return texture;
    }
    setTexture3DImageData(texture: InternalTexture, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTexture3DPixelsData(texture: InternalTexture, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTexture3DSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }

}
