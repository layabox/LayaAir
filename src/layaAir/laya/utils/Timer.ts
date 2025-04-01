import { Utils } from "./Utils";

/**
 * @en The `Timer` class is responsible for time management. It is a singleton and should not be instantiated manually. Access it via `Laya.timer`
 * @zh Timer 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 Laya.timer 访问。
 */
export class Timer {
    /**@internal */
    static gSysTimer: Timer = null;
    /**@internal */
    static readonly callLaters: Timer = new Timer(false, true);
    /**@internal */
    static readonly _pool: TimerHandler[] = [];

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
     * @en The time interval between two frames, in milliseconds.
     * @zh 两帧之间的时间间隔，单位毫秒。
     */
    delta: number = 0;
    /**
     * @en The unscaled time interval between two frames, in milliseconds.
     * @zh 两帧之间的时间间隔（不受 scale 影响），单位毫秒。
     */
    unscaledDelta: number = 0;

    private _lastTimer: number;
    private _map: Record<string, TimerHandler> = {};
    private _handlers: TimerHandler[] = [];
    private _greedy: boolean;

    /**
     * @en Constructor method
     * @param autoActive Whether to automatically activate the timer. If not, you need to call `_update` manually. Default is true.
     * @param greedyMode Whether to use the greedy mode. In the greedy mode, the timer will try to execute the new added handler within `_update`. Default is false.
     * @zh 构造方法
     * @param autoActive 是否自动激活时钟，否则需要手动调用 `_update`。默认为 true。
     * @param greedyMode 是否使用贪婪模式，在贪婪模式下时钟会尝试在 `_update` 内执行新添加的 handler。默认为 false。
     */
    constructor(autoActive?: boolean, greedyMode?: boolean) {
        (autoActive || autoActive == null) && Timer.gSysTimer && Timer.gSysTimer.frameLoop(1, this, this._update);
        this.currTimer = Date.now();
        this._lastTimer = Date.now();
        this._greedy = !!greedyMode;
    }

    /**
     * @en The time since last frame (unit: milliseconds).
     * @zh 获取最后一帧的时间（单位：毫秒）。
     */
    get totalTime(): number {
        return this._lastTimer;
    }

    /**
     * @en The frame update handling function.
     * @zh 帧循环处理函数。
     */
    _update(): void {
        if (this.scale <= 0) {
            this._lastTimer = Date.now();
            this.delta = 0;
            return;
        }

        let frame: number = this.currFrame = this.currFrame + this.scale;
        let now: number = Date.now();
        this.unscaledDelta = now - this._lastTimer;
        let awake: boolean = this.unscaledDelta > 30000;
        this.delta = this.unscaledDelta * this.scale;
        let timer: number = this.currTimer = this.currTimer + this.delta;
        this._lastTimer = now;

        let handlers = this._handlers;
        let killed = 0;
        for (let i: number = 0, n: number = handlers.length - 1; i <= n; i++) {
            let handler = handlers[i];
            if (handler.method) {
                let t: number = handler.userFrame ? frame : timer;
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
            }
            else
                killed++;

            i === n && this._greedy && (n = handlers.length - 1);
        }

        if (killed > 30 || frame % 200 === 0)
            this._clearHandlers();
    }

    private _clearHandlers(): void {
        let handlers = this._handlers;
        let j = 0;
        for (let i: number = 0, n: number = handlers.length; i < n; i++) {
            let handler: TimerHandler = handlers[i];
            if (handler.method !== null) {
                if (j !== i)
                    handlers[j++] = handler;
                else
                    j++;
            }
            else {
                if (this._map[handler.key] == handler)
                    delete this._map[handler.key];
                handler.clear();
                Timer._pool.push(handler);
            }
        }
        handlers.length = j;
    }

    /** @internal */
    _create(useFrame: boolean, repeat: boolean, delay: number, caller: any, method: Function, args: any[], coverBefore: boolean): TimerHandler {
        let key = Utils.getGID(caller, method);

        //先覆盖相同函数的计时
        if (coverBefore == null || coverBefore) {
            let handler: TimerHandler = this._map[key];
            if (handler) {
                handler.repeat = repeat;
                handler.userFrame = useFrame;
                handler.delay = delay;
                handler.caller = caller;
                handler.method = method;
                handler.args = args;
                handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + Date.now() - this._lastTimer);
                return handler;
            }
        }

        //找到一个空闲的timerHandler
        let handler = Timer._pool.length > 0 ? Timer._pool.pop() : new TimerHandler();
        handler.key = key;
        handler.repeat = repeat;
        handler.userFrame = useFrame;
        handler.delay = delay;
        handler.caller = caller;
        handler.method = method;
        handler.args = args;
        handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + Date.now() - this._lastTimer);

        //索引handler
        this._map[key] = handler;

        //插入数组
        this._handlers.push(handler);

        return handler;
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
    once(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void {
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
    loop(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean, jumpFrame?: boolean): void {
        let handler: TimerHandler = this._create(false, true, delay, caller, method, args, coverBefore);
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
    frameOnce(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void {
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
    frameLoop(delay: number, caller: any, method: Function, args?: any[], coverBefore?: boolean): void {
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
        let handler: TimerHandler = this._map[Utils.getGID(caller, method)];
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
        if (!caller)
            return;

        for (let i: number = 0, n: number = this._handlers.length; i < n; i++) {
            let handler: TimerHandler = this._handlers[i];
            if (handler.caller === caller) {
                handler.clear();
            }
        }
    }

    /**
     * @en Delays the execution.
     * @param caller The scope of the object (this).
     * @param method The timer callback function. 
     * @param args The callback arguments.
     * @zh 延迟执行。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     * @param args 回调参数。
     */
    callLater(caller: any, method: Function, args?: any[]): void {
        Timer.callLaters._create(false, false, 0, caller, method, args, true).exeTime = 0;
    }

    /**
     * @en Immediately executes the callLater.
     * @param caller The scope of the object (this).
     * @param method The callback function for the timer.
     * @param forceRun Whether to force execution, regardless of whether there is a registered CallLater.
     * @zh 立即执行 callLater。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     * @param forceRun 是否强制执行，不管是否有注册CallLater.
     */
    runCallLater(caller: any, method: Function, forceRun?: boolean): void {
        if (!Timer.callLaters.runTimer(caller, method) && forceRun)
            method.apply(caller);
    }

    /**
     * @en Cancels the execution of callLater.
     * @param caller The scope of the object (this).
     * @param method The callback function for the timer.
     * @zh 取消执行 callLater。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     */
    clearCallLater(caller: any, method: Function): void {
        Timer.callLaters.clear(caller, method);
    }

    /**
     * @en Immediately advance the timer, execute it, and then remove it from the queue.
     * @param caller The scope of the object (this).
     * @param method Timer callback function.
     * @return Whether the call was successful.
     * @zh 立即提前执行定时器，执行后从队列中删除。
     * @param caller 执行域(this)。
     * @param method 定时器回调函数。
     * @return 调用是否成功。
     */
    runTimer(caller: any, method: Function): boolean {
        let handler: TimerHandler = this._map[Utils.getGID(caller, method)];
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run(true);
            return true;
        }
        else
            return false;
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
        for (let i = 0, n = this._handlers.length; i < n; i++) {
            let handler = this._handlers[i];
            handler.clear();
        }
        this._handlers.length = 0;
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
    caller: any;

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
        let caller: any = this.caller;
        if (caller && caller.destroyed) return this.clear();
        let method: Function = this.method;
        let args: any[] = this.args;
        withClear && this.clear();
        if (method == null) return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
