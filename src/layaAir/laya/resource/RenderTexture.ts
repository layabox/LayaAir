import { Config3D } from "../../Config3D";
import { LayaGL } from "../layagl/LayaGL";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { BaseTexture } from "./BaseTexture";

/**
 * @en Depth texture mode
 * @zh 深度贴图模式
 */
export enum DepthTextureMode {
    /**
     * @en Do not generate depth texture.
     * @zh 不生成深度贴图。
     */
    None = 0,
    /**
     * @en Generate depth texture.
     * @zh 生成深度贴图。
     */
    Depth = 1,
    /**
     * @en Generate depth and normal textures.
     * @zh 生成深度和法线贴图。
     */
    DepthNormals = 2,
    /**
     * @en Generate depth and depth normals textures, and indicate whether motion vectors should be rendered.
     * @zh 生成深度和深度法线贴图，并指示是否应该渲染运动矢量。
     */
    DepthAndDepthNormals = 3,
    /**
     * @en Generate motion vectors texture.
     * @zh 生成运动矢量贴图。
     */
    MotionVectors = 4,
}

/**
 * @en RenderTexture class used to create render texture.
 * @zh RenderTexture 类用于创建渲染纹理。
 */
export class RenderTexture extends BaseTexture implements IRenderTarget {

    private static _pool: RenderTexture[] = [];
    private static _poolMemory: number = 0;

    /**
     * @en Creates a RenderTexture instance from the pool.
     * @param width Width of the RenderTexture.
     * @param height Height of the RenderTexture.
     * @param colorFormat Color format of the RenderTexture.
     * @param depthFormat Depth format of the RenderTexture.
     * @param mipmap Whether to generate mipmaps for the RenderTexture.
     * @param multiSamples Number of multisamples for the RenderTexture.
     * @param depthTexture Whether to generate a depth texture.
     * @param sRGB Whether the RenderTexture is in sRGB space.
     * @returns A RenderTexture instance.
     * @zh 从对象池中创建一个RenderTexture实例。
     * @param width 宽度。
     * @param height 高度。
     * @param colorFormat 颜色格式。
     * @param depthFormat 深度格式。
     * @param mipmap 是否生成多级纹理。
     * @param multiSamples 多采样次数。
     * @param depthTexture 是否生成深度纹理。
     * @param sRGB 是否sRGB空间。
     * @returns RenderTexture实例。
     */
    static createFromPool(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, mipmap: boolean = false, multiSamples: number = 1, depthTexture: boolean = false, sRGB: boolean = false) {

        // todo mipmap 判断
        mipmap = mipmap && (width & (width - 1)) === 0 && (height & (height - 1)) === 0;

        let n = RenderTexture._pool.length;
        for (let index = 0; index < n; index++) {
            let rt = RenderTexture._pool[index];

            if (rt.width == width && rt.height == height && rt.colorFormat == colorFormat && rt.depthStencilFormat == depthFormat && rt._generateMipmap == mipmap && rt.multiSamples == multiSamples && rt.generateDepthTexture == depthTexture && rt._gammaSpace == sRGB) {
                rt._inPool = false;
                let end = RenderTexture._pool[n - 1];
                RenderTexture._pool[index] = end;
                RenderTexture._pool.length -= 1;
                RenderTexture._poolMemory -= (rt._renderTarget.gpuMemory / 1024 / 1024);
                return rt;
            }
        }

        let rt = new RenderTexture(width, height, colorFormat, depthFormat, mipmap, multiSamples, depthTexture, sRGB);
        rt.lock = true;
        return rt;
    }

    /**
     * @en Recovers the RenderTexture to the pool for reuse.
     * @param rt The RenderTexture to recover.
     * @zh 回收渲染纹理到对象池以便重用。
     * @param rt 要回收的渲染纹理。
     */
    static recoverToPool(rt: RenderTexture): void {
        if (rt._inPool || rt.destroyed)
            return;
        RenderTexture._pool.push(rt);
        RenderTexture._poolMemory += (rt._renderTarget.gpuMemory / 1024 / 1024);
        rt._inPool = true;
    }

    /**
     * @en Clears the RenderTexture pool.
     * @zh 清空渲染纹理对象池。
     */
    static clearPool() {
        if (RenderTexture._poolMemory < Config3D.defaultCacheRTMemory) {
            return;
        }
        for (var i in RenderTexture._pool) {
            RenderTexture._pool[i].destroy();
        }
        RenderTexture._pool = [];
        RenderTexture._poolMemory = 0;
    }

    /** 最后绑定到主画布上的结果 此值可能为null*/
    private static _bindCanvasRender: RenderTexture;
    /**
     * @en The RenderTexture bound to the main canvas.
     * @zh 绑定到主画布上的渲染纹理。
     */
    static get bindCanvasRender(): RenderTexture {
        return RenderTexture._bindCanvasRender;
    }

    static set bindCanvasRender(value: RenderTexture) {
        if (value != this._bindCanvasRender)
            //(this._bindCanvasRender) && RenderTexture.recoverToPool(this._bindCanvasRender);
            this._bindCanvasRender = value;
    }


    /**
     * @internal
     * 是否在对象池中
     */
    _inPool: boolean = false;

    /**
     * 是否是相机目标纹理
     * @internal
     */
    _isCameraTarget: boolean = false;

    /**
     * 渲染纹理
     * @internal
     */
    _renderTarget: InternalRenderTarget;

    private _generateDepthTexture: boolean = false;
    /**
     * @en Whether to generate depth texture maps.
     * @zh 是否生成深度纹理贴图。
     */
    public get generateDepthTexture(): boolean {
        return this._generateDepthTexture;
    }
    public set generateDepthTexture(value: boolean) {

        if (this.depthStencilFormat == RenderTargetFormat.None) {
            this._generateDepthTexture = false;
            return;
        }

        // todo  重复 设置
        if (value && !this._depthStencilTexture) {
            // todo  base texture format 移出构造函数
            this._depthStencilTexture = new BaseTexture(this.width, this.height, this.depthStencilFormat);
            // @ts-ignore
            this._depthStencilTexture._dimension = TextureDimension.Tex2D;

            this._depthStencilTexture._texture = LayaGL.textureContext.createRenderTargetDepthTexture(this._renderTarget, TextureDimension.Tex2D, this.width, this.height);

        }

        this._generateDepthTexture = value;
    }
    /**
     * @en Depth and stencil removal texture mapping
     * @zh 深度与模板剔除纹理贴图
     */
    private _depthStencilTexture: BaseTexture;

    /**
     * @en Depth and stencil removal texture mapping
     * @zh 深度与模板剔除纹理贴图
     */
    get depthStencilTexture(): BaseTexture {
        return this._depthStencilTexture;
    }

    /**
     * 是否生成多级纹理
     * @internal
     */
    _generateMipmap: boolean;

    /**
     * @en Color format
     * @zh 颜色格式
     */
    get colorFormat(): RenderTargetFormat {
        return this._renderTarget.colorFormat;
    }
    /**
     * @en Depth and stencil removal format
     * @zh 深度与模板剔除的格式
     */
    protected _depthStencilFormat: RenderTargetFormat;
    /**
     * @en Depth and stencil removal format
     * @zh 深度与模板剔除的格式
     */
    get depthStencilFormat(): RenderTargetFormat {
        return this._renderTarget.depthStencilFormat;
    }

    /**
     * @en Number of multisamples.
     * @zh 多采样次数
     */
    protected _multiSamples: number;
    /**
     * @en Number of multisamples.
     * @zh 多采样次数
     */
    public get multiSamples(): number {
        return this._renderTarget._samples;
    }

    /**
     * @en Whether the RenderTexture is a cube texture.
     * @zh 是否是立方体贴图
     */
    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    /**
     * @en Sampling times
     * @zh 采样次数
     */
    get samples(): number {
        return this._renderTarget._samples;
    }

    /**
     * @en Whether to generate multi-level textures.
     * @zh 是否生成多级纹理。
     */
    get generateMipmap(): boolean {
        return this._renderTarget._generateMipmap;
    }

    /**
     * @en Create an instance of the RenderTexture class.
     * @param width Width of the RenderTexture.
     * @param height Height of the RenderTexture.
     * @param colorFormat Color format for the RenderTexture. 
     * @param depthFormat Depth format for the RenderTexture. 
     * @param generateMipmap Whether to generate mipmaps for the RenderTexture. 
     * @param multiSamples Number of multisamples for the RenderTexture.
     * @param generateDepthTexture Whether to generate a depth texture for the RenderTexture. 
     * @param sRGB Whether the RenderTexture uses sRGB color space. 
     * @zh 创建 RenderTexture 类的实例。
     * @param width 宽度。
     * @param height 高度。
     * @param colorFormat 颜色格式。
     * @param depthFormat 深度格式。
     * @param generateMipmap 是否生成多级纹理。
     * @param multiSamples 多采样次数。
     * @param generateDepthTexture 是否生成深度纹理。
     * @param sRGB 是否sRGB空间。
     */
    constructor(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean = false, multiSamples: number = 1, generateDepthTexture: boolean = false, sRGB: boolean = false) {
        super(width, height, colorFormat);

        this._gammaSpace = sRGB;

        this._depthStencilFormat = (depthFormat == null ? RenderTargetFormat.None : depthFormat);

        this._generateMipmap = generateMipmap;
        this._multiSamples = multiSamples;
        this._generateDepthTexture = generateDepthTexture;

        // todo format 
        this._createRenderTarget();
    }

    /**
     * 创建渲染纹理
     * @internal
     */
    _createRenderTarget() {
        this._dimension = TextureDimension.Tex2D;
        this._renderTarget = LayaGL.textureContext.createRenderTargetInternal(this.width, this.height, <RenderTargetFormat><any>this._format, this._depthStencilFormat, this._generateMipmap, this._gammaSpace, this._multiSamples);

        // rt 格式 宽高可能不支持
        this._generateMipmap = this._renderTarget._generateMipmap;
        if (this._renderTarget._texturesResolve)
            this._texture = this._renderTarget._texturesResolve[0];
        else this._texture = this._renderTarget._textures[0];

        this.generateDepthTexture = this._generateDepthTexture;
    }

    /**
     * @en Recreates the RenderTexture with the specified parameters.
     * @param width New width of the RenderTexture.
     * @param height New height of the RenderTexture.
     * @param colorFormat New color format for the RenderTexture.
     * @param depthFormat New depth format for the RenderTexture. 
     * @param generateMipmap Whether to regenerate mipmaps for the RenderTexture. 
     * @param multiSamples New number of multisamples for the RenderTexture. 
     * @param generateDepthTexture Whether to generate a new depth texture for the RenderTexture. 
     * @param sRGB Whether the RenderTexture uses sRGB color space. 
     * @zh 使用指定参数重新创建RenderTexture。
     * @param width 新宽度。
     * @param height 新高度。
     * @param colorFormat 新颜色格式。
     * @param depthFormat 新深度格式。
     * @param generateMipmap 是否重新生成多级纹理。
     * @param multiSamples 新多采样次数。
     * @param generateDepthTexture 是否生成新的深度纹理。
     * @param sRGB 是否sRGB空间。
     */
    recreate(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean = false, multiSamples: number = 1, generateDepthTexture: boolean = false, sRGB: boolean = false) {
        this._width = width;
        this._height = height;
        this._format = <TextureFormat><any>colorFormat;

        this._gammaSpace = sRGB;

        this._depthStencilFormat = (depthFormat == null ? RenderTargetFormat.None : depthFormat);

        this._generateMipmap = generateMipmap;
        this._multiSamples = multiSamples;
        this._generateDepthTexture = generateDepthTexture;

        this._disposeResource();

        // todo format 
        this._createRenderTarget();
    }

    /**
     * @deprecated 请使用getDataAsync函数代替
     * 获取渲染纹理的像素数据
     * @param xOffset x偏移值
     * @param yOffset y偏移值
     * @param width 宽度
     * @param height 高度
     * @param out 输出
     * @returns 二进制数据
     */
    getData(xOffset: number, yOffset: number, width: number, height: number, out: Uint8Array | Float32Array): Uint8Array | Float32Array {
        LayaGL.textureContext.readRenderTargetPixelData(this._renderTarget, xOffset, yOffset, width, height, out);
        return out;
    }

    /**
     * @en Asynchronously retrieves pixel data from the RenderTexture.
     * @param xOffset The x-offset value.
     * @param yOffset The y-offset value.
     * @param width The width of the area to retrieve.
     * @param height The height of the area to retrieve.
     * @param out The array to hold the output data.
     * @returns binary data
     * @zh 异步获取渲染纹理的像素数据。
     * @param xOffset x偏移值
     * @param yOffset y偏移值
     * @param width 要检索的区域的宽度。
     * @param height 要检索的区域的高度。
     * @param out 用于保存输出数据的数组。
     * @returns 二进制数据
     */
    getDataAsync(xOffset: number, yOffset: number, width: number, height: number, out: Uint8Array | Float32Array) { //兼容WGSL
        return LayaGL.textureContext.readRenderTargetPixelDataAsync(this._renderTarget, xOffset, yOffset, width, height, out);
    }

    /**
     * @en Destroy the Resource.
     * @zh 销毁资源
     */
    protected _disposeResource(): void {
        this._renderTarget.dispose();
        this._renderTarget = null;
        this._depthStencilTexture?.destroy();
        this._depthStencilTexture = null;
    }
}