import { Texture2D } from "./Texture2D";
import { LayaGL } from "../layagl/LayaGL"
import { BaseTexture } from "./BaseTexture"
import { WebGLContext } from "../webgl/WebGLContext"
import { BaseShader } from "../webgl/shader/BaseShader"
import { RenderState2D } from "../webgl/utils/RenderState2D"
import { ILaya } from "../../ILaya";
import { RenderTarget, RenderTargetFormat } from "./RenderTarget";
import { InternalRenderTarget } from "../d3/WebGL/InternalRenderTarget";

/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture2D extends BaseTexture implements RenderTarget {
    /** @private */
    private static _currentActive: RenderTexture2D;
    private _lastRT: RenderTexture2D;
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
    static get currentActive(): RenderTexture2D {
        return RenderTexture2D._currentActive;
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
    get defaulteTexture(): BaseTexture {
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

    _renderTarget: InternalRenderTarget;
    _isCameraTarget: boolean;

    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format: number = RenderTargetFormat.R8G8B8, depthStencilFormat: number = RenderTargetFormat.DEPTH_16) {//TODO:待老郭清理

        super(width, height, format);
        this._colorFormat = format;
        this._depthStencilFormat = depthStencilFormat;
        this._create();
        this.lock = true;
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

    _start(): void {
        throw new Error("Method not implemented.");
    }
    _end(): void {
        throw new Error("Method not implemented.");
    }
    _create() {
        // todo  mipmap
        this._renderTarget = LayaGL.layaContext.createRenderTargetInternal(this.width, this.height, this._colorFormat, this.depthStencilFormat, false, true, 1);

        this._texture = this._renderTarget._textures[0];
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
        var gl: WebGLRenderingContext = LayaGL.instance;
        var top: any = RenderTexture2D.rtStack.pop();
        if (top) {
            if (RenderTexture2D._currentActive != top.rt) {
                LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, top.rt ? top.rt._frameBuffer : null);
                RenderTexture2D._currentActive = top.rt;
            }
            gl.viewport(0, 0, top.w, top.h);
            RenderState2D.width = top.w;
            RenderState2D.height = top.h;
        }
    }
    /**
     * 开始绑定。
     */
    start(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        //(memorySize == 0) && recreateResource();
        LayaGL.layaContext.bindRenderTarget(this._renderTarget);
        this._lastRT = RenderTexture2D._currentActive;
        RenderTexture2D._currentActive = this;

        //var gl:LayaGL = LayaGL.instance;//TODO:这段代码影响2D、3D混合
        ////(memorySize == 0) && recreateResource();
        //LayaGL.instance.bindFramebuffer(WebGLContext.FRAMEBUFFER, _frameBuffer);
        //_lastRT = _currentActive;
        //_currentActive = this;
        ////_readyed = false;  
        //_readyed = true;	//这个没什么用。还会影响流程，比如我有时候并不调用end。所以直接改成true
        //
        ////if (_type == TYPE2D) {
        gl.viewport(0, 0, this._width, this._height);//外部设置
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
        LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
        RenderTexture2D._currentActive = null;
    }

    /**
     * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
     */
    restore(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        if (this._lastRT != RenderTexture2D._currentActive) {

            if (this._lastRT) {
                LayaGL.layaContext.bindRenderTarget(this._lastRT._renderTarget);
            }
            else {
                LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
            }

            RenderTexture2D._currentActive = this._lastRT;
        }
        // this._readyed = true;
        //if (_type == TYPE2D)//待调整
        //{
        gl.viewport(0, 0, this._lastWidth, this._lastHeight);
        RenderState2D.width = this._lastWidth;
        RenderState2D.height = this._lastHeight;
        BaseShader.activeShader = null;
        //} else 
        //	gl.viewport(0, 0, Laya.stage.width, Laya.stage.height);

    }

    clear(r: number = 0.0, g: number = 0.0, b: number = 0.0, a: number = 1.0): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        gl.clearColor(r, g, b, a);
        var clearFlag: number = gl.COLOR_BUFFER_BIT;
        switch (this._depthStencilFormat) {
            //case WebGLContext.DEPTH_COMPONENT: 
            case gl.DEPTH_COMPONENT16:
                clearFlag |= gl.DEPTH_BUFFER_BIT;
                break;
            //case WebGLContext.STENCIL_INDEX:
            case gl.STENCIL_INDEX8:
                clearFlag |= gl.STENCIL_BUFFER_BIT;
                break;
            case gl.DEPTH_STENCIL:
                clearFlag |= gl.DEPTH_BUFFER_BIT;
                clearFlag |= gl.STENCIL_BUFFER_BIT
                break;
        }
        gl.clear(clearFlag);
    }


    /**
     * 获得像素数据。
     * @param x X像素坐标。
     * @param y Y像素坐标。
     * @param width 宽度。
     * @param height 高度。
     * @return 像素数据。
     */
    getData(x: number, y: number, width: number, height: number): Uint8Array {
        // todo
        throw "native 2 thread mode use getDataAsync";
        // if (ILaya.Render.isConchApp && (window as any).conchConfig.threadMode == 2) {
        //     throw "native 2 thread mode use getDataAsync";
        // }
        // var gl: WebGLRenderingContext = LayaGL.instance;
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        // var canRead: boolean = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);

        // if (!canRead) {
        //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //     return null;
        // }

        // var pixels: Uint8Array = new Uint8Array(this._width * this._height * 4);
        // var glFormat: number = this._getGLFormat();
        // gl.readPixels(x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // return pixels;
    }
    /**
     * native多线程
     */
    getDataAsync(x: number, y: number, width: number, height: number, callBack: Function): void {
        // todo
        // var gl: any = LayaGL.instance;
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        // gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data: ArrayBuffer): void {
        //     callBack(new Uint8Array(data));
        // });
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    recycle(): void {

    }

    /**
     * @inheritDoc
     * @internal
     */
    _disposeResource(): void {
        this._renderTarget.dispose();
    }

}



