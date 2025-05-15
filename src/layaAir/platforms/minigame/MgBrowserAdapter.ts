import { Config } from "../../Config";
import { Event } from "../../laya/events/Event";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Utils } from "../../laya/utils/Utils";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";

var mg: WechatMinigame.Wx;

export class MgBrowserAdapter extends BrowserAdapter {
    private _visible: boolean;
    private _orientation: OrientationType;

    protected init() {
        mg = PAL.global;
        let platform: string = "";

        if (mg.getSystemInfoSync) {
            let systemInfo = mg.getSystemInfoSync();
            this._pixelRatio = systemInfo.pixelRatio;
            this._orientation = systemInfo.deviceOrientation === "landscape" ? "landscape-primary" : "portrait-primary";
            platform = systemInfo.platform || "";
        }
        else if (mg.getWindowInfo) {
            let windowInfo = mg.getWindowInfo();
            this._pixelRatio = windowInfo.pixelRatio;
            if (mg.getDeviceInfo) {
                let deviceInfo = mg.getDeviceInfo();
                platform = deviceInfo.platform || "";
            }
        }

        if (Browser.onVVMiniGame || Browser.onQGMiniGame) { //vivo or oppo, systemInfo里的不准确？！
            this._pixelRatio = window.devicePixelRatio;
        }

        this.setPlatform("", platform);

        console.log(`platform=${Browser.platformName}(${Browser.platform}), dpr=${this._pixelRatio}, orientation=${this._orientation}`);

        const { SDKVersion } = mg.getAppBaseInfo ? mg.getAppBaseInfo() : mg.getSystemInfoSync();
        Browser.SDKVersion = SDKVersion || "";

        const { system } = mg.getDeviceInfo ? mg.getDeviceInfo() : mg.getSystemInfoSync();
        const systemVersionArr = system ? system.split(' ') : [];
        Browser.systemVersion = systemVersionArr.length ? systemVersionArr[systemVersionArr.length - 1] : '';

        Browser.isDomSupported = false;

        /*
         这个是原来的isWan1Wan标志的逻辑
         1. 微信下玩一玩平台，不支持imagedata,所以是黑屏的，设置这个标志，采用canvas模式
         2. 其他平台也遇到这种问题，wan1wan标志就不再专指玩一玩了
         3. 微信支持imagedata了，关闭这个标记
         4. 发现虽然支持，但是有的手机会有文字黑边无法解决，再次打开
        */
        TextRenderConfig.useImageData = false;
        //这里还有个对特定ios版本允许使用imageData的判断，已不清楚为什么
        if (Browser.platform === Browser.PLATFORM_IOS && Utils.compareVersion(Browser.systemVersion, "10.1.1") === 0)
            TextRenderConfig.useImageData = true;

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

        if (mg.onWindowResize) {
            mg.onWindowResize((result: WechatMinigame.OnWindowResizeListenerResult) => {
                this.event(Event.RESIZE);
            });
        }
    }

    getVisibility(): boolean {
        return this._visible;
    }

    getScreenOrientation(): OrientationType {
        return this._orientation;
    }

    createMainCanvas(): HTMLCanvasElement {
        if (Browser.onTBMiniGame) {
            return (window as any).screencanvas //taobao mini
                || (window as any).canvas.getRealCanvas(); //taobao app/plugin
        }
        else
            return (window as any).canvas || (window as any).__canvas; //vivo/oppo
    }

    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        let ele: any;
        if (tagName === "canvas" && typeof (mg.createCanvas) === "function")
            ele = mg.createCanvas();
        else
            ele = super.createElement(tagName);
        if (!ele.style)
            ele.style = {};
        else if (ele.style === (window as any).canvas?.style) //douyin共享了style对象
            ele.style = {};
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
        return mg.createBufferURL != null && mg.revokeBufferURL != null;
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

    protected onCaptureGlobalError(enabled: boolean, func: (e: any) => void): void {
        if (enabled) {
            if (mg.onError)
                mg.onError(func);
            if (mg.onUnhandledRejection)
                mg.onUnhandledRejection(func);
        }
        else {
            if (mg.offError)
                mg.offError(func);
            if (mg.offUnhandledRejection)
                mg.offUnhandledRejection(func);
        }
    }

    alert(msg: string): void {
        if (typeof (window.alert) === "function") {
            window.alert.call(null, msg); //在douyin上直接window.alert会报错
        }
        else {
            console.warn("alert is not a function");
        }
    }
}

PAL.register("browser", MgBrowserAdapter);