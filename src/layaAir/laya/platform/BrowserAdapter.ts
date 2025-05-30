import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { IWebSocket } from "../net/IWebSocket";
import { _WebSocket } from "../net/WebSocket";
import { Browser } from "../utils/Browser";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class BrowserAdapter extends EventDispatcher {
    requestFrame: Function;
    webSocketClass: new () => IWebSocket;

    protected _visibilityStateKey: string;
    protected _pixelRatio: number = 1;

    /** @internal */
    _globalErrorCallback: (e: any) => void;

    constructor() {
        super();

        this.init();
        this.initRequestFrameFunction();
    }

    protected init() {
        let doc: any = Browser.document;
        let win = Browser.window;

        this._pixelRatio = Math.max(1, (win.devicePixelRatio || 1));
        this.setPlatform(win.navigator.userAgent || "", win.navigator.platform || "");

        let state = "visibilityState", visibilityChange = "visibilitychange";
        let fullscreenchange = "fullscreenchange";

        if (typeof doc.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
            state = "visibilityState";
            fullscreenchange = "fullscreenchange";
        } else if (typeof doc.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
            state = "mozVisibilityState";
            fullscreenchange = "mozfullscreenchange";
        } else if (typeof doc.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
            state = "msVisibilityState";
            fullscreenchange = "msfullscreenchange";
        } else if (typeof doc.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
            state = "webkitVisibilityState";
            fullscreenchange = "webkitfullscreenchange";
        }
        this._visibilityStateKey = state;

        doc.addEventListener(visibilityChange, () => this.event(Event.VISIBILITY_CHANGE, this.getVisibility()));
        doc.addEventListener(fullscreenchange, () => this.event(Event.FULL_SCREEN_CHANGE));

        win.addEventListener("resize", () => this.event(Event.RESIZE));
        win.addEventListener("orientationchange", (e: any) => this.event(Event.ORIENTATION_CHANGE, e));
        win.addEventListener("focus", () => this.event(Event.FOCUS));
        win.addEventListener("blur", () => this.event(Event.BLUR));

        win.addEventListener("unhandledrejection", e => this.event("unhandledrejection", e));

        //强制修改body样式
        let bodyStyle: any = doc.body.style;
        bodyStyle.margin = 0;
        bodyStyle.overflow = 'hidden';
        bodyStyle['-webkit-user-select'] = 'none';
        bodyStyle['-webkit-tap-highlight-color'] = 'rgba(200,200,200,0)';

        //强制修改meta标签，防止开发者写错
        let metas = doc.getElementsByTagName('meta');
        let viewportContent: Record<string, string> = {
            "width": "device-width",
            "initial-scale": "1.0",
            "minimum-scale": "1.0",
            "maximum-scale": "1.0",
            "user-scalable": "no"
        };
        let viewport: any;
        for (let i = 0; i < metas.length; i++) {
            let meta = metas[i];
            if (meta.name === "viewport") {
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
    }

    protected setPlatform(u: string, platform: string): void {
        platform = platform.toLowerCase();

        Browser.userAgent = u;

        Browser.onMobile = u.indexOf("Mobile") > -1;
        Browser.onIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        Browser.onIPhone = u.indexOf("iPhone") > -1;
        Browser.onMac = u.indexOf("Mac OS X") > -1;
        Browser.onIPad = u.indexOf("iPad") > -1;
        Browser.onAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        Browser.onOpenHarmonyOS = u.indexOf('OpenHarmony') > -1;
        Browser.onWP = u.indexOf("Windows Phone") > -1;
        Browser.onQQBrowser = u.indexOf("QQBrowser") > -1;
        Browser.onMQQBrowser = u.indexOf("MQQBrowser") > -1 || (u.indexOf("Mobile") > -1 && u.indexOf("QQ") > -1);
        Browser.onIE = !!(window as any).ActiveXObject || "ActiveXObject" in window;
        Browser.onWeiXin = u.indexOf('MicroMessenger') > -1;
        Browser.onSafari = u.indexOf("Safari") > -1 && u.indexOf("Chrome") === -1;
        Browser.onChrome = u.indexOf("Chrome") > -1;
        Browser.onFirefox = u.indexOf('Firefox') > -1;
        Browser.onEdge = u.indexOf('Edge') > -1 || u.indexOf('Edg') > -1;

        if (platform.indexOf("ios") !== -1) {
            Browser.onIOS = true;
            Browser.onMobile = true;
            if (!u) {
                Browser.onIPhone = true;
                Browser.onIPad = true;
            }

            Browser.platform = Browser.PLATFORM_IOS;
            Browser.platformName = "ios";

        } else if (platform.indexOf("android") !== -1) {
            Browser.onAndroid = true;
            Browser.onMobile = true;

            Browser.platform = Browser.PLATFORM_ANDROID;
            Browser.platformName = "android";
        }
        else if (platform.indexOf("ohos") !== -1) {
            Browser.onOpenHarmonyOS = true;
            Browser.onMobile = true;

            Browser.platform = Browser.PLATFORM_ANDROID;
            Browser.platformName = "ohos";

        } else if (platform.indexOf("mac") !== -1) {
            Browser.onMac = true;

            Browser.platform = Browser.PLATFORM_PC;
            Browser.platformName = "mac";

        } else if (platform.indexOf("win") !== -1) {
            Browser.platform = Browser.PLATFORM_PC;
            Browser.platformName = "windows";
        }
        else if (Browser.onAndroid) {
            Browser.platform = Browser.PLATFORM_ANDROID;
            Browser.platformName = "android";
        }
        else if (Browser.onIOS) {
            Browser.platform = Browser.PLATFORM_IOS;
            Browser.platformName = "ios";
        }
        else {
            Browser.platform = Browser.PLATFORM_PC;
            Browser.platformName = platform;
        }

        Browser.onPC = !Browser.onMobile;
        Browser.onDevTools = Browser.platformName === "devtools";
        Browser.isTouchDevice = true; //不使用的标志了，直接true

        //这个遗留逻辑未确认其含义
        if (u.indexOf("Mozilla/6.0(Linux; Android 6.0; HUAWEI NXT-AL10 Build/HUAWEINXT-AL10)") != -1)
            this._pixelRatio = 2;
    }

    protected initRequestFrameFunction(): void {
        this.requestFrame = window.requestAnimationFrame
            || (window as any).webkitRequestAnimationFrame
            || (window as any).mozRequestAnimationFrame
            || (window as any).oRequestAnimationFrame
            || (window as any).msRequestAnimationFrame;

        if (!this.requestFrame)
            this.requestFrame = function (fun: any): any {
                return setTimeout(fun, 1000 / 60);
            }
    }

    start(): Promise<void> {
        return Promise.resolve();
    }

    onInitRender(): void {
    }

    getScreenOrientation(): OrientationType {
        let ret = window.screen.orientation.type;
        if (ret == null) {
            let o = window.orientation;
            switch (o) {
                case 0:
                    ret = "portrait-primary";
                    break;
                case 180:
                    ret = "portrait-secondary";
                    break;
                case 90:
                    ret = "landscape-primary";
                    break;
                case -90:
                    ret = "landscape-secondary";
                    break;
            }
        }
        return ret;
    }

    getPixelRatio() {
        return this._pixelRatio;
    }

    getClientWidth(): number {
        return Browser.window.innerWidth || Browser.document.body.clientWidth || Browser.document.documentElement.clientWidth;
    }

    getClientHeight(): number {
        return Browser.window.innerHeight || Browser.document.body.clientHeight || Browser.document.documentElement.clientHeight;
    }

    getVisibility(): boolean {
        return (Browser.document as any)[this._visibilityStateKey] !== "hidden";
    }

    requestFullscreen(): void {
        let ele = Browser.document.documentElement;
        if (!ele)
            return;

        if (ele.requestFullscreen)
            ele.requestFullscreen();
        else if ((ele as any).mozRequestFullScreen)
            (ele as any).mozRequestFullScreen();
        else if ((ele as any).webkitRequestFullscreen)
            (ele as any).webkitRequestFullscreen();
        else if ((ele as any).msRequestFullscreen)
            (ele as any).msRequestFullscreen();
    }

    exitFullscreen() {
        let doc = document;
        if (doc.exitFullscreen)
            doc.exitFullscreen();
        else if ((doc as any).mozCancelFullScreen)
            (doc as any).mozCancelFullScreen();
        else if ((doc as any).webkitExitFullscreen)
            (doc as any).webkitExitFullscreen();
    }

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        return Browser.document.createElement(tagName);
    }

    createMainCanvas() {
        let canvas = this.createElement("canvas");
        canvas.id = "layaCanvas";
        canvas.width = 0;
        canvas.height = 0;

        let style = canvas.style;
        style.position = 'absolute';
        style.top = style.left = "0px";
        style.background = "#000000";

        let container = Browser.document.createElement("div");
        container.id = "layaContainer";
        Browser.document.body.appendChild(container);

        container.appendChild(canvas);

        return canvas;
    }

    setCursor(cursor: string): void {
        Browser.document.body.style.cursor = cursor;
    }

    get supportArrayBufferURL(): boolean {
        return !!window.Blob;
    }

    createBufferURL(data: ArrayBuffer): string {
        if (window.Blob) {
            let blob = new Blob([data], { type: 'application/octet-binary' });
            return window.URL.createObjectURL(blob);
        }
        else
            return null;
    }

    revokeBufferURL(url: string): void {
        window.URL.revokeObjectURL(url);
    }

    getOpenDataContextCanvas(): HTMLCanvasElement {
        return null;
    }

    postMessageToOpenDataContext(msg: any): void {
    }

    captureGlobalError(callback: (e: any) => void | null): void {
        this._globalErrorCallback = callback;
        this.onCaptureGlobalError(callback != null, onError);
    }

    protected onCaptureGlobalError(enabled: boolean, func: (e: any) => void): void {
        if (enabled) {
            Browser.window.addEventListener("error", func);
            Browser.window.addEventListener("unhandledrejection", func);
        }
        else {
            Browser.window.removeEventListener("error", func);
            Browser.window.removeEventListener("unhandledrejection", func);
        }
    }

    alert(msg: string): void {
        Browser.window.alert(msg);
    }

    setStyleTransformOrigin(style: CSSStyleDeclaration, value: string): void {
        style.transformOrigin = style.webkitTransformOrigin
            = (style as any).msTransformOrigin = (style as any).mozTransformOrigin
            = (style as any).oTransformOrigin = value;
    }

    setStyleTransform(style: CSSStyleDeclaration, value: string): void {
        style.transform = style.webkitTransform
            = (style as any).msTransform = (style as any).mozTransform
            = (style as any).oTransform = value;
    }

    createWebSocket(): IWebSocket {
        return new (this.webSocketClass || _WebSocket)();
    }
}

function onError(e: any) {
    PAL.browser._globalErrorCallback(e);
}

PAL.register("browser", BrowserAdapter);