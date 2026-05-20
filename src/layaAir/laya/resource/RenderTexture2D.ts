import { Texture2D } from "./Texture2D"
import { BaseTexture } from "./BaseTexture"
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { NotImplementedError } from "../utils/Error";
import { Stat } from "../utils/Stat";

/**
 * @en RenderTexture2D class used to create 2D render targets.
 * @zh RenderTexture2D 类用于创建2D渲染目标。
 */
export class RenderTexture2D extends BaseTexture implements IRenderTarget {
    static _empty: RenderTexture2D;
    /** @internal */
    static __init__() {
        // 0 像素webgpu 报错
        RenderTexture2D._empty = new RenderTexture2D(1, 1, RenderTargetFormat.R8G8B8, RenderTargetFormat.None);
        RenderTexture2D._empty.width = 0;
        RenderTexture2D._empty.height = 0;
        RenderTexture2D._empty.lock = true;
    }

    private static _currentActive: RenderTexture2D;

    private static _pool: RenderTexture2D[] = [];
    private static _poolMemory: number = 0;
    private static _poolTimeouts: Map<number, number> = new Map();
    /**
     * @en The timeout for cleanup checks.
     * @zh 清理检查的超时时间。
     * @default 30000
     */
    static cleanupTimeout: number = 30000;
    /**
     * @en The frame interval for cleanup checks.
     * @zh 清理检查的帧间隔。
     * @default 360
     */
    static cleanupFrameInterval: number = 360;
    /**
     * @en The maximum memory limit for the pool (in MB).
     * @zh 对象池的最大内存限制（单位：MB）。
     * @default 128
     */
    static maxPoolMemory: number = 128;

    // 上次清理的帧数
    private static _lastCleanupFrame: number = 0;

    /**
     * @en Creates a RenderTexture instance from the pool.
     * @param width Width of the RenderTexture.
     * @param height Height of the RenderTexture.
     * @param colorFormat Color format of the RenderTexture.
     * @param depthFormat Depth format of the RenderTexture.
     * @param multiSampler Multi sampler times.
     * @returns A RenderTexture instance.
     * @zh 从对象池中创建一个RenderTexture实例。
     * @param width 宽度。
     * @param height 高度。
     * @param colorFormat 颜色格式。
     * @param depthFormat 深度格式。
     * @param multiSampler 多采样次数。
     * @returns RenderTexture实例。
     */
    static createFromPool(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat , multiSampler = 1) {

        // 从后往前遍历，同时清理已销毁的对象
        for (let i = RenderTexture2D._pool.length - 1; i >= 0; i--) {
            let rt = RenderTexture2D._pool[i];

            if (rt.destroyed) {
                RenderTexture2D._pool.splice(i, 1);
                //已经被销毁了无法释放计数
                let gpuMem = rt._renderTarget ? (rt._renderTarget.gpuMemory / 1024 / 1024) : 0;
                RenderTexture2D._poolMemory -= gpuMem;
                RenderTexture2D._poolTimeouts.delete(rt._id);
                continue;
            }

            if (rt.width == width && rt.height == height && rt.getColorFormat() == colorFormat && rt.depthStencilFormat == depthFormat && rt._multiSamples == multiSampler) {
                rt._inPool = false;
                // 直接移除当前位置，避免再做尾部交换
                RenderTexture2D._pool.splice(i, 1);
                RenderTexture2D._poolMemory -= (rt._renderTarget.gpuMemory / 1024 / 1024);
                // 从池中取出时，移除时间记录
                RenderTexture2D._poolTimeouts.delete(rt._id);
                return rt;
            }
        }

        let rt = new RenderTexture2D(width, height, colorFormat, depthFormat , multiSampler);
        rt.lock = true;
        return rt;
    }

    /**
     * @en Recovers the RenderTexture2D to the pool for reuse.
     * @param rt The RenderTexture2D to recover.
     * @zh 回收渲染纹理到对象池以便重用。
     * @param rt 要回收的渲染纹理。
     */
    static recoverToPool(rt: RenderTexture2D): void {
        if (rt._inPool || rt.destroyed)
            return;
        RenderTexture2D._pool.push(rt);
        RenderTexture2D._poolMemory += (rt._renderTarget.gpuMemory / 1024 / 1024);
        rt._inPool = true;
        // 记录回收到池子的时间
        RenderTexture2D._poolTimeouts.set(rt.id, performance.now());
        
        // 检查是否超过限制，如果超过则清理
        RenderTexture2D._cleanupExcess();
    }

    /**
     * @en Clears the RenderTexture2D pool.
     * @zh 清空渲染纹理对象池。
     */
    static clearPool() {
        if (RenderTexture2D._poolMemory < 256) {
            return;
        }
        for (var i in RenderTexture2D._pool) {
            RenderTexture2D._pool[i].destroy();
        }
        RenderTexture2D._pool = [];
        RenderTexture2D._poolMemory = 0;
        RenderTexture2D._poolTimeouts.clear();
    }

    /**
     * @en Cleans up expired RenderTexture2D instances from the pool.
     * @returns Number of cleaned up instances.
     * @zh 清理池中过期的RenderTexture2D实例。
     * @returns 清理的实例数量。
     */
    static cleanupExpired(): number {
        let currentFrame = Stat.loopCount;
        // 检查是否到了清理的帧间隔
        if (currentFrame - RenderTexture2D._lastCleanupFrame < RenderTexture2D.cleanupFrameInterval) {
            return -1; // 跳过清理
        }
        
        // 更新上次清理的帧数
        RenderTexture2D._lastCleanupFrame = currentFrame;

        let timeout =  RenderTexture2D.cleanupTimeout;
        let currentTime = performance.now();
        let cleanedCount = 0;
        
        // 从后往前遍历，避免删除元素时索引问题
        for (let i = RenderTexture2D._pool.length - 1; i >= 0; i--) {
            let rt = RenderTexture2D._pool[i];
            let poolTime = RenderTexture2D._poolTimeouts.get(rt.id);
            
            if (poolTime && (currentTime - poolTime) > timeout) {
                // 从池中移除
                RenderTexture2D._pool.splice(i, 1);
                RenderTexture2D._poolMemory -= (rt._renderTarget.gpuMemory / 1024 / 1024);
                RenderTexture2D._poolTimeouts.delete(rt.id);
                rt.destroy();
                cleanedCount++;
            }
        }
        
        return cleanedCount;
    }

    /**
     * @internal
     * @en Cleans up excess objects from the pool when memory limit is exceeded.
     * @zh 当对象池超过内存限制时清理多余的对象。
     */
    private static _cleanupExcess(): void {
        if (RenderTexture2D._poolMemory <= RenderTexture2D.maxPoolMemory) {
            return; 
        }

        let objectsWithTime: Array<{ rt: RenderTexture2D, time: number }> = [];
        for (let i = 0; i < RenderTexture2D._pool.length; i++) {
            let rt = RenderTexture2D._pool[i];
            let poolTime = RenderTexture2D._poolTimeouts.get(rt.id);
            if (poolTime !== undefined) {
                objectsWithTime.push({ rt: rt, time: poolTime });
            }
        }

        objectsWithTime.sort((a, b) => a.time - b.time);

        // 清理最老的对象直到满足内存限制
        for (let i = 0; i < objectsWithTime.length; i++) {
            let item = objectsWithTime[i];
            let rt = item.rt;
            
            if (RenderTexture2D._poolMemory <= RenderTexture2D.maxPoolMemory) {
                break;
            }

            let index = RenderTexture2D._pool.indexOf(rt);
            if (index >= 0) {
                RenderTexture2D._pool.splice(index, 1);
                let gpuMem = rt._renderTarget ? (rt._renderTarget.gpuMemory / 1024 / 1024) : 0;
                RenderTexture2D._poolMemory -= gpuMem;
                RenderTexture2D._poolTimeouts.delete(rt.id);
                rt.destroy();
            }
        }
    }

    /** @internal */
    static _clearColor: Color = new Color(0, 0, 0, 0);
    /** @internal */
    static _clear: boolean = false;

    /**
     * @en The currently active RenderTexture.
     * @zh 当前激活的渲染纹理。
     */
    static get currentActive(): RenderTexture2D {
        return RenderTexture2D._currentActive;
    }

    private _depthStencilFormat: number;
    private _colorFormat: RenderTargetFormat;

    /**@internal */
    _mgrKey: number = 0;	//给WebGLRTMgr用的
    /**@internal */
    _invertY: boolean = false;
    /** @internal */
    _inPool: boolean = false;
    /**
     * @en Depth format.
     * @zh 深度格式。
     */
    get depthStencilFormat(): number {
        return this._depthStencilFormat;
    }

    /**
     * @en The default texture.
     * @zh 默认纹理。
     */
    get defaultTexture(): BaseTexture {
        return Texture2D.grayTexture;
    }

    /**
     * @en Checks whether the RenderTexture2D is ready.
     * @zh 检查2D渲染纹理是否准备好。
     */
    getIsReady(): boolean {
        return true;
    }

    /**
     * @en get the colorFormat from RenderInternalRT
     * @zh 得到此渲染纹理的颜色格式
     */
    getColorFormat(): RenderTargetFormat {
        return this._colorFormat;
    }

    /**
     * @en The source width of the RenderTexture2D.
     * @zh 2D渲染纹理的源宽度。
     */
    get sourceWidth(): number {
        return this._width;
    }

    /**
     * @en The source height of the RenderTexture2D.
     * @zh 2D渲染纹理的源高度。
     */
    get sourceHeight(): number {
        return this._height;
    }

    /**
     * @en The X-axis offset of the RenderTexture2D.
     * @zh 2D渲染纹理的X轴偏移。
     */
    get offsetX(): number {
        return 0;
    }

    /**
     * @en The Y-axis offset of the RenderTexture2D.
     * @zh 2D渲染纹理的Y轴偏移。
     */
    get offsetY(): number {
        return 0;
    }

    /**
     * @en Depth stencil texture
     * @zh 深度模板纹理
     */
    depthStencilTexture: BaseTexture;

    /**
     * @ignore
     * @en The RenderTarget.
     * @zh 渲染目标。
     */
    _renderTarget: InternalRenderTarget;
    /**
     * @en Whether the RenderTexture2D is a CameraTarget.
     * @zh 是否是CameraTarget
     */
    _isCameraTarget: boolean;
    
    protected _multiSamples: number;

    /**
     * @en Creates an instance of RenderTexture2D.
     * @param width The width.
     * @param height The height.
     * @param format The texture format.
     * @param depthStencilFormat The depth format.
     * @param multiSampler Multi sampler times.
     * @zh 创建 RenderTexture2D 类的实例。
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * @param multiSampler 多采样次数。
     */
    constructor(width: number, height: number, format: RenderTargetFormat = RenderTargetFormat.R8G8B8, depthStencilFormat: RenderTargetFormat = RenderTargetFormat.None, multiSampler = 1) {//TODO:待老郭清理

        super(width, height, format);
        this._colorFormat = format;
        this._depthStencilFormat = depthStencilFormat;
        this._multiSamples = multiSampler;
        if (width != 0 && height != 0) {
            this._create();
        }
        this.lock = true;
    }

    /**
     * @en Whether the render target is a cube render target.
     * @zh 渲染目标是否是立方体贴图渲染目标。
     */
    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    /**
     * @en The number of samples for the render target.
     * @zh 渲染目标的采样数。
     */
    get samples(): number {
        return this._renderTarget._samples;
    }

    /**
     * @en Checks if mipmaps are generated for the render target.
     * @zh 检查是否为渲染目标生成了mipmaps。
     */
    get generateMipmap(): boolean {
        return this._renderTarget._generateMipmap;
    }

    /**
     * @internal
     */
    _start(): void {
        throw new NotImplementedError();
    }

    /**
     * @internal
     */
    _end(): void {
        throw new NotImplementedError();
    }

    /**
     * @internal
     */
    _create() {
        // todo  mipmap
        this._renderTarget = LayaGL.textureContext.createRenderTargetInternal(this.width, this.height, this._colorFormat, this.depthStencilFormat, false, false, this._multiSamples, false);
        if (this._renderTarget._texturesResolve) {
            this._texture = this._renderTarget._texturesResolve[0];
            // MSAA 纹理也需同步 gammaCorrection，否则渲染时 GAMMASPACE 宏分支与采样端不一致，导致颜色偏暗
            this._renderTarget._textures[0].gammaCorrection = 2.2;
        } else {
            this._texture = this._renderTarget._textures[0];
        }
        this._texture.gammaCorrection = 2.2;
    }

    /**
     * @en Clears the render texture.
     * @param r The red component.
     * @param g The green component.
     * @param b The blue component.
     * @param a The alpha component, default is 1.0 for full opacity.
     * @zh 清理渲染纹理。
     * @param r 红色分量。
     * @param g 绿色分量。
     * @param b 蓝色分量。
     * @param a 透明度分量，默认为1.0表示完全不透明。
     */
    clear(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0): void {
        RenderTexture2D._clearColor.r = r;
        RenderTexture2D._clearColor.g = g;
        RenderTexture2D._clearColor.b = b;
        RenderTexture2D._clearColor.a = a;
        RenderTexture2D._clear = true;
    }

    /**
     * @en Gets the pixel data from the render texture within the specified area.
     * @param x The X coordinate of the pixel area.
     * @param y The Y coordinate of the pixel area.
     * @param width The width of the pixel area.
     * @param height The height of the pixel area.
     * @returns The pixel data from the specified area.
     * @zh 从指定区域获取渲染纹理的像素数据。
     * @param x 像素区域的X坐标。
     * @param y 像素区域的Y坐标。
     * @param width 像素区域的宽度。
     * @param height 像素区域的高度。
     * @returns 指定区域的像素数据。
     */
    getData(x: number, y: number, width: number, height: number): ArrayBufferView {
        const pixelCount = width * height * 4;
        let pixelArray: ArrayBufferView;
        switch (this._renderTarget.colorFormat) {
            case RenderTargetFormat.R8G8B8:
            case RenderTargetFormat.R8G8B8A8:
                pixelArray = new Uint8Array(pixelCount);
                break;
            case RenderTargetFormat.R16G16B16A16:
                pixelArray = new Float32Array(pixelCount);
                break;
            default:
                throw new Error("getData is not supported " + this._renderTarget.colorFormat.toString() + "format");
        }
        LayaGL.textureContext.readRenderTargetPixelData(this._renderTarget, x, y, width, height, pixelArray);
        return pixelArray;
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
     * @internal
     * @en Recycles the RenderTexture2D.
     * @zh 回收渲染纹理。
     */
    recycle(): void {
    }

    /**
     * @internal
     */
    _disposeResource(): void {
        //width 和height为0的时候不会创建资源
        this._renderTarget && this._renderTarget.dispose();
    }


}
