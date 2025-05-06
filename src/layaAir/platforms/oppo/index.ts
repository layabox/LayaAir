import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgCacheManager } from "../minigame/MgCacheManager";

PAL.preIntialize = function () {
    Browser.onQGMiniGame = true;
    PAL.global = (window as any).qg;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;
    downloader.supportSubPackageMultiLevelFolders = false;

    PAL.global.setWasmTaskCompile(true);
    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        if (!window.WebAssembly)
            throw new Error("==== 不支持wasm加载 ====");

        return PAL.fs.readFile("libs/" + wasmFile, "arraybuffer").then(data => window.WebAssembly.instantiate(data, imports));
    };

    return cacheManager.start();
};