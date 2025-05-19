import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Browser.onHWMiniGame = true;
    PAL.g = (window as any).hbs;
};