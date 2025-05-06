import { LocalStorageAdapter } from "../../laya/platform/LocalStorageAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";
import { ClassUtils } from "../../laya/utils/ClassUtils";

var mg: WechatMinigame.Wx;

export class MgLocalStorageAdapter extends LocalStorageAdapter {

    constructor() {
        super();
        
        mg = PAL.global;
    }

    protected checkSupport(): boolean {
        return true;
    }

    getItem(key: string): string {
        return mg.getStorageSync(key);
    }

    setItem(key: string, value: string): void {
        mg.setStorageSync(key, value);
    }

    removeItem(key: string): void {
        mg.removeStorageSync(key);
    }

    clear(): void {
        mg.clearStorageSync();
    }

    getCount(): number {
        return mg.getStorageInfoSync().currentSize;
    }
}

ClassUtils.regClass("PAL.LocalStorage", MgLocalStorageAdapter);