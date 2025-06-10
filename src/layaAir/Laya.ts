import { ILaya, Mutable } from "./ILaya";
import { Stage } from "./laya/display/Stage";
import { InputManager } from "./laya/events/InputManager";
import { Loader } from "./laya/net/Loader";
import { Render } from "./laya/renders/Render";
import { Browser } from "./laya/utils/Browser";
import { Timer } from "./laya/utils/Timer";
import { RenderStateContext } from "./laya/RenderEngine/RenderStateContext";
import { IStageConfig, LayaEnv } from "./LayaEnv";
import { Config } from "./Config";
import { Shader3D } from "./laya/RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Material } from "./laya/resource/Material";
import { VertexElementFormat } from "./laya/renders/VertexElementFormat";
import { Stat } from "./laya/utils/Stat";
import { RenderPassStatisticsInfo } from "./laya/RenderEngine/RenderEnum/RenderStatInfo";
import { IPhysics2DFactory } from "./laya/physics/factory/IPhysics2DFactory";
import { VertexMesh } from "./laya/RenderEngine/RenderShader/VertexMesh";
import { Laya3D } from "./Laya3D";
import { Camera2D } from "./laya/display/Scene2DSpecial/Camera2D";
import { BaseRenderNode2D } from "./laya/NodeRender2D/BaseRenderNode2D";
import { Texture2D } from "./laya/resource/Texture2D";
import { Texture2DArray } from "./laya/resource/Texture2DArray";
import { TextureCube } from "./laya/resource/TextureCube";
import { HalfFloatUtils } from "./laya/utils/HalfFloatUtils";
import { BlendMode, BlendModeHandler } from "./laya/webgl/canvas/BlendMode";
import { Shader2D } from "./laya/webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "./laya/webgl/shader/d2/ShaderDefines2D";
import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { PAL } from "./laya/platform/PlatformAdapters";
import { SoundManager } from "./laya/media/SoundManager";
import { GraphicsMesh } from "./laya/webgl/utils/GraphicsMesh";
import { Mesh2DRender } from "./laya/display/Scene2DSpecial/Mesh2DRender";
import { PostProcess2D } from "./laya/display/PostProcess2D";
import { Render2DProcessor } from "./laya/display/Render2DProcessor";
import { GraphicsRunner } from "./laya/display/Scene2DSpecial/GraphicsRunner";
import { Blit2DCMD } from "./laya/display/Scene2DSpecial/RenderCMD2D/Blit2DCMD";

/**
 * @en Laya is the reference entry for global objects.
 * 
 * The Laya class refers to some commonly used global objects, such as Laya.stage: stage, Laya.timer: time manager, Laya.loader: loading manager. Pay attention to case when using.
 * @zh Laya是全局对象的引用入口集。
 * 
 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
 * @blueprintable
 */
export class Laya {
    /**
     * @en Reference to the stage object.
     * @zh 舞台对象的引用。
     */
    static readonly stage: Stage = null;
    /**
     * @ignore 
     * @en System clock manager, used by the engine internally.
     * @zh 系统时钟管理器，引擎内部使用。
     */
    static readonly systemTimer: Timer = null;
    /**
     * @ignore
     * @en physics clock manager for components.
     * @zh 组件的物理时钟管理器
     */
    static readonly physicsTimer: Timer = null;
    /**
     * @en Main game timer, also manages scene, animation, tween effects clock. By controlling this timer's scale, fast-forward and slow-motion effects can be achieved.
     * @zh 游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果。
     */
    static readonly timer: Timer = null;
    /**
     * @en Reference to the loading manager.
     * @zh 加载管理器的引用。
     */
    static readonly loader: Loader = null;

    /**
     * @ignore
     * @en Reference to the Render class.
     * @zh physics2D类的引用。
     */
    static physics2D: IPhysics2DFactory;

    private static _inited = false;
    private static _initCallbacks: Array<() => void | Promise<void>> = [];
    private static _beforeInitCallbacks: Array<(stageConfig: IStageConfig) => void | Promise<void>> = [];
    private static _afterInitCallbacks: Array<() => void | Promise<void>> = [];

    /**
     * @en Initialize the engine. To use the engine, you need to initialize it first.
     * @param stageConfig Stage settings used to initialize the engine
     * @zh 初始化引擎。使用引擎需要先初始化引擎。
     * @param stageConfig 初始化引擎的舞台设置。
     * @blueprintIgnore
     */
    static init(stageConfig?: IStageConfig): Promise<void>;

    /**
     * @en Initialize the engine. To use the engine, you need to initialize it first.
     * @param width The width of the initialized game window, also known as design width.
     * @param height The height of the initialized game window, also known as design height.
     * @zh 初始化引擎。使用引擎需要先初始化引擎。
     * @param width 初始化的游戏窗口宽度，又称设计宽度。
     * @param height 初始化的游戏窗口高度，又称设计高度。
     * @blueprintIgnore
     */
    static init(width: number, height: number): Promise<void>;
    static init(...args: any[]): Promise<void> {
        if (Laya._inited)
            return Promise.resolve();
        Laya._inited = true;

        let stageConfig: IStageConfig;
        if (typeof (args[0]) === "number") {
            stageConfig = {
                designWidth: args[0],
                designHeight: args[1]
            };
        }
        else
            stageConfig = args[0];

        ILaya.systemTimer = (<Mutable<typeof Laya>>Laya).systemTimer = Timer.gSysTimer = systemTimer = new Timer(false);
        ILaya.timer = (<Mutable<typeof Laya>>Laya).timer = timer = new Timer(false);
        ILaya.physicsTimer = (<Mutable<typeof Laya>>Laya).physicsTimer = physicsTimer = new Timer(false);
        ILaya.loader = (<Mutable<typeof Laya>>Laya).loader = loader = new Loader();

        //初始化平台适配器
        PAL.__init__();

        let steps: Array<() => any> = [];

        //创建主画布
        steps.push(() => {
            let mainCanvas = Browser.mainCanvas = new HTMLCanvas(false);
            mainCanvas.source = PAL.browser.createMainCanvas();

            //创建离屏画布
            Browser.canvas = new HTMLCanvas(true);
            Browser.context = Browser.canvas.context as any;

            return PAL.browser.start();
        });

        if (LayaEnv.beforeInit)
            steps.push(() => LayaEnv.beforeInit(stageConfig));

        //beforeInitCallbacks 是按顺序执行
        Laya._beforeInitCallbacks.forEach(func => steps.push(() => func(stageConfig)));

        steps.push(() => LayaGL.renderDeviceFactory.createEngine(null, Browser.mainCanvas));

        steps.push(() => Laya.initRender2D(stageConfig));

        let laya3D = <typeof Laya3D>(<any>window)["Laya3D"];
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

    private static initRender2D(stageConfig: IStageConfig) {
        PAL.browser.onInitRender();

        stage = ((<any>window)).stage = ILaya.stage = (<Mutable<typeof Laya>>Laya).stage = new Stage();

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
            stage.bgColor = "#00000000";
        else if (stageConfig.backgroundColor)
            stage.bgColor = stageConfig.backgroundColor;

        VertexElementFormat.__init__();
        VertexMesh.__init__();
        Shader3D.init();

        GraphicsMesh.__init__();
        ShaderDefines2D.__init__();

        Render.__init__();

        Shader2D.__init__();
        BlendModeHandler._init_();
        Texture2D.__init__();
        TextureCube.__init__();
        Texture2DArray.__init__();
        HalfFloatUtils.__init__();

        GraphicsRunner.__init__();
        Render2DProcessor.__init__();
        BaseRenderNode2D.initBaseRender2DCommandEncoder();
        Camera2D.shaderValueInit();
        Blit2DCMD.__init__();
        PostProcess2D.init();
        RenderStateContext.__init__();
        Material.__initDefine__();
        InputManager.__init__();
        SoundManager.__init__();

    }

    /**
     * @en Pop up error information, suitable for mobile devices and other convenient debugging.
     * @param value Indicates whether to capture global errors and display a prompt. When set to true, detailed error stacks can be thrown in a pop-up window if unknown errors occur. The default is false.
     * @zh 弹出错误信息，适用于移动设备等不方便调试的时候，
     * @param value 表示是否捕获全局错误并弹出提示。设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈,默认为false。
     */
    static alertGlobalError(value: boolean) {
        if (value)
            PAL.browser.captureGlobalError(Laya._onGlobalError);
        else
            PAL.browser.captureGlobalError(null);
    }

    /**
     * @en Global error callback function. Will be called when an error occurs in the engine and alertGlobalError is set to true.
     * @param ev The error event object.
     * @zh 全局错误回调函数，当引擎发生错误并且alertGlobalError设置为true时会被调用。
     * @param ev 错误事件对象。
     */
    static _onGlobalError(ev: ErrorEvent | PromiseRejectionEvent) {
        let msg = "Something went wrong\n"
            + ((ev as ErrorEvent).message || (ev as PromiseRejectionEvent).reason)
            + "\n"
            + ((ev as any).stack || (ev as ErrorEvent).error?.stack);
        if (_erralert++ < 5)
            PAL.browser.alert(msg);
        else
            console.error(msg);
    }

    /**
     * @en Adds an initialization function. Various engine modules, such as physics, pathfinding, etc., can register their initialization logic here if needed. 
     * Developers typically do not use this directly. All registered callbacks are executed in parallel.
     * @param callback The initialization function of the module.
     * @zh 新增初始化函数，引擎各个模块，例如物理，寻路等，如果有初始化逻辑可以在这里注册初始化函数。
     * 开发者一般不直接使用。所有注册的回调是并行执行。
     * @param callback 模块的初始化函数。
     * @blueprintIgnore
     */
    static addInitCallback(callback: () => void | Promise<void>) {
        Laya._initCallbacks.push(callback);
    }

    /**
     * @en Execute custom logic before engine initialization. 
     * 
     * At this time, the Stage has not been created yet, so you can modify stageConfig to implement dynamic stage configuration. All registered callbacks are executed in the order of registration.
     * @param callback The initialization function of the module.
     * @zh 在引擎初始化前执行自定义逻辑。
     * 
     * 此时 Stage 尚未创建，可以修改 stageConfig 实现动态舞台配置。所有注册的回调按注册顺序依次执行。
     * @param callback 模块的初始化函数。
     * @blueprintIgnore
     */
    static addBeforeInitCallback(callback: (stageConfig: IStageConfig) => void | Promise<void>): void {
        Laya._beforeInitCallbacks.push(callback);
    }

    /**
     * @en Execute custom logic after engine initialization. All registered callbacks are executed in the order of registration.
     * @param callback The initialization function of the module.
     * @zh 在引擎初始化后执行自定义逻辑。所有注册的回调按注册顺序依次执行。
     * @param callback 模块的初始化函数。
     * @blueprintIgnore
     */
    static addAfterInitCallback(callback: () => void | Promise<void>): void {
        Laya._afterInitCallbacks.push(callback);
    }

    /**
     * @en Import a native library(e.g. dll/so/dylib). If not in the Conch environment, this function will return null.
     * @param name The name of the library to import. e.g. `test.dll` 
     * @returns The imported object.
     * @zh 导入一个原生库（如dll/so/dylib）。
     * @param name 要导入的库的名称。例如：`test.dll`
     * @returns 导入的对象。 
     */
    static importNative(name: string): any {
        if (!LayaEnv.isConch)
            return null;

        let path = (<any>window).$DLL_PATHS[name];
        let obj = (<any>window).importNative(path || name);
        if (!obj)
            throw new Error(`failed to load ${name}`);
        return obj;
    }
}

var _erralert: number = 0;

ILaya.Laya = Laya;
ILaya.Loader = Loader;
ILaya.InputManager = InputManager;

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
export var alertGlobalError = Laya.alertGlobalError;

export var addInitCallback = Laya.addInitCallback;
export var addBeforeInitCallback = Laya.addBeforeInitCallback;
export var addAfterInitCallback = Laya.addAfterInitCallback;
export var importNative = Laya.importNative;