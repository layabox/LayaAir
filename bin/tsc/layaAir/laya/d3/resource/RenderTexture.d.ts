import { BaseTexture } from "../../resource/BaseTexture";
/**
   //* <code>RenderTexture</code> 类用于创建渲染目标。
 */
export declare class RenderTexture extends BaseTexture {
    /**
     * 获取当前激活的Rendertexture。
     */
    static readonly currentActive: RenderTexture;
    /**
     *从对象池获取临时渲染目标。
     */
    static createFromPool(width: number, height: number, format?: number, depthStencilFormat?: number, filterMode?: number): RenderTexture;
    /**
     * 回收渲染目标到对象池,释放后可通过createFromPool复用。
     */
    static recoverToPool(renderTexture: RenderTexture): void;
    /**
     * 获取深度格式。
     *@return 深度格式。
     */
    readonly depthStencilFormat: number;
    /**
     * @inheritDoc
     */
    readonly defaulteTexture: BaseTexture;
    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format?: number, depthStencilFormat?: number);
    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x: number, y: number, width: number, height: number, out: Uint8Array): Uint8Array;
    /**
     * native多线程
     */
    getDataAsync(x: number, y: number, width: number, height: number, callBack: Function): void;
    /**
     * @inheritDoc
     */
    protected _disposeResource(): void;
}
