import { CallLater } from "././CallLater";
import { ILaya } from "../../ILaya";
/**
     * <code>Timer</code> 是时钟管理类。它是一个单例，不要手动实例化此类，应该通过 Laya.timer 访问。
     */
export class Timer {
    /**
     * 创建 <code>Timer</code> 类的一个实例。
     */
    constructor(autoActive = true) {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        /** 时针缩放。*/
        this.scale = 1;
        /** 当前帧开始的时间。*/
        this.currTimer = Date.now();
        /** 当前的帧数。*/
        this.currFrame = 0;
        /**@private 两帧之间的时间间隔,单位毫秒。*/
        this._delta = 0;
        /**@private */
        this._lastTimer = Date.now();
        /**@private */
        this._map = [];
        /**@private */
        this._handlers = [];
        /**@private */
        this._temp = [];
        /**@private */
        this._count = 0;
        autoActive && Timer.gSysTimer && Timer.gSysTimer.frameLoop(1, this, this._update);
    }
    /**两帧之间的时间间隔,单位毫秒。*/
    get delta() {
        return this._delta;
    }
    /**
     * @private
     * 帧循环处理函数。
     */
    _update() {
        if (this.scale <= 0) {
            this._lastTimer = Date.now();
            return;
        }
        var frame = this.currFrame = this.currFrame + this.scale;
        var now = Date.now();
        this._delta = (now - this._lastTimer) * this.scale;
        var timer = this.currTimer = this.currTimer + this._delta;
        this._lastTimer = now;
        //处理handler
        var handlers = this._handlers;
        this._count = 0;
        for (var i = 0, n = handlers.length; i < n; i++) {
            var handler = handlers[i];
            if (handler.method !== null) {
                var t = handler.userFrame ? frame : timer;
                if (t >= handler.exeTime) {
                    if (handler.repeat) {
                        if (!handler.jumpFrame) {
                            handler.exeTime += handler.delay;
                            handler.run(false);
                            if (t > handler.exeTime) {
                                //如果执行一次后还能再执行，做跳出处理，如果想用多次执行，需要设置jumpFrame=true
                                handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
                            }
                        }
                        else {
                            while (t >= handler.exeTime) {
                                handler.exeTime += handler.delay;
                                handler.run(false);
                            }
                        }
                    }
                    else {
                        handler.run(true);
                    }
                }
            }
            else {
                this._count++;
            }
        }
        if (this._count > 30 || frame % 200 === 0)
            this._clearHandlers();
    }
    /** @private */
    _clearHandlers() {
        var handlers = this._handlers;
        for (var i = 0, n = handlers.length; i < n; i++) {
            var handler = handlers[i];
            if (handler.method !== null)
                this._temp.push(handler);
            else
                this._recoverHandler(handler);
        }
        this._handlers = this._temp;
        handlers.length = 0;
        this._temp = handlers;
    }
    /** @private */
    _recoverHandler(handler) {
        if (this._map[handler.key] == handler)
            this._map[handler.key] = null;
        handler.clear();
        Timer._pool.push(handler);
    }
    /** @private */
    _create(useFrame, repeat, delay, caller, method, args, coverBefore) {
        //如果延迟为0，则立即执行
        if (!delay) {
            method.apply(caller, args);
            return null;
        }
        //先覆盖相同函数的计时
        if (coverBefore) {
            var handler = this._getHandler(caller, method);
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
        handler = Timer._pool.length > 0 ? Timer._pool.pop() : new TimerHandler();
        handler.repeat = repeat;
        handler.userFrame = useFrame;
        handler.delay = delay;
        handler.caller = caller;
        handler.method = method;
        handler.args = args;
        handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + Date.now() - this._lastTimer);
        //索引handler
        this._indexHandler(handler);
        //插入数组
        this._handlers.push(handler);
        return handler;
    }
    /** @private */
    _indexHandler(handler) {
        var caller = handler.caller;
        var method = handler.method;
        var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
        var mid = method.$_TID || (method.$_TID = (Timer._mid++) * 100000);
        handler.key = cid + mid;
        this._map[handler.key] = handler;
    }
    /**
     * 定时执行一次。
     * @param	delay	延迟时间(单位为毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    once(delay, caller, method, args = null, coverBefore = true) {
        this._create(false, false, delay, caller, method, args, coverBefore);
    }
    /**
     * 定时重复执行。
     * @param	delay	间隔时间(单位毫秒)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
     */
    loop(delay, caller, method, args = null, coverBefore = true, jumpFrame = false) {
        var handler = this._create(false, true, delay, caller, method, args, coverBefore);
        if (handler)
            handler.jumpFrame = jumpFrame;
    }
    /**
     * 定时执行一次(基于帧率)。
     * @param	delay	延迟几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameOnce(delay, caller, method, args = null, coverBefore = true) {
        this._create(true, false, delay, caller, method, args, coverBefore);
    }
    /**
     * 定时重复执行(基于帧率)。
     * @param	delay	间隔几帧(单位为帧)。
     * @param	caller	执行域(this)。
     * @param	method	定时器回调函数。
     * @param	args	回调参数。
     * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
     */
    frameLoop(delay, caller, method, args = null, coverBefore = true) {
        this._create(true, true, delay, caller, method, args, coverBefore);
    }
    /** 返回统计信息。*/
    toString() {
        return " handlers:" + this._handlers.length + " pool:" + Timer._pool.length;
    }
    /**
     * 清理定时器。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    clear(caller, method) {
        var handler = this._getHandler(caller, method);
        if (handler) {
            this._map[handler.key] = null;
            handler.key = 0;
            handler.clear();
        }
    }
    /**
     * 清理对象身上的所有定时器。
     * @param	caller 执行域(this)。
     */
    clearAll(caller) {
        if (!caller)
            return;
        for (var i = 0, n = this._handlers.length; i < n; i++) {
            var handler = this._handlers[i];
            if (handler.caller === caller) {
                this._map[handler.key] = null;
                handler.key = 0;
                handler.clear();
            }
        }
    }
    /** @private */
    _getHandler(caller, method) {
        var cid = caller ? caller.$_GID || (caller.$_GID = ILaya.Utils.getGID()) : 0;
        var mid = method.$_TID || (method.$_TID = (Timer._mid++) * 100000);
        return this._map[cid + mid];
    }
    /**
     * 延迟执行。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     * @param	args 回调参数。
     */
    callLater(caller, method, args = null) {
        CallLater.I.callLater(caller, method, args);
    }
    /**
     * 立即执行 callLater 。
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runCallLater(caller, method) {
        CallLater.I.runCallLater(caller, method);
    }
    /**
     * 立即提前执行定时器，执行之后从队列中删除
     * @param	caller 执行域(this)。
     * @param	method 定时器回调函数。
     */
    runTimer(caller, method) {
        var handler = this._getHandler(caller, method);
        if (handler && handler.method != null) {
            this._map[handler.key] = null;
            handler.run(true);
        }
    }
    /**
     * 暂停时钟
     */
    pause() {
        this.scale = 0;
    }
    /**
     * 恢复时钟
     */
    resume() {
        this.scale = 1;
    }
}
/**@private */
Timer.gSysTimer = null;
/**@private */
Timer._pool = [];
/**@private */
Timer._mid = 1;
/** @private */
class TimerHandler {
    clear() {
        this.caller = null;
        this.method = null;
        this.args = null;
    }
    run(withClear) {
        var caller = this.caller;
        if (caller && caller.destroyed)
            return this.clear();
        var method = this.method;
        var args = this.args;
        withClear && this.clear();
        if (method == null)
            return;
        args ? method.apply(caller, args) : method.call(caller);
    }
}
