import { BrowserAdapter } from "../../laya/platform/BrowserAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";

var conch: WechatMinigame.Wx;

export class NativeBrowserAdapter extends BrowserAdapter {
    constructor() {
        super();

        conch = PAL.global;
    }

    getCanvasContainer(): HTMLElement {
        return document.body;
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