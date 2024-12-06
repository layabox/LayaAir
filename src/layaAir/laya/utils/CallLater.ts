import { Timer } from "./Timer";
import { Utils } from "./Utils";

/**
 * @private
 * @en The CallLater class is responsible for managing delayed function calls.
 * @zh CallLater 类用于管理延迟执行的函数调用。
 */
export class CallLater {
    /**
     * @en Instance of CallLater.
     * @zh CallLater的实例。
     */
    static I = new CallLater();
    /**@private */
    private _pool: LaterHandler[] = [];
    /**@private */
    private _map: { [key: string]: LaterHandler } = {};
    /**@private */
    private _laters: LaterHandler[] = [];

    /**
     * @internal
     * @en Frame loop processing function.
     * @zh 帧循环处理。
     */
    _update(): void {
        let laters = this._laters;
        let len = laters.length;
        if (len > 0) {
            for (let i = 0, n = len - 1; i <= n; i++) {
                let handler = laters[i];
                delete this._map[handler.key];
                if (handler.method !== null) {
                    handler.run();
                    handler.clear();
                }
                this._pool.push(handler);
                i === n && (n = laters.length - 1);
            }
            laters.length = 0;
        }
    }

    /** @private */
    private _getHandler(caller: any, method: any): LaterHandler {
        var cid: number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = (Timer._mid++));
        return this._map[cid + '.' + mid]
    }

    /**
     * @en Delay execution
     * @param caller The execution context (this).
     * @param method Timer callback function.
     * @param args The arguments to be passed to the callback function.
     * @zh 延迟执行。
     * @param caller 执行域（this）。
     * @param method 定时器回调函数。
     * @param args 要传递给回调函数的参数。
     */
    callLater(caller: any, method: Function, args: any[] = null): void {
        if (this._getHandler(caller, method) == null) {
            let handler: LaterHandler;
            if (this._pool.length)
                handler = this._pool.pop();
            else
                handler = new LaterHandler();
            //设置属性
            handler.caller = caller;
            handler.method = method;
            handler.args = args;
            //索引handler
            var cid: number = caller ? caller.$_GID : 0;
            var mid: number = (method as any)["$_TID"];
            handler.key = cid + '.' + mid;
            this._map[handler.key] = handler
            //插入队列
            this._laters.push(handler);
        }
    }

    /**
     * @en Immediately execute a scheduled callLater.
     * @param caller The execution context (this).
     * @param method The callback function to be executed.
     * @zh 立即执行 callLater。
     * @param caller 执行域（this）。
     * @param method 要执行的回调函数。
     */
    runCallLater(caller: any, method: Function): void {
        var handler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            delete this._map[handler.key];
            handler.run();
            handler.clear();
        }
    }

    /**
     * @en Clear the specified callLater.
     * @param caller The execution context (this).
     * @param method The callback function to be cleared.
     * @zh 清除指定的 callLater。
     * @param caller 执行域（this）。
     * @param method 要清除的回调函数。
     */
    clear(caller: any, method: Function) {
        var handler = this._getHandler(caller, method);
        if (handler) {
            delete this._map[handler.key];
            handler.key = "";
            handler.clear();
            return true;
        }
        return false;
    }

    /**
     * @en Clear all scheduled callLater for a specific caller.
     * @param caller The caller object to clear all scheduled calls for.
     * @zh 清除指定执行域中的所有callLater。
     * @param caller 执行域（this）。
     */
    clearAll(caller: any) {
        if (!caller) return;
        for (var i = 0, n = this._laters.length; i < n; i++) {
            var handler = this._laters[i];
            if (handler.caller === caller) {
                delete this._map[handler.key];
                handler.key = "";
                handler.clear();
            }
        }
    }
}



/** @private */
class LaterHandler {
    key: string;
    caller: any
    method: Function;
    args: any[];

    /**
     * @en Clears the handler, setting the caller, method, and args to null.
     * @zh 清除，将执行域、回调函数、参数均设置为 null。
     */
    clear(): void {
        this.caller = null;
        this.method = null;
        this.args = null;
    }

    /**
     * @en Executes
     * @zh 立即执行
     */
    run(): void {
        var caller = this.caller;
        if (caller && caller.destroyed) return this.clear();
        var method = this.method;
        var args = this.args;
        if (method == null) return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
