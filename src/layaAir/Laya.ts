import { ILaya } from "./ILaya";
import { Input } from "./laya/display/Input";
import { Stage } from "./laya/display/Stage";
import { InputManager } from "./laya/events/InputManager";
import { SoundManager } from "./laya/media/SoundManager";
import { Loader } from "./laya/net/Loader";
import { LocalStorage } from "./laya/net/LocalStorage";
import { Render } from "./laya/renders/Render";
import { RenderSprite } from "./laya/renders/RenderSprite";
import { Context } from "./laya/renders/Context";
import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { Browser } from "./laya/utils/Browser";
import { CacheManger } from "./laya/utils/CacheManger";
import { Timer } from "./laya/utils/Timer";
import { PrimitiveSV } from "./laya/webgl/shader/d2/value/PrimitiveSV";
import { TextureSV } from "./laya/webgl/shader/d2/value/TextureSV";
import { RenderSpriteData, Value2D } from "./laya/webgl/shader/d2/value/Value2D";
import { WebGL } from "./laya/webgl/WebGL";
import { Mouse } from "./laya/utils/Mouse";
import { MeshVG } from "./laya/webgl/utils/MeshVG";
import { MeshQuadTexture } from "./laya/webgl/utils/MeshQuadTexture";
import { MeshTexture } from "./laya/webgl/utils/MeshTexture";
import { WeakObject } from "./laya/utils/WeakObject";
import { RenderStateContext } from "./laya/RenderEngine/RenderStateContext";
import { IStageConfig, LayaEnv } from "./LayaEnv";
import { URL } from "./laya/net/URL";
import { RunDriver } from "./laya/utils/RunDriver";
import { Config } from "./Config";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Material } from "./laya/resource/Material";
import { VertexElementFormat } from "./laya/renders/VertexElementFormat";
import { DrawStyle } from "./laya/webgl/canvas/DrawStyle";
import { Stat } from "./laya/utils/Stat";
import { RenderPassStatisticsInfo } from "./laya/RenderEngine/RenderEnum/RenderStatInfo";
import { TileMapLayer } from "./laya/display/Scene2DSpecial/TileMap/TileMapLayer";
import { IPhysiscs2DFactory } from "./laya/physics/IPhysiscs2DFactory";

/**
 * @en Laya is the reference entry for global objects.
 * @en The Laya class refers to some commonly used global objects, such as Laya.stage: stage, Laya.timer: time manager, Laya.loader: loading manager. Pay attention to case when using.
 * @zh Laya是全局对象的引用入口集。
 * @zh Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
 */
export class Laya {
    /**
     * @en Reference to the stage object.
     * @zh 舞台对象的引用。
     */
    static stage: Stage = null;

    /**
     * @ignore 
     * @en System clock manager, used by the engine internally.
     * @zh 系统时钟管理器，引擎内部使用。
     */
    static systemTimer: Timer = null;
    /**
     * @ignore
     * @en physics clock manager for components.
     * @zh 组件的物理时钟管理器
     */
    static physicsTimer: Timer = null;
    /**
     * @en Main game timer, also manages scene, animation, tween effects clock. By controlling this timer's scale, fast-forward and slow-motion effects can be achieved.
     * @zh 游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果。
     */
    static timer: Timer = null;
    /**
     * @en Reference to the loading manager.
     * @zh 加载管理器的引用。
     */
    static loader: Loader = null;
    /**
     * @ignore
     * @en Reference to the Render class.
     * @zh Render类的引用。
     */
    static render: Render;

    /**
     * @ignore
     * @en Reference to the Render class.
     * @zh physics2D类的引用。
     */
    static physics2D:IPhysiscs2DFactory;
    private static _inited = false;
    private static _initCallbacks: Array<() => void | Promise<void>> = [];
    private static _beforeInitCallbacks: Array<(stageConfig: IStageConfig) => void | Promise<void>> = [];
    private static _afterInitCallbacks: Array<() => void | Promise<void>> = [];
    private static _evcode: string = "eva" + "l";
    private static isNativeRender_enable: boolean = false;

    /**
     * @en Initialize the engine. To use the engine, you need to initialize it first.
     * @param stageConfig Stage settings used to initialize the engine
     * @zh 初始化引擎。使用引擎需要先初始化引擎。
     * @param stageConfig 初始化引擎的舞台设置。
     */
    static init(stageConfig?: IStageConfig): Promise<void>;

    /**
     * @en Initialize the engine. To use the engine, you need to initialize it first.
     * @param width The width of the initialized game window, also known as design width.
     * @param height The height of the initialized game window, also known as design height.
     * @zh 初始化引擎。使用引擎需要先初始化引擎。
     * @param width 初始化的游戏窗口宽度，又称设计宽度。
     * @param height 初始化的游戏窗口高度，又称设计高度。
     */
    static init(width: number, height: number): Promise<void>;
    static init(...args: any[]): Promise<void> {
        if (Laya._inited)
            return Promise.resolve();
        Laya._inited = true;
        Stat.renderPassStatArray.length = RenderPassStatisticsInfo.RenderPassStatisticCount;
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
        Laya._setStyleInfo(mainCanv);
        if (!Browser.onKGMiniGame && !Browser.onAlipayMiniGame && !Browser.onTBMiniGame) {
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

        CacheManger.beginCheck();

        let steps: Array<() => any> = [];

        if (LayaEnv.beforeInit)
            steps.push(() => LayaEnv.beforeInit(stageConfig));

        //beforeInitCallbacks 是按顺序执行
        Laya._beforeInitCallbacks.forEach(func => steps.push(() => func(stageConfig)));

        steps.push(() => LayaGL.renderOBJCreate.createEngine(null, Browser.mainCanvas));
        steps.push(() => Laya.initRender2D(stageConfig));
        if (laya3D)
            steps.push(() => laya3D.__init__());

        //initCallbacks 是并发执行
        steps.push(() => Promise.all(Laya._initCallbacks.map(func => func())));

        //afterInitCallbacks 是按顺序执行
        steps.push(() => {
            let p = Promise.resolve();
            for (let func of Laya._afterInitCallbacks)
                p = p.then(func);
            return p;
        });

        if (LayaEnv.afterInit)
            steps.push(() => LayaEnv.afterInit());

        let p = Promise.resolve();
        for (let step of steps)
            p = p.then(step);

        return p;
    }

    /**
     * @internal
     * 适配淘宝小游戏
     * @param mainCanv 
     */
    static _setStyleInfo(mainCanv: HTMLCanvas): void {
        let style: any = mainCanv.source.style;
        style.position = 'absolute';
        style.top = style.left = "0px";
        style.background = "#000000";
    }

    /**
     * @en Initialize 2D rendering.
     * @param stageConfig Settings used to initialize 2D rendering.
     * @zh 初始化2D渲染。
     * @param stageConfig 用于初始化2D的设置。
     */
    static initRender2D(stageConfig: IStageConfig) {
        stage = ((<any>window)).stage = ILaya.stage = Laya.stage = new Stage();

        VertexElementFormat.__init__();
        Shader3D.init();
        MeshQuadTexture.__int__();
        MeshVG.__init__();
        MeshTexture.__init__();
        

        Laya.render = Laya.createRender();
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
            stage.bgColor = "#000000";
        else if (stageConfig.backgroundColor)
            stage.bgColor = stageConfig.backgroundColor;

        if (LayaEnv.isConch && (window as any).conch.setGlobalRepaint) {
            (window as any).conch.setGlobalRepaint(stage.setGlobalRepaint.bind(stage));
        }

        RenderStateContext.__init__();
        RenderSprite.__init__();
        Material.__initDefine__();
        DrawStyle._Defaultinit();
        InputManager.__init__(stage, Render.canvas);
        if (!!(window as any).conch && "conchUseWXAdapter" in Browser.window) {
            Input.isAppUseNewInput = true;
        }
        Input.__init__();
        SoundManager.autoStopMusic = true;
        //Init internal 2D Value2D
        Value2D._initone(RenderSpriteData.Texture2D, TextureSV);
        Value2D._initone(RenderSpriteData.Primitive, PrimitiveSV);
        TileMapLayer.__init__();
    }

    /**
     * hook function
     * @internal
     */
    static createRender(): Render {
        return new Render(0, 0, Browser.mainCanvas);
    }

    /**
     * @en Pop up error information, suitable for mobile devices and other convenient debugging.
     * @param value Indicates whether to capture global errors and display a prompt. When set to true, detailed error stacks can be thrown in a pop-up window if unknown errors occur. The default is false.
     * @zh 弹出错误信息，适用于移动设备等不方便调试的时候，
     * @param value 表示是否捕获全局错误并弹出提示。设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈,默认为false。
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
    static _runScript(script: string): any {
        return Browser.window[Laya._evcode](script);
    }

    /**
     * @en Enable DebugPanel.
     * @param debugJsPath Path to the laya.debugtool.js file.
     * @zh 开启DebugPanel。
     * @param debugJsPath laya.debugtool.js文件路径。
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

    /**
     * @en Adds an initialization function. Various engine modules, such as physics, pathfinding, etc., can register their initialization logic here if needed. 
     * Developers typically do not use this directly. All registered callbacks are executed in parallel.
     * @param callback The initialization function of the module.
     * @zh 新增初始化函数，引擎各个模块，例如物理，寻路等，如果有初始化逻辑可以在这里注册初始化函数。
     * 开发者一般不直接使用。所有注册的回调是并行执行。
     * @param callback 模块的初始化函数。
     */
    static addInitCallback(callback: () => void | Promise<void>) {
        Laya._initCallbacks.push(callback);
    }

    /**
     * @en Execute custom logic before engine initialization. At this time, the Stage has not been created yet, so you can modify stageConfig to implement dynamic stage configuration. All registered callbacks are executed in the order of registration.
     * @param callback The initialization function of the module.
     * @zh 在引擎初始化前执行自定义逻辑。
     * 此时 Stage 尚未创建，可以修改 stageConfig 实现动态舞台配置。所有注册的回调按注册顺序依次执行。
     * @param callback 模块的初始化函数。
     */
    static addBeforeInitCallback(callback: (stageConfig: IStageConfig) => void | Promise<void>): void {
        Laya._beforeInitCallbacks.push(callback);
    }

    /**
     * @en Execute custom logic after engine initialization. All registered callbacks are executed in the order of registration.
     * @param callback The initialization function of the module.
     * @zh 在引擎初始化后执行自定义逻辑。所有注册的回调按注册顺序依次执行。
     * @param callback 模块的初始化函数。
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