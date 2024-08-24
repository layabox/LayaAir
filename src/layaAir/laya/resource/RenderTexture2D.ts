import { Texture2D } from "./Texture2D"
import { BaseTexture } from "./BaseTexture"
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";
import { InternalRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { IRenderTarget } from "../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture2D extends BaseTexture implements IRenderTarget {
    /** @private */
    private static _currentActive: RenderTexture2D;
    static _clearColor: Color = new Color(0, 0, 0, 0);
    static _clear: boolean = false;
    static _clearLinearColor: Color = new Color();

    //为push,pop 用的。以后和上面只保留一份。
    //由于可能递归，所以不能简单的用save，restore
    /**
     * 默认uv
     */
    static defuv: any[] = [0, 0, 1, 0, 1, 1, 0, 1];
    /**
     * 默认翻转uv
     */
    static flipyuv: any[] = [0, 1, 1, 1, 1, 0, 0, 0];
    /**
     * 获取当前激活的Rendertexture
     */
    static get currentActive(): RenderTexture2D {
        return RenderTexture2D._currentActive;
    }

    /** @private */
    private _depthStencilFormat: number;
    /** @private */
    private _colorFormat: RenderTargetFormat;

    /**@internal */
    _mgrKey: number = 0;	//给WebGLRTMgr用的
    /**@internal */
    _invertY: boolean = false;
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

    /**
     * RenderTexture2D是否准备好
     * @returns 
     */
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
    /**深度模板纹理 */
    depthStencilTexture: BaseTexture;
    
    _renderTarget: InternalRenderTarget;
    /**是否是CameraTarget */
    _isCameraTarget: boolean;


    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format: RenderTargetFormat = RenderTargetFormat.R8G8B8, depthStencilFormat: RenderTargetFormat = RenderTargetFormat.None) {//TODO:待老郭清理

        super(width, height, format);
        this._colorFormat = format;
        this._depthStencilFormat = depthStencilFormat;
        if (width != 0 && height != 0) {
            this._create();
        }
        this.lock = true;
    }

    /**是否是RTCube */
    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    /**采样 */
    get samples(): number {
        return this._renderTarget._samples;
    }

    /**
     * 是否生成Mipmap
     */
    get generateMipmap(): boolean {
        return this._renderTarget._generateMipmap;
    }

    /**
     * @internal
     */
    _start(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal
     */
    _end(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * @internal
     */
    _create() {
        // todo  mipmap
        this._renderTarget = LayaGL.textureContext.createRenderTargetInternal(this.width, this.height, this._colorFormat, this.depthStencilFormat, false, false, 1);
        this._texture = this._renderTarget._textures[0];
        this._texture.gammaCorrection = 2.2;
    }

    /**
     * 清理RT
     * @param r 
     * @param g 
     * @param b 
     * @param a 
     */
    clear(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0): void {
        RenderTexture2D._clearColor.r = r;
        RenderTexture2D._clearColor.g = g;
        RenderTexture2D._clearColor.b = b;
        RenderTexture2D._clearColor.a = a;
        RenderTexture2D._clear = true;
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
        return LayaGL.textureContext.getRenderTextureData(this._renderTarget, x, y, width, height);
    }

    /**
     * @internal
     */
    recycle(): void {

    }

    /**
     * @inheritDoc
     * @internal
     */
    _disposeResource(): void {
        //width 和height为0的时候不会创建资源
        this._renderTarget && this._renderTarget.dispose();
    }

}