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
    /** 可被平台覆盖的下载器类（默认 MgDownloader）；平台可在 beforeInit 里替换为子类。 */
    static downloaderClass: typeof MgDownloader = MgDownloader;

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
        let systemName: string = "";
        let systemInfo = PAL.hasAPI("getSystemInfoSync") ? PAL.g.getSystemInfoSync() : null;

        if (systemInfo) {
            this._pixelRatio = systemInfo.pixelRatio;
            this._orientation = systemInfo.deviceOrientation === "landscape" ? "landscape-primary" : "portrait-primary";
            platform = systemInfo.platform || "";
            systemName = systemInfo.system || "";
        }
        else if (PAL.hasAPI("getWindowInfo")) {
            let windowInfo = PAL.g.getWindowInfo();
            this._pixelRatio = windowInfo.pixelRatio;
            if (PAL.g.getDeviceInfo) {
                let deviceInfo = PAL.g.getDeviceInfo();
                platform = deviceInfo.platform || "";
                systemName = deviceInfo.system || "";
            }
        }

        if (Browser.onVVMiniGame || Browser.onQGMiniGame) { //vivo or oppo, systemInfo里的不准确？！
            this._pixelRatio = window.devicePixelRatio;
        }

        this.setPlatform("", this.normalizePlatform(platform, systemName));

        systemInfo = systemInfo || <any>{};

        const { SDKVersion } = (PAL.hasAPI("getAppBaseInfo") ? PAL.g.getAppBaseInfo() : null) || systemInfo;
        Browser.SDKVersion = SDKVersion || "";

        const { system } = (PAL.hasAPI("getDeviceInfo") ? PAL.g.getDeviceInfo() : null) || systemInfo;
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

        PAL.g.onShow && PAL.g.onShow(() => {
            this._visible = true;
            this.event(Event.VISIBILITY_CHANGE, true);
            this.event(Event.FOCUS);
        });
        PAL.g.onHide && PAL.g.onHide(() => {
            this._visible = false;
            this.event(Event.VISIBILITY_CHANGE, false);
            this.event(Event.BLUR);
        });
        if (PAL.hasAPI("onWindowResize")) {
            PAL.g.onWindowResize(result => {
                //旋转、分屏、PC拖窗、折叠屏等场景下窗口变化但屏幕不变，用屏幕尺寸会导致画布与实际显示区不匹配而被拉伸/剪裁。
                let info = PAL.hasAPI("getWindowInfo") ? PAL.g.getWindowInfo()
                    : (PAL.hasAPI("getSystemInfoSync") ? PAL.g.getSystemInfoSync() : null);
                //回调参数优先，其次查询接口
                let w = result ? result.windowWidth : 0;
                let h = result ? result.windowHeight : 0;
                if ((!w || !h) && info) { w = info.windowWidth; h = info.windowHeight; }
                if (w && h) {
                    window.innerWidth = w;
                    window.innerHeight = h;
                }
                this.event(Event.RESIZE);
            });
        }
    }

    start(): Promise<void> {
        let downloader = Loader.downloader = new MgBrowserAdapter.downloaderClass(
            PAL.hasAPI("getFileSystemManager") && PAL.hasAPI(PAL.g.getFileSystemManager(), "writeFile") && PAL.hasAPI(PAL.g.getFileSystemManager(), "readdir")
        );
        this.setupWasmSupport();

        MgBrowserAdapter.afterInit?.();

        if (downloader.cacheManager)
            return downloader.cacheManager.start();
        else
            return Promise.resolve();
    }

    onInitRender(): void {
        if (Browser.onTBMiniGame && !Browser.isIOSHighPerformanceMode) {
            // srgb问题（高性能模式不关闭 srgb）
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
            if (!window.WebAssembly) { //让WASM库以为支持WASM
                try {
                    (window as any).WebAssembly = { Memory: wasmGlobal.Memory };
                } catch (e) {
                    //抖音iOS等平台window.WebAssembly虽undefined但slot只读，赋值会抛错；wasm库走WasmAdapter钩子不依赖此stub，忽略
                }
            }
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
        if (tagName === "canvas" && typeof (PAL.g.createCanvas) === "function") {
            if (Browser.onTBMiniGame && (window as any).__NOT_TBMINIGAME__) {
                ele = (window as any).canvas.getRealCanvas();   // taobao app/plugin canvas get.
            } else {
                ele = PAL.g.createCanvas();
            }
        }
        else {
            ele = super.createElement(tagName);
        }
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

    // Some mini-game platforms, such as Xiaomi, may return host version strings in platform.
    protected normalizePlatform(platform: string, system: string): string {
        let p = (platform || "").toLowerCase();

        if (p.indexOf("openharmony") !== -1)
            return "ohos";
        if (p.indexOf("iphone") !== -1 || p.indexOf("ipad") !== -1)
            return "ios";

        if (p.indexOf("ios") !== -1 || p.indexOf("android") !== -1 || p.indexOf("ohos") !== -1
            || p.indexOf("mac") !== -1 || p.indexOf("win") !== -1 || p === "devtools")
            return platform;

        let s = (system || "").toLowerCase();
        if (s.indexOf("android") !== -1 || s.indexOf("adr") !== -1)
            return "android";
        if (s.indexOf("ios") !== -1 || s.indexOf("iphone") !== -1 || s.indexOf("ipad") !== -1)
            return "ios";
        if (s.indexOf("ohos") !== -1 || s.indexOf("openharmony") !== -1)
            return "ohos";

        return platform;
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
