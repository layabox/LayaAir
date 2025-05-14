import { StorageAdapter } from "../../laya/platform/StorageAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";

var mg: WechatMinigame.Wx;

export class MgStorageAdapter extends StorageAdapter {

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
        return mg.getStorageInfoSync().keys.length;
    }
}

PAL.register("storage", MgStorageAdapter);