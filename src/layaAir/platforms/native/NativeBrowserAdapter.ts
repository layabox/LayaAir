import { Config, PlayerConfig } from "../../Config";
import { Laya } from "../../Laya";
import { Event } from "../../laya/events/Event";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Render } from "../../laya/renders/Render";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";

export class NativeBrowserAdapter extends BrowserAdapter {
    protected _visible: boolean = true;
    protected _canvas: any;
    init() {
        Config.fixedFrames = false;
        Browser.onLayaRuntime = true;
        Browser.isDomSupported = false;
        PAL.g = (window as any).conch;
        //建议取值 30 60 120
        PAL.g.setPreferredFramesPerSecond(Config.FPS);
        //ios glBufferSubData is versy slow
        if ((window as any).conchConfig.getOS() == "Conch-ios") {
            Config.enableUniformBufferObject = false;
            Config.matUseUBO = false;
        }
        WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
            wasmFile = WasmAdapter.locateFileDefault(wasmFile);
            return Laya.loader.fetch(wasmFile, "arraybuffer").then(data => {
                if (data) {
                    let module = new window.WebAssembly.Module(data);
                    let instance = new window.WebAssembly.Instance(module, imports);
                    let ret: any = {};
                    ret["instance"] = instance;
                    return ret;
                }
                else {
                    console.error("WASM file not found: " + wasmFile);
                    return null;
                }
            });
        };

        let windowInfo = PAL.g.getWindowInfo();
        this._pixelRatio = windowInfo.pixelRatio;
        let deviceInfo = PAL.g.getDeviceInfo();
        let platform: string = deviceInfo.platform || "";

        this.setPlatform("", platform);

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
    getVisibility(): boolean {
        return this._visible;
    }

    setWindowSize(width: number, height: number): boolean {
        if (!PAL.hasAPI("setWindowSize")) {
            PAL.warnIncompatibility("setWindowSize");
            return false;
        }
        return (PAL.g as any).setWindowSize(width, height);
    }

    setResolution(width: number, height: number, fullscreen: boolean): boolean {
        if (PAL.hasAPI("setResolution"))
            return (PAL.g as any).setResolution(width, height, fullscreen);

        if (!fullscreen && PAL.hasAPI("setWindowSize"))
            return (PAL.g as any).setWindowSize(width, height);

        PAL.warnIncompatibility("setResolution");
        return false;
    }

    createMainCanvas() {
        this._canvas = PAL.g.createCanvas() as any;
        this._canvas.id = "layaCanvas";
        return this._canvas;
    }
    createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
        let ele: any;
        if (tagName === "canvas" && typeof (PAL.g.createCanvas) === "function")
            ele = PAL.g.createCanvas();
        else
            ele = super.createElement(tagName);
        return ele;
    }

    getElementById(id: string): HTMLElement {
        if (id === this._canvas.id) {
            return this._canvas;
        }
        return null
    }

    removeElement(ele: HTMLElement): void {
        ele = null;
    }

    get supportArrayBufferURL(): boolean {
        return true;
    }

    createBufferURL(data: ArrayBuffer): string {
        return PAL.g.createBufferURL(data);
    }

    revokeBufferURL(url: string): void {
        return PAL.g.revokeBufferURL(url);
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
}

PAL.register("browser", NativeBrowserAdapter);