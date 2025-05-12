import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onHWMiniGame = true;
    PAL.global = (window as any).hbs;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    cacheManager.spaceLimit = 200 * 1024 * 1024;

    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    WasmAdapter.setNativeProvider(window.WebAssembly);

    return cacheManager.start();
};