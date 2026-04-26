import { PlayerConfig } from "../../Config";
import { Laya } from "../../Laya";
import { Event } from "../../laya/events/Event";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Loader } from "../../laya/net/Loader";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { RenderCapable } from "../../laya/RenderEngine/RenderEnum/RenderCapable";
import { Browser } from "../../laya/utils/Browser";
import { Utils } from "../../laya/utils/Utils";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";
import { MgDownloader } from "./MgDownloader";
import { MgWebSocket } from "./MgWebSocket";

export class MgBrowserAdapter extends BrowserAdapter {
    static beforeInit: () => void;
    static afterInit: () => void;

    protected _visible: boolean = true;
    protected _orientation: OrientationType = "portrait-primary";
    protected _supportSetCursor: boolean;
    protected _supportCreateArrayBufferURL: boolean;

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

        this._supportSetCursor = PAL.hasAPI("setCursor");
        this._supportCreateArrayBufferURL = PAL.hasAPI("createBufferURL");
        if (PAL.hasAPI("connectSocket"))
            this.webSocketClass = MgWebSocket;
        else
            this.webSocketClass = null;

        let platform: string = "";
        let systemInfo = PAL.hasAPI("getSystemInfoSync") ? PAL.g.getSystemInfoSync() : null;

        if (systemInfo) {
            this._pixelRatio = systemInfo.pixelRatio;
            this._orientation = systemInfo.deviceOrientation === "landscape" ? "landscape-primary" : "portrait-primary";
            platform = systemInfo.platform || "";
        }
        else if (PAL.hasAPI("getWindowInfo")) {
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

        systemInfo = systemInfo || <any>{};

        const { SDKVersion } = PAL.hasAPI("getAppBaseInfo") ? PAL.g.getAppBaseInfo() : systemInfo;
        Browser.SDKVersion = SDKVersion || "";

        const { system } = PAL.hasAPI("getDeviceInfo") ? PAL.g.getDeviceInfo() : systemInfo;
        const systemVersionArr = system ? system.split(' ') : [];
        Browser.systemVersion = systemVersionArr.length ? systemVersionArr[systemVersionArr.length - 1] : '';

        if (Browser.onHWMiniGame) {
            this._pixelRatio = 1;
        }
        else {
            //常见于小游戏在PC真机跑，低dpr会导致画面模糊，强制取2
            if (this._pixelRatio === 1 && Browser.onPC && !Browser.onDevTools)
                this._pixelRatio = 2;
        }

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
        if (PAL.hasAPI("onWindowResize")) {
            PAL.g.onWindowResize(result => {
                this.event(Event.RESIZE);
            });
        }
    }

    start(): Promise<void> {
        let downloader = Loader.downloader = new MgDownloader(
            PAL.hasAPI("getFileSystemManager") && PAL.hasAPI(PAL.g.getFileSystemManager(), "writeFile")
        );
        this.setupWasmSupport();

        MgBrowserAdapter.afterInit?.();

        if (downloader.cacheManager)
            return downloader.cacheManager.start();
        else
            return Promise.resolve();
    }

    onInitRender(): void {
        if (Browser.onTBMiniGame) {
            // srgb问题
            (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();
        }

        if (Browser.onAlipayMiniGame) {
            // webgl1 + srgb + teximage2d接口，alipay安卓端绘制黑屏，关闭srgb
            (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();
            // webgl2下默认有srgb，但是srgb配合msaa超采样有问题，这里关闭msaa
            (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffCapableAndExtension(RenderCapable.MSAA, null);
        }

        if (Browser.onTBMiniGame) {
            // 预乘问题
            if (!PAL.g.isIDE) {
                let gl = <WebGLRenderingContext>LayaGL.renderEngine._context;
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            }
        }

        // webgpu 需要加载为 bitmap
        // hw webgpu 不需要加载为 bitmap
        if (Browser.onHWMiniGame) {
            LayaGL.textureContext.needBitmap = false;
        }
    }

    protected setupWasmSupport() {
        let wasmGlobal: typeof WebAssembly;
        if (Browser.onWXMiniGame)
            wasmGlobal = (window as any).WXWebAssembly;
        else if (Browser.onAlipayMiniGame)
            wasmGlobal = (window as any).MYWebAssembly;
        else if (Browser.onTTMiniGame)
            wasmGlobal = (window as any).TTWebAssembly;
        else if (Browser.onHWMiniGame)
            wasmGlobal = (window as any).qg;

        if (wasmGlobal) {
            if (!window.WebAssembly) //让WASM库以为支持WASM
                (window as any).WebAssembly = { Memory : wasmGlobal.Memory };
            WasmAdapter.Memory = wasmGlobal.Memory;

            WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
                wasmFile = WasmAdapter.locateFileDefault(wasmFile);
                return wasmGlobal.instantiate(wasmFile, imports);
            };
        }
        else if (window.WebAssembly) {
            let shouldInit = PAL.g.setWasmTaskCompile != null; //oppo

            WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
                wasmFile = WasmAdapter.locateFileDefault(wasmFile);
                return Laya.loader.fetch(wasmFile, "arraybuffer").then(data => {
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
        let canvas: HTMLCanvasElement;
        if (Browser.onTBMiniGame) {
            canvas = (window as any).screencanvas //taobao mini
                || (window as any).canvas.getRealCanvas(); //taobao app/plugin
        }
        else {
            canvas = (window as any).canvas || (window as any).__canvas; //vivo/oppo
        }
        canvas.id = "layaCanvas";
        return canvas;
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

    getElementById(id: string): HTMLElement {
        if (window.document.getElementById) {
            return window.document.getElementById(id);
        } else {
            PAL.warnIncompatibility("getElementById");
            return null;
        }
    }

    removeElement(ele: HTMLElement): void {
        if (ele.remove) {
            ele.remove();
        } else if ((ele as any).dispose) {
            // ttMiniGame
            (ele as any).dispose();
        } else {
            ele = null;
        }
    }

    setCursor(cursor: string): void {
        if (!this._supportSetCursor)
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
        return this._supportCreateArrayBufferURL;
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
            if (PAL.hasAPI("onError"))
                PAL.g.onError(func);
            if (PAL.g.onUnhandledRejection)
                PAL.g.onUnhandledRejection(func);
        }
        else {
            if (PAL.hasAPI("offError"))
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