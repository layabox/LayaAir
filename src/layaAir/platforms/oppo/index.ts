import { Config } from "../../Config";
import { _WebSocket } from "../../laya/net/WebSocket";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";

MgBrowserAdapter.beforeInit = function () {
    Config.fixedFrames = false;
    Browser.onQGMiniGame = true;
    PAL.g = (window as any).qg;
};

MgBrowserAdapter.afterInit = function () {
    PAL.browser.webSocketClass = _WebSocket;
};