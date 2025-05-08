import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.global = wx;
};

PAL.postInitialize = function () {
    TextRenderConfig.supportImageData = Browser.systemVersion === "ios 10.1.1";

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    cacheManager.spaceLimit = 200 * 1024 * 1024;

    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;
    downloader.escapeZhCharsInURL = false;

    if (window.WXWebAssembly) {
        (window as any).WebAssembly = {};
        WasmAdapter.Memory = window.WXWebAssembly.Memory;
    }
    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        if (!window.WXWebAssembly)
            throw new Error("==== 不支持wasm加载 ====");

        return window.WXWebAssembly.instantiate("libs/" + wasmFile, imports);
    };

    return cacheManager.start();
};