import { BaseTexture } from "./BaseTexture";
/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export declare class RenderTexture2D extends BaseTexture {
    /** @private */
    private static _currentActive;
    private _lastRT;
    private _lastWidth;
    private _lastHeight;
    private static rtStack;
    static defuv: any[];
    static flipyuv: any[];
    /**
     * 获取当前激活的Rendertexture
     */
    static readonly currentActive: RenderTexture2D;
    /** @private */
    private _frameBuffer;
    /** @private */
    private _depthStencilBuffer;
    /** @private */
    private _depthStencilFormat;
    /**
     * 获取深度格式。
     *@return 深度格式。
     */
    readonly depthStencilFormat: number;
    /**
     * @inheritDoc
     */
    readonly defaulteTexture: BaseTexture;
    getIsReady(): boolean;
    /**
     * 获取宽度。
     */
    readonly sourceWidth: number;
    /***
     * 获取高度。
     */
    readonly sourceHeight: number;
    /**
     * 获取offsetX。
     */
    readonly offsetX: number;
    /***
     * 获取offsetY
     */
    readonly offsetY: number;
    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format?: number, depthStencilFormat?: number);
    /**
     * @private
     */
    private _create;
    /**
     * 生成mipMap。
     */
    generateMipmap(): void;
    /**
     * 保存当前的RT信息。
     */
    static pushRT(): void;
    /**
     * 恢复上次保存的RT信息
     */
    static popRT(): void;
    /**
     * 开始绑定。
     */
    start(): void;
    /**
     * 结束绑定。
     */
    end(): void;
    /**
     * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
     */
    restore(): void;
    clear(r?: number, g?: number, b?: number, a?: number): void;
    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x: number, y: number, width: number, height: number): Uint8Array;
    /**
     * native多线程
     */
    getDataAsync(x: number, y: number, width: number, height: number, callBack: Function): void;
    recycle(): void;
    /**
     * @inheritDoc
     */
    _disposeResource(): void;
}
