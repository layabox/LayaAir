import { Laya } from "../../Laya";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @ignore
 */
export class WasmAdapter {
    static instantiateWasm: (url: string, imports: any) => Promise<any>;
    static locateFile: (path: string, dir: string, webDir: string) => string;
    static Memory = typeof (window.WebAssembly) !== "undefined" ? window.WebAssembly.Memory : null;

    static create(module: Function, wasmFile?: string): Function {
        let webDir: string;
        if (typeof document != 'undefined') {
            webDir = (<HTMLScriptElement>document.currentScript)?.src;
            if (webDir)
                webDir = webDir.substring(0, webDir.replace(/[?#].*/, "").lastIndexOf("/") + 1);
        }

        return () => {
            let moduleArg: any = {};

            if (WasmAdapter.instantiateWasm != null) {
                moduleArg["instantiateWasm"] = function (imports: any, receiveInstance: any) {
                    return WasmAdapter.instantiateWasm(wasmFile, imports).then(exports => {
                        receiveInstance(exports["instance"]);
                        return exports;
                    });
                };
            }

            moduleArg["locateFile"] = function (path: string, scriptDirectory: string) {
                if (WasmAdapter.locateFile != null)
                    wasmFile = WasmAdapter.locateFile(path, scriptDirectory, webDir);
                else
                    wasmFile = scriptDirectory + path;
                return wasmFile;
            }

            return module(moduleArg);
        };
    }

    static setInstantiateMethod(provider: typeof WebAssembly, method: "byUrl" | "byBuffer" | "byBufferSync") {
        if (provider) {
            if (!window.WebAssembly)
                (window as any).WebAssembly = {};
            WasmAdapter.Memory = provider.Memory;
        }

        let shouldInit = PAL.global.setWasmTaskCompile != null; //oppo

        WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
            if (!provider)
                throw new Error("WASM is not supported");

            if (shouldInit) {
                shouldInit = false;
                PAL.global.setWasmTaskCompile(true); //oppo
            }

            if (method === "byUrl") {
                return provider.instantiate("libs/" + wasmFile, imports);
            }
            else {
                return Laya.loader.fetch("libs/" + wasmFile, "arraybuffer").then(data => {
                    if (!data) {
                        console.error("WASM file not found: " + wasmFile);
                        return null;
                    }

                    if (method === "byBuffer")
                        return provider.instantiate(data, imports);
                    else {
                        let module = new window.WebAssembly.Module(data);
                        let instance = new window.WebAssembly.Instance(module, imports);
                        let ret: any = {};
                        ret["instance"] = instance;
                        return ret;
                    }
                });
            }
        };
    }
}