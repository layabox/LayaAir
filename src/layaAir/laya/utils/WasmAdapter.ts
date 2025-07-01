import { PlayerConfig } from "../../Config";
import { LayaEnv } from "../../LayaEnv";
import { URL } from "../net/URL";
import { Browser } from "./Browser";
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
                else
                    wasmFile = WasmAdapter.locateFileDefault(path, scriptDirectory);
                return wasmFile;
            }

            return module(moduleArg);
        };
    }

    static locateFileDefault(path: string, scriptDirectory?: string): string {
        if (LayaEnv.isPreview)
            return scriptDirectory ? scriptDirectory + path : path;

        path = URL.formatURL(path, '');
        if (PlayerConfig.wasmSubpackage)
            return PlayerConfig.wasmSubpackage + "/" + Utils.getBaseName(path);

        return path;
    }
}