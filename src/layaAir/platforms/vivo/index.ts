import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onVVMiniGame = true;
    PAL.global = (window as any).qg;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    let cacheManager = new MgCacheManager("internal://files/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;
    downloader.supportSubPackageMultiLevelFolders = false;
    //vivo下载接口是download而不是downloadFile, 这里为了通用定义成downloadFile
    PAL.global.downloadFile = PAL.global.download;

    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        if (!window.WebAssembly)
            throw new Error("==== 不支持wasm加载 ====");

        return PAL.fs.readFile("libs/" + wasmFile, "arraybuffer").then(data => window.WebAssembly.instantiate(data, imports));
    };

    return cacheManager.start();
};