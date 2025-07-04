import { Config } from "../../Config";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Config.useWebGL2 = false;
    Browser.onKGMiniGame = true;
    PAL.g = (window as any).qg;
};