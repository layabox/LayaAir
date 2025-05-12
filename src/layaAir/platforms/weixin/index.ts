import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgMediaAdapter } from "../minigame/MgMediaAdapter";
import { WxVideoTexture } from "./WxVideoTexture";

PAL.preIntialize = function () {
    Browser.onWXMiniGame = true;
    Browser.onMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.global = wx;
};

PAL.postInitialize = function () {
    if (!Browser.onDevTools)
        (<MgMediaAdapter>PAL.media).videoTextureClass = WxVideoTexture;

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