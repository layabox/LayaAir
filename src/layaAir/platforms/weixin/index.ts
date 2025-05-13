import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgMediaAdapter } from "../minigame/MgMediaAdapter";
import { setupMgWasmSupport } from "../minigame/WasmUtils";
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

    setupMgWasmSupport(<any>window.WXWebAssembly);

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;
    downloader.escapeZhCharsInURL = false;

    return cacheManager.start();
};