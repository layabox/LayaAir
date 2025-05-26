
import { Handler } from "../utils/Handler";
import { Tweener } from "./Tweener";
import { EaseFunction, TweenInterpolator, TweenCallback, ITweener, ITweenValue, EaseType } from "./ITween";
import { IPool, Pool } from "../utils/Pool";
import { CurvePath } from "./CurvePath";
import { Ease } from "./Ease";

/**
 * @en The `Tween` class is an easing class. It is used to implement the interpolation of properties of a target object.
 * @zh `Tween` 类是一个缓动类。使用此类能够实现对目标对象属性的渐变。
 * @example
 * ```ts
 * //tween a numeric property of an object
 * let tween = Laya.Tween.create(target).duration(1000).delay(1000)
 *  .to("x", 100).to("y", 200).ease(Laya.Ease.sineInOut).then(callback);
 * 
 * //tween a vector property of an object
 * Laya.Tween.create(target.transform, target).duration(1000).to("localPosition", new Laya.Vector3(1,1,1));
 * 
 * //tween a hex color property of an object, r/g/b channel are tweened separately.
 * Laya.Tween.create(target).duration(1000).to("color", 0xffffff).interp(Laya.Tween.seperateChannel, 3);
 * 
 * //Somewhere want to kill the tween immediately.
 * tween.kill();
 * 
 * //or kill by target
 * Laya.Tween.killAll(target);
 * 
 * //use chain and parallel to create complex sequences
 * Laya.Tween.create(target).duration(1000).to("x", 100)
 *   .chain().duration(500).to("y", 200)
 *   .parallel().to("visible", true)
 * ```
 * @blueprintable
 */
export class Tween {
    private _target: any;
    private _lo: any;
    private _cur: Tweener;
    private _par: Tweener;
    private _queue: Array<number>;
    private _head: number;

    /**
     * @en Create a new Tween object. You can set the properties of the Tween by chaining. It will start automatically and does not need to be called separately.
     * @param target The target object of the Tween. It can be empty.
     * @param lifecycleOwner The lifecycle object, when destroyed, the tween will automatically stop. In general, if the target object of the task has a destroyed property, this property does not need to be set. If the target object of the task does not have a destroyed property, this property can be set.
     * @returns A Tween object.
     * @zh 创建一个新的缓动对象。使用返回的对象可以设置缓动的属性和其他选项。
     * 缓动会自动开始，无需额外API调用。如果不想tween被立刻执行，可以调用pause，后续再调用resume。
     * @param target 缓动的目标对象。可以为空。
     * @param lifecycleOwner 生命周期对象，当销毁时，缓动会自动停止。一般情况下，如果任务的目标对象有 destroyed 属性，则不需要设置此属性。如果任务的目标对象没有 destroyed 属性，则可以设置此属性。
     * @returns 返回一个Tween对象。
     */
    static create(target?: any, lifecycleOwner?: { destroyed: boolean }): Tween {
        let tween = Tween._pool.take();
        tween._target = target;
        tween._lo = lifecycleOwner;
        return tween;
    }

    /**
     * @en Check if any Tween is running on the specified target.
     * @param target The target object.
     * @returns Returns true if there is a Tween running on the target.
     * @zh 检查指定对象上是否有任何 Tween 正在运行。
     * @param target 指定的对象。
     * @return 如果有任何 Tween 正在运行，则返回 true。
     */
    static isTweening(target: any): boolean {
        return Tweener.isTweening(target);
    }

    /**
     * Query a Tween object by target.
     * @param target The target object.
     * @returns The Tween object. If it doesn't exist, it will return null.
     */
    static getTween(target: any): Tween | null {
        tmpArray.length = 0;
        this.getTweens(target, tmpArray);
        return tmpArray.length > 0 ? tmpArray[0] : null;
    }

    /**
     * @en Get all Tweens that are running on the specified target. If none, returns an empty array or the passed-in non-null array.
     * @param target The target object. 
     * @param out An array to receive the Tween objects. 
     * @returns An array of Tween objects that are running on the specified target.
     * @zh 获取指定对象上正在运行的所有 Tween。如果没有，返回空数组或传入的非空对象。
     * @param target 指定的对象。
     * @param out 接收 Tween 对象的数组。
     * @return 正在运行的所有 Tween 的数组。 
     */
    static getTweens(target: any, out?: Array<Tween>): Array<Tween> {
        return Tweener.getTweens(target, out);
    }

    /**
     * @en Kill a specific tween.
     * @param tween The tween object to clear.
     * @zh 清理某个特定的缓动。
     * @param tween 要清理的缓动对象。
     */
    static kill(tween: Tween): void {
        if (tween)
            tween.kill();
    }

    /**
     * @deprecated Use kill instead.
     */
    static clear(tween: Tween): void {
        if (tween)
            tween.kill();
    }

    /**
     * @en Kill all Tweens by the specified target.
     * @param target The target object.
     * @param completed If true, the tweens will be set to the end state, and the complete callback will be called.
     * If false, the complete callback will not be called. 
     * @returns Returns true if there any tweens are existing and killed.
     * @zh 结束指定对象上的所有 Tween。
     * @param target 指定的对象。
     * @param completed 如果为 true，Tween 将设置到结束状态, complete 回调将会被执行。
     * 如果为 false，complete 回调将不会被执行。
     * @return 如果存在并且成功结束 Tween 返回 true，否则返回 false。 
     */
    static killAll(target: any, completed?: boolean): boolean {
        return Tweener.killAll(target, completed);
    }

    /**
     * @deprecated Use killAll instead.
     */
    static clearAll(target: any): void {
        Tween.killAll(target);
    }

    /**
     * @deprecated Use create instead.
     * @en Tweens the object's properties to the target values. This is a compatibility function, recommended to use Tween.create instead.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @returns Returns the Tween object.
     * @zh 缓动对象的props属性到目标值。这是兼容老版本的函数签名，建议使用Twee.create替代。
     * @param target 目标对象(即将更改属性值的对象)。
     * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param duration 花费的时间，单位毫秒。
     * @param ease 缓动类型，默认为匀速运动。
     * @param complete 结束回调函数。
     * @param delay 延迟执行时间。
     * @param coverBefore 是否覆盖之前的缓动。
     * @return 返回Tween对象。
     */
    static to(target: any, props: Readonly<Record<string, any>>, duration: number, ease?: EaseFunction, complete?: Handler, delay?: number, coverBefore?: boolean): Tween {
        if (coverBefore)
            Tween.killAll(target);

        let tween = Tween.create(target);
        Tween.tweenLegacy(tween.cur(true), props, duration, ease, complete, delay, true);
        return tween;
    }

    /**
     * @deprecated Use create instead.
     * @en From the props attribute, tween to the current state. 
     * This is a compatibility function, recommended to use Tween.create instead.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @returns Returns the Tween object.
     * @zh 从props属性，缓动到当前状态。
     * 这是兼容老版本的函数签名，建议使用Twee.create替代。
     * @param target 目标对象(即将更改属性值的对象)。
     * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param duration 花费的时间，单位毫秒。
     * @param ease 缓动类型，默认为匀速运动。
     * @param complete 结束回调函数。
     * @param delay 延迟执行时间。
     * @param coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    static from(target: any, props: Record<string, any>, duration: number, ease?: EaseFunction, complete?: Handler, delay?: number, coverBefore?: boolean): Tween {
        if (coverBefore)
            Tween.killAll(target);

        let tween = Tween.create(target);
        Tween.tweenLegacy(tween.cur(true), props, duration, ease, complete, delay, false);
        return tween;
    }

    private static tweenLegacy(tweener: Tweener, props: Record<string, any>, duration: number, ease: EaseFunction, complete: Handler, delay: number, isTo: boolean): void {
        tweener.duration = duration;

        for (let p in props) {
            let value = props[p];
            if (p in tweener.target) {
                isTo ? tweener.go(p, tweener.target[p], value) : tweener.go(p, value, tweener.target[p]);
            }
        }

        if (props.ease) {
            tweener.ease = props.ease;
            if (props.easeArgs)
                tweener.easeArgs.push(...props.easeArgs);
        }
        if (props.update) {
            tweener.onUpdate = props.update.runWith;
            tweener.onUpdateCaller = props.update;
        }
        if (props.complete) {
            tweener.onComplete = props.complete.runWith;
            tweener.onCompleteCaller = props.complete;
        }

        if (ease != null)
            tweener.ease = ease;

        if (delay != null)
            tweener.delay = delay;

        if (complete) {
            tweener.onComplete = complete.runWith;
            tweener.onCompleteCaller = complete;
        }
    }

    /**
     * @en Tweens the object's property to the sepecified value.
     * @param propName The name of the property. 
     * The property can be a number, string, boolean, Vector2, Vector3, Vector4, or Color. If it is a string, it is implicitly a color value.
     * @param value The target value of the property. 
     * @returns The Tween object.
     * @zh 缓动对象的属性到指定值。
     * 属性类型可以是数字，字符串，布尔值，Vector2, Vector3, Vector4, Color。如果是字符串，则隐含为颜色值。
     * @param propName 属性名称。
     * @param value 属性目标值。
     * @return Tween对象。 
     */
    to(propName: string, value: any): this {
        this.cur(true).go(propName, undefined, value);
        return this;
    }

    /**
     * @en Tweens the object's property from the specified value to the current value.
     * @param propName The name of the property.
     * The property can be a number, string, boolean, Vector2, Vector3, Vector4, or Color. If it is a string, it is implicitly a color value.
     * @param value The start value of the property.
     * @returns The Tween object.
     * @zh 缓动对象的属性从指定值到当前值。
     * @param propName 属性名称。
     * 属性类型可以是数字，字符串，布尔值，Vector2, Vector3, Vector4, Color。如果是字符串，则隐含为颜色值。
     * @param value 属性目标值。
     * @return Tween对象。 
     */
    from(propName: string, value: any): this {
        this.cur(true).go(propName, value, undefined);
        return this;
    }

    /**
     * @en Tweens the object's property from the start value to the end value.
     * @param propName The name of the property.
     * The property can be a number, string, boolean, Vector2, Vector3, Vector4, or Color. If it is a string, it is implicitly a color value.
     * @param startValue The start value of the property.
     * @param endValue The end value of the property. 
     * @returns The Tween object.
     * @zh 缓动对象的属性从指定的起始值到指定的结束值。
     * @param propName 属性名称。
     * 属性类型可以是数字，字符串，布尔值，Vector2, Vector3, Vector4, Color。如果是字符串，则隐含为颜色值。
     * @param startValue 属性起始值。
     * @param endValue 属性结束值。
     * @return Tween对象。
     */
    go<T>(propName: string, startValue: T, endValue: T): this {
        this.cur(true).go(propName, startValue, endValue);
        return this;
    }

    /**
     * @en Start a new tween task, which will start immediately after the current task ends.
     * @param target The target object of the Tween. If it is empty, the target object pass in create method will be used.
     * @param lifecycleOwner The lifecycle object, when destroyed, the tween will automatically stop. In general, if the target object of the task has a destroyed property, this property does not need to be set. If the target object of the task does not have a destroyed property, this property can be set.
     * @returns The Tween object.
     * @zh 开启一个新的缓动任务，它将在当前任务结束后立刻开始。
     * @param target 缓动的目标对象。如果为空，将使用create方法传入的目标对象。
     * @param lifecycleOwner 生命周期对象，当销毁时，缓动会自动停止。一般情况下，如果任务的目标对象有 destroyed 属性，则不需要设置此属性。如果任务的目标对象没有 destroyed 属性，则可以设置此属性。
     * @return Tween对象。
     */
    chain(target?: any, lifecycleOwner?: { destroyed: boolean }): this {
        if (target !== undefined) {
            this._target = target;
            this._lo = lifecycleOwner;
        }

        if (this._queue.length == 0)
            return this;

        if (this._par != null) {
            this._queue.push(-2);
            this._par = null;
        }

        this._cur = Tweener.create(this);
        this._cur.target = this._target;
        this._cur.lifecycleOwner = this._lo;
        this._queue.push(this._cur.id);
        return this;
    }

    /**
     * @en Start a new tween task, which will start at the same time as the current task.
     * @param target The target object of the Tween. If it is empty, the target object pass in chain or create method will be used.
     * @param lifecycleOwner The lifecycle object, when destroyed, the tween will automatically stop. In general, if the target object of the task has a destroyed property, this property does not need to be set. If the target object of the task does not have a destroyed property, this property can be set.
     * @returns The Tween object.
     * @zh 开启一个新的缓动任务，它和当前任务同时开始。
     * @param target 缓动的目标对象。如果为空，将使用chain或create方法传入的目标对象。
     * @param lifecycleOwner 生命周期对象，当销毁时，缓动会自动停止。一般情况下，如果任务的目标对象有 destroyed 属性，则不需要设置此属性。如果任务的目标对象没有 destroyed 属性，则可以设置此属性。
     * @return Tween对象。
     */
    parallel(target?: any, lifecycleOwner?: { destroyed: boolean }): this {
        if (this._queue.length == 0) {
            if (target !== undefined) {
                this._target = target;
                this._lo = lifecycleOwner;
            }
            return this;
        }

        if (this._par == null) {
            this._queue.push(-1);
            this._par = this._cur;
        }

        this._cur = Tweener.create(this);
        if (target !== undefined) {
            this._cur.target = target;
            this._cur.lifecycleOwner = lifecycleOwner;
        }
        else {
            this._cur.target = this._par.target;
            this._cur.lifecycleOwner = this._par.lifecycleOwner;
        }
        this._cur.duration = this._par.duration;
        if (this._par._active)
            this._cur.activate();
        this._queue.push(this._cur.id);
        return this;
    }

    /**
     * @en Set the delay time of the current task.
     * @param value The delay time in milliseconds.
     * @return Tween object.
     * @zh 设置当前任务的延迟时间。
     * @param value 延迟时间，以毫秒为单位。
     * @return Tween对象。
     */
    delay(value: number): this {
        this.cur(false).delay = value;
        return this;
    }

    /**
     * @en Set the duration of the current task.
     * @param value The duration in milliseconds. 
     * @returns The Tween object. 
     * @zh 设置当前任务的持续时间。
     * @param value 持续时间，以毫秒为单位。
     * @return Tween对象。
     */
    duration(value: number): this {
        this.cur(false).duration = value;
        return this;
    }

    /**
     * @en Set the breakpoint of the current task. If the time reaches the breakpoint, the task will end.
     * @param value The breakpoint in milliseconds.
     * @returns The Tween object.
     * @zh 设置当前任务的断点时间。如果时间达到断点时间，任务将会结束。
     * @param value 任务的断点时间，以毫秒为单位。
     * @return Tween对象。
     */
    breakpoint(value: number): this {
        this.cur(false).breakpoint = value;
        return this;
    }

    /**
     * @en Set the easing function of the current task. Use the Laya.Ease class for preset easing functions.
     * @param value The easing function, or the name of the easing function.
     * @param args Extra parameters for the easing function.
     * @returns The Tween object.
     * @zh 设置当前任务的缓动函数。可以使用Laya.Ease类中的预设缓动函数，或者一个缓动函数的名称。
     * @param value 缓动函数。
     * @param args 缓动函数的额外参数。
     * @return Tween对象。
     */
    ease(value: EaseFunction | EaseType, ...args: Array<any>): this {
        let cur = this.cur(false);
        if (typeof (value) === "string")
            cur.ease = Ease[value];
        else
            cur.ease = value;
        cur.easeArgs.length = 0;
        if (args)
            cur.easeArgs.push(...args);
        return this;
    }

    /**
     * @en Set the interpolation function of the current task. e.g. Laya.Tween.seperateChannel.
     * @param value The interpolation function.
     * @param args Extra parameters for the interpolation function. 
     * @returns The Tween object.
     * @zh 设置当前任务的插值函数。比如Laya.Tween.seperateChannel。
     * @param value 插值函数。
     * @param args 插值函数的额外参数。
     * @return Tween对象。 
     */
    interp<T extends any[]>(value: TweenInterpolator<T>, ...args: T): this {
        let cur = this.cur(false);
        cur.interp = value;
        cur.interpArgs.length = 0;
        if (args)
            cur.interpArgs.push(...args);
        return this;
    }

    /**
     * @en Set the number of repetitions of the current task.
     * If the repeat is 0, then the task will play once. If the repeat is -1, then the task will loop indefinitely. 
     * If the repeat is 1, then the task will play twice, and so on.
     * @param repeat The number of repetitions of the task.
     * @param yoyo If yoyo is true, after the first play, the task will alternate back and forth. 
     * @returns The Tween object.
     * @zh 设置当前任务的重复次数。
     * 如果 repeat 为 0，则任务将播放一次。如果 repeat 为 -1，则任务将无限循环。
     * 如果 repeat 为 1，则任务将播放两次，依此类推。
     * @param repeat 任务的重复次数。
     * @param yoyo 如果 yoyo 为 true，任务将在第一次播放后来回交替播放。
     * @return Tween对象。
     */
    repeat(repeat: number, yoyo?: boolean): this {
        let cur = this.cur(false);
        cur.repeat = repeat;
        cur.yoyo = yoyo;
        return this;
    }

    /**
     * @en Set the time scale of the current task.
     * @param value The time scale.
     * @returns The Tween object.
     * @zh 设置当前任务的时间缩放。
     * @param value 任务的时间缩放。
     * @return Tween对象。
     */
    timeScale(value: number): this {
        this.cur(false).timeScale = value;
        return this;
    }

    /**
     * @en Set whether current task will ignore the time scale from Laya.timer.
     * @param value If true, then the time scale of current task will not be affected by Laya.timer. 
     * @returns The Tween object.
     * @zh 设置当前任务是否忽略Laya.timer的时间缩放。
     * @param value 如果为 true，任务的时间缩放不会受到Laya.timer的影响。
     * @return Tween对象。
     */
    ignoreEngineTimeScale(value: boolean): this {
        this.cur(false).ignoreEngineTimeScale = value;
        return this;
    }

    /**
     * @en Set whether the property values of current task is rounded to an integer.
     * @param value If true, the property values will be rounded to an integer.
     * @returns The Tween object.
     * @zh 设置当前任务的属性值是否取整。
     * @param value 如果为 true，属性值将会取整。
     * @return Tween对象。
     */
    snapping(value: boolean): this {
        this.cur(false).snapping = value;
        return this;
    }

    /**
     * @en Set the user data of the current task.
     * @param value The user data of the current task.
     * @returns The Tween object. 
     */
    userData(value: any): this {
        this.cur(false).userData = value;
        return this;
    }

    /**
     * @en Set the name of current task.
     * @param value The name of the current task. 
     * @returns The Tween object.
     * @zh 设置当前任务的名称。
     * @param value 当前任务的名称。
     * @return Tween对象。
     */
    name(value: string): this {
        this.cur(false).name = value;
        return this;
    }

    /**
     * @en Set a custom update callback for the current task. The update callback is executed for every frame during the task.
     * @param callback The update callback.
     * @param callbackThis The update callback execution context. 
     * @returns The Tween object.
     * @zh 设置当前任务的自定义更新回调。更新回调会在任务的每一帧执行。
     * @param callback 更新回调函数。
     * @param callbackThis 更新回调执行上下文。
     * @return Tween对象。
     */
    onUpdate(callback: TweenCallback, callbackThis?: any): this {
        let cur = this.cur(false);
        cur.onUpdate = callback;
        cur.onUpdateCaller = callbackThis;
        return this;
    }

    /**
     * @en Set a custom start callback for the current task. The start callback is executed when the task starts.
     * @param callback The start callback.
     * @param callbackThis The start callback execution context. 
     * @returns The Tween object.
     * @zh 设置当前任务的自定义开始回调。开始回调会在任务开始时执行。
     * @param callback 开始回调函数。
     * @param callbackThis 开始回调执行上下文。
     * @return Tween对象。
     */
    onStart(callback: TweenCallback, callbackThis?: any): this {
        let cur = this.cur(false);
        cur.onStart = callback;
        cur.onStartCaller = callbackThis;
        return this;
    }

    /**
     * @en Set a custom complete callback for the current task. The complete callback is executed when the task finishes.
     * Note that if there are parallel tasks, the complete callback will only be called when all tasks are finished.
     * If the task is killed before it ends, and the parameter complete is false, the complete callback will not be called.
     * @param callback The complete callback.
     * @param callbackThis The complete callback execution context.
     * @returns The Tween object.
     * @zh 设置当前任务的自定义结束回调。结束回调会在任务结束时执行。
     * 注意，如果有并行任务，只是在当前任务结束就会调用结束回调，而并不是所有并行的任务。
     * 如果任务在结束前被 kill，并且参数 complete 为 false，则不会调用结束回调。
     * @param callback 结束回调函数。
     * @param callbackThis 结束回调执行上下文。
     * @return Tween对象。
     */
    then(callback: TweenCallback, callbackThis?: any): this {
        let cur = this.cur(false);
        cur.onComplete = callback;
        cur.onCompleteCaller = callbackThis;
        return this;
    }

    /**
     * @en Seek current task to a specified time.
     * @param time The time to seek to, in milliseconds.
     * @returns The Tween object.
     * @zh 将当前任务的播放头跳转到指定的时间。
     * @param time 要跳转到的时间，以毫秒为单位。
     * @return Tween对象。
     */
    seek(time: number): this {
        this.cur(false).seek(time);
        return this;
    }

    /**
     * @en Pause the tween. It can be resumed using resume() or restart().
     * @zh 暂停缓动。可以通过 resume() 重新开始。
     */
    pause(): this {
        forEach(this._queue, tween => tween.paused = true);
        return this;
    }

    /**
     * @en Resume the paused tween.
     * @zh 恢复已暂停的缓动。
     */
    resume(): this {
        forEach(this._queue, tween => tween.paused = false);
        return this;
    }

    /**
     * @en Find a tweener by name.
     * @param name The name of the tweener. 
     * @returns The Tween object.
     * @zh 通过名字查找一个缓动。
     * @param name 缓动的名字。
     * @return Tween对象。 
     */
    findTweener(name: string): ITweener | null {
        for (let i = 0, n = this._queue.length; i < n; i++) {
            if (i < 0) continue;
            let tween = Tweener.getTween(this._queue[i]);
            if (tween && tween.name == name)
                return tween;
        }
        return null;
    }

    /**
     * @en Kill the Tween. The Tween will be stopped and will be removed from the Tween system.
     * @param complete If true, the Tween will be set to the end state, and the complete callback will be called.
     * If false, the complete callback will not be called.
     * @returns The Tween object.
     * @zh 结束缓动。缓动将会停止，并从缓动系统中移除。
     * @param complete 如果为 true，缓动将设置到结束状态, complete 回调将会被执行。
     * 如果为 false，complete 回调将不会被执行。
     * @return Tween对象。 
     */
    kill(complete?: boolean): void {
        if (this._queue.length == 0)
            return;

        let arr: Array<Tweener>;
        for (let e of this._queue) {
            if (e > 0) {
                let tweener = Tweener.getTween(e);
                if (tweener) {
                    if (!tweener._killed) {
                        if (!arr) arr = [];
                        arr.push(tweener);
                    }
                    tweener.owner = null;
                }
            }
        }

        this._head = -1;
        this._cur = null;
        this._queue.length = 0;

        if (arr != null)
            arr.forEach(t => t.kill(complete));
    }

    /**
     * @en Whether the Tween is completed. 
     * If the Tween is killed, this property will still be false.
     * @zh 缓动是否已结束。如果缓动是被kill掉的，此属性仍然为false。
     */
    get completed(): boolean {
        return this._head >= 0 && this._queue.length === 0;
    }

    /**
     * @en Immediately complete the tween and reach the end point.
     * @zh 立即结束缓动并到达终点。
     */
    complete(): void {
        this.kill(true);
    }

    /**
     * @en Clear the tween. Same as kill(false).
     * @zh 清理缓动。和kill(false)作用一样。
     */
    clear(): void {
        this.kill(false);
    }

    /**
     * @en Clear the tween and return it to the object pool. Note: After calling this method, this object cannot be used again, otherwise it will cause unpredictable problems.
     * @zh 清理缓动，并将缓动对象回收到对象池。注意：调用此方法，本对象不能再使用，否则会造成不可预料的问题。
     */
    recover(): void {
        this.kill(false);
        Tween._pool.recover(this);
    }

    private constructor() {
        this._queue = [];
        this._head = -1;
    }

    private cur(call: boolean): Tweener {
        if (!this._cur) {
            if (this._head != -1) {
                if (call)
                    this.kill(false);
                else
                    throw new Error("Tween has been started. clear first!");
            }

            this._cur = Tweener.create(this);
            this._cur.target = this._target;
            this._cur.lifecycleOwner = this._lo;
            this._cur.activate();
            this._queue.push(this._cur.id);
        }

        return this._cur;
    }

    /**
     * @internal
     */
    _check(): void {
        if (this._cur) {
            this._head = 0;
            this._cur = null;
        }

        let i = this._head, cnt = this._queue.length;
        for (; i < cnt; i++) {
            let id = this._queue[i];
            if (id < 0)
                continue;

            let tween = Tweener.getTween(id);
            if (tween && !tween._killed) {
                if (tween._active)
                    break;

                tween.activate();
                if (this._queue[i + 1] == -1) {
                    for (let j = i + 2; j < cnt; j++) {
                        let id = this._queue[j];
                        if (id < 0)
                            break;
                        let tween = Tweener.getTween(id);
                        if (tween && !tween._killed)
                            tween.activate();
                        else
                            this._queue[i] = -3;
                    }
                }
                break;
            }
            else
                this._queue[i] = -3;
        }

        this._head = i;
        if (i >= cnt)
            this._queue.length = 0;
    }

    /**
     * @en This is an interpolator that implements a shake effect.
     * @param amplitude The amplitude of the shake effect.
     * @zh 这是一个实现震动效果的插值器。
     * @param amplitude 震动幅度。
     * @example
     * ```ts
     * //The value pass in `to` is not used, so it can be any value.
     * Laya.Tween.create(target).duration(1000).to("x",0).to("y",0).interp(Laya.Tween.shake, 3);
     * ```
     */
    static shake(time: number, start: ReadonlyArray<number>, end: ReadonlyArray<number>, result: Array<number>, amplitude: number): void {
        if (time == 1) {
            result.length = 0;
            result.push(...start);
        }
        else {
            let am = amplitude * (1 - time);
            let am2 = am * (Math.random() > 0.5 ? 1 : -1);
            for (let i = 0; i < start.length; i++)
                result[i] = start[i] + am2;
        }
    }

    /**
     * @en This is an interpolator that separates a numeric color value into each channel for interpolation.
     * For example, from 0x000000 to 0xffffff tween, by default, it will increase directly from 0x000000 to 0xffffff, instead of R/G/B increasing from 0x00 to 0xff respectively. Using this interpolator, R/G/B can increase from 0x00 to 0xff respectively.
     * @param channels The number of channels to interpolate. For example, if it is RGB, this value is 3. If it is RGBA, this value is 4. Default is 3.
     * @zh 这是一个实现将一个数字颜色值分离各个通道分别进行插值的插值器。
     * 例如从0x000000到0xffffff缓动，默认情况下是直接从0x000000一直增大到0xffffff，而不是R/G/B分别从0x00到0xff。使用这个插值器可以让R/G/B分别从0x00到0xff。
     * @param channels 要插值的通道数。例如，如果是RGB，这个值就是3。如果是RGBA，这个值就是4。默认为3。
     * @example
     * ```ts
     * Laya.Tween.create(target).duration(1000).to("color",0xffffff).interp(Laya.Tween.seperateChannel, 3);
     * ```
     */
    static seperateChannel(time: number, start: ReadonlyArray<number>, end: ReadonlyArray<number>, result: Array<number>, channels?: number): void {
        channels = channels || 3;
        for (let i = 0; i < start.length; i++)
            result[i] = interpByChannel(time, start[i], end[i], channels);
    }

    /**
     * @en This is an interpolator that uses a curve path. The value will be obtained from the curve path.
     * @zh 这是一个使用曲线路径的插值器。数值将从曲线路径中获取。
     */
    static useCurvePath(time: number, start: ReadonlyArray<number>, end: ReadonlyArray<number>, result: Array<number>, path: CurvePath): void {
        let pt = path.getPointAt(time);
        result[0] = pt.x;
        if (result.length > 1)
            result[1] = pt.y;
        if (result.length > 2)
            result[2] = pt.z;
    }

    /**
     * @internal
     */
    static _pool: IPool<Tween> = Pool.createPool(<any>Tween);
}

const tmpArray: Array<Tween> = [];

function forEach(all: Array<number>, callback: (t: Tweener) => void): void {
    for (let e of all) {
        if (e > 0) {
            let tween = Tweener.getTween(e);
            if (tween && !tween._killed)
                callback(tween);
        }
    }
}

function interpByChannel(time: number, start: number, end: number, channels: number): number {
    let v = 0;
    for (let i = 0; i < channels; i++) {
        let j = i * 8;
        let n0 = (start >> j) & 0xFF;
        let n1 = (end >> j) & 0xFF;

        v += (n0 + (n1 - n0) * time) << j;
    }
    return v;
}