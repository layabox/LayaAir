import { Config } from "../../Config";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    // 淘宝的webgl2支持不完善，淘宝推荐使用webgl1.0
    Config.useWebGL2 = false;
    Browser.onTBMiniGame = true;
    PAL.g = (window as any).my;
};