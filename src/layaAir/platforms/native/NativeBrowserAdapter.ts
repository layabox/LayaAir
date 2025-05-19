import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Render } from "../../laya/renders/Render";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";

export class NativeBrowserAdapter extends BrowserAdapter {
    init() {
        Config.fixedFrames = false;
        Browser.onLayaRuntime = true;
        Browser.isDomSupported = false;
        PAL.g = (window as any).conch;

        WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
            return Laya.loader.fetch("libs/" + wasmFile, "arraybuffer").then(data => {
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

        Laya.addAfterInitCallback(() => {
            PAL.g.setGlobalRepaint(Render.setGlobalRepaint);
        });

        super.init();
    }

    createMainCanvas() {
        let canvas = this.createElement("canvas");
        Browser.document.body.appendChild(canvas);

        return canvas;
    }

    get supportArrayBufferURL(): boolean {
        return true;
    }

    createBufferURL(data: ArrayBuffer): string {
        return (window as any).wx.createBufferURL(data);
    }

    revokeBufferURL(url: string): void {
        return (window as any).wx.revokeBufferURL(url);
    }
}

PAL.register("browser", NativeBrowserAdapter);