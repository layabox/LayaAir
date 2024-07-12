import { Config } from "../../../../Config";
import { Laya } from "../../../../Laya";
import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { FilterMode } from "../../../RenderEngine/RenderEnum/FilterMode";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { RenderParams } from "../../../RenderEngine/RenderEnum/RenderParams";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderEngine } from "../../DriverDesign/RenderDevice/IRenderEngine";
import { IRenderEngineFactory } from "../../DriverDesign/RenderDevice/IRenderEngineFactory";
import { ITextureContext } from "../../DriverDesign/RenderDevice/ITextureContext";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { IDefineDatas } from "../../RenderModuleData/Design/IDefineDatas";
import { ShaderDefine } from "../../RenderModuleData/Design/ShaderDefine";
import { GLBuffer } from "../../WebGLDriver/RenderDevice/WebGLEngine/GLBuffer";

export class NoRenderEngineFactory implements IRenderEngineFactory {
    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        return new UniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle);
    }
    createEngine(config: Config, canvas: any): Promise<void> {
        LayaGL.renderEngine = new NoRenderEngine();
        LayaGL.textureContext = LayaGL.renderEngine.getTextureContext();

        return Promise.resolve();
    }

}


export class NoRenderEngine implements IRenderEngine {
    _context: any;
    _isShaderDebugMode: boolean;
    _renderOBJCreateContext: IRenderEngineFactory;
    _enableStatistics: boolean;
    _remapZ: boolean;
    _screenInvertY: boolean;
    _lodTextureSample: boolean;
    _breakTextureSample: boolean;
    initRenderEngine(canvas: any): void {
    }
    copySubFrameBuffertoTex(texture: InternalTexture, level: number, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void {
    }
    resizeOffScreen(width: number, height: number): void {
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
    getCreateRenderOBJContext(): IRenderEngineFactory {
        return new NoRenderEngineFactory();
    }
    clearStatisticsInfo(): void {

    }
    getStatisticsInfo(info: GPUEngineStatisticsInfo): number {
        return 0
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
    filterMode: FilterMode;
    wrapU: WrapMode;
    wrapV: WrapMode;
    wrapW: WrapMode;
    anisoLevel: number;
    baseMipmapLevel: number;
    maxMipmapLevel: number;
    compareMode: TextureCompareMode;
    gpuMemory: number;
    useSRGBLoad: boolean;
    gammaCorrection: number;
    dispose(): void {
    }
}

export class NoInternalRT implements InternalRenderTarget {
    _isCube: boolean;
    _samples: number;
    _generateMipmap: boolean;
    _textures: InternalTexture[] = [];
    _texturesResolve?: InternalTexture[];
    _depthTexture: InternalTexture;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean;
    gpuMemory: number;
    dispose(): void {
    }

}


export class NoTextureContext implements ITextureContext {
    needBitmap: boolean;
    createTextureInternal(dimension: TextureDimension, width: number, height: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        let internalTex = new NoInternalTexture();
        internalTex.width = width;
        internalTex.height = height;
        internalTex.depth = 1;
        internalTex.mipmapCount = 1;
        internalTex.mipmap = false;
        internalTex.isPotSize = true;
        return internalTex;
    }
    setTextureImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTextureSubImageData(texture: InternalTexture, source: HTMLImageElement | HTMLCanvasElement | ImageBitmap, x: number, y: number, premultiplyAlpha: boolean, invertY: boolean): void {
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
        return TextureCompareMode.None;
    }
    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        multiSamples = 1;
        let texture = this.createTextureInternal(TextureDimension.Tex2D, width, height, TextureFormat.R8G8B8A8, generateMipmap, sRGB, false);
        let renderTarget = new NoInternalRT();
        renderTarget._textures.push(texture);
        return renderTarget;
    }
    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget {
        multiSamples = 1;
        let texture = this.createTextureInternal(TextureDimension.Cube, size, size, TextureFormat.R8G8B8A8, generateMipmap, sRGB, false);
        let renderTarget = new NoInternalRT();
        renderTarget._textures.push(texture);
        return renderTarget;
    }
    createRenderTargetDepthTexture(renderTarget: InternalRenderTarget, dimension: TextureDimension, width: number, height: number): InternalTexture {
        let internalTex = new NoInternalTexture();
        internalTex.width = width;
        internalTex.height = height;
        internalTex.depth = 1;
        internalTex.mipmapCount = 1;
        internalTex.mipmap = false;
        internalTex.isPotSize = true;
        return internalTex;
    }
    bindRenderTarget(renderTarget: InternalRenderTarget, faceIndex?: number): void {
    }
    bindoutScreenTarget(): void {
    }
    unbindRenderTarget(renderTarget: InternalRenderTarget): void {
    }
    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView {
        return new Float32Array()
    }
    readRenderTargetPixelDataAsync(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): Promise<ArrayBufferView> {
        return Promise.resolve(new Float32Array());
    }
    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    getRenderTextureData(internalTex: InternalRenderTarget, x: number, y: number, width: number, height: number): ArrayBufferView {
        return new Float32Array();
    }
    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture {
        let internalTex = new NoInternalTexture();
        internalTex.width = width;
        internalTex.height = height;
        internalTex.depth = 1;
        internalTex.mipmapCount = 1;
        internalTex.mipmap = false;
        internalTex.isPotSize = true;
        return internalTex;
    }
    setTexture3DImageData(texture: InternalTexture, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTexture3DPixelsData(texture: InternalTexture, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }
    setTexture3DSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void {
    }

}