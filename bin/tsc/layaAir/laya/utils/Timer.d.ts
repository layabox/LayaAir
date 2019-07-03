/**
     * <code>Timer</code> 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 Laya.timer 访问。
     */
export declare class Timer {
    /**@private */
    static gSysTimer: Timer;
    /**@private */
    private static _pool;
    /**@private */
    static _mid: number;
    /** 时针缩放。*/
    scale: number;
    /** 当前帧开始的时间。*/
    currTimer: number;
    /** 当前的帧数。*/
    currFrame: number;
    /**@private */
    private _map;
    /**@private */
    private _handlers;
    /**@private */
    private _temp;
    /**@private */
    private _count;
    /**
     * 创建 <code>Timer</code> 类的一个实例。
     */
    constructor(autoActive?: boolean);
    /**两帧之间的时间间隔,单位毫秒。*/
    readonly delta: number;
    /** @private */
    private _clearHandlers;
    /** @private */
    private _recoverHandler;
    /** @private */
    private _indexHandler;
    /**
     * 定时执行一次。
     * @param	delay	延迟时间(单位为毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    once(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void;
    /**
     * 定时重复执行。
     * @param	delay	间隔时间(单位毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
     */
    loop(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean, jumpFrame?: boolean): void;
    /**
     * 定时执行一次(基于帧率)。
     * @param	delay	延迟几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameOnce(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void;
    /**
     * 定时重复执行(基于帧率)。
     * @param	delay	间隔几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameLoop(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void;
    /** 返回统计信息。*/
    toString(): string;
    /**
     * 清理定时器。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    clear(caller: any, method: Function): void;
    /**
     * 清理对象身上的所有定时器。
     * @param	caller 执行域(this)。
     */
    clearAll(caller: any): void;
    /** @private */
    private _getHandler;
    /**
     * 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller: any, method: Function, args?: any[]): void;
    /**
     * 立即执行 callLater 。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runCallLater(caller: any, method: Function): void;
    /**
     * 立即提前执行定时器，执行之后从队列中删除
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runTimer(caller: any, method: Function): void;
    /**
     * 暂停时钟
     */
    pause(): void;
    /**
     * 恢复时钟
     */
    resume(): void;
}
