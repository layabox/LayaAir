import { Handler } from "./Handler";
import { Pool } from "./Pool";
import { Browser } from "./Browser";
import { Utils } from "./Utils";
import { ILaya } from "./../../ILaya";

/**
 * @en The `Tween` class is an easing class. It is used to implement the interpolation of properties of a target object.
 * @zh `Tween` 类是一个缓动类。使用此类能够实现对目标对象属性的渐变。
 */
export class Tween {
    /**@private */
    private static tweenMap: any[] = [];
    /**@private */
    private _complete: Handler;
    /**@private */
    private _target: any;
    /**@private */
    private _ease: Function;
    /**@private */
    private _props: any[];
    /**@private */
    private _duration: number;
    /**@private */
    private _delay: number;
    /**@private */
    private _startTimer: number;
    /**@private */
    private _usedTimer: number;
    /**@private */
    private _usedPool: boolean;
    /**@private */
    private _delayParam: any[];
    /**
     * @private
     * @en Unique identifier used by TimeLintLite.
     * @zh 唯一标识，由 TimeLintLite 使用。
     */
    gid: number = 0;
    /**
     * @en Update callback, when the buffering value changes, the value of the callback changes
     * @zh 更新回调，缓动数值发生变化时，回调变化的值。
     */
    update: Handler;
    /**
     * @en The number of times to replay the tween. If set to 0, it indicates an infinite loop.
     * @zh 重播次数，如果设置为 0，则表示无限循环播放。
     */
    repeat: number = 1;
    /**当前播放次数*/
    private _count: number = 0;

    /**
     * @en Tweens the object's properties to the target values.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @param autoRecover Whether to automatically recover after the tween ends, defaults to true.
     * @returns Returns the Tween object.
     * @zh 缓动对象的props属性到目标值。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @param	autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
     * @return	返回Tween对象。
     */
    static to(target: any, props: any, duration: number, ease: Function|null = null, complete: Handler|null = null, delay: number = 0, coverBefore: boolean = false, autoRecover: boolean = true): Tween {
        return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, true, autoRecover, true);
    }

    /**
     * @en From the props attribute, tween to the current state.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @param autoRecover Whether to automatically recover after the tween ends, defaults to true.
     * @returns Returns the Tween object.
     * @zh 从props属性，缓动到当前状态。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @param	autoRecover 是否自动回收，默认为true，缓动结束之后自动回收到对象池。
     * @return	返回Tween对象。
     */
    static from(target: any, props: any, duration: number, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false, autoRecover: boolean = true): Tween {
        return Pool.getItemByClass("tween", Tween)._create(target, props, duration, ease, complete, delay, coverBefore, false, autoRecover, true);
    }

    /**
     * @en Tweens the props attribute of the object to the target value.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @returns Returns the Tween object.
     * @zh 缓动对象的props属性到目标值。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    to(target: any, props: any, duration: number, ease: Function = null, complete: Handler = null, delay: number = 0, coverBefore: boolean = false): Tween {
        return this._create(target, props, duration, ease, complete, delay, coverBefore, true, false, true);
    }

    /**
     * @en From the props attribute, slow down to the current state.
     * @param target The target object (the object whose property values will be changed).
     * @param props A list of changing properties, such as {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onComplete)}.
     * @param duration The time spent, in milliseconds.
     * @param ease The easing type, default is uniform motion. Default value is null.
     * @param complete The callback function at the end. Default value is null.
     * @param delay The delay time before execution. Default value is 0.
     * @param coverBefore Whether to cover the previous tween. Default value is false.
     * @returns Returns a Tween object.
     * @zh 从props属性，缓动到当前状态。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    from(target: any, props: any, duration: number, ease: Function|null = null, complete: Handler|null = null, delay: number = 0, coverBefore: boolean = false): Tween {
        return this._create(target, props, duration, ease, complete, delay, coverBefore, false, false, true);
    }

    /** @internal */
    _create(target: any, props: any, duration: number, ease: Function|null, complete: Handler|null, delay: number, coverBefore: boolean, isTo: boolean, usePool: boolean, runNow: boolean): Tween {
        if (!target) throw new Error("Tween:target is null");
        this._target = target;
        this._duration = duration;
        this._ease = ease || props.ease || Tween.easeNone;
        this._complete = complete || props.complete;
        this._delay = delay;
        this._props = [];
        this._usedTimer = 0;
        this._startTimer = Browser.now();
        this._usedPool = usePool;
        this._delayParam = null;
        this.update = props.update;

        //判断是否覆盖			
        var gid: number = (target.$_GID || (target.$_GID = Utils.getGID()));
        if (!Tween.tweenMap[gid]) {
            Tween.tweenMap[gid] = [this];
        } else {
            if (coverBefore) Tween.clearTween(target);
            Tween.tweenMap[gid].push(this);
        }

        if (runNow) {
            if (delay <= 0) this.firstStart(target, props, isTo);
            else {
                this._delayParam = [target, props, isTo];
                ILaya.timer.once(delay, this, this.firstStart, this._delayParam);
            }
        } else {
            this._initProps(target, props, isTo);
        }
        return this;
    }

    private firstStart(target: any, props: any, isTo: boolean): void {
        this._delayParam = null;
        if (target.destroyed) {
            this.clear();
            return;
        }
        this._initProps(target, props, isTo);
        this._beginLoop();
    }

    private _initProps(target: any, props: any, isTo: boolean): void {
        //初始化属性
        for (var p in props) {
            if (typeof (target[p]) == 'number') {
                var start: number = isTo ? target[p] : props[p];
                var end: number = isTo ? props[p] : target[p];
                this._props.push([p, start, end - start]);
                if (!isTo) target[p] = start;
            }
        }
    }

    private _beginLoop(): void {
        ILaya.timer.frameLoop(1, this, this._doEase);
    }

    /**执行缓动**/
    private _doEase(): void {
        this._updateEase(Browser.now());
    }

    /**@internal */
    _updateEase(time: number): void {
        var target: any = this._target;
        if (!target) return;

        //如果对象被销毁，则立即停止缓动
        if (target.destroyed) return Tween.clearTween(target);

        var usedTimer: number = this._usedTimer = time - this._startTimer - this._delay;
        if (usedTimer < 0) return;
        if (usedTimer >= this._duration) return this.complete();

        var ratio: number = usedTimer > 0 ? this._ease(usedTimer, 0, 1, this._duration) : 0;
        var props: any[] = this._props;
        for (var i: number = 0, n: number = props.length; i < n; i++) {
            var prop: any[] = props[i];
            target[prop[0]] = prop[1] + (ratio * prop[2]);
        }
        if (this.update) this.update.run();
    }

    /**
     * @en Set the current execution progress ratio.
     * @zh 设置当前执行进度比例。
     */
    set progress(v: number) {
        var uTime: number = v * this._duration;
        this._startTimer = Browser.now() - this._delay - uTime;
    }

    /**
     * @en Immediately complete the tween and reach the end point.
     * @zh 立即结束缓动并到达终点。
     */
    complete(): void {
        if (!this._target) return;

        //立即执行初始化
        ILaya.timer.runTimer(this, this.firstStart);

        //缓存当前属性
        var target: any = this._target;
        var props: any = this._props;
        var handler: Handler = this._complete;
        //设置终点属性
        for (var i: number = 0, n: number = props.length; i < n; i++) {
            var prop: any[] = props[i];
            target[prop[0]] = prop[1] + prop[2];
        }
        if (this.update) this.update.run();

        this._count++;
        if (this.repeat != 0 && this._count >= this.repeat) {
            //清理
            this.clear();
            //回调
            handler && handler.run();
        } else {
            this.restart();
        }
    }

    /**
     * @en Pause the tween. It can be resumed using resume() or restart().
     * @zh 暂停缓动。可以通过 resume() 或 restart() 重新开始。
     */
    pause(): void {
        ILaya.timer.clear(this, this._beginLoop);
        ILaya.timer.clear(this, this._doEase);
        ILaya.timer.clear(this, this.firstStart);
        var time: number = Browser.now();
        var dTime: number;
        dTime = time - this._startTimer - this._delay;
        if (dTime < 0) {
            this._usedTimer = dTime;
        }
    }

    /**
     * @en Set the start time of the tween.
     * @param startTime The start time.
     * @zh 设置缓动的开始时间。
     * @param startTime 开始时间。
     */
    setStartTime(startTime: number): void {
        this._startTimer = startTime;
    }

    /**
     * @en Clear all tweens on the specified target object.
     * @param target The target object.
     * @zh 清理指定目标对象上的所有缓动。
     * @param target 目标对象。
     */
    static clearAll(target: any): void {
        if (!target || !target.$_GID) return;
        var tweens: any[] = Tween.tweenMap[target.$_GID];
        if (tweens) {
            for (var i: number = 0, n: number = tweens.length; i < n; i++) {
                tweens[i]._clear();
            }
            tweens.length = 0;
        }
    }

    /**
     * @en Clear a specific tween.
     * @param tween The tween object to clear.
     * @zh 清理某个特定的缓动。
     * @param tween 要清理的缓动对象。
     */
    static clear(tween: Tween): void {
        tween.clear();
    }

    /**@private 同clearAll，废弃掉，尽量别用。*/
    static clearTween(target: any): void {
        Tween.clearAll(target);
    }

    /**
     * @en Stop and clear the current tween.
     * @zh 停止并清理当前缓动。
     */
    clear(): void {
        if (this._target) {
            this._remove();
            this._clear();
        }
    }

    /**
     * @internal
     */
    _clear(): void {
        this.pause();
        ILaya.timer.clear(this, this.firstStart);
        this._complete = null;
        this._target = null;
        this._ease = null;
        this._props = null;
        this._delayParam = null;
        this.repeat = 1;

        if (this._usedPool) {
            this.update = null;
            Pool.recover("tween", this);
        }
    }

    /**
     * @en Recycle to the object pool.
     * @zh 回收到对象池。
     */
    recover(): void {
        this._usedPool = true;
        this._clear();
    }

    private _remove(): void {
        var tweens: any[] = Tween.tweenMap[this._target.$_GID];
        if (tweens) {
            for (var i: number = 0, n: number = tweens.length; i < n; i++) {
                if (tweens[i] === this) {
                    tweens.splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * @en Restart the paused tween.
     * @zh 重新开始已暂停的缓动。
     */
    restart(): void {
        this.pause();
        this._usedTimer = 0;
        this._startTimer = Browser.now();
        if (this._delayParam) {
            ILaya.timer.once(this._delay, this, this.firstStart, this._delayParam);
            return;
        }
        var props: any[] = this._props;
        for (var i: number = 0, n: number = props.length; i < n; i++) {
            var prop: any[] = props[i];
            this._target[prop[0]] = prop[1];
        }
        ILaya.timer.once(this._delay, this, this._beginLoop);
    }

    /**
     * @en Resume the paused tween.
     * @zh 恢复已暂停的缓动。
     */
    resume(): void {
        if (this._usedTimer >= this._duration) return;
        this._startTimer = Browser.now() - this._usedTimer - this._delay;
        if (this._delayParam) {
            if (this._usedTimer < 0) {
                ILaya.timer.once(-this._usedTimer, this, this.firstStart, this._delayParam);
            } else {
                this.firstStart.apply(this, <any>this._delayParam);
            }
        } else {
            this._beginLoop();
        }
    }

    private static easeNone(t: number, b: number, c: number, d: number): number {
        return c * t / d + b;
    }
}

