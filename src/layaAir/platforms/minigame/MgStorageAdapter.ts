import { PAL } from "../../laya/platform/PlatformAdapters";
import { StorageAdapter } from "../../laya/platform/StorageAdapter";

export class MgStorageAdapter extends StorageAdapter {
    protected checkSupport(): boolean {
        return PAL.hasAPI("getStorageInfoSync");
    }
}

PAL.register("storage", MgStorageAdapter);