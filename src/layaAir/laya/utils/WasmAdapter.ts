import { PAL } from "../platform/PlatformAdapters";
import { Utils } from "./Utils";

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
                else if (scriptDirectory)
                    wasmFile = scriptDirectory + path;
                else
                    wasmFile = webDir + "libs/" + Utils.getBaseName(path);
                return wasmFile;
            }

            return module(moduleArg);
        };
    }

    static setNativeProvider(provider: any) {
        let isStandard = window.WebAssembly != null && provider == window.WebAssembly;
        if (provider && !isStandard) {
            (window as any).WebAssembly = {};
            WasmAdapter.Memory = provider.Memory;
        }
        WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
            if (!provider)
                throw new Error("WASM is not supported");

            if (isStandard) {
                if (PAL.global.setWasmTaskCompile)
                    PAL.global.setWasmTaskCompile(true); //oppo
                return PAL.fs.readFile("libs/" + wasmFile, "arraybuffer").then(data => window.WebAssembly.instantiate(data, imports));
            }
            else
                return provider.instantiate("libs/" + wasmFile, imports);
        };
    }
}