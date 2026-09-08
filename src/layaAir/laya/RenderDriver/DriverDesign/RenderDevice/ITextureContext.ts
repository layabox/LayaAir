import { DDSTextureInfo } from "../../../RenderEngine/DDSTextureInfo";
import { HDRTextureInfo } from "../../../RenderEngine/HDRTextureInfo";
import { KTXTextureInfo } from "../../../RenderEngine/KTXTextureInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureCompareMode } from "../../../RenderEngine/RenderEnum/TextureCompareMode";
import { TextureDimension } from "../../../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../../../RenderEngine/RenderEnum/TextureFormat";
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

    createRenderTargetInternal(width: number, height: number, format: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number, storage: boolean): InternalRenderTarget;

    /**
     * @en Creates a 2D MRT owning its color attachments and optional shared depth/stencil resource.
     * The initial contract is single-sampled, linear color, mip level 0 only. Unsupported backends must throw, not fall back to a single attachment.
     * Color formats use ordinary render-target mappings. Callers must check device format support before creation; readback support is validated separately.
     * @param width Positive integer width shared by all attachments.
     * @param height Positive integer height shared by all attachments.
     * @param colorFormats Non-empty ordered list of all color formats, including attachment 0. Index i maps to shader output location i. The implementation must not modify this list.
     * @param depthStencilFormat Shared depth/stencil format, or RenderTargetFormat.None.
     * @returns A render target that owns and disposes all resources it creates.
     * @zh 创建拥有颜色附件及可选共享深度/模板资源的 2D MRT。
     * 首版约定为单采样、线性颜色、仅 mip 0；不支持的后端必须报错，不得静默退化为单附件。
     * 颜色格式沿用普通渲染目标的映射；调用方须在创建前确认设备格式支持，读回支持单独校验。
     * @param width 所有附件共用的宽度，须为正整数。
     * @param height 所有附件共用的高度，须为正整数。
     * @param colorFormats 包含附件 0 的全部颜色格式，非空且有序；索引 i 对应 Shader 输出 location i。实现不得修改传入列表。
     * @param depthStencilFormat 共享深度/模板格式，无深度时传 RenderTargetFormat.None。
     * @returns 统一拥有并释放所创建资源的渲染目标。
     */
    createMultiRenderTargetInternal(width: number, height: number, colorFormats: readonly RenderTargetFormat[], depthStencilFormat: RenderTargetFormat): InternalRenderTarget;

    /**
     * @internal
     * @en Creates a non-owning MRT binding from existing single-color 2D targets.
     * Target i supplies color attachment i; target 0 also supplies depth/stencil.
     * All targets must be live, distinct, same-sized, single-sampled and without mipmaps.
     * No texture storage is allocated or copied. Disposing the view only releases its binding.
     * The caller must keep the source owners alive and out of the pool, and dispose the view
     * before replacing/resizing/recycling their attachments. Nested views are not supported.
     * @zh 从现有单颜色 2D RT 创建不拥有附件的 MRT 绑定。第 i 个 RT 提供颜色附件 i，
     * 第 0 个 RT 同时提供深度/模板；要求资源有效、互不重复、同尺寸、单采样且无 mipmap。
     * 不分配或复制纹理存储，销毁视图只释放绑定。调用方须保持源资源存活且不入池，
     * 在替换、重建或回收源附件前销毁视图；不支持嵌套借用视图。
     */
    createMultiRenderTargetViewInternal(renderTargets: readonly InternalRenderTarget[]): InternalRenderTarget;

    createRenderTargetCubeInternal(size: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    createRenderTargetDepthTexture(renderTarget: InternalRenderTarget, dimension: TextureDimension, width: number, height: number): InternalTexture;

    createRenderTargetArrayInternal(width: number, height: number, depth: number, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, generateMipmap: boolean, sRGB: boolean, multiSamples: number): InternalRenderTarget;

    bindRenderTarget(renderTarget: InternalRenderTarget, faceIndex?: number): void;
    bindoutScreenTarget(): void;
    unbindRenderTarget(renderTarget: InternalRenderTarget): void;

    /**
     * @deprecated 请使用readRenderTargetPixelDataAsync函数代替
     * @param renderTarget 
     * @param xOffset 
     * @param yOffset 
     * @param width 
     * @param height 
     * @param out 
     */
    readRenderTargetPixelData(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView): ArrayBufferView;
    /**
     * @en Asynchronously reads a color attachment. Omitting attachmentIndex preserves the existing attachment 0 behavior.
     * @param attachmentIndex Zero-based color attachment index, not a cube face, array layer, or depth attachment. Defaults to 0. Invalid or unsupported indices must reject the promise, not read attachment 0 instead.
     * @zh 异步读取颜色附件；省略 attachmentIndex 时保持原有附件 0 的读回行为。
     * @param attachmentIndex 从 0 开始的颜色附件索引，不是 Cube 面、数组层或深度附件。默认为 0；非法或尚不支持的索引必须拒绝 Promise，不得改读附件 0。
     */
    readRenderTargetPixelDataAsync(renderTarget: InternalRenderTarget, xOffset: number, yOffset: number, width: number, height: number, out: ArrayBufferView, attachmentIndex?: number): Promise<ArrayBufferView>; //兼容WGSL

    updateVideoTexture(texture: InternalTexture, video: HTMLVideoElement, premultiplyAlpha: boolean, invertY: boolean): void;

    createTexture3DInternal(dimension: TextureDimension, width: number, height: number, depth: number, format: TextureFormat, generateMipmap: boolean, sRGB: boolean, premultipliedAlpha: boolean): InternalTexture;

    setTexture3DImageData(texture: InternalTexture, source: HTMLImageElement[] | HTMLCanvasElement[] | ImageBitmap[], depth: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexture3DPixelsData(texture: InternalTexture, source: ArrayBufferView, depth: number, premultiplyAlpha: boolean, invertY: boolean): void;

    setTexture3DSubPixelsData(texture: InternalTexture, source: ArrayBufferView, mipmapLevel: number, generateMipmap: boolean, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number, premultiplyAlpha: boolean, invertY: boolean): void;

}
