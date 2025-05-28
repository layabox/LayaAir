import { PlayerConfig } from "../../Config";
import { Browser } from "./Browser";

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
            webDir = (<HTMLScriptElement>Browser.document.currentScript)?.src;
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
                else if (PlayerConfig.wasmSubpackage)
                    wasmFile = PlayerConfig.wasmSubpackage + "/" + path;
                else
                    wasmFile = scriptDirectory + path;
                return wasmFile;
            }

            return module(moduleArg);
        };
    }
}