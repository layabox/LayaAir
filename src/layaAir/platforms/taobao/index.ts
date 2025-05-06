import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLExtension } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine/GLEnum/WebGLExtension";
import { RenderCapable } from "../../laya/RenderEngine/RenderEnum/RenderCapable";
import { Browser } from "../../laya/utils/Browser";
import { TextRenderConfig } from "../../laya/webgl/text/TextRenderConfig";
import { MgCacheManager } from "../minigame/MgCacheManager";
import { MgDownloader } from "../minigame/MgDownloader";

PAL.preIntialize = function () {
    Browser.onTBMiniGame = true;
    PAL.global = (window as any).my;
};

PAL.postInitialize = function () {
    Config.useRetinalCanvas = true;
    // 淘宝的webgl2支持不完善，淘宝推荐使用webgl1.0
    Config.useWebGL2 = false;
    TextRenderConfig.supportImageData = Browser.systemVersion === "ios 10.1.1";

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    Laya.addInitCallback(() => {
        // srgb问题
        //@ts-ignore
        LayaGL.renderEngine._supportCapatable._extensionMap.set(WebGLExtension.EXT_sRGB, null);
        //@ts-ignore
        LayaGL.renderEngine._supportCapatable._capabilityMap.set(RenderCapable.Texture_SRGB, false);
    });

    return cacheManager.start();
};