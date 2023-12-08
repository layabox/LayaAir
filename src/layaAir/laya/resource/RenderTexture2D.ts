import { Texture2D } from "./Texture2D"
import { BaseTexture } from "./BaseTexture"
import { BaseShader } from "../webgl/shader/BaseShader"
import { RenderState2D } from "../webgl/utils/RenderState2D"
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../RenderEngine/RenderInterface/InternalRenderTarget";
import { IRenderTarget } from "../RenderEngine/RenderInterface/IRenderTarget";
import { RenderClearFlag } from "../RenderEngine/RenderEnum/RenderClearFlag";
import { NativeRenderTexture2D } from "./NativeRenderTexture2D";
import { Color } from "../maths/Color";
import { LayaGL } from "../layagl/LayaGL";
/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture2D extends BaseTexture implements IRenderTarget {
    /** @private */
    private static _currentActive: RenderTexture2D;
    static _clearColor: Color = new Color(0, 0, 0, 0);
    static _clearLinearColor: Color = new Color();
    private _lastRT: RenderTexture2D;
    private _lastWidth: number;
    private _lastHeight: number;

    //为push,pop 用的。以后和上面只保留一份。
    //由于可能递归，所以不能简单的用save，restore
    private static rtStack: any[] = [];//rt:RenderTexture，w:int，h:int
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
    _depthStencilFormat: number;
    /** @private */
    _colorFormat: RenderTargetFormat;

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
     * 保存当前的RT信息。
     */
    static pushRT(): void {
        RenderTexture2D.rtStack.push({ rt: RenderTexture2D._currentActive, w: RenderState2D.width, h: RenderState2D.height });
    }
    /**
     * 恢复上次保存的RT信息
     */
    static popRT(): void {
        var top: any = RenderTexture2D.rtStack.pop();
        if (top) {
            if (RenderTexture2D._currentActive != top.rt) {
                if (top.rt) {
                    LayaGL.textureContext.bindRenderTarget(top.rt._renderTarget);
                    RenderState2D.InvertY = top.rt._invertY;
                } else {
                    LayaGL.textureContext.bindoutScreenTarget();
                    RenderState2D.InvertY = false;
                }
                RenderTexture2D._currentActive = top.rt;
            }
            LayaGL.renderEngine.viewport(0, 0, top.w, top.h);
            LayaGL.renderEngine.scissor(0, 0, top.w, top.h);
            RenderState2D.width = top.w;
            RenderState2D.height = top.h;
        }
    }
    /**
     * 开始绑定。
     */
    start(): void {
        //(memorySize == 0) && recreateResource();
        LayaGL.textureContext.bindRenderTarget(this._renderTarget);
        this._lastRT = RenderTexture2D._currentActive;
        RenderTexture2D._currentActive = this;
        RenderState2D.InvertY = this._invertY;
        //var gl:LayaGL = LayaGL.instance;//TODO:这段代码影响2D、3D混合
        ////(memorySize == 0) && recreateResource();
        //LayaGL.instance.bindFramebuffer(WebGLContext.FRAMEBUFFER, _frameBuffer);
        //_lastRT = _currentActive;
        //_currentActive = this;
        ////_readyed = false;  
        //_readyed = true;	//这个没什么用。还会影响流程，比如我有时候并不调用end。所以直接改成true
        //
        ////if (_type == TYPE2D) {
        LayaGL.renderEngine.viewport(0, 0, this._width, this._height);//外部设置
        LayaGL.renderEngine.scissor(0, 0, this._width, this._height);//外部设置
        this._lastWidth = RenderState2D.width;
        this._lastHeight = RenderState2D.height;
        RenderState2D.width = this._width;
        RenderState2D.height = this._height;
        BaseShader.activeShader = null;
        ////}
    }

    /**
     * 结束绑定。
     */
    end(): void {
        LayaGL.textureContext.unbindRenderTarget(this._renderTarget);
        RenderTexture2D._currentActive = null;
        RenderState2D.InvertY = false;
    }

    /**
     * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
     */
    restore(): void {
        if (this._lastRT != RenderTexture2D._currentActive) {

            if (this._lastRT) {
                LayaGL.textureContext.bindRenderTarget(this._lastRT._renderTarget);
                RenderState2D.InvertY = this._lastRT._invertY;
            }
            else {
                LayaGL.textureContext.unbindRenderTarget(this._renderTarget);
                RenderState2D.InvertY = false;
            }

            RenderTexture2D._currentActive = this._lastRT;
        }
        // this._readyed = true;
        //if (_type == TYPE2D)//待调整
        //{
        LayaGL.renderEngine.viewport(0, 0, this._lastWidth, this._lastHeight);
        LayaGL.renderEngine.scissor(0, 0, this._lastWidth, this._lastHeight);
        RenderState2D.width = this._lastWidth;
        RenderState2D.height = this._lastHeight;
        BaseShader.activeShader = null;
        //} else 
        //	gl.viewport(0, 0, Laya.stage.width, Laya.stage.height);
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
        //RenderTexture2D._clearColor.toLinear(RenderTexture2D._clearLinearColor);
        //@ts-ignore
        LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color | RenderClearFlag.Depth, RenderTexture2D._clearColor, 1);
    }

    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x: number, y: number, width: number, height: number, out: Uint8Array | Float32Array = null): ArrayBufferView {
        if (!out)
            return LayaGL.textureContext.getRenderTextureData(this._renderTarget, x, y, width, height);
        else
            return LayaGL.textureContext.readRenderTargetPixelData(this._renderTarget, x, y, width, height, out);
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

// native
if ((window as any).conch && !(window as any).conchConfig.conchWebGL) {
    //@ts-ignore
    RenderTexture2D = NativeRenderTexture2D;
}


