import { Laya } from "../../Laya";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";

export function setCustomWasmLoader(useSyncInstantiate?: boolean) {
    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        return Laya.loader.fetch("libs/" + wasmFile, "arraybuffer").then(data => {
            if (!data) {
                console.error("WASM file not found: " + wasmFile);
                return null;
            }

            if (useSyncInstantiate) {
                let module = new window.WebAssembly.Module(data);
                let instance = new window.WebAssembly.Instance(module, imports);
                let ret: any = {};
                ret["instance"] = instance;
                return ret;
            }
            else
                return window.WebAssembly.instantiate(data, imports);
        });
    };
}

export function setupMgWasmSupport(provider: typeof WebAssembly) {
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

        return provider.instantiate("libs/" + wasmFile, imports);
    };
}