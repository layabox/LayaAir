import { Config } from "../../Config";
import { LayaGL } from "../../laya/layagl/LayaGL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    // 淘宝的webgl2支持不完善，淘宝推荐使用webgl1.0
    Config.useWebGL2 = false;
    Browser.onTBMiniGame = true;
    PAL.g = (window as any).my;
};

MgBrowserAdapter.afterInit = function () {
    // srgb问题
    (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();

    // 预乘问题
    if (!PAL.g.isIDE) {
        let gl = <WebGLRenderingContext>LayaGL.renderEngine._context;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    }
};