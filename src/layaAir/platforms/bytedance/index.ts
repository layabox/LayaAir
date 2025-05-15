import { Config } from "../../Config";
import { WebAudioChannel } from "../../laya/media/WebAudioChannel";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";
import { MgVideoPlayer } from "../minigame/MgVideoPlayer";
import { setupMgWasmSupport } from "../minigame/WasmUtils";
import { TtVideoTexture } from "./TtVideoTexture";

PAL.preIntialize = function () {
    Browser.onTTMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.global = (window as any).tt;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    PAL.media.shortAudioClass = WebAudioChannel; //抖音支持WebAudio API

    if (Browser.onDevTools) { //devtools下报错，而且影响到主循环
        PAL.media.videoTextureClass = null;
        PAL.media.videoPlayerClass = null;
    }
    else {
        PAL.media.videoTextureClass = TtVideoTexture;
        PAL.media.videoPlayerClass = MgVideoPlayer;
    }

    setupMgWasmSupport((window as any).TTWebAssembly);

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    return cacheManager.start();
};