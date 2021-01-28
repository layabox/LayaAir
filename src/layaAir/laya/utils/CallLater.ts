import { ILaya } from "../../ILaya";
/**
	 * @private
	 */
export class CallLater {
    static I = new CallLater();
    /**@private */
    private _pool: LaterHandler[] = [];
    /**@private */
    private _map: {[key:string]:LaterHandler} = {};
    /**@private */
    private _laters: LaterHandler[] = [];

    /**
     * @internal
     * 帧循环处理函数。
     */
    _update(): void {
        let laters = this._laters;
        let len = laters.length;
        if (len > 0) {
            for (let i = 0, n = len - 1; i <= n; i++) {
                let handler = laters[i];
                this._map[handler.key] = null;
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
        var cid: number = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = (ILaya.Timer._mid++) );
        return this._map[cid+'.'+mid]
    }

    /**
     * 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller: any, method: Function, args: any[] = null): void {
        if (this._getHandler(caller, method) == null) {
            let handler:LaterHandler;
            if (this._pool.length)
                handler  = this._pool.pop();
            else 
                handler = new LaterHandler();
            //设置属性
            handler.caller = caller;
            handler.method = method;
            handler.args = args;
            //索引handler
            var cid: number = caller ? caller.$_GID : 0;
            var mid: number = (method as any)["$_TID"];
            handler.key = cid +'.'+ mid;
            this._map[handler.key] = handler
            //插入队列
            this._laters.push(handler);
        }
    }

    /**
     * 立即执行 callLater 。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runCallLater(caller: any, method: Function): void {
        var handler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run();
            handler.clear();
        }
    }
}



/** @private */
class LaterHandler {
    key: string;
    caller: any
    method: Function;
    args: any[];

    clear(): void {
        this.caller = null;
        this.method = null;
        this.args = null;
    }

    run(): void {
        var caller = this.caller;
        if (caller && caller.destroyed) return this.clear();
        var method = this.method;
        var args = this.args;
        if (method == null) return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
