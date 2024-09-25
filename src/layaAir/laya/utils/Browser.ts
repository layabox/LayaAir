import { Config } from "../../Config";
import { ILaya } from "../../ILaya";

/**
 * @en Browser is a browser proxy class. Encapsulate some of the features provided by the browser and native JavaScript.
 * @zh Browser 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 */
export class Browser {

    /**
     * @en Browser proxy information.
     * @zh 浏览器代理信息。
     */
    static userAgent: string;

    /**
     * @en Indicates whether the current environment is a mobile device, including iOS and Android devices.
     * @zh 表示当前环境是否为移动设备，包括 iOS 和 Android 设备。
     */
    static onMobile: boolean;

    /**
     * @en Indicates whether the current environment is within an iOS device.
     * @zh 表示当前环境是否在 IOS 设备内。
     */
    static onIOS: boolean;

    /**
     * @en Indicates whether the current environment is a Mac device.
     * @zh 表示当前环境是否为 Mac 设备。
     */
    static onMac: boolean;

    /**
     * @en Indicates whether the current environment is within an iPhone.
     * @zh 表示当前环境是否在 iPhone 内。
     */
    static onIPhone: boolean;

    /**
     * @en Indicates whether the current environment is within an iPad.
     * @zh 表示当前环境是否在 iPad 内。
     */
    static onIPad: boolean;

    /**
     * @en Indicates whether the current environment is within an Android device.
     * @zh 表示当前环境是否在 Android 设备内。
     */
    static onAndroid: boolean;

    /**
     * @en Indicates whether the current environment is within an OpenHarmonyOS device.
     * @zh 表示当前环境是否在 OpenHarmonyOS 设备内。
     */
    static onOpenHarmonyOS: boolean

    /**
     * @en Indicates whether the current environment is within a Windows Phone device.
     * @zh 表示当前环境是否在 Windows Phone 设备内。
     */
    static onWP: boolean;

    /**
     * @en Indicates whether the current environment is within the QQ browser.
     * @zh 表示当前环境是否在 QQ 浏览器内。
     */
    static onQQBrowser: boolean;

    /**
     * @en Indicates whether the current environment is within the mobile QQ or QQ browser.
     * @zh 表示当前环境是否在移动 QQ 或 QQ 浏览器内。
     */
    static onMQQBrowser: boolean;

    /**
     * @en Indicates whether the current environment is within Safari.
     * @zh 表示当前环境是否在 Safari 内。
     */
    static onSafari: boolean;

    /**
     * @en Indicates whether the current environment is within Chrome.
     * @zh 表示当前环境是否在 Chrome 内。
     */
    static onChrome: boolean;

    /**
     * @en Indicates whether the current environment is within the Internet Explorer browser.
     * @zh 表示当前环境是否在 Internet Explorer 浏览器内。
     */
    static onIE: boolean;

    /**
     * @en Indicates whether the current environment is within WeChat.
     * @zh 表示当前环境是否在微信内。
     */
    static onWeiXin: boolean;

    /**
     * @en Indicates whether the current environment is a PC.
     * @zh 表示当前环境是否为 PC。
     */
    static onPC: boolean;

    /**
     * @en Indicates whether the current environment is a WeChat mini-game.
     * @zh 表示当前环境是否是微信小游戏。
     */
    static onMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Baidu mini-game.
     * @zh 表示当前环境是否是百度小游戏。
     */
    static onBDMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Xiaomi mini-game.
     * @zh 表示当前环境是否是小米小游戏。
     */
    static onKGMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is an OPPO mini-game.
     * @zh 表示当前环境是否是 OPPO 小游戏。
     */
    static onQGMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a VIVO mini-game.
     * @zh 表示当前环境是否是 vivo 小游戏。
     */
    static onVVMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is an Alipay mini-game.
     * @zh 表示当前环境是否是支付宝小游戏。
     */
    static onAlipayMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a QQ mini-game on mobile.
     * @zh 表示当前环境是否是手机 QQ 小游戏。
     */
    static onQQMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a BILIBILI mini-game.
     * @zh 表示当前环境是否是 BILIBILI 小游戏。
     */
    static onBLMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a TikTok (Douyin) mini-game.
     * @zh 表示当前环境是否是抖音小游戏。
     */
    static onTTMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Huawei mini-game.
     * @zh 表示当前环境是否是华为快游戏。
     */
    static onHWMiniGame: boolean;

    /**
     * @en Indicates whether the current environment is a Taobao mini-game.
     * @zh 表示当前环境是否是淘宝小游戏。
     */
    static onTBMiniGame: boolean;

    /**
     * @private
     * @en Indicates whether the current environment is the Firefox browser.
     * @zh 表示当前环境是否是 Firefox 浏览器。
     */
    static onFirefox: boolean;

    /**
     * @en Indicates whether the current environment is the Edge browser.
     * @zh 表示当前环境是否是 Edge 浏览器。
     */
    static onEdge: boolean;

    /**
     * @private
     * @en Indicates whether the current environment is running on LayaAir Native Runtime.
     * @zh 表示当前环境是否运行在 LayaAir Native Runtime。
     */
    static onLayaRuntime: boolean;

    /**
     * @en The actual platform type, OnMobile and others are determined through UserAgent, which may be faked.
     * @zh 真实平台类型，onMobile等是通过UserAgent判断，可能具有欺骗性
     */
    static platform: number;
    static PLATFORM_PC = 0;
    static PLATFORM_ANDROID = 1;
    static PLATFORM_IOS = 2;

    /**
     * @en Indicates whether the environment supports WebAudio.
     * @zh 表示环境是否支持 WebAudio。
     */
    static supportWebAudio: boolean;
    /**
     * @en Indicates whether the environment supports LocalStorage.
     * @zh 表示环境是否支持 LocalStorage。
     */
    static supportLocalStorage: boolean;

    /**
     * @en The global offline canvas (not the main canvas), used primarily for measuring text and obtaining image data.
     * @zh 全局离线画布（非主画布），主要用来测量文本和获取图像数据。
     */
    static canvas: any;
    /**
     * @en The rendering context of the global offline canvas (not the main canvas).
     * @zh 全局离线画布上绘图的环境（非主画布）。
     */
    static context: CanvasRenderingContext2D;

    /**
     * @en The service object for mini-game platform services.
     * @zh 小游戏平台服务对象。
     */
    static miniGameContext: any;

    /**
     * @en The loaded bundles.
     * @zh 已载入的脚本集。
     */
    static bundles = new Map<string, any>();

    /** @private */
    private static _window: any;
    /** @private */
    private static _document: Document;
    /** @private */
    private static _container: any;
    /** @private */
    private static _pixelRatio: number = -1;

    /** @private */
    private static _clientWidth: number;
    /** @private */
    private static _clientHeight: number;

    /** @private */
    static mainCanvas: any = null;

    /**@private */
    private static hanzi: RegExp = new RegExp("^[\u4E00-\u9FA5]$");
    /**@private */
    private static fontMap: { [key: string]: string } = {};
    /**@private */
    static measureText: Function = function (txt: string, font: string): any {
        let isChinese: boolean = Browser.hanzi.test(txt);
        if (isChinese && Browser.fontMap[font]) {
            return Browser.fontMap[font];
        }

        let ctx: CanvasRenderingContext2D = Browser.context;
        ctx.font = font;

        let r: any = ctx.measureText(txt);
        if (isChinese) Browser.fontMap[font] = r;
        return r;
    }

    /**@internal */
    static __init__(): any {
        let Laya: any = (window as any).Laya || ILaya.Laya;
        if (Browser._window) return Browser._window;
        let win: any = Browser._window = window;
        let doc: any = Browser._document = win.document;
        let u: string = Browser.userAgent = win.navigator.userAgent;
        let maxTouchPoints: number = win.navigator.maxTouchPoints || 0;
        let platform: string = win.navigator.platform;
        let miniGame: [string, string, string];

        //微信小游戏
        if (!!(window as any).conch && "conchUseWXAdapter" in Browser.window) {
            miniGame = ["wxMiniGame", "MiniAdpter", "wx"];
        }
        //阿里小游戏
        if ("my" in Browser.window) {
            if (u.indexOf('TB/') > -1 || u.indexOf('Taobao/') > -1 || u.indexOf('TM/') > -1) {
                miniGame = ["tbMiniGame", "TBMiniAdapter", "my"];
            } else if (u.indexOf('AlipayMiniGame') > -1) {
                miniGame = ["aliPayMiniGame", "ALIMiniAdapter", "my"];
            }
        }

        if (((u.indexOf('OPPO') == -1 && u.indexOf("MiniGame") > -1) || u.indexOf('runtime') != -1 || (u.indexOf('miniprogram') != -1 && (window as any).isWXMiMi)) && "wx" in Browser.window) {
            if ("tt" in Browser.window) {
                //抖音小游戏
                miniGame = ["ttMiniGame", "TTMiniAdapter", "tt"];
            } else if ("bl" in Browser.window) {
                //手机B站小游戏
                miniGame = ["biliMiniGame", "BLMiniAdapter", null];
            }
            else if ("qq" in Browser.window) {
                //手机QQ小游戏
                miniGame = ["qqMiniGame", "QQMiniAdapter", null];
            }
            else {
                //微信小游戏
                miniGame = ["wxMiniGame", "MiniAdpter", "wx"];
            }
        }
        //华为快游戏
        if ("hbs" in Browser.window) {
            miniGame = ["hwMiniGame", "HWMiniAdapter", null];
        }

        //百度小游戏
        if (u.indexOf("SwanGame") > -1) {
            miniGame = ["bdMiniGame", "BMiniAdapter", null];
        }

        //小米小游戏
        if (u.indexOf('QuickGame') > -1) {
            miniGame = ["miMiniGame", "KGMiniAdapter", "qg"];
        }

        //OPPO小游戏
        if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
            miniGame = ["qgMiniGame", "QGMiniAdapter", "qg"];
            //temp oppo 需要修改交换链的功能
            Config.fixedFrames = false;
        }

        //VIVO小游戏
        if (u.indexOf('VVGame') > -1) {
            miniGame = ["vvMiniGame", "VVMiniAdapter", "qg"];
            //temp oppo 需要修改交换链的功能
            Config.fixedFrames = false;
        }

        if (miniGame != null) {
            Browser.window[miniGame[0]](Laya, Laya);
            Laya[miniGame[1]].enable();
            Browser.miniGameContext = Browser.window[miniGame[2]];
        }

        //新增trace的支持
        win.trace = console.log;

        //兼容requestAnimationFrame
        win.requestAnimationFrame = win.requestAnimationFrame || win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || win.oRequestAnimationFrame || win.msRequestAnimationFrame || function (fun: any): any {
            return win.setTimeout(fun, 1000 / 60);
        }

        //强制修改body样式
        var bodyStyle: any = doc.body.style;
        bodyStyle.margin = 0;
        bodyStyle.overflow = 'hidden';
        bodyStyle['-webkit-user-select'] = 'none';
        bodyStyle['-webkit-tap-highlight-color'] = 'rgba(200,200,200,0)';

        //强制修改meta标签，防止开发者写错
        var metas: any[] = doc.getElementsByTagName('meta');
        let viewportContent: Record<string, string> = {
            "width": "device-width",
            "initial-scale": "1.0",
            "minimum-scale": "1.0",
            "maximum-scale": "1.0",
            "user-scalable": "no"
        };
        let viewport: any;
        for (const meta of metas) {
            if (meta.name == "viewport") {
                viewport = meta;
                break;
            }
        }
        if (!viewport) {
            viewport = doc.createElement('meta');
            viewport.name = 'viewport';
            doc.getElementsByTagName('head')[0]?.appendChild(viewport);
        }
        else {
            let arr: Array<string> = (viewport.content || "").split(",");
            for (let ele of arr) {
                let arr2 = ele.split("=");
                if (!viewportContent[arr2[0].trim()])
                    viewportContent[arr2[0]] = arr2[1];
            }
        }
        viewport.content = Object.keys(viewportContent).map(k => k + "=" + viewportContent[k]);

        //处理兼容性			
        Browser.onMobile = (window as any).conch ? true : u.indexOf("Mobile") > -1;
        Browser.onIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        Browser.onIPhone = u.indexOf("iPhone") > -1;
        Browser.onMac = u.indexOf("Mac OS X") > -1;
        Browser.onIPad = u.indexOf("iPad") > -1 || (platform === 'MacIntel' && maxTouchPoints > 1);//"platform === 'MacIntel' && maxTouchPoints >1" is a temporary solution，maybe accidentally injure other platform.
        Browser.onAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        Browser.onOpenHarmonyOS = u.indexOf('OpenHarmony') > -1;
        Browser.onWP = u.indexOf("Windows Phone") > -1;
        Browser.onQQBrowser = u.indexOf("QQBrowser") > -1;
        Browser.onMQQBrowser = u.indexOf("MQQBrowser") > -1 || (u.indexOf("Mobile") > -1 && u.indexOf("QQ") > -1);
        Browser.onIE = !!win.ActiveXObject || "ActiveXObject" in win;
        Browser.onWeiXin = u.indexOf('MicroMessenger') > -1;
        Browser.onSafari = u.indexOf("Safari") > -1 && u.indexOf("Chrome") === -1;
        Browser.onChrome = u.indexOf("Chrome") > -1;
        Browser.onPC = !Browser.onMobile;
        Browser.onFirefox = u.indexOf('Firefox') > -1;
        Browser.onEdge = u.indexOf('Edge') > -1 || u.indexOf('Edg') > -1;
        Browser.onMiniGame = u.indexOf('MiniGame') > -1;
        Browser.onBDMiniGame = u.indexOf('SwanGame') > -1;
        Browser.onLayaRuntime = !!(window as any).conch;
        if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
            Browser.onQGMiniGame = true;//OPPO环境判断
            Browser.onMiniGame = false;
        } else if ("qq" in Browser.window && u.indexOf('MiniGame') > -1) {
            Browser.onQQMiniGame = true;//手机QQ环境判断
            Browser.onMiniGame = false;
        } else if ("bl" in Browser.window && u.indexOf('MiniGame') > -1) {
            Browser.onBLMiniGame = true;//B站环境判断
            Browser.onMiniGame = false;
        } else if ("tt" in Browser.window && u.indexOf('MiniGame') > -1) {
            Browser.onTTMiniGame = true;
            Browser.onMiniGame = false;
        }

        Browser.onHWMiniGame = "hbs" in Browser.window;
        Browser.onVVMiniGame = u.indexOf('VVGame') > -1;//vivo
        Browser.onKGMiniGame = u.indexOf('QuickGame') > -1;//小米运行环境判断
        if (u.indexOf('AlipayMiniGame') > -1) {
            Browser.onAlipayMiniGame = true;//阿里小游戏环境判断
            Browser.onMiniGame = false;
        }
        if (u.indexOf('TB/') > -1 || u.indexOf('Taobao/') > -1 || u.indexOf('TM/') > -1) {
            Browser.onTBMiniGame = true;
        }

        if (Browser.onAndroid || Browser.onIOS) {
            //也有可能是模拟器
            if (platform && (platform.indexOf("Win") != -1 || platform.indexOf("Mac") != -1))
                Browser.platform = Browser.PLATFORM_PC;
            else if (Browser.onAndroid)
                Browser.platform = Browser.PLATFORM_ANDROID;
            else
                Browser.platform = Browser.PLATFORM_IOS;
        }
        else
            Browser.platform = Browser.PLATFORM_PC;

        return win;
    }
    /**
     * @en Gets whether it is a mini game environment
     * @returns onMiniGame || onBDMiniGame || onQGMiniGame || onKGMiniGame || onVVMiniGame || onAlipayMiniGame || onQQMiniGame || onBLMiniGame || onTTMiniGame || onHWMiniGame || onTBMiniGame
     * @zh 获取是否为小游戏环境
     * @returns onMiniGame || onBDMiniGame || onQGMiniGame || onKGMiniGame || onVVMiniGame || onAlipayMiniGame || onQQMiniGame || onBLMiniGame || onTTMiniGame || onHWMiniGame || onTBMiniGame
     */
    static get _isMiniGame(): boolean {
        return Browser.onMiniGame || Browser.onBDMiniGame || Browser.onQGMiniGame || Browser.onKGMiniGame || Browser.onVVMiniGame || Browser.onAlipayMiniGame || Browser.onQQMiniGame || Browser.onBLMiniGame || Browser.onTTMiniGame || Browser.onHWMiniGame || Browser.onTBMiniGame || (Browser.window && Browser.window.isWXMiMi);
    }

    /**
     * @en Creates a native browser element of the specified type.
     * @param type The type of node to create.
     * @return A reference to the created node object.
     * @zh 创建指定类型的浏览器原生节点。
     * @param type 要创建的节点类型。
     * @return 创建的节点对象的引用。
     */
    static createElement(type: string): any {
        Browser.__init__();
        return Browser._document.createElement(type);
    }

    /**
     * @en Returns a reference to the first object in the Document object with the specified id.
     * @param id The id of the node.
     * @return The node object.
     * @zh 返回 Document 对象中拥有指定 id 的第一个对象的引用。
     * @param type 节点的 id。
     * @return 节点对象。
     */
    static getElementById(type: string): any {
        Browser.__init__();
        return Browser._document.getElementById(type);
    }

    /**
     * @en Removes the specified native browser node object from the DOM.
     * @param ele The node object to be removed.
     * @zh 移除指定的浏览器原生节点对象。
     * @param ele 要移除的节点对象。
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
        Browser.__init__();
        return Browser._clientWidth || Browser._window.innerWidth || Browser._document.body.clientWidth;
    }

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
        Browser.__init__();
        return Browser._clientHeight || Browser._window.innerHeight || Browser._document.body.clientHeight || Browser._document.documentElement.clientHeight;
    }

    static set clientHeight(value: number) {
        Browser._clientHeight = value;
    }

    /**
     * @en The physical width of the browser window, taking into account the device pixel ratio.
     * @zh 浏览器窗口的物理宽度，考虑了设备像素比。
     */
    static get width(): number {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
    }

    /**
     * @en The physical height of the browser window, taking into account the device pixel ratio.
     * @zh 浏览器窗口的物理高度，考虑了设备像素比。
     */
    static get height(): number {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
    }

    /**
     * @en The device pixel ratio of the current environment.
     * @zh 当前环境的设备像素比。
     */
    static get pixelRatio(): number {
        if (Browser._pixelRatio < 0) {
            Browser.__init__();
            if (Browser.userAgent.indexOf("Mozilla/6.0(Linux; Android 6.0; HUAWEI NXT-AL10 Build/HUAWEINXT-AL10)") > -1) Browser._pixelRatio = 2;
            else {
                Browser._pixelRatio = (Browser._window.devicePixelRatio || 1);
                if (Browser._pixelRatio < 1) Browser._pixelRatio = 1;
            }
        }
        return Browser._pixelRatio;
    }

    /**
     * @en The canvas container that holds the canvas element, facilitating control over the canvas.
     * @zh 用来存放画布元素的容器，方便对画布进行控制。
     */
    static get container(): any {
        if (!Browser._container) {
            Browser.__init__();
            Browser._container = Browser.createElement("div");
            Browser._container.id = "layaContainer";
            Browser._document.body.appendChild(Browser._container);
        }
        return Browser._container;
    }

    static set container(value: any) {
        Browser._container = value;
    }

    /**
     * @en Reference to the browser native window object.
     * @zh 浏览器原生 window 对象的引用。
     */
    static get window(): any {
        return Browser._window || Browser.__init__();
    }

    /**
     * @en Reference to the browser native document object.
     * @zh 浏览器原生 document 对象的引用。
     */
    static get document(): any {
        Browser.__init__();
        return Browser._document;
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
        if (Browser.onMiniGame) return null;
        if (!window.location || !window.location.search)
            return null;
        var reg: RegExp = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r: any = window.location.search.substring(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /**
     * @en Safari landscape toolbar offset
     * @zh Safari横屏工具栏偏移
     */
    static getSafariToolbarOffset() {
        return (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;
    }

    /**
     * @en Dynamically loads a JavaScript library from the specified source.
     * @zh 从指定源动态加载 JavaScript 库。
     */
    static loadLib(src: string) {
        return new Promise<void>((resolve, reject) => {
            let script = Browser.document.createElement('script');
            script.onload = function () {
                resolve();
            };
            script.onerror = function () {
                reject(`load ${src} failed`);
            };
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