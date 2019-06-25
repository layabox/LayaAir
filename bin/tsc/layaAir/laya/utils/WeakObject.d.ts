/**
     * 封装弱引用WeakMap
     * 如果支持WeakMap，则使用WeakMap，如果不支持，则用Object代替
     * 注意：如果采用Object，为了防止内存泄漏，则采用定时清理缓存策略
     */
export declare class WeakObject {
    /**是否支持WeakMap*/
    static supportWeakMap: boolean;
    /**如果不支持WeakMap，则多少时间清理一次缓存，默认10分钟清理一次*/
    static delInterval: number;
    /**全局WeakObject单例*/
    static I: WeakObject;
    /**@private */
    private static _keys;
    /**@private */
    private static _maps;
    /**@private */
    _obj: any;
    /**@private */
    static __init__(): void;
    /**清理缓存，回收内存*/
    static clearCache(): void;
    constructor();
    /**
     * 设置缓存
     * @param	key kye对象，可被回收
     * @param	value object对象，可被回收
     */
    set(key: any, value: any): void;
    /**
     * 获取缓存
     * @param	key kye对象，可被回收
     */
    get(key: any): any;
    /**
     * 删除缓存
     */
    del(key: any): void;
    /**
     * 是否有缓存
     */
    has(key: any): boolean;
}
