import { Config } from "../../Config";
import { ILaya } from "../../ILaya";

/**
 * <code>Browser</code> 是浏览器代理类。封装浏览器及原生 js 提供的一些功能。
 */
export class Browser {

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
    /** 表示是否在 Chrome 内 */
    static onChrome: boolean;
    /** 表示是否在 IE 浏览器内*/
    static onIE: boolean;
    /** 表示是否在 微信 内*/
    static onWeiXin: boolean;
    /** 表示是否在 PC 端。*/
    static onPC: boolean;
    /** 微信小游戏 **/
    static onMiniGame: boolean;
    /** 百度小游戏 **/
    static onBDMiniGame: boolean;
    /** 小米戏小游戏 **/
    static onKGMiniGame: boolean;
    /** OPPO小游戏 **/
    static onQGMiniGame: boolean;
    /** VIVO小游戏 **/
    static onVVMiniGame: boolean;
    /** 阿里小游戏 **/
    static onAlipayMiniGame: boolean;
    /***手机QQ小游戏 */
    static onQQMiniGame: boolean;
    /*** BILIBILI小游戏 */
    static onBLMiniGame: boolean;
    /** 抖音小游戏*/
    static onTTMiniGame: boolean;
    /** 华为快游戏 */
    static onHWMiniGame: boolean;
    /** 淘宝小程序 */
    static onTBMiniGame: boolean;
    /** @private */
    static onFirefox: boolean;//TODO:求补充
    /** Edge浏览器 */
    static onEdge: boolean;
    /** @private */
    static onLayaRuntime: boolean;

    /** 真实平台类型，onMobile等是通过UserAgent判断，可能具有欺骗性 **/
    static platform: number;
    static PLATFORM_PC = 0;
    static PLATFORM_ANDROID = 1;
    static PLATFORM_IOS = 2;

    /** 表示是否支持WebAudio*/
    static supportWebAudio: boolean;
    /** 表示是否支持LocalStorage*/
    static supportLocalStorage: boolean;

    /** 全局离线画布（非主画布）。主要用来测量字体、获取image数据。*/
    static canvas: any;
    /** 全局离线画布上绘图的环境（非主画布）。 */
    static context: CanvasRenderingContext2D;

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

        if (!!(window as any).conch && "conchUseWXAdapter" in Browser.window) {
            (window as any).wxMiniGame(Laya, Laya);
            Laya["MiniAdpter"].enable();
        }
        //阿里小游戏
        if ("my" in Browser.window) {
            if (u.indexOf('TB/') > -1 || u.indexOf('Taobao/') > -1 || u.indexOf('TM/') > -1) {
                //这里需要手动初始化阿里适配库
                (window as any).tbMiniGame(Laya, Laya);
                if (!Laya["TBMiniAdapter"]) {
                    console.error("请先添加淘宝适配库");
                } else {
                    Laya["TBMiniAdapter"].enable();
                }
            } else if (u.indexOf('AlipayMiniGame') > -1) {
                //这里需要手动初始化阿里适配库
                (window as any).aliPayMiniGame(Laya, Laya);
                if (!Laya["ALIMiniAdapter"]) {
                    console.error("请先添加阿里小游戏适配库");
                } else {
                    Laya["ALIMiniAdapter"].enable();
                }
            }
        }

        if (((u.indexOf('OPPO') == -1 && u.indexOf("MiniGame") > -1) || u.indexOf('runtime') != -1 || (u.indexOf('miniprogram') != -1 && (window as any).isWXMiMi)) && "wx" in Browser.window) {
            if ("tt" in Browser.window) {
                //抖音小游戏
                (window as any).ttMiniGame(Laya, Laya);
                if (!Laya["TTMiniAdapter"]) {
                    //TODO
                    console.error("请引入抖音小游戏的适配库，详细教程：https://layaair.com/3.x/doc/released/miniGame/byteDance/readme.html");
                } else {
                    Laya["TTMiniAdapter"].enable();
                }
            } else if ("bl" in Browser.window) {
                //手机B站小游戏
                (window as any).biliMiniGame(Laya, Laya);
                if (!Laya["BLMiniAdapter"]) {
                    console.error("请引入bilibili小游戏的适配库");
                } else {
                    Laya["BLMiniAdapter"].enable();
                }
            }
            else if ("qq" in Browser.window) {
                //手机QQ小游戏
                (window as any).qqMiniGame(Laya, Laya);
                if (!Laya["QQMiniAdapter"]) {
                    console.error("请引入手机QQ小游戏的适配库");
                } else {
                    Laya["QQMiniAdapter"].enable();
                }
            }
            else {
                //微信小游戏
                (window as any).wxMiniGame(Laya, Laya);
                if (!Laya["MiniAdpter"]) {
                    console.error("请先添加小游戏适配库,详细教程：https://layaair.com/3.x/doc/released/miniGame/wechat/readme.html");
                    //TODO 教程要改
                } else {
                    Laya["MiniAdpter"].enable();
                }
            }
        }
        //华为快游戏
        if ("hbs" in Browser.window) {
            (window as any).hwMiniGame(Laya, Laya);
            if (!Laya["HWMiniAdapter"]) {
                console.error("请先添加小游戏适配库!");
                //TODO 教程要改
            } else {
                Laya["HWMiniAdapter"].enable();
            }
        }

        //百度小游戏
        if (u.indexOf("SwanGame") > -1) {
            (window as any).bdMiniGame(Laya, Laya);
            if (!Laya["BMiniAdapter"]) {
                console.error("请先添加百度小游戏适配库");
                //TODO 教程要改
            } else {
                Laya["BMiniAdapter"].enable();
            }
        }

        //小米小游戏
        if (u.indexOf('QuickGame') > -1) {
            (window as any).miMiniGame(Laya, Laya);
            if (!Laya["KGMiniAdapter"]) {
                console.error("请先添加小米小游戏适配库,详细教程：https://layaair.com/3.x/doc/released/miniGame/xiaomi/readme.html");
            } else {
                Laya["KGMiniAdapter"].enable();
            }
        }

        //OPPO小游戏
        if (u.indexOf('OPPO') > -1 && u.indexOf('MiniGame') > -1) {
            (window as any).qgMiniGame(Laya, Laya);
            if (!Laya["QGMiniAdapter"]) {
                console.error("请先添加OPPO小游戏适配库,详细教程：https://layaair.com/3.x/doc/released/miniGame/OPPO/readme.html");
            } else {
                //temp oppo 需要修改交换链的功能
                Config.fixedFrames = false;
                Laya["QGMiniAdapter"].enable();
            }
        }

        //VIVO小游戏
        if (u.indexOf('VVGame') > -1) {
            (window as any).vvMiniGame(Laya, Laya);
            if (!Laya["VVMiniAdapter"]) {
                console.error("请先添加VIVO小游戏适配库,详细教程：https://layaair.com/3.x/doc/released/miniGame/vivo/readme.html");
            } else {
                //temp oppo 需要修改交换链的功能
                Config.fixedFrames = false;
                Laya["VVMiniAdapter"].enable();
            }
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
     * 获取是否为小游戏环境
     * @returns onMiniGame || onBDMiniGame || onQGMiniGame || onKGMiniGame || onVVMiniGame || onAlipayMiniGame || onQQMiniGame || onBLMiniGame || onTTMiniGame || onHWMiniGame || onTBMiniGame
     */
    static get _isMiniGame(): boolean {
        return Browser.onMiniGame || Browser.onBDMiniGame || Browser.onQGMiniGame || Browser.onKGMiniGame || Browser.onVVMiniGame || Browser.onAlipayMiniGame || Browser.onQQMiniGame || Browser.onBLMiniGame || Browser.onTTMiniGame || Browser.onHWMiniGame || Browser.onTBMiniGame || (Browser.window && Browser.window.isWXMiMi);
    }
    /**
     * 创建浏览器原生节点。
     * @param	type 节点类型。
     * @return	创建的节点对象的引用。
     */
    static createElement(type: string): any {
        Browser.__init__();
        return Browser._document.createElement(type);
    }

    /**
     * 返回 Document 对象中拥有指定 id 的第一个对象的引用。
     * @param	type 节点id。
     * @return	节点对象。
     */
    static getElementById(type: string): any {
        Browser.__init__();
        return Browser._document.getElementById(type);
    }

    /**
     * 移除指定的浏览器原生节点对象。
     * @param	type 节点对象。
     */
    static removeElement(ele: any): void {
        if (ele && ele.parentNode) ele.parentNode.removeChild(ele);
    }

    /**
     * 获取浏览器当前时间戳，单位为毫秒。
     */
    static now(): number {
        return Date.now();
    }

    /**
     * 浏览器窗口可视宽度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerWidth(包含滚动条宽度) > document.body.clientWidth(不包含滚动条宽度)，如果前者为0或为空，则选择后者。
     */
    static get clientWidth(): number {
        Browser.__init__();
        return Browser._clientWidth || Browser._window.innerWidth || Browser._document.body.clientWidth;
    }

    static set clientWidth(value: number) {
        Browser._clientWidth = value;
    }

    /**
     * 浏览器窗口可视高度。
     * 通过分析浏览器信息获得。浏览器多个属性值优先级为：window.innerHeight(包含滚动条高度) > document.body.clientHeight(不包含滚动条高度) > document.documentElement.clientHeight(不包含滚动条高度)，如果前者为0或为空，则选择后者。
     */
    static get clientHeight(): number {
        Browser.__init__();
        return Browser._clientHeight || Browser._window.innerHeight || Browser._document.body.clientHeight || Browser._document.documentElement.clientHeight;
    }

    static set clientHeight(value: number) {
        Browser._clientHeight = value;
    }

    /** 浏览器窗口物理宽度。考虑了设备像素比。*/
    static get width(): number {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientHeight : Browser.clientWidth) * Browser.pixelRatio;
    }

    /** 浏览器窗口物理高度。考虑了设备像素比。*/
    static get height(): number {
        Browser.__init__();
        return ((ILaya.stage && ILaya.stage.canvasRotation) ? Browser.clientWidth : Browser.clientHeight) * Browser.pixelRatio;
    }

    /** 获得设备像素比。*/
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

    /**画布容器，用来盛放画布的容器。方便对画布进行控制*/
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

    /**浏览器原生 window 对象的引用。*/
    static get window(): any {
        return Browser._window || Browser.__init__();
    }

    /**浏览器原生 document 对象的引用。*/
    static get document(): any {
        Browser.__init__();
        return Browser._document;
    }

    /**
     * 获得URL参数值
     * @param	name 参数名称
     * @return	参数值
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

    // Safari横屏工具栏偏移
    static getSafariToolbarOffset() {
        return (Browser.window.__innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight) - Browser.window.innerHeight;
    }
}

