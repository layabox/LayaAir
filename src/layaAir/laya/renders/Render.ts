import { VertexElementFormat } from "../d3/graphics/VertexElementFormat";
import { LayaGL } from "../layagl/LayaGL";
import { WebGLMode } from "../RenderEngine/RenderEngine/WebGLEngine/GLEnum/WebGLMode";
import { WebGlConfig } from "../RenderEngine/RenderEngine/WebGLEngine/WebGLConfig";
import { WebGLEngine } from "../RenderEngine/RenderEngine/WebGLEngine/WebGLEngine";
import { RenderStateContext } from "../RenderEngine/RenderStateContext";
import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { WebGL } from "../webgl/WebGL";
import { Config } from "./../../Config";
import { ILaya } from "./../../ILaya";
import { NativeWebGLEngine } from "../RenderEngine/RenderEngine/NativeGLEngine/NativeWebGLEngine";
import { IRenderEngine } from "../RenderEngine/RenderInterface/IRenderEngine";

/**
 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
 */
export class Render {
    /** @internal */
    static _context: Context;
    /** @internal 主画布。canvas和webgl渲染都用这个画布*/
    static _mainCanvas: HTMLCanvas;
    /**是否是加速器 只读*/
    static isConchApp: boolean = false;
    /** 表示是否是 3D 模式。*/
    static is3DMode: boolean;
    /**自定义帧循环 */
    static _customRequestAnimationFrame: any;
    /**帧循环函数 */
    static _loopFunction: any;

    static _Render: Render;

    static customRequestAnimationFrame(value: any, loopFun: any) {
        Render._customRequestAnimationFrame = value;
        Render._loopFunction = loopFun;
    }


    /**
     * 初始化引擎。
     * @param	width 游戏窗口宽度。
     * @param	height	游戏窗口高度。
     */
    constructor(width: number, height: number, mainCanv: HTMLCanvas) {
        Render._Render = this;
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
            if (!!Render._customRequestAnimationFrame && !!Render._loopFunction) {
                Render._customRequestAnimationFrame(Render._loopFunction);
            }
            else
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
        let glConfig: WebGlConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };
       
        //TODO  other engine
        const webglMode: WebGLMode = Config.useWebGL2 ? WebGLMode.Auto : WebGLMode.WebGL1;

        let engine: IRenderEngine;
        if ((window as any).conch && !(window as any).conchConfig.conchWebGL) {
            engine = new NativeWebGLEngine(glConfig, webglMode);
            engine.initRenderEngine(Render._mainCanvas.source);
            WebGL._isWebGL2 = engine.isWebGL2;
            new LayaGL();
        }
        else {
            engine = new WebGLEngine(glConfig, webglMode);
            engine.initRenderEngine(Render._mainCanvas.source);
            var gl: WebGLRenderingContext = RenderStateContext.mainContext = engine.gl;
            if (Config.printWebglOrder)
                this._replaceWebglcall(gl);

            if (!gl)
                return false;
            if (gl) {
                WebGL._isWebGL2 = engine.isWebGL2;
                new LayaGL();
            }
        }
        LayaGL.renderEngine = engine;
        //LayaGL.instance = gl;
        //native TODO
        LayaGL.textureContext = engine.getTextureContext();
        LayaGL.renderDrawConatext = engine.getDrawContext();
        LayaGL.render2DContext =engine.get2DRenderContext();
        LayaGL.renderOBJCreate = engine.getCreateRenderOBJContext();

        canvas.size(w, h);	//在ctx之后调用。
        VertexElementFormat.__init__();
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
        BlendMode._init_();
        
        return true;
    }

    /**@private */
    private _replaceWebglcall(gl: any) {
        var tempgl: { [key: string]: any } = {};
        for (const key in gl) {
            if (typeof gl[key] == "function" && key != "getError" && key != "__SPECTOR_Origin_getError" && key != "__proto__") {
                tempgl[key] = gl[key];
                gl[key] = function () {
                    let arr: IArguments[] = [];
                    for (let i = 0; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    let result = tempgl[key].apply(gl, arr);

                    //console.log(RenderInfo.loopCount + ":gl." + key + ":" + arr);
                    let err = gl.getError();
                    if (err) {
                        //console.log(err);
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
}


