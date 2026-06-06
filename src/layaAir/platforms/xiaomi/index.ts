import { Config } from "../../Config";
import { _WebSocket } from "../../laya/net/WebSocket";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Config.useWebGL2 = false;
    Browser.onKGMiniGame = true;
    PAL.g = (window as any).qg;
};

MgBrowserAdapter.afterInit = function () {
    PAL.browser.webSocketClass = _WebSocket;
};