import { Laya } from "../../Laya";
import { Event } from "../../laya/events/Event";
import { Loader } from "../../laya/net/Loader";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { Utils } from "../../laya/utils/Utils";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";
import { MgDownloader } from "./MgDownloader";
import { MgWebSocket } from "./MgWebSocket";

export class MgBrowserAdapter extends BrowserAdapter {
    webSocketClass = MgWebSocket;

    static beforeInit: () => void;
    static afterInit: () => void;

    private _visible: boolean;
    private _orientation: OrientationType;

    protected init() {
        if (!console.time) { //有些平台，例如taobao没有这个
            console.time = function (name: string) {
            };
            console.timeEnd = function (name: string) {
                console.log(name);
            };
        }
        Browser.isDomSupported = false;

        MgBrowserAdapter.beforeInit?.();

        let platform: string = "";

        if (PAL.g.getSystemInfoSync) {
            let systemInfo = PAL.g.getSystemInfoSync();
            this._pixelRatio = systemInfo.pixelRatio;
            this._orientation = systemInfo.deviceOrientation === "landscape" ? "landscape-primary" : "portrait-primary";
            platform = systemInfo.platform || "";
        }
        else if (PAL.g.getWindowInfo) {
            let windowInfo = PAL.g.getWindowInfo();
            this._pixelRatio = windowInfo.pixelRatio;
            if (PAL.g.getDeviceInfo) {
                let deviceInfo = PAL.g.getDeviceInfo();
                platform = deviceInfo.platform || "";
            }
        }

        if (Browser.onVVMiniGame || Browser.onQGMiniGame) { //vivo or oppo, systemInfo里的不准确？！
            this._pixelRatio = window.devicePixelRatio;
        }

        this.setPlatform("", platform);

        const { SDKVersion } = PAL.g.getAppBaseInfo ? PAL.g.getAppBaseInfo() : PAL.g.getSystemInfoSync();
        Browser.SDKVersion = SDKVersion || "";

        const { system } = PAL.g.getDeviceInfo ? PAL.g.getDeviceInfo() : PAL.g.getSystemInfoSync();
        const systemVersionArr = system ? system.split(' ') : [];
        Browser.systemVersion = systemVersionArr.length ? systemVersionArr[systemVersionArr.length - 1] : '';

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
        PAL.g.onShow(() => {
            this._visible = true;
            this.event(Event.VISIBILITY_CHANGE, true);
            this.event(Event.FOCUS);
        });
        PAL.g.onHide(() => {
            this._visible = false;
            this.event(Event.VISIBILITY_CHANGE, false);
            this.event(Event.BLUR);
        });

        if (PAL.g.onWindowResize) {
            PAL.g.onWindowResize(result => {
                this.event(Event.RESIZE);
            });
        }
    }

    start(): Promise<void> {
        let downloader = Loader.downloader = new MgDownloader();
        this.setupWasmSupport();

        MgBrowserAdapter.afterInit?.();

        return downloader.cacheManager.start();
    }

    protected setupWasmSupport() {
        let wasmGlobal: typeof WebAssembly;
        if (Browser.onWXMiniGame)
            wasmGlobal = (window as any).WXWebAssembly;
        else if (Browser.onAlipayMiniGame)
            wasmGlobal = (window as any).MYWebAssembly;
        else if (Browser.onTTMiniGame)
            wasmGlobal = (window as any).TTWebAssembly;

        if (wasmGlobal) {
            if (!window.WebAssembly) //让WASM库以为支持WASM
                (window as any).WebAssembly = {};
            WasmAdapter.Memory = wasmGlobal.Memory;

            WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
                return wasmGlobal.instantiate("libs/" + wasmFile, imports);
            };
        }
        else if (window.WebAssembly) {
            let shouldInit = PAL.g.setWasmTaskCompile != null; //oppo

            WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
                return Laya.loader.fetch("libs/" + wasmFile, "arraybuffer").then(data => {
                    if (data) {
                        if (shouldInit) {
                            shouldInit = false;
                            PAL.g.setWasmTaskCompile(true); //oppo
                        }

                        return window.WebAssembly.instantiate(data, imports);
                    }
                    else {
                        console.error("WASM file not found: " + wasmFile);
                        return null;
                    }
                });
            };
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
        if (tagName === "canvas" && typeof (PAL.g.createCanvas) === "function")
            ele = PAL.g.createCanvas();
        else
            ele = super.createElement(tagName);
        if (!ele.style)
            ele.style = {};
        else if (ele.style === (window as any).canvas?.style) //douyin共享了style对象
            ele.style = {};
        return ele;
    }

    setCursor(cursor: string): void {
        if (!PAL.g.setCursor)
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
        PAL.g.setCursor(arr[0], x, y);
    }

    get supportArrayBufferURL(): boolean {
        return PAL.g.createBufferURL != null && PAL.g.revokeBufferURL != null;
    }

    createBufferURL(data: ArrayBuffer): string {
        return PAL.g.createBufferURL(data);
    }

    revokeBufferURL(url: string): void {
        return PAL.g.revokeBufferURL(url);
    }

    getOpenDataContextCanvas() {
        return (window as any).sharedCanvas;
    }

    postMessageToOpenDataContext(msg: any): void {
        if (PAL.g.getOpenDataContext)
            PAL.g.getOpenDataContext().postMessage(msg);
    }

    protected onCaptureGlobalError(enabled: boolean, func: (e: any) => void): void {
        if (enabled) {
            if (PAL.g.onError)
                PAL.g.onError(func);
            if (PAL.g.onUnhandledRejection)
                PAL.g.onUnhandledRejection(func);
        }
        else {
            if (PAL.g.offError)
                PAL.g.offError(func);
            if (PAL.g.offUnhandledRejection)
                PAL.g.offUnhandledRejection(func);
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