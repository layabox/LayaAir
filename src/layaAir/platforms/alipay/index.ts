import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onAlipayMiniGame = true;
    PAL.global = (window as any).my;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;

    WasmAdapter.setNativeProvider((window as any).MYWebAssembly);

    Laya.addBeforeInitCallback(() => {
        // srgb问题
        (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();
    }, true);

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    return cacheManager.start();
};