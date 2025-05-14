import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { setCustomWasmLoader } from "../minigame/WasmUtils";
import { VvDownloader } from "./VvDownloader";

PAL.preIntialize = function () {
    Browser.onVVMiniGame = true;
    PAL.global = (window as any).qg;
};

PAL.postInitialize = function () {
    Config.fixedFrames = false;
    Config.useRetinalCanvas = true;

    setCustomWasmLoader();

    let cacheManager = new MgCacheManager("internal://files/layaCache");
    let downloader = Loader.downloader = new VvDownloader();
    downloader.cacheManager = cacheManager;
    downloader.supportSubPackageMultiLevelFolders = false;

    return cacheManager.start();
};