import { ILaya } from "./ILaya";
import { Input } from "./laya/display/Input";
import { Sprite } from "./laya/display/Sprite";
import { Stage } from "./laya/display/Stage";
import { InputManager } from "./laya/events/InputManager";
import { LayaGL } from "./laya/layagl/LayaGL";
import { SoundManager } from "./laya/media/SoundManager";
import { Loader } from "./laya/net/Loader";
import { LocalStorage } from "./laya/net/LocalStorage";
import { Render } from "./laya/renders/Render";
import { RenderSprite } from "./laya/renders/RenderSprite";
import { Context } from "./laya/resource/Context";
import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { RenderTexture2D } from "./laya/resource/RenderTexture2D";
import { Texture } from "./laya/resource/Texture";
import { Browser } from "./laya/utils/Browser";
import { CacheManger } from "./laya/utils/CacheManger";
import { ColorUtils } from "./laya/utils/ColorUtils";
import { Stat } from "./laya/utils/Stat";
import { StatUI } from "./laya/utils/StatUI";
import { Timer } from "./laya/utils/Timer";
import { ShaderDefines2D } from "./laya/webgl/shader/d2/ShaderDefines2D";
import { SkinSV } from "./laya/webgl/shader/d2/skinAnishader/SkinSV";
import { PrimitiveSV } from "./laya/webgl/shader/d2/value/PrimitiveSV";
import { TextureSV } from "./laya/webgl/shader/d2/value/TextureSV";
import { Value2D } from "./laya/webgl/shader/d2/value/Value2D";
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
import { LayaEnv } from "./LayaEnv";
import { Color } from "./laya/maths/Color";
/**
 * <code>Laya</code> 是全局对象的引用入口集。
 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
 */
export class Laya {
    /*[COMPILER OPTIONS:normal]*/
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
    /** 当前引擎版本。*/

    /**@private Render 类的引用。*/
    static render: Render;
    /**@internal */
    private static _isinit: boolean = false;
    /**是否是微信小游戏子域，默认为false**/
    static isWXOpenDataContext: boolean = false;
    /**微信小游戏是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false**/
    static isWXPosMsg: boolean = false;
    /**@internal */
    static WasmModules: { [key: string]: { exports: WebAssembly.Exports, memory: WebAssembly.Memory } } = {};

    /**
     * 初始化引擎。使用引擎需要先初始化引擎，否则可能会报错。
     * @param	width 初始化的游戏窗口宽度，又称设计宽度。
     * @param	height	初始化的游戏窗口高度，又称设计高度。
     * @param	plugins 插件列表，比如 WebGL（使用WebGL方式渲染）。
     * @return	返回原生canvas引用，方便对canvas属性进行修改
     */
    static init(width: number, height: number, ...plugins: any[]): any {
        if (Laya._isinit) return;
        Laya._isinit = true;
        ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = Laya._arrayBufferSlice);
        Browser.__init__();

        // 创建主画布
        //这个其实在Render中感觉更合理，但是runtime要求第一个canvas是主画布，所以必须在下面的那个离线画布之前
        var mainCanv = Browser.mainCanvas = new HTMLCanvas(true);
        //Render._mainCanvas = mainCanv;
        var style: any = mainCanv.source.style;
        style.position = 'absolute';
        style.top = style.left = "0px";
        style.background = "#000000";

        if (!Browser.onKGMiniGame && !Browser.onAlipayMiniGame) {
            Browser.container.appendChild(mainCanv.source);//xiaosong add
        }

        // 创建离屏画布
        //创建离线画布
        Browser.canvas = new HTMLCanvas(true);
        Browser.context = <CanvasRenderingContext2D>(Browser.canvas.getContext('2d') as any);
        Browser.supportWebAudio = SoundManager.__init__();
        Browser.supportLocalStorage = LocalStorage.__init__();

        //temp TODO 以后分包
        Laya.systemTimer = new Timer(false);
        systemTimer = Timer.gSysTimer = Laya.systemTimer;
        Laya.physicsTimer = new Timer(false);
        Laya.timer = new Timer(false);

        ILaya.systemTimer = Laya.systemTimer;
        timer = ILaya.timer = Laya.timer;
        physicsTimer = ILaya.physicsTimer = Laya.physicsTimer;

        Laya.loader = new Loader();
        ILaya.Laya = Laya;
        loader = ILaya.loader = Laya.loader;

        WeakObject.__init__();
        Mouse.__init__();

        WebGL.inner_enable();
        if (plugins) {
            for (var i = 0, n = plugins.length; i < n; i++) {
                if (plugins[i] && plugins[i].enable) {
                    plugins[i].enable();
                }
            }
        }
        if (LayaEnv.isConch) {
            Laya.enableNative();
        }
        CacheManger.beginCheck();
        stage = Laya.stage = new Stage();
        ILaya.stage = Laya.stage;

        if (LayaEnv.isConch && (window as any).conch.setGlobalRepaint) {
            (window as any).conch.setGlobalRepaint(Laya.stage.setGlobalRepaint.bind(Laya.stage));
        }

        MeshQuadTexture.__int__();
        MeshVG.__init__();
        MeshTexture.__init__();
        Laya.render = new Render(0, 0, Browser.mainCanvas);
        render = Laya.render;
        Laya.stage.size(width, height);
        ((<any>window)).stage = Laya.stage;

        RenderStateContext.__init__();
        MeshParticle2D.__init__();
        RenderSprite.__init__();
        InputManager.__init__(Laya.stage, Render.canvas);
        if (!!(window as any).conch && "conchUseWXAdapter" in Browser.window) {
            Input.isAppUseNewInput = true;
        }
        Input.__init__();
        SoundManager.autoStopMusic = true;
        Stat._StatRender = new StatUI();

        Value2D._initone(ShaderDefines2D.TEXTURE2D, TextureSV);
        Value2D._initone(ShaderDefines2D.TEXTURE2D | ShaderDefines2D.FILTERGLOW, TextureSV);
        Value2D._initone(ShaderDefines2D.PRIMITIVE, PrimitiveSV);
        Value2D._initone(ShaderDefines2D.SKINMESH, SkinSV);

        return Render.canvas;
    }

    static addWasmModule(id: string, exports: WebAssembly.Exports, memory: WebAssembly.Memory) {
        Laya.WasmModules[id] = { exports, memory };
    }

    /**@internal */
    static _arrayBufferSlice(start: number, end: number): ArrayBuffer {
        var arr: any = this;
        var arrU8List: Uint8Array = new Uint8Array(arr, start, end - start);
        var newU8List: Uint8Array = new Uint8Array(arrU8List.length);
        newU8List.set(arrU8List);
        return newU8List.buffer;
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
        Browser.measureText = function (txt: string, font: string): any {
            (window as any)["conchTextCanvas"].font = font;
            return (window as any)["conchTextCanvas"].measureText(txt);
        }

        Stage.clear = function (color: string): void {
            Context.set2DRenderConfig();//渲染2D前要还原2D状态,否则可能受3D影响
            var c: any[] = ColorUtils.create(color).arrColor;

            LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color | RenderClearFlag.Depth, new Color(c[0], c[1], c[2], c[3]), 1);
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
            var ctx: Context = canv.getContext('2d') as Context;
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
}

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
export var startTimer: Timer;
/**@internal */
export var physicsTimer: Timer;
/**@internal */
export var updateTimer: Timer;
/**@internal */
export var lateTimer: Timer;
/**@internal */
export var timer: Timer;
/**@internal */
export var loader: Loader;
/**@internal */
export var render: Render;
/**@internal */
export var isWXOpenDataContext: boolean;
/**@internal */
export var isWXPosMsg: boolean;
/**@internal */
export var alertGlobalError = Laya.alertGlobalError;
/**@internal */
export var enableDebugPanel = Laya.enableDebugPanel;