import { Config } from "../../Config";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Config.fixedFrames = false;
    Browser.onQGMiniGame = true;
    PAL.g = (window as any).qg;
};