import { StorageAdapter } from "../../laya/platform/StorageAdapter";
import { PAL } from "../../laya/platform/PlatformAdapters";

export class MgStorageAdapter extends StorageAdapter {

    protected checkSupport(): boolean {
        return true;
    }

    getItem(key: string): string {
        return PAL.g.getStorageSync(key);
    }

    setItem(key: string, value: string): void {
        PAL.g.setStorageSync(key, value);
    }

    removeItem(key: string): void {
        PAL.g.removeStorageSync(key);
    }

    clear(): void {
        PAL.g.clearStorageSync();
    }

    getCount(): number {
        return PAL.g.getStorageInfoSync().keys.length;
    }
}

PAL.register("storage", MgStorageAdapter);