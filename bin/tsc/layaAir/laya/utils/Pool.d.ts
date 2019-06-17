/**
     * <p> <code>Pool</code> 是对象池类，用于对象的存储、重复使用。</p>
     * <p>合理使用对象池，可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。</p>
     */
export declare class Pool {
    /**@private */
    private static _CLSID;
    /**@private */
    private static POOLSIGN;
    /**@private  对象存放池。*/
    private static _poolDic;
    /**
     * 根据对象类型标识字符，获取对象池。
     * @param sign 对象类型标识字符。
     * @return 对象池。
     */
    static getPoolBySign(sign: string): any[];
    /**
     * 清除对象池的对象。
     * @param sign 对象类型标识字符。
     */
    static clearBySign(sign: string): void;
    /**
     * 将对象放到对应类型标识的对象池中。
     * @param sign 对象类型标识字符。
     * @param item 对象。
     */
    static recover(sign: string, item: any): void;
    /**
     * 根据类名进行回收，如果类有类名才进行回收，没有则不回收
     * @param	instance 类的具体实例
     */
    static recoverByClass(instance: any): void;
    /**
     * 返回类的唯一标识
     */
    private static _getClassSign;
    /**
     * 根据类名回收类的实例
     * @param	instance 类的具体实例
     */
    static createByClass(cls: new () => any): any;
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param cls 用于创建该类型对象的类。
     * @return 此类型标识的一个对象。
     */
    static getItemByClass(sign: string, cls: new () => any): any;
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param createFun 用于创建该类型对象的方法。
     * @param caller this对象
     * @return 此类型标识的一个对象。
     */
    static getItemByCreateFun(sign: string, createFun: Function, caller?: any): any;
    /**
     * 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     * @param sign 对象类型标识字符。
     * @return 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     */
    static getItem(sign: string): any;
}
