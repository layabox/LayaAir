import { HTMLCanvas } from "../resource/HTMLCanvas";
/**
 * <code>Browser</code> 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 */
export declare class Browser {
    /** 浏览器代理信息。*/
    static userAgent: string;
    /** 表示是否在移动设备，包括IOS和安卓等设备内。*/
    static onMobile: boolean;
    /** 表示是否在 IOS 设备内。*/
    static onIOS: boolean;
    /** 表示是否在 Mac 设备。*/
    static onMac: boolean;
    /** 表示是否在 IPhone 设备内。*/
    static onIPhone: boolean;
    /** 表示是否在 IPad 设备内。*/
    static onIPad: boolean;
    /** 表示是否在 Android 设备内。*/
    static onAndroid: boolean;
    /** 表示是否在 Windows Phone 设备内。*/
    static onWP: boolean;
    /** 表示是否在 QQ 浏览器内。*/
    static onQQBrowser: boolean;
    /** 表示是否在移动端 QQ 或 QQ 浏览器内。*/
    static onMQQBrowser: boolean;
    /** 表示是否在 Safari 内。*/
    static onSafari: boolean;
    /** 表示是否在 IE 浏览器内*/
    static onIE: boolean;
    /** 表示是否在 微信 内*/
    static onWeiXin: boolean;
    /** 表示是否在 PC 端。*/
    static onPC: boolean;
    /** @private */
    static onMiniGame: boolean;
    /** @private */
    static onBDMiniGame: boolean;
    /** @private */
    static onKGMiniGame: boolean;
    /** @private */
    static onQGMiniGame: boolean;
    /** @private */
    static onVVMiniGame: boolean;
    /** @private */
    static onLimixiu: boolean;
    /** @private */
    static onFirefox: boolean;
    /** @private */
    static onEdge: boolean;
    /** @private */
    static onLayaRuntime: boolean;
    /** 表示是否支持WebAudio*/
    static supportWebAudio: boolean;
    /** 表示是否支持LocalStorage*/
    static supportLocalStorage: boolean;
    /** 全局离线画布（非主画布）。主要用来测量字体、获取image数据。*/
    static canvas: HTMLCanvas;
    /** 全局离线画布上绘图的环境（非主画布）。 */
    static context: CanvasRenderingContext2D;
    /** @private */
    private static _window;
    /** @private */
    private static _document;
    /** @private */
    private static _container;
    /** @private */
    private static _pixelRatio;
    /** @private */
    static mainCanvas: any;
    /**@private */
    private static hanzi;
    /**@private */
    private static fontMap;
    /**@private */
    static measureText: Function;
    /**@private */
    static __init__(): any;
    /**
     * 创建浏览器原生节点。
     * @param	type 节点类型。
     * @return	创建的节点对象的引用。
     */
    static createElement(type: string): any;
    /**
     * 返回 Document 对象中拥有指定 id 的第一个对象的引用。
     * @param	type 节点id。
     * @return	节点对象。
     */
    static getElementById(type: string): any;
    /**
     * 移除指定的浏览器原生节点对象。
     * @param	type 节点对象。
     */
    static removeElement(ele: any): void;
    /**
     * 获取浏览器当前时间戳，单位为毫秒。
     */
    static now(): number;
    /**
     * 浏览器窗口可视宽度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，如果前者为0或为空，则选择后者。
     */
    static readonly clientWidth: number;
    /**
     * 浏览器窗口可视高度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight(不包含滚动条高度)，如果前者为0或为空，则选择后者。
     */
    static readonly clientHeight: number;
    /** 浏览器窗口物理宽度。考虑了设备像素比。*/
    static readonly width: number;
    /** 浏览器窗口物理高度。考虑了设备像素比。*/
    static readonly height: number;
    /** 获得设备像素比。*/
    static readonly pixelRatio: number;
    /**画布容器，用来盛放画布的容器。方便对画布进行控制*/
    static container: any;
    /**浏览器原生 window 对象的引用。*/
    static readonly window: any;
    /**浏览器原生 document 对象的引用。*/
    static readonly document: any;
}
