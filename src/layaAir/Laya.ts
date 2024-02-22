import { ILaya } from "./ILaya";
import { Input } from "./laya/display/Input";
import { Sprite } from "./laya/display/Sprite";
import { Stage } from "./laya/display/Stage";
import { InputManager } from "./laya/events/InputManager";
import { SoundManager } from "./laya/media/SoundManager";
import { Loader } from "./laya/net/Loader";
import { LocalStorage } from "./laya/net/LocalStorage";
import { Render } from "./laya/renders/Render";
import { RenderSprite } from "./laya/renders/RenderSprite";
import { Context } from "./laya/renders/Context";
import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { RenderTexture2D } from "./laya/resource/RenderTexture2D";
import { Texture } from "./laya/resource/Texture";
import { Browser } from "./laya/utils/Browser";
import { CacheManger } from "./laya/utils/CacheManger";
import { ColorUtils } from "./laya/utils/ColorUtils";
import { Timer } from "./laya/utils/Timer";
import { PrimitiveSV } from "./laya/webgl/shader/d2/value/PrimitiveSV";
import { TextureSV } from "./laya/webgl/shader/d2/value/TextureSV";
import { RenderSpriteData, Value2D } from "./laya/webgl/shader/d2/value/Value2D";
import { RenderState2D } from "./laya/webgl/utils/RenderState2D";
import { WebGL } from "./laya/webgl/WebGL";
import { Mouse } from "./laya/utils/Mouse";
import { MeshVG } from "./laya/webgl/utils/MeshVG";
import { MeshParticle2D } from "./laya/webgl/utils/MeshParticle2D";
import { MeshQuadTexture } from "./laya/webgl/utils/MeshQuadTexture";
import { MeshTexture } from "./laya/webgl/utils/MeshTexture";
import { WeakObject } from "./laya/utils/WeakObject";
import { RenderStateContext } from "./laya/RenderEngine/RenderStateContext";
import { RenderClearFlag } from "./laya/RenderEngine/RenderEnum/RenderClearFlag";
import { IStageConfig, LayaEnv } from "./LayaEnv";
import { Color } from "./laya/maths/Color";
import { URL } from "./laya/net/URL";
import { RunDriver } from "./laya/utils/RunDriver";
import { Config } from "./Config";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Material } from "./laya/resource/Material";
import { VertexElementFormat } from "./laya/renders/VertexElementFormat";

/**
 * <code>Laya</code> 是全局对象的引用入口集。
 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
 */
export class Laya {
    /** 舞台对象的引用。*/
    static stage: Stage = null;

    /**@private 系统时钟管理器，引擎内部使用*/
    static systemTimer: Timer = null;
    /**@private 组件的物理时钟管理器*/
    static physicsTimer: Timer = null;
    /**游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果*/
    static timer: Timer = null;
    /** 加载管理器的引用。*/
    static loader: Loader = null;

    /**@private Render 类的引用。*/
    static render: Render;

    private static _inited = false;
    private static _initCallbacks: Array<() => void | Promise<void>> = [];
    private static _beforeInitCallbacks: Array<(stageConfig: IStageConfig) => void | Promise<void>> = [];
    private static _afterInitCallbacks: Array<() => void | Promise<void>> = [];

    /**
     * 初始化引擎。使用引擎需要先初始化引擎。
     */
    static init(stageConfig?: IStageConfig): Promise<void>;
    /**
     * 初始化引擎。使用引擎需要先初始化引擎。
     * @param	width 初始化的游戏窗口宽度，又称设计宽度。
     * @param	height 初始化的游戏窗口高度，又称设计高度。
     */
    static init(width: number, height: number): Promise<void>;
    static init(...args: any[]): Promise<void> {
        if (Laya._inited)
            return Promise.resolve();
        Laya._inited = true;

        if (!WebGL.enable())
            throw new Error("Must support webGL!");

        let stageConfig: IStageConfig;
        if (typeof (args[0]) === "number") {
            stageConfig = {
                designWidth: args[0],
                designHeight: args[1]
            };
        }
        else
            stageConfig = args[0];

        Browser.__init__();
        URL.__init__();

        let laya3D = (<any>window)["Laya3D"];
        if (laya3D) {
            RunDriver.changeWebGLSize = laya3D._changeWebGLSize;
            Render.is3DMode = true;
        }

        // 创建主画布
        //这个其实在Render中感觉更合理，但是runtime要求第一个canvas是主画布，所以必须在下面的那个离线画布之前
        let mainCanv = Browser.mainCanvas = new HTMLCanvas(true);
        //Render._mainCanvas = mainCanv;
        let style: any = mainCanv.source.style;
        style.position = 'absolute';
        style.top = style.left = "0px";
        style.background = "#000000";

        if (!Browser.onKGMiniGame && !Browser.onAlipayMiniGame) {
            Browser.container.appendChild(mainCanv.source);//xiaosong add
        }

        Browser.canvas = new HTMLCanvas(true);
        Browser.context = <CanvasRenderingContext2D>(Browser.canvas.getContext('2d') as any);
        Browser.supportWebAudio = SoundManager.__init__();
        Browser.supportLocalStorage = LocalStorage.__init__();

        systemTimer = new Timer(false);
        physicsTimer = new Timer(false);
        timer = new Timer(false);
        loader = new Loader();

        Laya.systemTimer = Timer.gSysTimer = systemTimer;
        Laya.timer = timer;
        Laya.physicsTimer = physicsTimer;
        Laya.loader = loader;

        ILaya.systemTimer = systemTimer;
        ILaya.physicsTimer = physicsTimer;
        ILaya.timer = timer;
        ILaya.loader = loader;

        WeakObject.__init__();
        Mouse.__init__();

        if (LayaEnv.isConch) {
            Laya.enableNative();
        }
        CacheManger.beginCheck();

        let steps: Array<() => any> = [];

        if (LayaEnv.beforeInit)
            steps.push(() => LayaEnv.beforeInit(stageConfig));
        steps.push(() => Promise.all(Laya._beforeInitCallbacks.map(func => func(stageConfig))));

        steps.push(() => LayaGL.renderOBJCreate.createEngine(null, Browser.mainCanvas));
        steps.push(() => Laya.initRender2D(stageConfig));
        if (laya3D)
            steps.push(() => laya3D.__init__());
        steps.push(() => Promise.all(Laya._initCallbacks.map(func => func())));

        steps.push(() => Promise.all(Laya._afterInitCallbacks.map(func => func())));

        if (LayaEnv.afterInit)
            steps.push(() => LayaEnv.afterInit());

        let p = Promise.resolve();
        for (let step of steps)
            p = p.then(step);

        return p;
    }

    static initRender2D(stageConfig: IStageConfig) {
        stage = ((<any>window)).stage = ILaya.stage = Laya.stage = new Stage();
        
        VertexElementFormat.__init__();
        Shader3D.init();
        MeshQuadTexture.__int__();
        MeshVG.__init__();
        MeshTexture.__init__();

        Laya.render = new Render(0, 0, Browser.mainCanvas);
        render = Laya.render;
        stage.size(stageConfig.designWidth, stageConfig.designHeight);
        if (stageConfig.scaleMode)
            stage.scaleMode = stageConfig.scaleMode;
        if (stageConfig.screenMode)
            stage.screenMode = stageConfig.screenMode;
        if (stageConfig.alignV)
            stage.alignV = stageConfig.alignV;
        if (stageConfig.alignH)
            stage.alignH = stageConfig.alignH;
        if (Config.isAlpha)
            stage.bgColor = null;
        else if (stageConfig.backgroundColor)
            stage.bgColor = stageConfig.backgroundColor;

        if (LayaEnv.isConch && (window as any).conch.setGlobalRepaint) {
            (window as any).conch.setGlobalRepaint(stage.setGlobalRepaint.bind(stage));
        }

        RenderStateContext.__init__();
        MeshParticle2D.__init__();
        RenderSprite.__init__();
        Material.__initDefine__();
        InputManager.__init__(stage, Render.canvas);
        if (!!(window as any).conch && "conchUseWXAdapter" in Browser.window) {
            Input.isAppUseNewInput = true;
        }
        Input.__init__();
        SoundManager.autoStopMusic = true;
        //Init internal 2D Value2D
        Value2D._initone(RenderSpriteData.Texture2D, TextureSV);
        Value2D._initone(RenderSpriteData.Primitive, PrimitiveSV);
    }

    /**
     * 表示是否捕获全局错误并弹出提示。默认为false。
     * 适用于移动设备等不方便调试的时候，设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈。
     */
    static alertGlobalError(value: boolean) {
        var erralert: number = 0;
        if (value) {
            Browser.window.onerror = function (msg: string, url: string, line: string, column: string, detail: any): void {
                if (erralert++ < 5 && detail)
                    this.alert("出错啦，请把此信息截图给研发商\n" + msg + "\n" + detail.stack);
            }
        } else {
            Browser.window.onerror = null;
        }
    }
    /**@internal */
    private static _evcode: string = "eva" + "l";

    /**@internal */
    static _runScript(script: string): any {
        return Browser.window[Laya._evcode](script);
    }

    /**
     * 开启DebugPanel
     * @param	debugJsPath laya.debugtool.js文件路径
     */
    static enableDebugPanel(debugJsPath: string = "libs/laya.debugtool.js"): void {
        if (!(window as any)['Laya']["DebugPanel"]) {
            var script: any = Browser.createElement("script");
            script.onload = function (): void {
                (window as any)['Laya']["DebugPanel"].enable();
            }
            script.src = debugJsPath;
            Browser.document.body.appendChild(script);
        } else {
            (window as any)['Laya']["DebugPanel"].enable();
        }
    }

    private static isNativeRender_enable: boolean = false;

    /**@private */
    private static enableNative(): void {
        if (Laya.isNativeRender_enable)
            return;
        Laya.isNativeRender_enable = true;
        RenderState2D.width = Browser.window.innerWidth;
        RenderState2D.height = Browser.window.innerHeight;

        Stage.clear = function (color: string): void {
            Context.set2DRenderConfig();//渲染2D前要还原2D状态,否则可能受3D影响
            var c: any[] = ColorUtils.create(color).arrColor;

           // LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color | RenderClearFlag.Depth, new Color(c[0], c[1], c[2], c[3]), 1, 0);
            // if (c) gl.clearColor(c[0], c[1], c[2], c[3]);
            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            RenderState2D.clear();
        }

        Sprite.drawToCanvas = function (sprite: Sprite, _renderType: number, canvasWidth: number, canvasHeight: number, offsetX: number, offsetY: number): any {
            offsetX -= sprite.x;
            offsetY -= sprite.y;
            offsetX |= 0;
            offsetY |= 0;
            canvasWidth |= 0;
            canvasHeight |= 0;

            var canv: HTMLCanvas = new HTMLCanvas(false);
            var ctx  = canv.getContext('2d') as Context;
            canv.size(canvasWidth, canvasHeight);

            ctx.asBitmap = true;
            ctx._targets.start();
            RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
            ctx.flush();
            ctx._targets.end();
            ctx._targets.restore();
            return canv;
        }
        //RenderTexture2D.prototype._uv = RenderTexture2D.flipyuv;
        Object["defineProperty"](RenderTexture2D.prototype, "uv", {
            "get": function (): any {
                return this._uv;
            },
            "set": function (v: any): void {
                this._uv = v;
            }
        }
        );
        HTMLCanvas.prototype.getTexture = function (): Texture | RenderTexture2D {
            if (!this._texture) {
                // @ts-ignore
                this._texture = this.context._targets;
                //遗留的奇怪代码，先注释掉
                // @ts-ignore
                this._texture.uv = RenderTexture2D.flipyuv;
                // @ts-ignore
                this._texture.bitmap = this._texture;
            }
            return this._texture;
        }
    }
    /**
     * 引擎各个模块，例如物理，寻路等，如果有初始化逻辑可以在这里注册初始化函数。开发者一般不直接使用。
     * @param callback 模块的初始化函数
     */
    static addInitCallback(callback: () => void | Promise<void>) {
        Laya._initCallbacks.push(callback);
    }

    /**
     * 在引擎初始化前执行自定义逻辑。此时Stage尚未创建，因为可以修改stageConfig实现动态舞台配置。
     * @param callback 
     */
    static addBeforeInitCallback(callback: (stageConfig: IStageConfig) => void | Promise<void>): void {
        Laya._beforeInitCallbacks.push(callback);
    }

    /**
     * 在引擎初始化后执行自定义逻辑
     * @param callback 
     */
    static addAfterInitCallback(callback: () => void | Promise<void>): void {
        Laya._afterInitCallbacks.push(callback);
    }
}

ILaya.Laya = Laya;
ILaya.Loader = Loader;
ILaya.Context = Context;
ILaya.Browser = Browser;

/**@internal */
export var init = Laya.init;
/**@internal */
export var stage: Stage;
/**@internal */
export var systemTimer: Timer;
/**@internal */
export var physicsTimer: Timer;
/**@internal */
export var timer: Timer;
/**@internal */
export var loader: Loader;
/**@internal */
export var render: Render;
/**@internal */
export var alertGlobalError = Laya.alertGlobalError;
/**@internal */
export var enableDebugPanel = Laya.enableDebugPanel;

export var addInitCallback = Laya.addInitCallback;
export var addBeforeInitCallback = Laya.addBeforeInitCallback;
export var addAfterInitCallback = Laya.addAfterInitCallback;