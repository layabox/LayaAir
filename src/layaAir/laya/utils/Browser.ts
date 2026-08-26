import { ILaya } from "../../ILaya";
import { URL } from "../net/URL";
import { PAL } from "../platform/PlatformAdapters";
import { HTMLCanvas } from "../resource/HTMLCanvas";

/**
 * @zh Browser 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 * @en Browser is a browser proxy class. Encapsulate some of the features provided by the browser and native JavaScript.
 * @blueprintable
 */
export class Browser {

    /**
     * @zh 浏览器代理信息。
     * @en Browser proxy information.
     * @readonly
     */
    static userAgent: string;

    /**
     * @zh 表示当前环境是否为移动设备，包括 iOS 和 Android 设备。
     * @en Indicates whether the current environment is a mobile device, including iOS and Android devices.
     * @readonly
     */
    static onMobile: boolean;

    /**
     * @zh 表示当前环境是否在 IOS 设备内。
     * @en Indicates whether the current environment is within an iOS device.
     * @readonly
     */
    static onIOS: boolean;

    /**
     * @zh 表示当前环境是否为 Mac 设备。
     * @en Indicates whether the current environment is a Mac device.
     * @readonly
     */
    static onMac: boolean;

    /**
     * @zh 表示当前环境是否在 iPhone 内。
     * @en Indicates whether the current environment is within an iPhone.
     * @readonly
     */
    static onIPhone: boolean;

    /**
     * @zh 表示当前环境是否在 iPad 内。
     * @en Indicates whether the current environment is within an iPad.
     * @readonly
     */
    static onIPad: boolean;

    /**
     * @zh 表示当前环境是否在 Android 设备内。
     * @en Indicates whether the current environment is within an Android device.
     * @readonly
     */
    static onAndroid: boolean;

    /**
     * @zh 表示当前环境是否在 OpenHarmonyOS 设备内。
     * @en Indicates whether the current environment is within an OpenHarmonyOS device.
     * @readonly
     */
    static onOpenHarmonyOS: boolean

    /**
     * @zh 表示当前环境是否在 Windows Phone 设备内。
     * @en Indicates whether the current environment is within a Windows Phone device.
     * @readonly
     */
    static onWP: boolean;

    /**
     * @zh 表示当前环境是否在 QQ 浏览器内。
     * @en Indicates whether the current environment is within the QQ browser.
     * @readonly
     */
    static onQQBrowser: boolean;

    /**
     * @zh 表示当前环境是否在移动 QQ 或 QQ 浏览器内。
     * @en Indicates whether the current environment is within the mobile QQ or QQ browser.
     * @readonly
     */
    static onMQQBrowser: boolean;

    /**
     * @zh 表示当前环境是否在 Safari 内。
     * @en Indicates whether the current environment is within Safari.
     * @readonly
     */
    static onSafari: boolean;

    /**
     * @zh 表示当前环境是否在 Chrome 内。
     * @en Indicates whether the current environment is within Chrome.
     * @readonly
     */
    static onChrome: boolean;

    /**
     * @zh 表示当前环境是否在 Internet Explorer 浏览器内。
     * @en Indicates whether the current environment is within the Internet Explorer browser.
     * @readonly
     */
    static onIE: boolean;

    /**
     * @zh 表示当前环境是否在微信内。
     * @en Indicates whether the current environment is within WeChat.
     * @readonly
     */
    static onWeiXin: boolean;

    /**
     * @zh 表示当前环境是否为 PC。
     * @en Indicates whether the current environment is a PC.
     * @readonly
     */
    static onPC: boolean;

    /**
     * @deprecated
     */
    static onMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是微信小游戏。
     * @en Indicates whether the current environment is a WeChat mini-game.
     * @readonly
     */
    static onWXMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是百度小游戏。
     * @en Indicates whether the current environment is a Baidu mini-game.
     * @readonly
     */
    static onBDMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是小米小游戏。
     * @en Indicates whether the current environment is a Xiaomi mini-game.
     * @readonly
     */
    static onKGMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是 OPPO 小游戏。
     * @en Indicates whether the current environment is an OPPO mini-game.
     * @readonly
     */
    static onQGMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是 vivo 小游戏。
     * @en Indicates whether the current environment is a VIVO mini-game.
     * @readonly
     */
    static onVVMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是支付宝小游戏。
     * @en Indicates whether the current environment is an Alipay mini-game.
     * @readonly
     */
    static onAlipayMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是手机 QQ 小游戏。
     * @en Indicates whether the current environment is a QQ mini-game on mobile.
     * @readonly
     */
    static onQQMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是 BILIBILI 小游戏。
     * @en Indicates whether the current environment is a BILIBILI mini-game.
     * @readonly
     */
    static onBLMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是抖音小游戏。
     * @en Indicates whether the current environment is a TikTok (Douyin) mini-game.
     * @readonly
     */
    static onTTMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是华为快游戏。
     * @en Indicates whether the current environment is a Huawei mini-game.
     * @readonly
     */
    static onHWMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是淘宝小游戏。
     * @en Indicates whether the current environment is a Taobao mini-game.
     * @readonly
     */
    static onTBMiniGame: boolean;

    /**
     * @zh 表示当前环境是否是 Firefox 浏览器。
     * @en Indicates whether the current environment is the Firefox browser.
     * @readonly
     */
    static onFirefox: boolean;

    /**
     * @zh 表示当前环境是否是 Edge 浏览器。
     * @en Indicates whether the current environment is the Edge browser.
     * @readonly
     */
    static onEdge: boolean;

    /**
     * @zh 表示当前环境是否运行在 LayaAir Native Runtime。
     * @en Indicates whether the current environment is running on LayaAir Native Runtime.
     * @readonly
     */
    static onLayaRuntime: boolean;

    /**
     * @zh 表示当前环境是否运行在开发工具中。
     * @en Indicates whether the current environment is running in a development tool.
     * @readonly
     */
    static onDevTools: boolean;

    /**
     * @zh 真实平台类型，onMobile等是通过UserAgent判断，可能具有欺骗性
     * @en The actual platform type, OnMobile and others are determined through UserAgent, which may be faked.
     * @readonly
     */
    static platform: number = 0;
    /**
     * @zh 平台的可读名称。
     * @en The readable name of the platform.
     * @readonly
     */
    static platformName: string = "";

    /**
     * @zh PC 平台。
     * @en PC platform.
     */
    static readonly PLATFORM_PC = 0;
    /**
     * @zh Android 平台。
     * @en Android platform.
     */
    static readonly PLATFORM_ANDROID = 1;
    /**
     * @zh iOS 平台。
     * @en iOS platform.
     */
    static readonly PLATFORM_IOS = 2;

    /**
     * @zh 表示环境是否支持触摸输入。
     * @en Indicates whether the environment supports touch input.
     * @readonly
     */
    static isTouchDevice: boolean;

    /**
     * @zh 表示环境是否支持 iOS 设备的高性能模式。
     * @en Indicates whether the environment supports high-performance mode on iOS devices.
     * @readonly
     */
    static isIOSHighPerformanceMode: boolean;

    /**
     * @zh 表示环境是否支持 iOS 设备的高性能+模式。
     * @en Indicates whether the environment supports high-performance+ mode on iOS devices.
     * @readonly
     */
    static isIOSHighPerformanceModePlus: boolean;

    /**
     * @zh 表示环境是否支持 DOM。
     * @en Indicates whether the environment supports DOM.
     * @readonly
     */
    static isDomSupported: boolean = true;

    /**
     * @zh 系统版本。
     * @en The version of the system.
     * @readonly
     */
    static systemVersion: string = "";

    /**
     * @zh 平台 SDK 版本。
     * @en The version of the Platform SDK.
     * @readonly
     */
    static SDKVersion: string = "";

    /**
     * @zh 全局画布。
     * @en The global canvas.
     * @readonly
     */
    static mainCanvas: HTMLCanvas;

    /**
     * @zh 是否使用一个离屏画布来进行渲染，默认是空，即使用mainCanvas。
     * @en Whether to use an offscreen canvas for rendering. By default, it is null, which means using the mainCanvas.
     */
    static offscreenMainCanvas: HTMLCanvas;

    /**
     * @zh 全局离屏画布，主要用来测量文本和获取图像数据。
     * @en The global offscreen canvas, used primarily for measuring text and obtaining image data.
     * @readonly
     */
    static canvas: HTMLCanvas;

    /**
     * @zh 全局离屏画布上绘图的环境。
     * @en The rendering context of the global offscreen canvas.
     * @readonly
     */
    static context: CanvasRenderingContext2D;

    /**
     * @zh 已载入的脚本集。
     * @en The loaded bundles.
     * @blueprintIgnore
     */
    static readonly bundles = new Map<string, any>();

    /**
     * @zh 全局 window 对象。
     * @en The global window object.
     * @readonly
     */
    static window: Window & typeof globalThis = typeof window !== undefined ? window : null;
    /**
     * @zh 全局 document 对象。
     * @en The global document object.
     * @readonly
     */
    static document: Document = typeof document !== undefined ? document : null;

    /**
     * @en Internal storage for client width.
     * @zh 内部存储的客户端宽度。
     */
    private static _clientWidth: number;
    /**
     * @en Internal storage for client height.
     * @zh 内部存储的客户端高度。
     */
    private static _clientHeight: number;

    /**
     * @zh 创建指定类型的浏览器原生节点。
     * @param tagName 要创建的节点类型。
     * @return 创建的节点对象的引用。
     * @en Creates a native browser element of the specified type.
     * @param tagName The type of node to create.
     * @return A reference to the created node object.
     * @blueprintIgnore
     */
    static createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return PAL.browser.createElement(tagName);
    }

    /**
     * @zh 通过id获取HTMLElement。
     * @param id 元素的id。
     * @return 获取到的元素。
     * @en Get the HTMLElement by its ID.
     * @param id The element's ID.
     * @return The element that was obtained.
     */
    static getElementById(id: string): HTMLElement {
        return PAL.browser.getElementById(id);
    }

    /**
     * @zh 移除指定HTMLElement元素。
     * @param ele 要移除的元素。
     * @en Removes the specified HTMLElement.
     * @param ele element to remove.
     */
    static removeElement(ele: HTMLElement): void {
        PAL.browser.removeElement(ele);
    }

    /**
     * @zh 获取从页面加载开始的高精度时间，单位为毫秒。等同于 `performance.now()`。
     * @en Gets the high-resolution time in milliseconds since the page started loading or since the navigation start time. It is equivalent to `performance.now()`.
     */
    static now(): number {
        return performance.now(); //before 3.3.2 is Date.now();
    }

    /**
     * @zh 浏览器窗口的可视宽度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，
     * 如果前者为 0 或未定义，则选择后者。
     * @en The viewport width of the browser window.
     * The method analyzes the browser information to determine the width, with a priority given to `window.innerWidth` (includes scrollbar width) > `document.body.clientWidth` (does not include scrollbar width).
     * If the former is 0 or undefined, the latter is chosen.
     */
    static get clientWidth(): number {
        if (this._clientWidth != null)
            return this._clientWidth;
        else
            return PAL.browser.getClientWidth();
    }

    /**
     * @zh 设置浏览器窗口的可视宽度。
     * @en Sets the viewport width of the browser window.
     * @blueprintIgnore
     */
    static set clientWidth(value: number) {
        Browser._clientWidth = value;
    }

    /**
     * @zh 浏览器窗口的可视高度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight，
     * 如果前者为 0 或未定义，则选择后者。
     * @en The viewport height of the browser window.
     * The method analyzes the browser information to determine the height, with a priority given to `window.innerHeight` (includes scrollbar height) > `document.body.clientHeight` (excluding scrollbar height) > `document.documentElement.clientHeight` (both do not include scrollbar height).
     * If the former is 0 or undefined, it falls back to the latter.
     */
    static get clientHeight(): number {
        if (this._clientHeight != null)
            return this._clientHeight;
        else
            return PAL.browser.getClientHeight();
    }

    /**
     * @zh 设置浏览器窗口的可视高度。
     * @en Sets the viewport height of the browser window.
     * @blueprintIgnore
     */
    static set clientHeight(value: number) {
        Browser._clientHeight = value;
    }

    /**
     * @en Changes the native host window size in logical pixels. This operation is only supported by resizable desktop native windows.
     * @param width The requested client-area width in logical pixels.
     * @param height The requested client-area height in logical pixels.
     * @returns Whether the resize request was accepted by the current platform.
     * @zh 修改 Native 宿主窗口的客户区尺寸（逻辑像素）。仅可调整大小的桌面 Native 窗口支持此操作。
     * @param width 目标客户区宽度（逻辑像素）。
     * @param height 目标客户区高度（逻辑像素）。
     * @returns 当前平台是否接受了修改请求。
     */
    static setWindowSize(width: number, height: number): boolean {
        return PAL.browser.setWindowSize(width, height);
    }


    /**
     * @zh 浏览器窗口的物理宽度，考虑了设备像素比。
     * @en The physical width of the browser window, taking into account the device pixel ratio.
     */
    static get width(): number {
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
    }

    /**
     * @zh 浏览器窗口的物理高度，考虑了设备像素比。
     * @en The physical height of the browser window, taking into account the device pixel ratio.
     */
    static get height(): number {
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
    }

    /**
     * @zh 当前环境的设备像素比。
     * @en The device pixel ratio of the current environment.
     */
    static get pixelRatio(): number {
        return PAL.browser.getPixelRatio();
    }

    /**
     * @zh 用来存放画布元素的容器，方便对画布进行控制。
     * @en The canvas container that holds the canvas element, facilitating control over the canvas.
     */
    static get container(): HTMLElement {
        return Browser.mainCanvas.source.parentElement || document.body;
    }

    /**
     * @zh 获取 URL 参数的值。
     * @param name 参数的名称。
     * @return 参数的值。
     * @en Gets the value of a URL parameter.
     * @param name The name of the parameter.
     * @return The value of the parameter.
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
     * @zh 从指定源动态加载 JavaScript 库。
     * @en Dynamically loads a JavaScript library from the specified source.
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
            script.src = URL.postFormatURL(URL.formatURL(src));
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

/**
 * @zh 将属性从一个对象复制到另一个对象，排除指定的属性。
 * @param to 要复制属性的目标对象。
 * @param from 要复制属性的源对象。
 * @param except 要从复制中排除的属性名称。
 * @return 包含复制属性的目标对象。
 * @en Copies properties from one object to another, excluding specified properties.
 * @param to The target object to copy properties to.
 * @param from The source object to copy properties from.
 * @param except The property name to exclude from copying.
 * @return The target object with copied properties.
 */
function copyProps(to: any, from: any, except?: string) {
    var desc: any;
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of Object.getOwnPropertyNames(from))
            if (!to.hasOwnProperty(key) && key !== except)
                Object.defineProperty(to, key, { get: () => from[key], enumerable: !(desc = Object.getOwnPropertyDescriptor(from, key)) || desc.enumerable });
    }
    return to;
}