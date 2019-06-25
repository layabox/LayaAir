import { ILaya } from "./../../ILaya";
/**
     * @private
     * 对象缓存统一管理类
     */
export class CacheManger {
    constructor() {
    }
    /**
     * 注册cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
     */
    static regCacheByFunction(disposeFunction, getCacheListFunction) {
        CacheManger.unRegCacheByFunction(disposeFunction, getCacheListFunction);
        var cache;
        cache = { tryDispose: disposeFunction, getCacheList: getCacheListFunction };
        CacheManger._cacheList.push(cache);
    }
    /**
     * 移除cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
     */
    static unRegCacheByFunction(disposeFunction, getCacheListFunction) {
        var i, len;
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
    static forceDispose() {
        var i, len = CacheManger._cacheList.length;
        for (i = 0; i < len; i++) {
            CacheManger._cacheList[i].tryDispose(true);
        }
    }
    /**
     * 开始检测循环
     * @param waitTime 检测间隔时间
     *
     */
    static beginCheck(waitTime = 15000) {
        ILaya.systemTimer.loop(waitTime, null, CacheManger._checkLoop);
    }
    /**
     * 停止检测循环
     *
     */
    //TODO:coverage
    static stopCheck() {
        ILaya.systemTimer.clear(null, CacheManger._checkLoop);
    }
    /**
     * @private
     * 检测函数
     */
    static _checkLoop() {
        var cacheList = CacheManger._cacheList;
        if (cacheList.length < 1)
            return;
        var tTime = ILaya.Browser.now();
        var count;
        var len;
        len = count = cacheList.length;
        while (count > 0) {
            CacheManger._index++;
            CacheManger._index = CacheManger._index % len;
            cacheList[CacheManger._index].tryDispose(false);
            if (ILaya.Browser.now() - tTime > CacheManger.loopTimeLimit)
                break;
            count--;
        }
    }
}
//TODO:
/**
 * 单次清理检测允许执行的时间，单位ms。
 */
CacheManger.loopTimeLimit = 2;
/**
 * @private
 */
CacheManger._cacheList = [];
/**
 * @private
 * 当前检测的索引
 */
CacheManger._index = 0;
