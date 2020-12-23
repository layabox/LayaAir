import { Texture2D } from "./Texture2D";
import { LayaGL } from "../layagl/LayaGL"
import { BaseTexture } from "./BaseTexture"
import { WebGLContext } from "../webgl/WebGLContext"
import { BaseShader } from "../webgl/shader/BaseShader"
import { RenderState2D } from "../webgl/utils/RenderState2D"
import { ILaya } from "../../ILaya";
import { RenderTextureFormat, RenderTextureDepthFormat } from "./RenderTextureFormat";

/**
 * <code>RenderTexture</code> 类用于创建渲染目标。
 */
export class RenderTexture2D extends BaseTexture {
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
    private _frameBuffer: any;
    /** @private */
    private _depthStencilBuffer: any;
    /** @private */
    private _depthStencilFormat: number;
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

    /**
     * @param width  宽度。
     * @param height 高度。
     * @param format 纹理格式。
     * @param depthStencilFormat 深度格式。
     * 创建一个 <code>RenderTexture</code> 实例。
     */
    constructor(width: number, height: number, format: number = RenderTextureFormat.R8G8B8, depthStencilFormat: number = RenderTextureDepthFormat.DEPTH_16) {//TODO:待老郭清理

        super(format, false);
        this._glTextureType = LayaGL.instance.TEXTURE_2D;
        this._width = width;
        this._height = height;
        this._depthStencilFormat = depthStencilFormat;
        this._create(width, height);
        this.lock = true;
    }

    /**
     * @private
     */
    private _create(width: number, height: number): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        this._frameBuffer = gl.createFramebuffer();
        WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
        var glFormat: number = this._getGLFormat();
        gl.texImage2D(this._glTextureType, 0, glFormat, width, height, 0, glFormat, gl.UNSIGNED_BYTE, null);
        this._setGPUMemory(width * height * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._glTexture, 0);
        if (this._depthStencilFormat !== RenderTextureDepthFormat.DEPTHSTENCIL_NONE) {
            this._depthStencilBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._depthStencilBuffer);
            switch (this._depthStencilFormat) {
                case RenderTextureDepthFormat.DEPTH_16:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case RenderTextureDepthFormat.STENCIL_8:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.STENCIL_INDEX8, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                case RenderTextureDepthFormat.DEPTHSTENCIL_24_8:
                    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, width, height);
                    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._depthStencilBuffer);
                    break;
                default:
                //console.log("RenderTexture: unkonw depth format.");//2d并不需要depthbuffer
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
        this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
        this._setFilterMode(this._filterMode);
        this._setAnisotropy(this._anisoLevel);

        this._readyed = true;
        this._activeResource();
    }

    /**
     * 生成mipMap。
     * @override
     */
    generateMipmap(): void {
        if (this._isPot(this.width) && this._isPot(this.height)) {
            this._mipmap = true;
            LayaGL.instance.generateMipmap(this._glTextureType);
            this._setFilterMode(this._filterMode);
            this._setGPUMemory(this.width * this.height * 4 * (1 + 1 / 3));
        } else {
            this._mipmap = false;
            this._setGPUMemory(this.width * this.height * 4);
        }
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
        LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        this._lastRT = RenderTexture2D._currentActive;
        RenderTexture2D._currentActive = this;
        this._readyed = true;

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
        var gl: WebGLRenderingContext = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        RenderTexture2D._currentActive = null;
        this._readyed = true;
    }

    /**
     * 恢复上一次的RenderTarge.由于使用自己保存的，所以如果被外面打断了的话，会出错。
     */
    restore(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        if (this._lastRT != RenderTexture2D._currentActive) {
            LayaGL.instance.bindFramebuffer(gl.FRAMEBUFFER, this._lastRT ? this._lastRT._frameBuffer : null);
            RenderTexture2D._currentActive = this._lastRT;
        }
        this._readyed = true;
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
        if (ILaya.Render.isConchApp && (window as any).conchConfig.threadMode == 2) {
            throw "native 2 thread mode use getDataAsync";
        }
        var gl: WebGLRenderingContext = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        var canRead: boolean = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE);

        if (!canRead) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return null;
        }

        var pixels: Uint8Array = new Uint8Array(this._width * this._height * 4);
        var glFormat: number = this._getGLFormat();
        gl.readPixels(x, y, width, height, glFormat, gl.UNSIGNED_BYTE, pixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return pixels;
    }
    /**
     * native多线程
     */
    getDataAsync(x: number, y: number, width: number, height: number, callBack: Function): void {
        var gl: any = LayaGL.instance;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.readPixelsAsync(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, function (data: ArrayBuffer): void {
            callBack(new Uint8Array(data));
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    recycle(): void {

    }

    /**
     * @inheritDoc
     * @internal
     */
    _disposeResource(): void {
        if (this._frameBuffer) {
            var gl: WebGLRenderingContext = LayaGL.instance;
            gl.deleteTexture(this._glTexture);
            gl.deleteFramebuffer(this._frameBuffer);
            gl.deleteRenderbuffer(this._depthStencilBuffer);
            this._glTexture = null;
            this._frameBuffer = null;
            this._depthStencilBuffer = null;
            this._setGPUMemory(0);
        }
    }

}



