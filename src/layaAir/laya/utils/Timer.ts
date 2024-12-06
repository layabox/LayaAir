import { CallLater } from "./CallLater";
import { Utils } from "./Utils";

/**
 * @en The `Timer` class is responsible for time management. It is a singleton and should not be instantiated manually. Access it via `Laya.timer`
 * @zh Timer 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 Laya.timer 访问。
 */
export class Timer {
    /**@private */
    static gSysTimer: Timer = null;

    /**@private */
    private static _pool: any[] = [];
    /**@private */
    static _mid: number = 1;


    /**
     * @en Scale of the clock hand.
     * @zh 时针的缩放比例。
     */
    scale: number = 1;
    /**
     * @en The start time of the current frame.
     * @zh 当前帧的开始时间。
     */
    currTimer: number;
    /**
     * @en The current frame count.
     * @zh 当前的帧数。
     */
    currFrame: number = 0;
    /**
     * @internal
     * @en The time interval between two frames, in milliseconds.
     * @zh 两帧之间的时间间隔，单位毫秒。
     */
    _delta: number = 0;
    /**@internal */
    _lastTimer: number;
    /**@private */
    private _map: { [key: string]: TimerHandler } = {};
    /**@private */
    private _handlers: any[] = [];
    /**@private */
    private _temp: any[] = [];
    /**@private */
    private _count: number = 0;

    /**
     * @en Constructor method
     * @zh 构造方法
     */
    constructor(autoActive: boolean = true) {
        autoActive && Timer.gSysTimer && Timer.gSysTimer.frameLoop(1, this, this._update);
        this.currTimer = this._getNowData();
        this._lastTimer = this._getNowData();
    }

    /**
     * @en The time interval between two frames, in milliseconds.
     * @zh 两帧之间的时间间隔，单位毫秒。
     */
    get delta(): number {
        return this._delta;
    }

    get totalTime(): number {
        return this._lastTimer;
    }


    /**
     * @internal
     * @en The frame update handling function.
     * @zh 帧循环处理函数。
     */
    _update(): void {
        if (this.scale <= 0) {
            this._lastTimer = this._getNowData();
            this._delta = 0;
            return;
        }
        var frame: number = this.currFrame = this.currFrame + this.scale;
        var now: number = this._getNowData();
        var awake: boolean = (now - this._lastTimer) > 30000;
        this._delta = (now - this._lastTimer) * this.scale;
        var timer: number = this.currTimer = this.currTimer + this._delta;
        this._lastTimer = now;

        //处理handler
        var handlers: any[] = this._handlers;
        this._count = 0;
        for (var i: number = 0, n: number = handlers.length; i < n; i++) {
            var handler: TimerHandler = handlers[i];
            if (handler.method !== null) {
                var t: number = handler.userFrame ? frame : timer;
                if (t >= handler.exeTime) {
                    if (handler.repeat) {
                        if (!handler.jumpFrame || awake) {
                            handler.exeTime += handler.delay;
                            handler.run(false);
                            if (t > handler.exeTime) {
                                //如果执行一次后还能再执行，做跳出处理，如果想用多次执行，需要设置jumpFrame=true
                                handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
                            }
                        } else {
                            while (t >= handler.exeTime) {
                                handler.exeTime += handler.delay;
                                handler.run(false);
                            }
                        }
                    } else {
                        handler.run(true);
                    }
                }
            } else {
                this._count++;
            }
        }

        if (this._count > 30 || frame % 200 === 0) this._clearHandlers();
    }

    /** @private */
    private _clearHandlers(): void {
        var handlers: any[] = this._handlers;
        for (var i: number = 0, n: number = handlers.length; i < n; i++) {
            var handler: TimerHandler = handlers[i];
            if (handler.method !== null) this._temp.push(handler);
            else this._recoverHandler(handler);
        }
        this._handlers = this._temp;
        handlers.length = 0;
        this._temp = handlers;
    }

    /** @private */
    private _recoverHandler(handler: TimerHandler): void {
        if (this._map[handler.key] == handler) delete this._map[handler.key];
        handler.clear();
        Timer._pool.push(handler);
    }

    /**
     * @private
     * @en get now time data.
     * @returns reutrn time data.
     * @zh 立即获取时间数据
     * @returns 返回时间数据
     */
    public _getNowData(): number {
        return Date.now();
    }

    /** @internal */
    _create(useFrame: boolean, repeat: boolean, delay: number, caller: any, method: Function, args: any[], coverBefore: boolean): TimerHandler {
        //如果延迟为0，则立即执行
        if (!delay) {
            method.apply(caller, args);
            return null;
        }

        //先覆盖相同函数的计时
        if (coverBefore) {
            var handler: TimerHandler = this._getHandler(caller, method);
            if (handler) {
                handler.repeat = repeat;
                handler.userFrame = useFrame;
                handler.delay = delay;
                handler.caller = caller;
                handler.method = method;
                handler.args = args;
                handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + this._getNowData() - this._lastTimer);
                return handler;
            }
        }

        //找到一个空闲的timerHandler
        handler = Timer._pool.length > 0 ? Timer._pool.pop() : new TimerHandler();
        handler.repeat = repeat;
        handler.userFrame = useFrame;
        handler.delay = delay;
        handler.caller = caller;
        handler.method = method;
        handler.args = args;
        handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + this._getNowData() - this._lastTimer);

        //索引handler
        this._indexHandler(handler);

        //插入数组
        this._handlers.push(handler);

        return handler;
    }

    /** @private */
    private _indexHandler(handler: TimerHandler): void {
        var caller: any = handler.caller;
        var method: any = handler.method;
        var cid: number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = Timer._mid++);
        handler.key = cid + "_" + mid;
        this._map[handler.key] = handler;
    }

    /**
     * Executes once after a delay.
     * @param delay The delay time in milliseconds.
     * @param caller The scope of the object (this).
     * @param method The callback function to be executed by the timer.
     * @param args The arguments to pass to the callback function.
     * @param coverBefore Whether to overwrite previous delayed execution, default is true.
     * @zh 定时执行一次。
     * @param delay 延迟时间(单位为毫秒)。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     * @param args 回调参数。
     * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
     */
    once(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(false, false, delay, caller, method, args, coverBefore);
    }

    /**
     * Repeatedly executes at intervals.
     * @param delay The interval time in milliseconds.
     * @param caller The scope of the object (this).
     * @param method The callback function to be executed by the timer.
     * @param args The arguments to pass to the callback function.
     * @param coverBefore Whether to overwrite previous delayed execution, default is true.
     * @param jumpFrame Whether to jump frames. For time-based callbacks, if multiple callbacks can be executed within a given time interval, the engine defaults to executing once for performance reasons. Setting `jumpFrame` to true will allow multiple executions in quick succession.
     * @zh 定时重复执行。
     * @param delay 间隔时间(单位毫秒)。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     * @param args 回调参数。
     * @param coverBefore 是否覆盖之前的延迟执行，默认为 true 。
     * @param jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次。
     */
    loop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true, jumpFrame: boolean = false): void {
        var handler: TimerHandler = this._create(false, true, delay, caller, method, args, coverBefore);
        if (handler) handler.jumpFrame = jumpFrame;
    }

    /**
     * Executes once after a delay in frames.
     * @param delay The delay time in frames.
     * @param caller The scope of the object (this).
     * @param method The callback function to be executed by the timer.
     * @param args The arguments to pass to the callback function.
     * @param coverBefore Whether to overwrite previous delayed execution, default is true.
     * @zh 定时执行一次（基于帧率）。
     * @param delay 延迟几帧（单位为帧）。
     * @param caller 执行域（this）。
     * @param method 定时器回调函数。
     * @param args 回调参数。
     * @param coverBefore 是否覆盖之前的延迟执行，默认为 true。
     */
    frameOnce(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(true, false, delay, caller, method, args, coverBefore);
    }

    /**
     * Repeatedly executes at frame intervals.
     * @param delay The interval time in frames.
     * @param caller The scope of the object (this).
     * @param method The callback function to be executed by the timer.
     * @param args The arguments to pass to the callback function.
     * @param coverBefore Whether to overwrite previous delayed execution, default is true.
     * @zh 定时重复执行（基于帧率）。
     * @param delay 间隔几帧（单位为帧）。
     * @param caller 执行域（this）。
     * @param method 定时器回调函数。
     * @param args 回调参数。
     * @param coverBefore 是否覆盖之前的延迟执行，默认为 true。
     */
    frameLoop(delay: number, caller: any, method: Function, args: any[] = null, coverBefore: boolean = true): void {
        this._create(true, true, delay, caller, method, args, coverBefore);
    }

    /**
     * @en Return statistical information
     * @zh 返回统计信息
     */
    toString(): string {
        return " handlers:" + this._handlers.length + " pool:" + Timer._pool.length;
    }

    /**
     * @en Cleaning the timer.
     * @param caller The scope of the object (this).
     * @param method Timer callback function.
     * @zh 清理定时器。
     * @param caller 执行域（this）。
     * @param method 定时器回调函数。
     */
    clear(caller: any, method: Function): void {
        var handler: TimerHandler = this._getHandler(caller, method);
        if (handler) {
            handler.clear();
        }
    }

    /**
     * @en Clears all timers associated with the object.
     * @param caller The scope of the object (this).
     * @zh 清理对象身上的所有定时器。
     * @param caller  执行域(this)。
     */
    clearAll(caller: any): void {
        if (!caller) return;
        for (var i: number = 0, n: number = this._handlers.length; i < n; i++) {
            var handler: TimerHandler = this._handlers[i];
            if (handler.caller === caller) {
                handler.clear();
            }
        }
    }

    /** @private */
    private _getHandler(caller: any, method: any): TimerHandler {
        var cid: number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
        var mid: number = method.$_TID || (method.$_TID = Timer._mid++);
        var key: any = cid + "_" + mid;
        return this._map[key];
    }

    /**
     * @en Delays the execution.
     * @param caller The scope of the object (this).
     * @param method The timer callback function. 
     * @param args The callback arguments. Default is null.
     * @zh 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller: any, method: Function, args: any[] = null): void {
        CallLater.I.callLater(caller, method, args);
    }

    /**
     * @en Immediately executes the callLater.
     * @param caller The scope of the object (this).
     * @param method The callback function for the timer.
     * @zh 立即执行 callLater。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runCallLater(caller: any, method: Function): void {
        CallLater.I.runCallLater(caller, method);
    }

    /**
     * @en Cancels the execution of callLater.
     * @param caller The scope of the object (this).
     * @param method The callback function for the timer.
     * @zh 取消执行 callLater。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    clearCallLater(caller: any, method: Function): void {
        CallLater.I.clear(caller, method);
    }

    /**
     * @en Immediately advance the timer, execute it, and then remove it from the queue.
     * @param caller The scope of the object (this).
     * @param method Timer callback function.
     * @zh 立即提前执行定时器，执行后从队列中删除。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     */
    runTimer(caller: any, method: Function): void {
        var handler: TimerHandler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run(true);
        }
    }

    /**
     * @en Pause the clock.
     * @zh 暂停时钟。
     */
    pause(): void {
        this.scale = 0;
    }

    /**
     * @en Resume the clock.
     * @zh 恢复时钟。
     */
    resume(): void {
        this.scale = 1;
    }

    /**
     * @en Destroy the timer, and clear all events on the timer.
     * @zh 删除定时器，同时清理定时器上的所有事件。
     */
    destroy() {
        for (var i = 0, n = this._handlers.length; i < n; i++) {
            var handler = this._handlers[i];
            handler.clear();
        }
        this._handlers.length = 0;
        this._map = {};
        this._temp.length = 0;
    }
}



/** @private */
class TimerHandler {
    /**
     * @en The key of the timer handler.
     * @zh 定时器处理程序的键。
     */
    key: string;

    /**
     * @en Whether the timer should repeat.
     * @zh 定时器是否应该重复。
     */
    repeat: boolean;

    /**
     * @en The delay between executions in milliseconds.
     * @zh 执行之间的延迟，以毫秒为单位。
     */
    delay: number;

    /**
     * @en Whether to use frame-based timing.
     * @zh 是否使用基于帧的计时。
     */
    userFrame: boolean;

    /**
     * @en The execution time of the timer.
     * @zh 定时器的执行时间。
     */
    exeTime: number;

    /**
     * @en The caller object for the timer method.
     * @zh 定时器方法的调用者对象。
     */
    caller: any

    /**
     * @en The method to be executed by the timer.
     * @zh 定时器要执行的方法。
     */
    method: Function;

    /**
     * @en The arguments to be passed to the timer method.
     * @zh 要传递给定时器方法的参数。
     */
    args: any[];

    /**
     * @en Whether to jump frames.
     * @zh 是否跳帧。
     */
    jumpFrame: boolean;

    /**
     * @en Clear the timer handler by setting its properties to null.
     * @zh 通过将其属性设置为 null 来清除定时器处理程序。
     */
    clear(): void {
        this.caller = null;
        this.method = null;
        this.args = null;
    }

    /**
     * @en Run the timer handler method.
     * @param withClear Whether to clear the handler after execution.
     * @zh 运行定时器处理程序方法。
     * @param withClear 是否在执行后清除处理程序。
     */
    run(withClear: boolean): void {
        var caller: any = this.caller;
        if (caller && caller.destroyed) return this.clear();
        var method: Function = this.method;
        var args: any[] = this.args;
        withClear && this.clear();
        if (method == null) return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
