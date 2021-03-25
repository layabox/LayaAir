import { ILaya } from "./../../ILaya";
import { Config } from "./../../Config";
import { LayaGL } from "../layagl/LayaGL"
import { Context } from "../resource/Context"
import { HTMLCanvas } from "../resource/HTMLCanvas"
import { WebGL } from "../webgl/WebGL"
import { WebGLContext } from "../webgl/WebGLContext"
import { BlendMode } from "../webgl/canvas/BlendMode"
import { Shader2D } from "../webgl/shader/d2/Shader2D"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
import { Value2D } from "../webgl/shader/d2/value/Value2D"
import { Buffer2D } from "../webgl/utils/Buffer2D"
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { LayaGPU } from "../webgl/LayaGPU";
import { Browser } from "../utils/Browser";
import { RenderInfo } from "./RenderInfo";

/**
 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
 */
export class Render {
    /** @internal */
    static _context: Context;
    /** @internal 主画布。canvas和webgl渲染都用这个画布*/
    static _mainCanvas: HTMLCanvas;

    // static supportWebGLPlusCulling: boolean = false;
    static supportWebGLPlusAnimation: boolean = false;
    static supportWebGLPlusRendering: boolean = false;
    /**是否是加速器 只读*/
    static isConchApp: boolean = false;
    /** 表示是否是 3D 模式。*/
    static is3DMode: boolean;

	/**
	 * 初始化引擎。
	 * @param	width 游戏窗口宽度。
	 * @param	height	游戏窗口高度。
	 */
    constructor(width: number, height: number, mainCanv: HTMLCanvas) {
        Render._mainCanvas = mainCanv;
        let source: HTMLCanvasElement = Render._mainCanvas.source as HTMLCanvasElement;
        //创建主画布。改到Browser中了，因为为了runtime，主画布必须是第一个
        source.id = "layaCanvas";
        source.width = width;
        source.height = height;
        if (Render.isConchApp) {
            document.body.appendChild(source);
        }

        this.initRender(Render._mainCanvas, width, height);
        window.requestAnimationFrame(loop);
        function loop(stamp: number): void {
            ILaya.stage._loop();
            window.requestAnimationFrame(loop);
        }
        ILaya.stage.on("visibilitychange", this, this._onVisibilitychange);
    }

    /**@private */
    private _timeId: number = 0;

    /**@private */
    private _onVisibilitychange(): void {
        if (!ILaya.stage.isVisibility) {
            this._timeId = window.setInterval(this._enterFrame, 1000);
        } else if (this._timeId != 0) {
            window.clearInterval(this._timeId);
        }
    }

    initRender(canvas: HTMLCanvas, w: number, h: number): boolean {
        function getWebGLContext(canvas: any): WebGLRenderingContext {
            var gl: WebGLRenderingContext;
            var names: any[] = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            if (!Config.useWebGL2 || Browser.onBDMiniGame) {//TODO:反向兼容百度
                names.shift();
            }
            for (var i: number = 0; i < names.length; i++) {
                try {
                    gl = canvas.getContext(names[i], { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer });//antialias为true,premultipliedAlpha为false,IOS和部分安卓QQ浏览器有黑屏或者白屏底色BUG
                } catch (e) {
                }
                if (gl) {
                    (names[i] === 'webgl2') && (WebGL._isWebGL2 = true);
                    new LayaGL();
                    return gl;
                }
            }
            return null;
        }
        var gl: WebGLRenderingContext = LayaGL.instance = WebGLContext.mainContext = getWebGLContext(Render._mainCanvas.source);
        if(Config.printWebglOrder)
           this._replaceWebglcall(gl);

        if (!gl)
            return false;

        LayaGL.instance = gl;
        LayaGL.layaGPUInstance = new LayaGPU(gl, WebGL._isWebGL2);

        canvas.size(w, h);	//在ctx之后调用。
        Context.__init__();
        SubmitBase.__init__();

        var ctx: Context = new Context();
        ctx.isMain = true;
        Render._context = ctx;
        canvas._setContext(ctx);

        //TODO 现在有个问题是 gl.deleteTexture并没有走WebGLContex封装的
        ShaderDefines2D.__init__();
        Value2D.__init__();
        Shader2D.__init__();
        Buffer2D.__int__(gl);
        BlendMode._init_(gl);
        return true;
    }

    /**@private */
    private _replaceWebglcall(gl:any){
        var tempgl:{[key:string]:any} = {};
        for(const key in gl){
            if(typeof gl[key]=="function"&& key != "getError" && key != "__SPECTOR_Origin_getError" && key !="__proto__"){
                tempgl[key] = gl[key];
                gl[key] = function() {
                    let arr:IArguments[] = [];
                    for(let i = 0;i<arguments.length;i++){
                        arr.push(arguments[i]);
                    }
                    let result = tempgl[key].apply(gl,arr);
                    
                    console.log(RenderInfo.loopCount+":gl."+key+":"+arr);
                    let err = gl.getError();
                    if(err){
                        console.log(err);
                        debugger;
                    }
                    return result;
                }
            }
        }
    }

    /**@private */
    private _enterFrame(e: any = null): void {
        ILaya.stage._loop();
    }

    /** 目前使用的渲染器。*/
    static get context(): Context {
        return Render._context;
    }

    /** 渲染使用的原生画布引用。 */
    static get canvas(): any {
        return Render._mainCanvas.source;
    }
}
{
    Render.isConchApp = ((window as any).conch != null);
    if (Render.isConchApp) {
        //Render.supportWebGLPlusCulling = false;
        //Render.supportWebGLPlusAnimation = false;
        Render.supportWebGLPlusRendering = false;
    }
    else if ((window as any).qq != null && (window as any).qq.webglPlus != null) {
        //Render.supportWebGLPlusCulling = false;
        //Render.supportWebGLPlusAnimation = false;
        Render.supportWebGLPlusRendering = false;
    }
}


