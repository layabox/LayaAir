import { Config } from "../../Config";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { WasmAdapter } from "../../laya/utils/WasmAdapter";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";
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
    TextRenderConfig.supportImageData = Browser.systemVersion === "ios 10.1.1";

    if (!Browser.onDevTools)
        (<MgMediaAdapter>PAL.media).videoTextureClass = TtVideoTexture;

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    //抖音ide不支持wasm，并且存在TTWebAssembly，所以需要做下兼容
    const TTWebAssembly = (window as any).TTWebAssembly;
    if ((!(window.navigator.platform === "devtools")) && TTWebAssembly) {
        (window as any).WebAssembly = {};
        WasmAdapter.Memory = TTWebAssembly.Memory;
    }

    WasmAdapter.instantiateWasm = (wasmFile: string, imports: any) => {
        if (!TTWebAssembly)
            throw new Error("==== 不支持wasm加载 ====");

        return TTWebAssembly.instantiate("libs/" + wasmFile, imports);
    };

    return cacheManager.start();
};