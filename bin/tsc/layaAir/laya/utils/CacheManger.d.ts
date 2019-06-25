/**
     * @private
     * 对象缓存统一管理类
     */
export declare class CacheManger {
    /**
     * 单次清理检测允许执行的时间，单位ms。
     */
    static loopTimeLimit: number;
    /**
     * @private
     */
    private static _cacheList;
    /**
     * @private
     * 当前检测的索引
     */
    private static _index;
    constructor();
    /**
     * 注册cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
     */
    static regCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void;
    /**
     * 移除cache管理函数
     * @param disposeFunction 释放函数 fun(force:Boolean)
     * @param getCacheListFunction 获取cache列表函数fun():Array
     *
     */
    static unRegCacheByFunction(disposeFunction: Function, getCacheListFunction: Function): void;
    /**
     * 强制清理所有管理器
     *
     */
    static forceDispose(): void;
    /**
     * 开始检测循环
     * @param waitTime 检测间隔时间
     *
     */
    static beginCheck(waitTime?: number): void;
    /**
     * 停止检测循环
     *
     */
    static stopCheck(): void;
    /**
     * @private
     * 检测函数
     */
    private static _checkLoop;
}
