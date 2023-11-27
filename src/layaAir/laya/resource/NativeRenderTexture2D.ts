import { Texture2D } from "./Texture2D";
import { BaseTexture } from "./BaseTexture"
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../RenderEngine/RenderInterface/InternalRenderTarget";
import { IRenderTarget } from "../RenderEngine/RenderInterface/IRenderTarget";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";

/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class NativeRenderTexture2D extends BaseTexture implements IRenderTarget {
    /** @private */
    private static _currentActive: NativeRenderTexture2D;
    private static _clearColor: Color = new Color(0, 0, 0, 0);
    private _lastRT: NativeRenderTexture2D;
    private _lastWidth: number;
    private _lastHeight: number;

    //为push,pop 用的。以后和上面只保留一份。
    //由于可能递归，所以不能简单的用save，restore
    private static rtStack: any[] = [];//rt:RenderTexture，w:int，h:int

    static defuv: any[] = [0, 0, 1, 0, 1, 1, 0, 1];
    static flipyuv: any[] = [0, 1, 1, 1, 1, 0, 0, 0];
    /**
     * 获取当前激活的Rendertexture
     */
    static get currentActive(): NativeRenderTexture2D {
        return NativeRenderTexture2D._currentActive;
    }

    /** @private */
    private _depthStencilFormat: number;

    private _colorFormat: RenderTargetFormat;

    /**@internal */
    _mgrKey: number = 0;	//给WebGLRTMgr用的

    /**
     * 获取深度格式。
     *@return 深度格式。
     */
    get depthStencilFormat(): number {
        return this._depthStencilFormat;
    }

    /**
     * @inheritDoc
     * @override
     */
    get defaultTexture(): BaseTexture {
        return Texture2D.grayTexture;
    }

    getIsReady(): boolean {
        return true;
    }

    /**
     * 获取宽度。
     */
    get sourceWidth(): number {
        return this._width;
    }

    /***
     * 获取高度。
     */
    get sourceHeight(): number {
        return this._height;
    }

    /**
     * 获取offsetX。
     */
    get offsetX(): number {
        return 0;
    }

    /***
     * 获取offsetY
     */
    get offsetY(): number {
        return 0;
    }

    depthStencilTexture: BaseTexture;

    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;

    private _nativeObj: any;
    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format: number = RenderTargetFormat.R8G8B8, depthStencilFormat: number = RenderTargetFormat.DEPTH_16, create: boolean = true ) {//TODO:待老郭清理

        super(width, height, format);
        this._colorFormat = format;
        this._depthStencilFormat = depthStencilFormat;
        if (width != 0 && height != 0 && create) {
            this._create();
        }
        this.lock = true;
    }

    get isCube(): boolean {
        return this._nativeObj.isCube;
    }

    get samples(): number {
        return this._nativeObj.samples;
    }

    get generateMipmap(): boolean {
        return this._nativeObj.generateMipmap;
    }

    _start(): void {
        throw new Error("Method not implemented.");
    }
    _end(): void {
        throw new Error("Method not implemented.");
    }
    _create() {
        // todo  mipmap
        this._nativeObj = new (window as any).conchRenderTexture2D((LayaGL.renderEngine as any)._nativeObj, this.width, this.height, this._colorFormat, this.depthStencilFormat);
        this._texture = this._nativeObj._renderTarget._textures[0];
    }


    /**
     * 保存当前的RT信息。
     */
    static pushRT(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * 恢复上次保存的RT信息
     */
    static popRT(): void {
        throw new Error("Method not implemented.");
    }
    /**
     * 开始绑定。
     */
    start(): void {
        this._nativeObj.start();
    }

    /**
     * 结束绑定。
     */
    end(): void {
        this._nativeObj.end();
    }

    /**
     * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
     */
    restore(): void {
        this._nativeObj.restore();
    }


    clear(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0): void {
        this._nativeObj.clear(r, g, b, a);
    }


    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x: number, y: number, width: number, height: number): ArrayBufferView {
        return this._nativeObj.getData(x, y, width, height);
    }
    recycle(): void {

    }

    /**
     * @inheritDoc
     * @internal
     */
    _disposeResource(): void {
        this._nativeObj._disposeResource();
    }

}



