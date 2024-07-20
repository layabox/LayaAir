import { ILaya } from "./../../ILaya";
/**
 * @private
 * @en The Cache Manager is a centralized management class for object caching.
 * @zh 对象缓存统一管理类。
 */
export class CacheManger {
    /**
     * @en The maximum allowable execution time for a single cleanup check, in milliseconds.
     * @zh 单次清理检测允许执行的时间，单位ms。
     */
    static loopTimeLimit: number = 2;
    /**
     * @private
     */
    private static _cacheList: any[] = [];
    /**
     * @private
     * 当前检测的索引
     */
    private static _index: number = 0;

    constructor() {

    }

    /**
     * @en Register a cache management function.
     * @param disposeFunction The function used to dispose of the cache, with the signature fun(force:Boolean).
     * @param getCacheListFunction The function used to retrieve the cache list, with the signature fun():Array.
     * @zh 注册cache管理函数。
     * @param disposeFunction 释放函数， fun(force:Boolean)。
     * @param getCacheListFunction 获取cache列表函数， fun():Array。
     */
    static regCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void {
        CacheManger.unRegCacheByFunction(disposeFunction, getCacheListFunction);
        var cache: any;
        cache = { tryDispose: disposeFunction, getCacheList: getCacheListFunction };
        CacheManger._cacheList.push(cache);
    }

    /**
     * @en Unregister a cache management function.
     * @param disposeFunction Release function fun(force:Boolean)
     * @param getCacheListFunction Get cache list function fun():Array
     * @zh 移除cache管理函数。
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     */
    static unRegCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void {
        var i: number, len: number;
        len = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            if (CacheManger._cacheList[i].tryDispose == disposeFunction && CacheManger._cacheList[i].getCacheList == getCacheListFunction) {
                CacheManger._cacheList.splice(i, 1);
                return;
            }
        }
    }

    /**
     * @en Force the disposal of all managed caches.
     * @zh 强制清理所有管理器。
     */
    //TODO:coverage
    static forceDispose(): void {
        var i: number, len: number = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            CacheManger._cacheList[i].tryDispose(true);
        }
    }

    /**
     * @en Start the check loop with a specified interval time.
     * @param waitTime The interval time between checks, in milliseconds.
     * @zh 开始检测循环。
     * @param waitTime 检测间隔时间，单位毫秒。
     */
    static beginCheck(waitTime: number = 15000): void {
        ILaya.systemTimer.loop(waitTime, null, CacheManger._checkLoop);
    }

    /**
     * @en Stop the check loop.
     * @zh 停止检测循环。
     */
    //TODO:coverage
    static stopCheck(): void {
        ILaya.systemTimer.clear(null, CacheManger._checkLoop);
    }

    /**
     * @private
     * 检测函数
     */
    private static _checkLoop(): void {
        var cacheList: any[] = CacheManger._cacheList;
        if (cacheList.length < 1) return;
        var tTime: number = ILaya.Browser.now();
        var count: number;
        var len: number;
        len = count = cacheList.length;
        while (count > 0) {
            CacheManger._index++;
            CacheManger._index = CacheManger._index % len;
            cacheList[CacheManger._index].tryDispose(false);
            if (ILaya.Browser.now() - tTime > CacheManger.loopTimeLimit) break;
            count--;
        }
    }
}


