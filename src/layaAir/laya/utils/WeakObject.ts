import { Utils } from "./Utils";
import { ILaya } from "../../ILaya";

/**
 * @internal
 * 弱引用对象
 * 注意：如果采用Object，为了防止内存泄漏，则采用定时清理缓存策略
 */
export class WeakObject {
    /**多少时间清理一次缓存，默认10分钟清理一次*/
    static delInterval = 10 * 60 * 1000;

    private static _maps: WeakObject[];
    private static _i: WeakObject;

    /** 
     * @en Global WeakObject singleton.
     * @zh 全局WeakObject单例 
     */
    static get I(): WeakObject {
        return this._i || (this._i = new WeakObject());
    }

    /**
     * @en Clear cache and recycle memory. 
     * @zh 清理缓存，回收内存 
     */
    static clearCache(): void {
        for (let i = 0, n = WeakObject._maps.length; i < n; i++) {
            let obj = WeakObject._maps[i];
            obj._obj = {};
        }
    }

    private _obj: any;

    constructor() {
        this._obj = {};
        if (!WeakObject._maps) {
            WeakObject._maps = [this];
            ILaya.systemTimer.loop(WeakObject.delInterval, null, WeakObject.clearCache);
        }
        else
            WeakObject._maps.push(this);
    }

    /**
     * 设置缓存
     * @param key kye对象，可被回收
     * @param value object对象，可被回收
     */
    set(key: any, value: any): void {
        if (key == null) return;
        if (typeof (key) == 'string' || typeof (key) == 'number') {
            this._obj[key] = value;
        } else {
            this._obj[Utils.getGID(key)] = value;
        }
    }

    /**
     * 获取缓存
     * @param key kye对象，可被回收
     */
    get(key: any): any {
        if (key == null) return null;
        if (typeof (key) == 'string' || typeof (key) == 'number')
            return this._obj[key];
        else
            return this._obj[Utils.getGID(key)];
    }

    /**
     * 删除缓存
     */
    del(key: any): void {
        if (key == null) return;
        if (typeof (key) == 'string' || typeof (key) == 'number')
            delete this._obj[key];
        else
            delete this._obj[Utils.getGID(key)];
    }

    /**
     * 是否有缓存
     */
    has(key: any): boolean {
        if (key == null) return false;
        if (typeof (key) == 'string' || typeof (key) == 'number')
            return this._obj[key] != null;
        else
            return this._obj[Utils.getGID(key)] != null;
    }
}