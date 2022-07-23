import { ILaya } from "./../../ILaya";
import { Config } from "./../../Config";
import { LayaGL } from "../layagl/LayaGL";
import { VertexElementFormat } from "../d3/graphics/VertexElementFormat";
import { WebGLMode } from "../RenderEngine/RenderEngine/WebGLEngine/GLEnum/WebGLMode";
import { WebGlConfig } from "../RenderEngine/RenderEngine/WebGLEngine/WebGLConfig";
import { RenderStateContext } from "../RenderEngine/RenderStateContext";
import { Context } from "../resource/Context";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { WebGL } from "../webgl/WebGL";

import { IRenderEngine } from "../RenderEngine/RenderInterface/IRenderEngine";
import { PerfHUD } from "../utils/PerfHUD";

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

    /** 当前的帧数 */
    private static lastFrm=0;
    /** 第一次运行标记 */
    private _first=true;
    /** 刚启动的时间。由于微信的rAF不标准，传入的stamp参数不对，因此自己计算一个从启动开始的相对时间 */
    private _startTm=0;    

    /** @internal */
    private static ifps=1000/60;

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
		let me = this;
        let lastFrmTm=performance.now();
        let fps = Config.FPS;
        let ifps = Render.ifps= 1000/fps; //如果VR的话，需要改这个
        function loop(stamp: number){
            let perf = PerfHUD.inst;
            let sttm = performance.now();
            //perf && perf.updateValue(0, sttm-lastFrmTm);
            lastFrmTm=sttm;
            if(me._first){
                // 把starttm转成帧对齐
                me._startTm=Math.floor(stamp/ifps)*ifps;
                me._first=false;
            }
            // 与第一帧开始时间的delta
            stamp-=me._startTm;
            // 计算当前帧数
			let frm = Math.floor(stamp/ifps);    // 不能|0 在微信下会变成负的
            // 是否已经跨帧了
            let dfrm = frm-Render.lastFrm;
			if(dfrm>0 || Render.isConchApp){
				Render.lastFrm=frm;
				ILaya.stage._loop();
			}
            perf && perf.updateValue(1, performance.now()-sttm);

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

    /**
     * 获取帧对齐的时间。
     * 用这个做动画的时间参数会更平滑。
     * 从render构造开始算起。
     * @returns 
     */
    static vsyncTime(){
        return Render.lastFrm*Render.ifps;
    }    

    initRender(canvas: HTMLCanvas, w: number, h: number): boolean {
        let glConfig: WebGlConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };
       
        //TODO  other engine
        const webglMode: WebGLMode = Config.useWebGL2 ? WebGLMode.Auto : WebGLMode.WebGL1;

        let engine: IRenderEngine;
        if ((window as any).conch && !(window as any).conchConfig.conchWebGL) {
            engine = new ILaya.NativeWebGLEngine(glConfig, webglMode);
            engine.initRenderEngine(Render._mainCanvas.source);
            WebGL._isWebGL2 = engine.isWebGL2;
            new LayaGL();
        }
        else {
            engine = new ILaya.WebGLEngine(glConfig, webglMode);
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
        LayaGL.renderDrawContext = engine.getDrawContext();
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


