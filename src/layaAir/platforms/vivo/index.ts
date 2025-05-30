import { Config } from "../../Config";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Config.fixedFrames = false;
    Browser.onVVMiniGame = true;
    PAL.g = (window as any).qg;

    PAL.g.downloadFile = PAL.g.download; //Vivo的下载方法是download而不是downloadFile，这里为了兼容定义一个
};