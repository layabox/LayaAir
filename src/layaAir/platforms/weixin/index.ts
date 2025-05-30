import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";
import { WxVideoTexture } from "./WxVideoTexture";

declare module "../../laya/platform/PlatformAdapters" {
    interface IPlatformGlobalType extends WechatMinigame.Wx { }
}

MgBrowserAdapter.beforeInit = function () {
    Browser.onWXMiniGame = true;
    Browser.onMiniGame = true;
    Browser.isIOSHighPerformanceMode = GameGlobal.isIOSHighPerformanceMode;
    Browser.isIOSHighPerformanceModePlus = GameGlobal.isIOSHighPerformanceModePlus;
    PAL.g = (window as any).wx;
};

MgBrowserAdapter.afterInit = function () {
    if (!Browser.onDevTools)
        PAL.media.videoTextureClass = WxVideoTexture;
};