import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgMediaAdapter } from "../minigame/MgMediaAdapter";
import { TtVideoTexture } from "./TtVideoTexture";

PAL.preIntialize = function () {
    Browser.onTTMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.global = (window as any).tt;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    if (!Browser.onDevTools)
        (<MgMediaAdapter>PAL.media).videoTextureClass = TtVideoTexture;

    WasmAdapter.setInstantiateMethod((window as any).TTWebAssembly, "byUrl");

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    return cacheManager.start();
};