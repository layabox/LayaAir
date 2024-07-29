import { CacheManger } from "./CacheManger";
import { Pool } from "./Pool";

/**
 * @private
 * @en A manager for object caching based on a count limit.
 * @zh 基于个数的对象缓存管理器
 */
export class PoolCache {

    //TODO:
    /**
     * @en The identifier for objects within the Pool.
     * @zh 对象在Pool中的标识。
     */
    sign: string;
    /**
     * @en The maximum number of objects allowed in the cache.
     * @zh 允许缓存的最大数量。
     */
    maxCount: number = 1000;

    /**
     * @en Get the list of cached objects.
     * @zh 获取缓存的对象列表。
     */
    getCacheList(): any[] {
        return Pool.getPoolBySign(this.sign);
    }

    /**
     * @en Attempt to clear the cache.
     * @param force If true, force the cache to be cleared.
     * @zh 尝试清理缓存。
     * @param force 如果为 true，则强制清理缓存。
     */
    tryDispose(force: boolean): void {
        var list: any[];
        list = Pool.getPoolBySign(this.sign);
        if (list.length > this.maxCount) {
            list.splice(this.maxCount, list.length - this.maxCount);
        }
    }

    /**
     * @en Add a manager for object caching to the pool.
     * @param sign The identifier for objects within the Pool.
     * @param maxCount The maximum number of objects allowed in the cache. Defaults to 100 if not provided.
     * @zh 向池中添加对象缓存管理器。
     * @param sign 对象在Pool中的标识
     * @param maxCount 允许缓存的最大数量，默认为100
     */
    static addPoolCacheManager(sign: string, maxCount: number = 100): void {
        var cache: PoolCache;
        cache = new PoolCache();
        cache.sign = sign;
        cache.maxCount = maxCount;
        CacheManger.regCacheByFunction(cache.tryDispose.bind(cache), cache.getCacheList.bind(cache));
    }
}

