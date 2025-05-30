import { ILaya } from "../../ILaya";
import { PAL } from "../platform/PlatformAdapters";
import { HTMLCanvas } from "../resource/HTMLCanvas";

/**
 * @en Browser is a browser proxy class. Encapsulate some of the features provided by the browser and native JavaScript.
 * @zh Browser 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 * @blueprintable
 */
export class Browser {

    /**
     * @en Browser proxy information.
     * @zh 浏览器代理信息。
     * @readonly
     */
    static userAgent: string;

    /**
     * @en Indicates whether the current environment is a mobile device, including iOS and Android devices.
     * @zh 表示当前环境是否为移动设备，包括 iOS 和 Android 设备。
     * @readonly
     */
    static onMobile: boolean;

    /**
     * @en Indicates whether the current environment is within an iOS device.
     * @zh 表示当前环境是否在 IOS 设备内。
     * @readonly
     */
    static onIOS: boolean;

    /**
     * @en Indicates whether the current environment is a Mac device.
     * @zh 表示当前环境是否为 Mac 设备。
     * @readonly
     */
    static onMac: boolean;

    /**
     * @en Indicates whether the current environment is within an iPhone.
     * @zh 表示当前环境是否在 iPhone 内。
     * @readonly
     */
    static onIPhone: boolean;

    /**
     * @en Indicates whether the current environment is within an iPad.
     * @zh 表示当前环境是否在 iPad 内。
     * @readonly
     */
    static onIPad: boolean;

    /**
     * @en Indicates whether the current environment is within an Android device.
     * @zh 表示当前环境是否在 Android 设备内。
     * @readonly
     */
    static onAndroid: boolean;

    /**
     * @en Indicates whether the current environment is within an OpenHarmonyOS device.
     * @zh 表示当前环境是否在 OpenHarmonyOS 设备内。
     * @readonly
     */
    static onOpenHarmonyOS: boolean

    /**
     * @en Indicates whether the current environment is within a Windows Phone device.
     * @zh 表示当前环境是否在 Windows Phone 设备内。
     * @readonly
     */
    static onWP: boolean;

    /**
     * @en Indicates whether the current environment is within the QQ browser.
     * @zh 表示当前环境是否在 QQ 浏览器内。
     * @readonly
     */
    static onQQBrowser: boolean;

    /**
     * @en Indicates whether the current environment is within the mobile QQ or QQ browser.
     * @zh 表示当前环境是否在移动 QQ 或 QQ 浏览器内。
     * @readonly
     */
    static onMQQBrowser: boolean;

    /**
     * @en Indicates whether the current environment is within Safari.
     * @zh 表示当前环境是否在 Safari 内。
     * @readonly
     */
    static onSafari: boolean;

    /**
     * @en Indicates whether the current environment is within Chrome.
     * @zh 表示当前环境是否在 Chrome 内。
     * @readonly
     */
    static onChrome: boolean;

    /**
     * @en Indicates whether the current environment is within the Internet Explorer browser.
     * @zh 表示当前环境是否在 Internet Explorer 浏览器内。
     * @readonly
     */
    static onIE: boolean;

    /**
     * @en Indicates whether the current environment is within WeChat.
     * @zh 表示当前环境是否在微信内。
     * @readonly
     */
    static onWeiXin: boolean;

    /**
     * @en Indicates whether the current environment is a PC.
     * @zh 表示当前环境是否为 PC。
     * @readonly
     */
    static onPC: boolean;

    /**
     * @deprecated
     */
    static onMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a WeChat mini-game.
     * @zh 表示当前环境是否是微信小游戏。
     * @readonly
     */
    static onWXMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Baidu mini-game.
     * @zh 表示当前环境是否是百度小游戏。
     * @readonly
     */
    static onBDMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Xiaomi mini-game.
     * @zh 表示当前环境是否是小米小游戏。
     * @readonly
     */
    static onKGMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is an OPPO mini-game.
     * @zh 表示当前环境是否是 OPPO 小游戏。
     * @readonly
     */
    static onQGMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a VIVO mini-game.
     * @zh 表示当前环境是否是 vivo 小游戏。
     * @readonly
     */
    static onVVMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is an Alipay mini-game.
     * @zh 表示当前环境是否是支付宝小游戏。
     * @readonly
     */
    static onAlipayMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a QQ mini-game on mobile.
     * @zh 表示当前环境是否是手机 QQ 小游戏。
     * @readonly
     */
    static onQQMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a BILIBILI mini-game.
     * @zh 表示当前环境是否是 BILIBILI 小游戏。
     * @readonly
     */
    static onBLMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a TikTok (Douyin) mini-game.
     * @zh 表示当前环境是否是抖音小游戏。
     * @readonly
     */
    static onTTMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Huawei mini-game.
     * @zh 表示当前环境是否是华为快游戏。
     * @readonly
     */
    static onHWMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Taobao mini-game.
     * @zh 表示当前环境是否是淘宝小游戏。
     * @readonly
     */
    static onTBMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is the Firefox browser.
     * @zh 表示当前环境是否是 Firefox 浏览器。
     * @readonly
     */
    static onFirefox: boolean;

    /**
     * @en Indicates whether the current environment is the Edge browser.
     * @zh 表示当前环境是否是 Edge 浏览器。
     * @readonly
     */
    static onEdge: boolean;

    /**
     * @en Indicates whether the current environment is running on LayaAir Native Runtime.
     * @zh 表示当前环境是否运行在 LayaAir Native Runtime。
     * @readonly
     */
    static onLayaRuntime: boolean;

    /**
     * @en Indicates whether the current environment is running in a development tool.
     * @zh 表示当前环境是否运行在开发工具中。
     * @readonly
     */
    static onDevTools: boolean;

    /**
     * @en The actual platform type, OnMobile and others are determined through UserAgent, which may be faked.
     * @zh 真实平台类型，onMobile等是通过UserAgent判断，可能具有欺骗性
     * @readonly
     */
    static platform: number = 0;
    /**
     * @en The readable name of the platform.
     * @zh 平台的可读名称。
     * @readonly
     */
    static platformName: string = "";

    /**
     * @en PC platform.
     * @zh PC 平台。
     */
    static readonly PLATFORM_PC = 0;
    /**
     * @en Android platform.
     * @zh Android 平台。
     */
    static readonly PLATFORM_ANDROID = 1;
    /**
     * @en iOS platform.
     * @zh iOS 平台。
     */
    static readonly PLATFORM_IOS = 2;

    /**
     * @en Indicates whether the environment supports touch input.
     * @zh 表示环境是否支持触摸输入。
     * @readonly
     */
    static isTouchDevice: boolean;

    /**
     * @en Indicates whether the environment supports high-performance mode on iOS devices.
     * @zh 表示环境是否支持 iOS 设备的高性能模式。
     * @readonly
     */
    static isIOSHighPerformanceMode: boolean;

    /**
     * @en Indicates whether the environment supports high-performance+ mode on iOS devices.
     * @zh 表示环境是否支持 iOS 设备的高性能+模式。
     * @readonly
     */
    static isIOSHighPerformanceModePlus: boolean;

    /**
     * @en Indicates whether the environment supports DOM.
     * @zh 表示环境是否支持 DOM。
     * @readonly
     */
    static isDomSupported: boolean = true;

    /**
     * @en The version of the system.
     * @zh 系统版本。
     * @readonly
     */
    static systemVersion: string = "";

    /**
     * @en The version of the Platform SDK.
     * @zh 平台 SDK 版本。
     * @readonly
     */
    static SDKVersion: string = "";

    /**
     * @en The global canvas.
     * @zh 全局画布。
     * @readonly
     */
    static mainCanvas: HTMLCanvas;

    /**
     * @en The global offscreen canvas, used primarily for measuring text and obtaining image data.
     * @zh 全局离屏画布，主要用来测量文本和获取图像数据。
     * @readonly
     */
    static canvas: HTMLCanvas;

    /**
     * @en The rendering context of the global offscreen canvas.
     * @zh 全局离屏画布上绘图的环境。
     * @readonly
     */
    static context: CanvasRenderingContext2D;

    /**
     * @en The loaded bundles.
     * @zh 已载入的脚本集。
     * @blueprintIgnore
     */
    static readonly bundles = new Map<string, any>();

    /**
     * @readonly
     */
    static window: Window & typeof globalThis = typeof window !== undefined ? window : null;
    /**
     * @readonly
     */
    static document: Document = typeof document !== undefined ? document : null;

    private static _clientWidth: number;
    private static _clientHeight: number;

    /**
     * @en Creates a native browser element of the specified type.
     * @param tagName The type of node to create.
     * @return A reference to the created node object.
     * @zh 创建指定类型的浏览器原生节点。
     * @param tagName 要创建的节点类型。
     * @return 创建的节点对象的引用。
     * @blueprintIgnore
     */
    static createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return PAL.browser.createElement(tagName);
    }

    /**
     * @deprecated
     */
    static getElementById(id: string): any {
        return Browser.document.getElementById(id);
    }

    /**
     * @deprecated
     */
    static removeElement(ele: any): void {
        if (ele && ele.parentNode) ele.parentNode.removeChild(ele);
    }

    /**
     * @en Gets the current timestamp in milliseconds since the epoch.
     * @zh 获取浏览器当前时间戳，单位为毫秒。
     */
    static now(): number {
        return Date.now();
    }

    /**
     * @en The viewport width of the browser window.
     * The method analyzes the browser information to determine the width, with a priority given to `window.innerWidth` (includes scrollbar width) > `document.body.clientWidth` (does not include scrollbar width).
     * If the former is 0 or undefined, the latter is chosen.
     * @zh 浏览器窗口的可视宽度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，
     * 如果前者为 0 或未定义，则选择后者。
     */
    static get clientWidth(): number {
        if (this._clientWidth != null)
            return this._clientWidth;
        else
            return PAL.browser.getClientWidth();
    }

    /**
     * @en Sets the viewport width of the browser window.
     * @zh 设置浏览器窗口的可视宽度。
     * @blueprintIgnore
     */
    static set clientWidth(value: number) {
        Browser._clientWidth = value;
    }

    /**
     * @en The viewport height of the browser window.
     * The method analyzes the browser information to determine the height, with a priority given to `window.innerHeight` (includes scrollbar height) > `document.body.clientHeight` (excluding scrollbar height) > `document.documentElement.clientHeight` (both do not include scrollbar height).
     * If the former is 0 or undefined, it falls back to the latter.
     * @zh 浏览器窗口的可视高度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight，
     * 如果前者为 0 或未定义，则选择后者。
     */
    static get clientHeight(): number {
        if (this._clientHeight != null)
            return this._clientHeight;
        else
            return PAL.browser.getClientHeight();
    }

    /**
     * @en Sets the viewport height of the browser window.
     * @zh 设置浏览器窗口的可视高度。
     * @blueprintIgnore
     */
    static set clientHeight(value: number) {
        Browser._clientHeight = value;
    }


    /**
     * @en The physical width of the browser window, taking into account the device pixel ratio.
     * @zh 浏览器窗口的物理宽度，考虑了设备像素比。
     */
    static get width(): number {
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
    }

    /**
     * @en The physical height of the browser window, taking into account the device pixel ratio.
     * @zh 浏览器窗口的物理高度，考虑了设备像素比。
     */
    static get height(): number {
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
    }

    /**
     * @en The device pixel ratio of the current environment.
     * @zh 当前环境的设备像素比。
     */
    static get pixelRatio(): number {
        return PAL.browser.getPixelRatio();
    }

    /**
     * @en The canvas container that holds the canvas element, facilitating control over the canvas.
     * @zh 用来存放画布元素的容器，方便对画布进行控制。
     */
    static get container(): HTMLElement {
        return Browser.mainCanvas.source.parentElement || document.body;
    }

    /**
     * @en Gets the value of a URL parameter.
     * @param name The name of the parameter.
     * @return The value of the parameter.
     * @zh 获取 URL 参数的值。
     * @param name 参数的名称。
     * @return 参数的值。
     */
    static getQueryString(name: string): string {
        if (!Browser.window.location || !Browser.window.location.search)
            return null;
        let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        let r = Browser.window.location.search.substring(1).match(reg);
        if (r != null)
            return unescape(r[2]);
        return null;
    }

    /**
     * @en Dynamically loads a JavaScript library from the specified source.
     * @zh 从指定源动态加载 JavaScript 库。
     */
    static loadLib(src: string, async?: boolean) {
        return new Promise<void>((resolve, reject) => {
            let script = <HTMLScriptElement>document.createElement('script');
            script.onload = function () {
                resolve();
            };
            script.onerror = function () {
                reject(`load ${src} failed`);
            };
            if (async != null)
                script.async = async;
            script.src = src;
            Browser.document.body.appendChild(script);
        });
    }
}

let win: any = window;
win.__getBundle_ = function (bundleId: string) {
    let bun = Browser.bundles.get(bundleId);
    if (!bun)
        Browser.bundles.set(bundleId, bun = {});
    return bun;
}

win.__setBundle_ = function (bundleId: string, bun: any, globalName?: string) {
    let existing = Browser.bundles.get(bundleId);
    if (existing)
        copyProps(existing, bun, "default");
    Browser.bundles.set(bundleId, bun);
    if (globalName)
        win[globalName] = bun;
}

function copyProps(to: any, from: any, except?: string) {
    var desc: any;
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of Object.getOwnPropertyNames(from))
            if (!to.hasOwnProperty(key) && key !== except)
                Object.defineProperty(to, key, { get: () => from[key], enumerable: !(desc = Object.getOwnPropertyDescriptor(from, key)) || desc.enumerable });
    }
    return to;
}