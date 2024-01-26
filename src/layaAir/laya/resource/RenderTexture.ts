import { Config3D } from "../../Config3D";
import { LayaGL } from "../layagl/LayaGL";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { BaseTexture } from "./BaseTexture";

/**
 * 深度贴图模式
 */
export enum DepthTextureMode {
    /**不生成深度贴图 */
    None = 0,
    /**生成深度贴图 */
    Depth = 1,
    /**生成深度+法线贴图 */
    DepthNormals = 2,
    /**是否应渲染运动矢量  TODO*/
    DepthAndDepthNormals = 3,
    MotionVectors = 4,
}
export class RenderTexture extends BaseTexture implements IRenderTarget {

    private static _pool: RenderTexture[] = [];
    private static _poolMemory: number = 0;

    /**
     * 创建一个RenderTexture
     * @param width
     * @param height
     * @param colorFormat
     * @param depthFormat
     * @param mipmap 
     * @param multiSamples 
     * @param depthTexture 
     * @param sRGB 
     * @returns 
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

    static recoverToPool(rt: RenderTexture): void {
        if (rt._inPool || rt.destroyed)
            return;
        RenderTexture._pool.push(rt);
        RenderTexture._poolMemory += (rt._renderTarget.gpuMemory / 1024 / 1024);
        rt._inPool = true;
    }

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

    /** @internal 最后绑定到主画布上的结果 此值可能为null*/
    private static _bindCanvasRender: RenderTexture;
    /**
     * 绑定到主画布上的RenderTexture
     */
    static get bindCanvasRender(): RenderTexture {
        return RenderTexture._bindCanvasRender;
    }

    static set bindCanvasRender(value: RenderTexture) {
        if (value != this._bindCanvasRender)
            //(this._bindCanvasRender) && RenderTexture.recoverToPool(this._bindCanvasRender);
            this._bindCanvasRender = value;
    }


    _inPool: boolean = false;

    _isCameraTarget: boolean = false;

    _renderTarget: InternalRenderTarget;

    private _generateDepthTexture: boolean = false;
    public get generateDepthTexture(): boolean {
        return this._generateDepthTexture;
    }
    public set generateDepthTexture(value: boolean) {

        // todo  重复 设置
        if (value && !this._depthStencilTexture) {
            // todo  base texture format 移出构造函数
            this._depthStencilTexture = new BaseTexture(this.width, this.height, this.depthStencilFormat);
            // @ts-ignore
            this._depthStencilTexture._dimension = TextureDimension.Tex2D;


            this._depthStencilTexture._texture = LayaGL.textureContext.createRenderTextureInternal(TextureDimension.Tex2D, this.width, this.height, this.depthStencilFormat, false, false);

            LayaGL.textureContext.setupRendertargetTextureAttachment(this._renderTarget, this._depthStencilTexture._texture);

        }

        this._generateDepthTexture = value;
    }

    private _depthStencilTexture: BaseTexture;

    get depthStencilTexture(): BaseTexture {
        return this._depthStencilTexture;
    }

    _generateMipmap: boolean;

    get colorFormat(): RenderTargetFormat {
        return this._renderTarget.colorFormat;
    }

    protected _depthStencilFormat: RenderTargetFormat;
    get depthStencilFormat(): RenderTargetFormat {
        return this._renderTarget.depthStencilFormat;
    }

    protected _multiSamples: number;
    public get multiSamples(): number {
        return this._renderTarget._samples;
    }

    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    get samples(): number {
        return this._renderTarget._samples;
    }

    get generateMipmap(): boolean {
        return this._renderTarget._generateMipmap;
    }

    /**
     * @param width 
     * @param height 
     * @param colorFormat 
     * @param depthFormat 
     * @param generateMipmap 
     * @param multiSamples 
     * @param generateDepthTexture 
     * @param sRGB 
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

    _createRenderTarget() {
        this._dimension = TextureDimension.Tex2D;
        this._renderTarget = LayaGL.textureContext.createRenderTargetInternal(this.width, this.height, <RenderTargetFormat><any>this._format, this._depthStencilFormat, this._generateMipmap, this._gammaSpace, this._multiSamples);

        // rt 格式 宽高可能不支持
        this._generateMipmap = this._renderTarget._generateMipmap;
        this._texture = this._renderTarget._textures[0];

        this.generateDepthTexture = this._generateDepthTexture;
    }

    //@internal
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

    // _start() {
    //     RenderTexture._configInstance.invertY = this._isCameraTarget;
    //     if (RenderTexture._currentActive != this) {
    //         RenderTexture._currentActive && RenderTexture._currentActive._end();
    //         RenderTexture._currentActive = this;
    //         LayaGL.textureContext.bindRenderTarget(this._renderTarget);
    //     }
    // }

    // _end() {
    //     RenderTexture._currentActive = null;

    //     LayaGL.textureContext.unbindRenderTarget(this._renderTarget);
    //     (this._isCameraTarget) && (RenderTexture._configInstance.invertY = false);
    // }

    getData(xOffset: number, yOffset: number, width: number, height: number, out: Uint8Array | Float32Array): Uint8Array | Float32Array {
        LayaGL.textureContext.readRenderTargetPixelData(this._renderTarget, xOffset, yOffset, width, height, out);
        return out;
    }

    protected _disposeResource(): void {

        // if (RenderTexture._currentActive == this) {
        //     this._end();
        // }

        this._renderTarget.dispose();
        this._renderTarget = null;
        this._depthStencilTexture?.destroy();
        this._depthStencilTexture = null;
    }

}