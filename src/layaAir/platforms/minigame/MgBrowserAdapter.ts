import { Event } from "../../laya/events/Event";
import { URL } from "../../laya/net/URL";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { ClassUtils } from "../../laya/utils/ClassUtils";

var mg: WechatMinigame.Wx;

export class MgBrowserAdapter extends BrowserAdapter {
    private _windowWidth: number;
    private _windowHeight: number;
    private _supportBufferURL: boolean;
    private _visible: boolean;
    private _orientation: OrientationType;

    protected init() {
        mg = PAL.global;
        URL.basePath = URL.rootPath = "";
        let platform: string = "";

        if (mg.getSystemInfoSync) {
            let systemInfo = mg.getSystemInfoSync();
            this._pixelRatio = systemInfo.pixelRatio;
            this._windowWidth = systemInfo.windowWidth;
            this._windowHeight = systemInfo.windowHeight;
            this._orientation = systemInfo.deviceOrientation === "landscape" ? "landscape-primary" : "portrait-primary";
            platform = systemInfo.platform || "";
        }
        else if (mg.getWindowInfo) {
            let windowInfo = mg.getWindowInfo();
            this._pixelRatio = windowInfo.pixelRatio;
            this._windowWidth = windowInfo.windowWidth;
            this._windowHeight = windowInfo.windowHeight;
            if (mg.getDeviceInfo) {
                let deviceInfo = mg.getDeviceInfo();
                platform = deviceInfo.platform || "";
            }
        }

        platform = platform.toLowerCase();
        if (Browser.onVVMiniGame || Browser.onQGMiniGame) { //vivo or oppo
            this._pixelRatio = window.devicePixelRatio;
        }
        console.log(`platform=${platform}, windowSize=${this._windowWidth}x${this._windowHeight}, dpr=${this._pixelRatio}, orientation=${this._orientation}`);

        if (platform.indexOf("ios") !== -1) {
            Browser.onIOS = true;
            Browser.onIPhone = true;
            Browser.onIPad = true;

            Browser.onAndroid = false;
            Browser.platform = Browser.PLATFORM_IOS;
        } else if (platform.indexOf("android") !== -1 || platform.indexOf("ohos") !== -1) {
            Browser.onIOS = false;
            Browser.onIPhone = false;
            Browser.onIPad = false;

            Browser.onAndroid = true;
            Browser.platform = Browser.PLATFORM_ANDROID;
        } else {
            Browser.onIOS = false;
            Browser.onIPhone = false;
            Browser.onIPad = false;

            Browser.onAndroid = false;
            Browser.platform = Browser.PLATFORM_PC;
        }

        const { SDKVersion } = mg.getAppBaseInfo ? mg.getAppBaseInfo() : mg.getSystemInfoSync();
        Browser.SDKVersion = SDKVersion || "";

        const { system } = mg.getDeviceInfo ? mg.getDeviceInfo() : mg.getSystemInfoSync();
        const systemVersionArr = system ? system.split(' ') : [];
        Browser.systemVersion = systemVersionArr.length ? systemVersionArr[systemVersionArr.length - 1] : '';

        this._supportBufferURL = typeof (mg.createBufferURL) === "function" && typeof (mg.revokeBufferURL) === "function";

        this._visible = true;
        mg.onShow(() => {
            this._visible = true;
            this.event(Event.VISIBILITY_CHANGE, true);
            this.event(Event.FOCUS);
        });
        mg.onHide(() => {
            this._visible = false;
            this.event(Event.VISIBILITY_CHANGE, false);
            this.event(Event.BLUR);
        });

        mg.onWindowResize((result: WechatMinigame.OnWindowResizeListenerResult) => {
            this._windowWidth = result.windowWidth;
            this._windowHeight = result.windowHeight;
            this.event(Event.RESIZE);
        });

        mg.onError(e => {
            if (this.hasListener(Event.ERROR))
                this.event(Event.ERROR, e);
            else
                console.error(e);
        });

        if (mg.onUnhandledRejection) {
            mg.onUnhandledRejection(e => {
                if (this.hasListener("unhandledrejection"))
                    this.event("unhandledrejection", e);
                else
                    console.error(e);
            });
        }
    }

    getClientWidth(): number {
        return this._windowWidth;
    }

    getClientHeight(): number {
        return this._windowHeight;
    }

    getVisibility(): boolean {
        return this._visible;
    }

    getScreenOrientation(): OrientationType {
        return this._orientation;
    }

    createMainCanvas(): HTMLCanvasElement {
        return (window as any).canvas || (window as any).__canvas;
    }

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        let ele: any;
        if (tagName === "canvas" && typeof (mg.createCanvas) === "function")
            ele = mg.createCanvas();
        else
            ele = super.createElement(tagName);
        (!ele.style) && (ele.style = {});
        return ele;
    }

    setCursor(cursor: string): void {
        if (!mg.setCursor)
            return;

        let arr = cursor.split(" ");
        let x = arr[1] ? parseInt(arr[1].trim()) : 0;
        let y = arr[2] ? parseInt(arr[2].trim()) : 0;
        let i = arr[0].indexOf("url(");
        if (i != -1) {
            let j = arr[0].indexOf(")");
            if (j != -1)
                arr[0] = arr[0].substring(i + 4, j);
        }

        if (isNaN(x) || isNaN(y))
            x = y = undefined;
        mg.setCursor(arr[0], x, y);
    }

    get supportArrayBufferURL(): boolean {
        return this._supportBufferURL;
    }

    createBufferURL(data: ArrayBuffer): string {
        return mg.createBufferURL(data);
    }

    revokeBufferURL(url: string): void {
        return mg.revokeBufferURL(url);
    }

    getOpenDataContextCanvas() {
        return (window as any).sharedCanvas;
    }

    postMessageToOpenDataContext(msg: any): void {
        if (mg.getOpenDataContext)
            mg.getOpenDataContext().postMessage(msg);
    }
}

ClassUtils.regClass("PAL.Browser", MgBrowserAdapter);