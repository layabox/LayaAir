import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { setCustomWasmLoader } from "../minigame/WasmUtils";

PAL.preIntialize = function () {
    Browser.onQGMiniGame = true;
    PAL.global = (window as any).qg;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    setCustomWasmLoader();

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;
    downloader.supportSubPackageMultiLevelFolders = false;

    return cacheManager.start();
};