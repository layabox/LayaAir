import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { Browser } from "../../laya/utils/Browser";

var conch: WechatMinigame.Wx;

export class NativeBrowserAdapter extends BrowserAdapter {
    init() {
        super.init();

        conch = PAL.global;
        Browser.isDomSupported = false;
    }

    createMainCanvas() {
        let canvas = this.createElement("canvas");
        document.body.appendChild(canvas);

        return canvas;
    }

    get supportArrayBufferURL(): boolean {
        return true;
    }

    createBufferURL(data: ArrayBuffer): string {
        return (window as any).wx.createBufferURL(data);
    }

    revokeBufferURL(url: string): void {
        return (window as any).wx.revokeBufferURL(url);
    }
}