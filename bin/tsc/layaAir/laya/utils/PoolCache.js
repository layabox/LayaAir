import { CacheManger } from "./CacheManger";
import { Utils } from "./Utils";
import { Pool } from "./Pool";
/**
     * @private
     * 基于个数的对象缓存管理器
     */
export class PoolCache {
    constructor() {
        /**
         * 允许缓存的最大数量
         */
        this.maxCount = 1000;
    }
    /**
     * 获取缓存的对象列表
     * @return
     *
     */
    getCacheList() {
        return Pool.getPoolBySign(this.sign);
    }
    /**
     * 尝试清理缓存
     * @param force 是否强制清理
     *
     */
    tryDispose(force) {
        var list;
        list = Pool.getPoolBySign(this.sign);
        if (list.length > this.maxCount) {
            list.splice(this.maxCount, list.length - this.maxCount);
        }
    }
    /**
     * 添加对象缓存管理
     * @param sign 对象在Pool中的标识
     * @param maxCount 允许缓存的最大数量
     *
     */
    static addPoolCacheManager(sign, maxCount = 100) {
        var cache;
        cache = new PoolCache();
        cache.sign = sign;
        cache.maxCount = maxCount;
        CacheManger.regCacheByFunction(Utils.bind(cache.tryDispose, cache), Utils.bind(cache.getCacheList, cache));
    }
}
