import { LayaGL } from "../../laya/layagl/LayaGL";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { WebGLEngine } from "../../laya/RenderDriver/WebGLDriver/RenderDevice/WebGLEngine";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Browser.onAlipayMiniGame = true;
    PAL.g = (window as any).my;
};

MgBrowserAdapter.afterInit = function () {
    // srgb问题
    (LayaGL.renderEngine as WebGLEngine)._supportCapatable.turnOffSRGB();
};