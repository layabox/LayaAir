/**
     * @private
     * 基于个数的对象缓存管理器
     */
export declare class PoolCache {
    /**
     * 对象在Pool中的标识
     */
    sign: string;
    /**
     * 允许缓存的最大数量
     */
    maxCount: number;
    /**
     * 获取缓存的对象列表
     * @return
     *
     */
    getCacheList(): any[];
    /**
     * 尝试清理缓存
     * @param force 是否强制清理
     *
     */
    tryDispose(force: boolean): void;
    /**
     * 添加对象缓存管理
     * @param sign 对象在Pool中的标识
     * @param maxCount 允许缓存的最大数量
     *
     */
    static addPoolCacheManager(sign: string, maxCount?: number): void;
}
