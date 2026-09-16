import { _WebSocket } from "../../laya/net/WebSocket";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";
import { MgBrowserAdapter } from "../minigame/MgBrowserAdapter";
import { MgFileSystemAdapter } from "../minigame/MgFileSystemAdapter";

class HwFileSystemAdapter extends MgFileSystemAdapter {
    writeFile(path: string, data: ArrayBuffer | string, encoding?: string): Promise<void> {
        // Huawei silently stalls when ArrayBuffer data is written without an explicit binary encoding.
        if (encoding == null && Object.prototype.toString.call(data) === "[object ArrayBuffer]")
            encoding = "binary";
        return super.writeFile(path, data, encoding);
    }
}

PAL.register("fs", HwFileSystemAdapter);

MgBrowserAdapter.beforeInit = function () {
    Browser.onHWMiniGame = true;
    PAL.g = (window as any).hbs;
};

MgBrowserAdapter.afterInit = function () {
    //TODO，补充华为快游戏的WebSocket内容,原生支持WebSocket的方案，无qg/hbs.connectSocket的内容
    PAL.browser.webSocketClass = _WebSocket;
};
