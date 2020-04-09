import { ILaya } from "./../../ILaya";
/**
	 * @private
	 * 对象缓存统一管理类
	 */
export class CacheManger {
    //TODO:
    /**
     * 单次清理检测允许执行的时间，单位ms。
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
     * 注册cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
     */
    static regCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void {
        CacheManger.unRegCacheByFunction(disposeFunction, getCacheListFunction);
        var cache: any;
        cache = { tryDispose: disposeFunction, getCacheList: getCacheListFunction };
        CacheManger._cacheList.push(cache);
    }

    /**
     * 移除cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
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
     * 强制清理所有管理器
     *
     */
    //TODO:coverage
    static forceDispose(): void {
        var i: number, len: number = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            CacheManger._cacheList[i].tryDispose(true);
        }
    }

    /**
     * 开始检测循环
     * @param waitTime 检测间隔时间
     *
     */
    static beginCheck(waitTime: number = 15000): void {
        ILaya.systemTimer.loop(waitTime, null, CacheManger._checkLoop);
    }

    /**
     * 停止检测循环
     *
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


