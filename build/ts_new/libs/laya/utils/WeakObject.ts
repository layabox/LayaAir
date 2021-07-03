import { Utils } from "./Utils";
import { ILaya } from "../../ILaya";

/**
	 * 封装弱引用WeakMap
	 * 如果支持WeakMap，则使用WeakMap，如果不支持，则用Object代替
	 * 注意：如果采用Object，为了防止内存泄漏，则采用定时清理缓存策略
	 * 
	 * 这里的设计是错误的，为了兼容，先不删掉这个类，直接采用Object
	 */
export class WeakObject {
    /**是否支持WeakMap*/
    static supportWeakMap = false;
    /**如果不支持WeakMap，则多少时间清理一次缓存，默认10分钟清理一次*/
    static delInterval = 10 * 60 * 1000;
    /**全局WeakObject单例*/
    static I: WeakObject;
    /**@private */
    private static _maps: any[] = [];
    /**@internal */
    _obj: any;

    /**@internal */
    static __init__(): void {
        WeakObject.I = new WeakObject();
        //WeakObject.supportWeakMap = Browser.window.WeakMap != null;
        //如果不支持，10分钟回收一次
        if (!WeakObject.supportWeakMap) ILaya.systemTimer.loop(WeakObject.delInterval, null, WeakObject.clearCache);
    }

    /**清理缓存，回收内存*/
    static clearCache(): void {
        for (var i = 0, n = WeakObject._maps.length; i < n; i++) {
            var obj = WeakObject._maps[i];
            obj._obj = {};
        }
    }

    constructor() {
        this._obj = {};
        WeakObject._maps.push(this);
    }

	/**
	 * 设置缓存
	 * @param	key kye对象，可被回收
	 * @param	value object对象，可被回收
	 */
    set(key: any, value: any): void {
        if (key == null) return;
        if (WeakObject.supportWeakMap) {
        } else {
            if (typeof (key) == 'string' || typeof (key) == 'number') {
                this._obj[key as any] = value;
            } else {
                key.$_GID || (key.$_GID = Utils.getGID());
                this._obj[key.$_GID] = value;
            }
        }
    }

	/**
	 * 获取缓存
	 * @param	key kye对象，可被回收
	 */
    get(key: any): any {
        if (key == null) return null;
        if (WeakObject.supportWeakMap) {
        } else {
            if (typeof (key) == 'string' || typeof (key) == 'number') return this._obj[key as any];
            return this._obj[key.$_GID];
        }
    }

	/**
	 * 删除缓存
	 */
    del(key: any): void {
        if (key == null) return;
        if (WeakObject.supportWeakMap) {
        } else {
            if (typeof (key) == 'string' || typeof (key) == 'number') delete this._obj[key as any];
            else delete this._obj[this._obj.$_GID];
        }
    }

	/**
	 * 是否有缓存
	 */
    has(key: any): boolean {
        if (key == null) return false;
        if (WeakObject.supportWeakMap) {
            return false;
        } else {
            if (typeof (key) == 'string' || typeof (key) == 'number') return this._obj[key as any] != null;
            return this._obj[this._obj.$_GID] != null;
        }
    }
}

//WeakObject.__init__();