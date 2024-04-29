import { LayaEnv } from "../../LayaEnv";
import { IRenderEngine } from "../RenderDriver/DriverDesign/RenderDevice/IRenderEngine";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Config } from "./../../Config";
import { ILaya } from "./../../ILaya";
import { Context } from "./Context";

/**
 * <code>Render</code> 是渲染管理类。它是一个单例，可以使用 Laya.render 访问。
 */
export class Render {
    /** @internal */
    static _context: Context;
    /** @internal 主画布。canvas和webgl渲染都用这个画布*/
    static _mainCanvas: HTMLCanvas;
    /** 表示是否是 3D 模式。*/
    static is3DMode: boolean;
    /**自定义帧循环 */
    static _customRequestAnimationFrame: any;
    /**帧循环函数 */
    static _loopFunction: any;

    /** 当前的帧数 */
    private static lastFrm = 0;
    /** 第一次运行标记 */
    private _first = true;
    /** 刚启动的时间。由于微信的rAF不标准，传入的stamp参数不对，因此自己计算一个从启动开始的相对时间 */
    private _startTm = 0;

    /** @internal */
    private static ifps = 1000 / 60;

    static _Render: Render;

    static customRequestAnimationFrame(value: any, loopFun: any) {
        Render._customRequestAnimationFrame = value;
        Render._loopFunction = loopFun;
    }

    private static _customEngine: IRenderEngine;
    static set customRenderEngine(engine: IRenderEngine) {
        Render._customEngine = engine;
    }
    static get customRenderEngine() {
        return Render._customEngine;
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
        if (LayaEnv.isConch) {
            document.body.appendChild(source);
        }

        this.initRender(Render._mainCanvas, width, height);
        if (Config._enableWindowRAFFunction) {
            window.requestAnimationFrame(loop);
        } else {
            requestAnimationFrame(loop);
        }
        let me = this;
        let lastFrmTm = performance.now();
        let fps = Config.FPS;
        let ifps = Render.ifps = 1000 / fps; //如果VR的话，需要改这个
        function loop(stamp: number) {
            //let perf = PerfHUD.inst;
            let sttm = performance.now();
            //perf && perf.updateValue(0, sttm-lastFrmTm);
            lastFrmTm = sttm;
            if (me._first) {
                // 把starttm转成帧对齐
                me._startTm = Math.floor(stamp / ifps) * ifps;
                me._first = false;
            }
            // 与第一帧开始时间的delta
            stamp -= me._startTm;
            // 计算当前帧数
            let frm = Math.floor(stamp / ifps);    // 不能|0 在微信下会变成负的
            // 是否已经跨帧了
            let dfrm = frm - Render.lastFrm;
            if (dfrm > 0 || LayaEnv.isConch || !Config.fixedFrames) {
                //不限制
                Render.lastFrm = frm;
                ILaya.stage._loop();
            }
            //perf && perf.updateValue(1, performance.now()-sttm);

            if (!!Render._customRequestAnimationFrame && !!Render._loopFunction) {
                Render._customRequestAnimationFrame(Render._loopFunction);
            }
            else {
                if (Config._enableWindowRAFFunction) {
                    window.requestAnimationFrame(loop);
                } else {
                    requestAnimationFrame(loop);
                }
            }
        }
        ILaya.stage.on("visibilitychange", this, this._onVisibilitychange);
    }

    /**@private */
    private _timeId: number = 0;

    /**@private */
    /**
     * @performanceTool  func count 
     */
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
    static vsyncTime() {
        return Render.lastFrm * Render.ifps;
    }

    initRender(canvas: HTMLCanvas, w: number, h: number): boolean {

        canvas.size(w, h);	//在ctx之后调用。
        ShaderDefines2D.__init__();
        Context.__init__();

        var ctx = new Context();
        ctx.isMain = true;
        Render._context = ctx;
        canvas._setContext(ctx);


        Shader2D.__init__();
        BlendMode._init_();

        return true;
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
