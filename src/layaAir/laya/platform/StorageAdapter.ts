import { Browser } from "../utils/Browser";
import { PAL } from "./PlatformAdapters";

/**
 * @ignore
 */
export class StorageAdapter {
    protected _storage: Storage;
    protected _supported: boolean;

    constructor() {
        this._storage = Browser.window.localStorage;
        this._supported = this.checkSupport();
    }

    protected checkSupport(): boolean {
        return this._storage != null && typeof (this._storage.getItem) === 'function' &&
            typeof (this._storage.setItem) === 'function';
    }

    getItem(key: string): string | null {
        if (this._supported)
            return this._storage.getItem(key);
        else
            return null;
    }

    setItem(key: string, value: string): void {
        this._supported && this._storage.setItem(key, value);
    }

    removeItem(key: string): void {
        this._supported && this._storage.removeItem(key);
    }

    clear(): void {
        this._supported && this._storage.clear();
    }

    getCount(): number {
        if (this._supported)
            return this._storage.length || 0;
        else
            return 0;
    }
}

PAL.register("storage", StorageAdapter);