import { Sprite } from "./laya/display/Sprite";
import { Stage } from "./laya/display/Stage";
import { LoaderManager } from "./laya/net/LoaderManager";
import { Render } from "./laya/renders/Render";
import { Timer } from "./laya/utils/Timer";
/**
 * <code>Laya</code> 是全局对象的引用入口集。
 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
 */
export declare class Laya {
    /** 舞台对象的引用。*/
    static stage: Stage;
    /**@private 系统时钟管理器，引擎内部使用*/
    static systemTimer: Timer;
    /**@private 组件的start时钟管理器*/
    static startTimer: Timer;
    /**@private 组件的物理时钟管理器*/
    static physicsTimer: Timer;
    /**@private 组件的update时钟管理器*/
    static updateTimer: Timer;
    /**@private 组件的lateUpdate时钟管理器*/
    static lateTimer: Timer;
    /**游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果*/
    static timer: Timer;
    /** 加载管理器的引用。*/
    static loader: LoaderManager;
    /** 当前引擎版本。*/
    static version: string;
    /**@private Render 类的引用。*/
    static render: Render;
    /**@private */
    static _currentStage: Sprite;
    /**@private */
    private static _isinit;
    /**是否是微信小游戏子域，默认为false**/
    static isWXOpenDataContext: boolean;
    /**微信小游戏是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false**/
    static isWXPosMsg: boolean;
    /**
     * 初始化引擎。使用引擎需要先初始化引擎，否则可能会报错。
     * @param	width 初始化的游戏窗口宽度，又称设计宽度。
     * @param	height	初始化的游戏窗口高度，又称设计高度。
     * @param	plugins 插件列表，比如 WebGL（使用WebGL方式渲染）。
     * @return	返回原生canvas引用，方便对canvas属性进行修改
     */
    static init(width: number, height: number, ...plugins: any[]): any;
    /**@private */
    static _getUrlPath(): string;
    /**@private */
    static _arrayBufferSlice(start: number, end: number): ArrayBuffer;
    /**
     * 表示是否捕获全局错误并弹出提示。默认为false。
     * 适用于移动设备等不方便调试的时候，设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈。
     */
    static alertGlobalError: boolean;
    private static _evcode;
    /**@private */
    static _runScript(script: string): any;
    /**
     * 开启DebugPanel
     * @param	debugJsPath laya.debugtool.js文件路径
     */
    static enableDebugPanel(debugJsPath?: string): void;
    private static isNativeRender_enable;
    /**@private */
    private static enableNative;
}
export declare var init: typeof Laya.init;
export declare var stage: any;
export declare var systemTimer: any;
export declare var startTimer: any;
export declare var physicsTimer: any;
export declare var updateTimer: any;
export declare var lateTimer: any;
export declare var timer: any;
export declare var loader: any;
export declare var version: any;
export declare var render: any;
export declare var isWXOpenDataContext: any;
export declare var isWXPosMsg: any;
export declare var alertGlobalError: boolean;
export declare var enableDebugPanel: typeof Laya.enableDebugPanel;
