import { Config } from "../../Config";
import { Laya } from "../../Laya";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { Loader } from "../../laya/net/Loader";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { Browser } from "../../laya/utils/Browser";
import { Utils } from "../../laya/utils/Utils";
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

    let cacheManager = new MgCacheManager(PAL.global.env.USER_DATA_PATH + "/layaCache");
    let downloader = Loader.downloader = new MgDownloader();
    downloader.cacheManager = cacheManager;

    Laya.addBeforeInitCallback(() => {
        // srgb问题
        (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();

        // 预乘问题
        if (!PAL.global.isIDE) {
            let gl = <WebGLRenderingContext>LayaGL.renderEngine._context;
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        }

    }, true);

    return cacheManager.start();
};