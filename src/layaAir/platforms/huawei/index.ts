import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";
import { setCustomWasmLoader } from "../minigame/WasmUtils";

PAL.preIntialize = function () {
    Browser.onHWMiniGame = true;
    PAL.global = (window as any).hbs;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    setCustomWasmLoader();

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    return cacheManager.start();
};