/**
     * @private
     */
export declare class CallLater {
    static I: CallLater;
    /**@private */
    private _pool;
    /**@private */
    private _map;
    /**@private */
    private _laters;
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
}
