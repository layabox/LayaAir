import { ILaya } from "../../ILaya";
import type { Node } from "../display/Node";
import { Point } from "../maths/Point";
import { Handler } from "../utils/Handler";
import { IPool, Pool } from "../utils/Pool";
import { Ease, EaseFunction } from "./Ease";
import { CurvePath } from "./CurvePath";
import { TweenValue, TweenValueType } from "./TweenValue";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Color } from "../maths/Color";

export type TweenCallback = (tween: Tween) => void;
type TweenPropDef = { name: string, type: TweenValueType, i: number, shake?: boolean };

/**
 * @en The `Tween` class is an easing class. It is used to implement the interpolation of properties of a target object.
 * @zh `Tween` 类是一个缓动类。使用此类能够实现对目标对象属性的渐变。
 */
export class Tween {
    /**
     * @en A positive integer, representing the unique id of the Tween object. If you need to access the Tween after creating it, you should save this id and then call Tween.getTween(id) to get it.
     * @zh 一个正整数，是Tween对象的唯一标识。如果创建Tween后后续需要引用它，保留此id，然后使用getTween(id)获取它。
     */
    readonly id: number;
    /**
     * @en The starting value of the Tween. Even if the Tween is running, you can still modify it.
     * @zh 缓动的初始值。即使Tween在运行过程中，也可以修改它。
     */
    readonly startValue: TweenValue;
    /**
     * @en The end value of the Tween. Even if the Tween is running, you can still modify it.
     * @zh 缓动的结束值。即使Tween在运行过程中，也可以修改它。
     */
    readonly endValue: TweenValue;
    /**
     * @en The current value of the Tween. You can get the Tween value at any time during the Tween.
     * @zh 缓动的当前值。可以在缓动进行中的任意时刻获取Tween的值。
     */
    readonly value: TweenValue;
    /**
     * @en The difference between the value of the last update callback and the value of the current update callback.
     * @zh 上一次update回调与本次update回调的value值的差值。
     */
    readonly deltaValue: TweenValue;

    private _target: any;
    private _killed: boolean;
    private _paused: boolean;
    private _props: Array<TweenPropDef>;
    private _propsCnt: number;
    private _delay: number;
    private _duration: number;
    private _breakpoint: number;
    private _easeFunc: EaseFunction;
    private _easeArgs: number[];
    private _repeat: number;
    private _yoyo: boolean;
    private _timeScale: number;
    private _ignoreEngineScale: boolean;
    private _snapping: boolean;
    private _userData: any;
    private _path: CurvePath;

    private _onUpdate: TweenCallback;
    private _onStart: TweenCallback;
    private _onComplete: TweenCallback;
    private _onUpdateCaller: any;
    private _onStartCaller: any;
    private _onCompleteCaller: any;

    private _started: boolean;
    private _ended: number;
    private _startFrame: number;
    private _elapsedTime: number;
    private _normalizedTime: number;

    /**
     * @zh 创建一个新的缓动对象。使用返回的对象可以设置缓动的属性和其他选项。
     * 缓动会自动开始，无需额外API调用。如果不想tween被立刻执行，可以调用pause，后续再调用resume。
     * 请不要缓存返回的tween对象，它会在内部被池化，缓动结束后自动回收，对缓存的tween对象操作是危险的。
     * 在start,update,complete回调中，会自动传递当前的tween对象。如果在其他情况需要获得tween对象，可以保存tween对象的id，然后使用Tween.getTween(id)获取它，可以使用Tween.killTween(id)立即结束它.
     * @param target 缓动的目标对象。可以为空。
     * @returns 返回一个Tween对象。
     * @en Create a new Tween object. You can set the properties of the Tween by chaining. It will start automatically and does not need to be called separately.
     * Please do not cache the returned Tween object, it will be pooled internally, and the Tween object operation is dangerous.
     * In the start, update, and complete callbacks, the current Tween object will be automatically passed. If you need to get the Tween object in other cases, you can save the id of the Tween object, and then use Tween.getTween(id) to get it, and use Tween.killTween(id) to end it immediately.
     * @param target The target object of the Tween. It can be empty.
     * @returns A Tween object.
     * @example
     * ```ts
     * //tween a numeric property of an object
     * let tweenId = Laya.Tween.create(target)
     *   .setDuration(1000)
     *   .to("x", 100).to("y", 200)
     *   .setEase(Laya.Ease.sineInOut).setDelay(1000).onUpdate(onUpdate).onComplete(onComplete);
     * 
     * //tween a vector property of an object
     * Laya.Tween.create(target.transform).setDuration(1000).to("localPosition", new Laya.Vector3(1,1,1));
     * 
     * //tween a hex color property of an object, r/g/b channel are tweened separately.
     * Laya.Tween.create(target).setDuration(1000).to("color", 0xffffff, Laya.TweenValueType.HexColor);
     * 
     * //Somewhere want to kill the tween immediately.
     * Laya.Tween.kill(tweenId);
     * ```
     */
    static create(target?: any): Tween {
        let tweener = Tween._pool.borrow();
        _activeTweens[_totalActiveTweens++] = tweener;
        tweener._target = target;
        return tweener;
    }

    /**
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
    static to(target: any, props: Readonly<Record<string, any>>, duration: number, ease?: EaseFunction, complete?: Handler | Function, delay?: number, coverBefore?: boolean): Tween {
        if (coverBefore)
            Tween.killAll(target);

        return Tween.legacySetup(Tween.create(target), props, duration, ease, complete, delay, true);
    }

    /**
     * @en From the props attribute, tween to the current state. This is a compatibility function, recommended to use Tween.create instead.
     * @param target The target object whose properties will be tweened.
     * @param props The list of properties to change, e.g., {x:100, y:20, ease:Ease.backOut, complete:Handler.create(this,onComplete), update:new Handler(this,onUpdate)}.
     * @param duration The time taken for the tween in milliseconds.
     * @param ease The type of easing, defaults to linear motion.
     * @param complete The callback function when the tween completes.
     * @param delay The delay before the tween starts.
     * @param coverBefore Whether to override the previous tween.
     * @returns Returns the Tween object.
     * @zh 从props属性，缓动到当前状态。这是兼容老版本的函数签名，建议使用Twee.create替代。
     * @param target 目标对象(即将更改属性值的对象)。
     * @param props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param duration 花费的时间，单位毫秒。
     * @param ease 缓动类型，默认为匀速运动。
     * @param complete 结束回调函数。
     * @param delay 延迟执行时间。
     * @param coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    static from(target: any, props: Record<string, any>, duration: number, ease?: EaseFunction, complete?: Handler | Function, delay?: number, coverBefore?: boolean): Tween {
        if (coverBefore)
            Tween.killAll(target);

        return Tween.legacySetup(Tween.create(target), props, duration, ease, complete, delay, false);
    }

    private static legacySetup(tween: Tween, props: Record<string, any>, duration: number, ease: EaseFunction, complete: Handler | Function, delay: number, isTo: boolean): Tween {
        tween._duration = duration;

        for (let p in props) {
            let value = props[p];
            if (typeof (value) == 'number' || (<Vector2 | Vector3 | Vector4 | Color>value).writeTo != null) {
                isTo ? tween.to(p, value) : tween.from(p, value);
            }
        }

        if (props.ease)
            tween.setEase(props.ease, props.easeArgs);
        if (props.update) {
            if (typeof (props.update) === "function")
                tween.onUpdate(<TweenCallback>props.update);
            else //handler
                tween.onUpdate(props.update.runWith, props.update);
        }
        if (props.complete) {
            if (typeof (props.complete) === "function")
                tween.onComplete(<TweenCallback>props.complete);
            else //handler
                tween.onComplete(props.complete.runWith, props.complete);
        }

        if (ease != null)
            tween.setEase(ease);

        if (delay != null)
            tween.setDelay(delay);

        if (complete) {
            if (typeof (complete) === "function")
                tween.onComplete(<TweenCallback>complete);
            else
                tween.onComplete(complete.runWith, complete);
        }

        return tween;
    }

    /**
     * Query a Tween object by ID.
     * @param id The ID of the Tween object. 
     * @returns The Tween object. If it doesn't exist, it will return null.
     */
    static getTween(id: number): Tween | null {
        return _activeTweenMap.get(id);
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
        if (target == null)
            return false;

        for (let i = 0; i < _totalActiveTweens; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed)
                return true;
        }

        return false;
    }

    /**
     * @en Get all Tweens that are running on the specified target.
     * @param target The target object. 
     * @param out An array to receive the Tween objects. 
     * @returns An array of Tween objects that are running on the specified target.
     * @zh 获取指定对象上正在运行的所有 Tween。
     * @param target 指定的对象。
     * @param out 接收 Tween 对象的数组。
     * @return 正在运行的所有 Tween 的数组。 
     */
    static getTweens(target: any, out?: Array<Tween>): Array<Tween> {
        out = out || [];
        if (target == null)
            return out;

        let cnt = _totalActiveTweens;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed) {
                out.push(tweener);
            }
        }

        return out;
    }

    /**
     * @en Kill a Tween by its ID. The tween will be removed from the Tween system and stopped immediately.
     * @param tweenId The ID of the Tween object.
     * @param complete If true, the tween will be set to the end state, and the complete callback will be called.
     * If false, the complete callback will not be called.
     * @returns Returns true if the Tween is existing and killed.
     * @zh 通过指定的 ID 结束指定的 Tween，结束时会立即从 Tween 系统中移除。
     * @param tweenId Tween 对象的 ID。
     * @param complete 如果为 true，Tween 将设置到结束状态, complete 回调将会被执行。
     * 如果为 false，complete 回调将不会被执行。
     * @return 如果存在并且成功结束 Tween 返回 true，否则返回 false。
     */
    static kill(tweenId: number, complete?: boolean): boolean {
        let tween = _activeTweenMap.get(tweenId);
        if (!tween || tween._killed)
            return false;

        tween.kill(complete);
        return true;
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
        if (target == null)
            return false;

        let flag = false;
        let cnt = _totalActiveTweens;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener && tweener.target == target && !tweener._killed) {
                tweener.kill(completed);
                flag = true;
            }
        }

        return flag;
    }

    /**
     * @deprecated Use kill instead.
     */
    static clear(tween: Tween): void {
        tween.kill();
    }

    /**
     * @deprecated Use killAll instead.
     */
    static clearAll(target: any): void {
        Tween.killAll(target);
    }

    constructor() {
        this.startValue = new TweenValue();
        this.endValue = new TweenValue();
        this.value = new TweenValue();
        this.deltaValue = new TweenValue();
        this._props = [];
        this._easeArgs = [];

        this.startValue._props = this._props;
        this.endValue._props = this._props;
        this.value._props = this._props;
        this.deltaValue._props = this._props;
    }

    /**
     * @en Tweens the object's property to the sepecified value.
     * @param propName The name of the property.
     * @param value The target value of the property. 
     * @param propType The value type of the property. This is optional, if the type of value can be inferred from the value, propType can be omitted.
     * @returns The Tween object.
     * @zh 缓动对象的属性到指定值。
     * @param propName 属性名称。
     * @param value 属性目标值。
     * @param propType 属性类型。这是可选的，如果从value的类型能推断出来，propType可以不传。
     * @return Tween对象。 
     */
    to<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, value: T, propType?: TweenValueType): this {
        return this.go(propName, this._target[propName], value, propType);
    }

    /**
     * @en Tweens the object's property from the specified value to the current value.
     * @param propName The name of the property. 
     * @param value The start value of the property. 
     * @param propType The value type of the property. This is optional, if the type of value can be inferred from the value, propType can be omitted.
     * @returns The Tween object.
     * @zh 缓动对象的属性从指定值到当前值。
     * @param propName 属性名称。
     * @param value 属性目标值。
     * @param propType 属性类型。这是可选的，如果从value的类型能推断出来，propType可以不传。
     * @return Tween对象。 
     */
    from<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, value: T, propType?: TweenValueType): this {
        return this.go(propName, value, this._target[propName], propType);
    }

    /**
     * @en Tweens the object's property from the start value to the end value.
     * @param propName The name of the property.
     * @param startValue The start value of the property.
     * @param endValue The end value of the property. 
     * @param propType The value type of the property. This is optional, if the type of value can be inferred from the value, propType can be omitted. 
     * @returns The Tween object.
     * @zh 缓动对象的属性从指定的起始值到指定的结束值。
     * @param propName 属性名称。
     * @param startValue 属性起始值。
     * @param endValue 属性结束值。
     * @param propType 属性类型。这是可选的，如果从value的类型能推断出来，propType可以不传。
     * @return Tween对象。
     */
    go<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, startValue: T, endValue: T, propType?: TweenValueType): this {
        let prop = this._props[this._propsCnt];
        if (!prop)
            prop = this._props[this._propsCnt] = { name: "", type: TweenValueType.None, i: 0 };
        this._propsCnt++;
        prop.name = propName;
        prop.i = this.startValue.length;
        prop.shake = false;

        if (typeof (startValue) === "number" || typeof (endValue) === "number") {
            this.startValue.push(<number>startValue);
            this.endValue.push(<number>endValue);
            prop.type = propType || 0;
        }
        else {
            startValue.writeTo(this.startValue, this.startValue.length);
            let len = this.startValue.length - prop.i;
            (<Vector2 | Vector3 | Vector4 | Color>endValue).writeTo(this.endValue, this.endValue.length);
            prop.type = propType || (len == 4 && startValue instanceof Color) ? TweenValueType.Color : (len - 1);
        }

        return this;
    }

    /**
     * @en Play shake effect on the specified property.
     * @param propName The name of the property. 
     * @param amplitude The amplitude of the shake effect. 
     * @returns The Tween object.
     * @zh 实现一个属性的震动效果。
     * @param propName 属性名称。
     * @param amplitude 震动幅度。
     * @return Tween对象。
     */
    shake<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, amplitude: T): this;
    /**
     * @en Play shake effect on the specified property.
     * @param propName The name of the property. 
     * @param startValue The start value of the property. 
     * @param amplitude The amplitude of the shake effect.
     * @returns The Tween object.
     * @zh 实现一个属性的震动效果。
     * @param propName 属性名称。
     * @param startValue 属性起始值。
     * @param amplitude 震动幅度。
     * @return Tween对象。 
     */
    shake<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, startValue: T, amplitude: T): this;
    shake<T extends Vector2 | Vector3 | Vector4 | Color | number>(propName: string, startValue: T, amplitude?: T): this {
        if (arguments.length == 2) {
            amplitude = startValue;
            startValue = this._target[propName];
        }

        this.go(propName, startValue, amplitude);
        this._props[this._propsCnt - 1].shake = true;

        return this;
    }

    /**
     * @en Get the target of the Tween.
     * @zh 获得缓动的目标对象。
     */
    get target(): any {
        return this._target;
    }

    /**
     * @en Set the delay time in milliseconds.
     * @param value The delay time in milliseconds. 
     * @returns The Tween object. 
     */
    setDelay(value: number): this {
        this._delay = value;
        return this;
    }

    /**
     * @en Get the delay time in milliseconds.
     * @zh 获取延迟时间，以毫秒为单位。
     */
    get delay(): number {
        return this._delay;
    }

    /**
     * @en Set the duration of the Tween.
     * @param value The duration of the Tween in milliseconds. 
     * @returns The Tween object. 
     */
    setDuration(value: number): this {
        this._duration = value;
        return this;
    }

    /**
     * @en Get the duration of the Tween.
     * @zh 获取缓动的持续时间，以毫秒为单位。
     */
    get duration(): number {
        return this._duration;
    }

    /**
     * @en Set the breakpoint of the Tween. If the time reaches the breakpoint, the Tween will end.
     * @param value The breakpoint of the Tween in milliseconds.
     * @returns The Tween object.
     * @zh 设置缓动的断点时间。如果时间达到断点时间，缓动将会结束。
     * @param value 缓动的断点时间，以毫秒为单位。
     * @return Tween对象。 
     */
    setBreakpoint(value: number): this {
        this._breakpoint = value;
        return this;
    }

    /**
     * @en Set the easing function of the Tween. Use the Laya.Ease class for preset easing functions.
     * @param value The easing function.
     * @param args Extra parameters for the easing function.
     * @returns The Tween object. 
     * @zh 设置缓动的缓动函数。可以使用Laya.Ease中的缓动函数。
     * @param value 缓动函数。
     * @param args 缓动函数的额外参数。
     * @return Tween对象。
     */
    setEase(value: EaseFunction, args?: number[]): this {
        this._easeFunc = value;
        this._easeArgs.length = 0;
        if (args)
            this._easeArgs.push(...args);
        return this;
    }

    /**
     * @en Set the number of repetitions of the Tween.
     * If the repeat is 0, then the Tween will play once. If the repeat is -1, then the Tween will loop indefinitely. 
     * If the repeat is 1, then the Tween will play twice, and so on.
     * @param repeat The number of repetitions of the Tween.
     * @param yoyo If yoyo is true, after the first play, the Tween will alternate back and forth. 
     * @returns The Tween object.
     * @zh 设置缓动的重复次数。
     * 如果 repeat 为 0，则缓动将播放一次。如果 repeat 为 -1，则缓动将无限循环。
     * 如果 repeat 为 1，则缓动将播放两次，依此类推。
     * @param repeat 缓动的重复次数。
     * @param yoyo 如果 yoyo 为 true，缓动将在第一次播放后来回交替播放。
     * @return Tween对象。 
     */
    setRepeat(repeat: number, yoyo?: boolean): this {
        this._repeat = repeat;
        this._yoyo = yoyo;
        return this;
    }

    /**
     * @en Get the number of repetitions of the Tween.
     * @zh 获取缓动的重复次数。
     */
    get repeat(): number {
        return this._repeat;
    }

    /**
     * @deprecated Use setRepeat instead.
     */
    set repeat(value: number) {
        this._repeat = value;
    }

    /**
     * @en Set the time scale of the Tween.
     * @param value The time scale of the Tween. 
     * @returns The Tween object.
     * @zh 设置缓动的时间缩放。
     * @param value 缓动的时间缩放。
     * @return Tween对象。
     */
    setTimeScale(value: number): this {
        this._timeScale = value;
        return this;
    }

    /**
     * @en Set whether the Tween ignores the time scale from Laya.timer.
     * @param value If true, then the time scale of the Tween will not be affected by Laya.timer. 
     * @returns The Tween object.
     * @zh 设置缓动是否忽略Laya.timer的时间缩放。
     * @param value 如果为 true，缓动的时间缩放不会受到Laya.timer的影响。
     * @return Tween对象。
     */
    setIgnoreEngineTimeScale(value: boolean): this {
        this._ignoreEngineScale = value;
        return this;
    }

    /**
     * @en Set whether the Tween value is rounded to an integer.
     * @param value If true, the Tween value will be rounded to an integer.
     * @returns The Tween object.
     * @zh 设置缓动的值是否取整。
     * @param value 如果为 true，缓动的值将取整。
     * @return Tween对象。 
     */
    setSnapping(value: boolean): this {
        this._snapping = value;
        return this;
    }

    /**
     * @en Set the path of the Tween. The path is a CurvePath object. It is used to implement path tweening and only supports two-dimensional vectors.
     * @param value The path of the Tween. 
     * @returns The Tween object.
     * @zh 设置缓动的路径。路径是一个CurvePath对象, 用于实现路径缓动，只支持二维向量。
     * @param value 缓动的路径。
     * @return Tween对象。 
     */
    setPath(value: CurvePath): this {
        this._path = value;
        return this;
    }

    /**
     * @en Set the user data of the Tween.
     * @param value The user data of the Tween.
     * @returns The Tween object. 
     */
    setUserData(value: any): this {
        this._userData = value;
        return this;
    }

    /**
     * @en Get the user data of the Tween.
     * @zh 获取缓动的用户数据。
     */
    get userData(): any {
        return this._userData;
    }

    /**
     * @en Set a custom update callback for the Tween. The update callback is executed for every frame during the Tween.
     * @param callback The update callback.
     * @param target The update callback execution context. 
     * @returns The Tween object.
     * @zh 设置缓动的自定义更新回调。更新回调会在缓动的每一帧执行。
     * @param callback 更新回调函数。
     * @param target 更新回调执行上下文。
     * @return Tween对象。 
     */
    onUpdate(callback: TweenCallback, target?: any): this {
        this._onUpdate = callback;
        this._onUpdateCaller = target;
        return this;
    }

    /**
     * @en Set a custom start callback for the Tween. The start callback is executed when the Tween starts.
     * @param callback The start callback.
     * @param target The start callback execution context. 
     * @returns The Tween object.
     * @zh 设置缓动的自定义开始回调。开始回调会在缓动开始时执行。
     * @param callback 开始回调函数。
     * @param target 开始回调执行上下文。
     * @return Tween对象。 
     */
    onStart(callback: TweenCallback, target?: any): this {
        this._onStart = callback;
        this._onStartCaller = target;
        return this;
    }

    /**
     * @en Set a custom complete callback for the Tween. The complete callback is executed when the Tween finishes.
     * If the tween is killed before completion and the parameter `complete` is false, the complete callback will not be called.
     * @param callback The complete callback.
     * @param target The complete callback execution context.
     * @returns The Tween object.
     * @zh 设置缓动的自定义结束回调。结束回调会在缓动结束时执行。
     * 如果缓动在结束前被Kill，并且参数`complete`为false，结束回调不会被调用。
     * @param callback 结束回调函数。
     * @param target 结束回调执行上下文。
     * @return Tween对象。
     */
    onComplete(callback: TweenCallback, target?: any): this {
        this._onComplete = callback;
        this._onCompleteCaller = target;
        return this;
    }

    /**
     * @en The normalized time of the Tween. The value is between 0 and 1.
     * @zh 缓动的归一化时间。取值在 0 和 1 之间。
     */
    get normalizedTime(): number {
        return this._normalizedTime;
    }

    /**
     * @en Whether the Tween is completed. 
     * If the Tween is killed, this property will still be false.
     * @zh 缓动是否已结束。如果缓动是被kill掉的，此属性仍然为false。
     */
    get completed(): boolean {
        return this._ended != 0;
    }

    /**
     * @en Whether the Tween is completed. 
     * If the Tween is reached the breakpoint, this property will still be false.
     * If the Tween is killed, this property will still be false.
     * @zh 缓动是否已结束。
     * 如果缓动是由于到达breakpoint结束的，此属性仍然为false。
     * 如果缓动是被kill掉的，此属性仍然为false。
     */
    get allCompleted(): boolean {
        return this._ended == 1;
    }

    /**
     * @en Seek the Tween to a specified time.
     * @param time The time to seek to, in milliseconds.
     * @returns The Tween object.
     * @zh 将缓动播放头跳转到指定的时间。
     * @param time 要跳转到的时间，以毫秒为单位。
     * @return Tween对象。
     */
    seek(time: number): Tween {
        if (this._killed)
            return this;

        this._elapsedTime = time;
        if (this._elapsedTime < this._delay) {
            if (this._started)
                this._elapsedTime = this._delay;
            else
                return this;
        }

        this.update2();
        return this;
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
        if (this._killed)
            return;

        if (complete) {
            if (this._ended == 0) {
                if (this._breakpoint >= 0)
                    this._elapsedTime = this._delay + this._breakpoint;
                else if (this._repeat >= 0)
                    this._elapsedTime = this._delay + this._duration * (this._repeat + 1);
                else
                    this._elapsedTime = this._delay + this._duration * 2;
                this.update2();
            }

            this.callCompleteCallback();
        }

        this._killed = true;
    }

    /**
     * @deprecated Use kill instead.
     */
    complete(): void {
        this.kill(true);
    }

    /**
     * @deprecated Use kill instead.
     */
    clear(): void {
        this.kill(false);
    }

    /**
     * @deprecated Use kill instead.
     */
    recover(): void {
        this.kill(false);
    }

    /**
     * @en Pause the tween. It can be resumed using resume() or restart().
     * @zh 暂停缓动。可以通过 resume() 或 restart() 重新开始。
     */
    pause(): Tween {
        this._paused = true;
        return this;
    }

    /**
     * @en Resume the paused tween.
     * @zh 恢复已暂停的缓动。
     */
    resume(): Tween {
        this._paused = false;
        return this;
    }

    private init(): void {
        _idCounter++;
        if (_idCounter < 1)
            _idCounter = 1;
        (<{ -readonly [P in keyof this]: this[P] }>this).id = _idCounter;
        _activeTweenMap.set(this.id, this);
        this._delay = 0;
        this._duration = 0;
        this._breakpoint = -1;
        this._easeFunc = Ease.linearNone;
        this._easeArgs.length = 0;
        this._timeScale = 1;
        this._snapping = false;
        this._repeat = 0;
        this._yoyo = false;
        this._started = false;
        this._paused = false;
        this._killed = false;
        this._startFrame = ILaya.timer.currFrame;
        this._elapsedTime = 0;
        this._normalizedTime = 0;
        this._ended = 0;
        this._propsCnt = 0;
        this.startValue.length = 0;
        this.endValue.length = 0;
        this.value.length = 0;
    }

    private reset(): void {
        (<{ -readonly [P in keyof this]: this[P] }>this).id = -1;
        this._target = null;
        this._userData = null;
        this._path = null;
        this._onStart = this._onUpdate = this._onComplete = null;
        this._onStartCaller = this._onUpdateCaller = this._onCompleteCaller = null;
    }

    private update(dt: number): void {
        if (this._timeScale != 1)
            dt *= this._timeScale;
        if (dt == 0)
            return;

        if (this._ended != 0) { //Maybe completed by seek
            this.callCompleteCallback();
            this._killed = true;
            return;
        }

        this._elapsedTime += dt;
        this.update2();

        if (this._ended != 0) {
            if (!this._killed) {
                this.callCompleteCallback();
                this._killed = true;
            }
        }
    }

    private update2(): void {
        this._ended = 0;

        if (this.startValue.length == 0) { //DelayedCall
            if (this._elapsedTime >= this._delay + this._duration)
                this._ended = 1;

            return;
        }

        if (!this._started) {
            if (this._elapsedTime < this._delay)
                return;

            this._started = true;
            this.value.length = this.startValue.length;
            this.value.push(...this.startValue);
            this.deltaValue.length = this.startValue.length;
            this.deltaValue.fill(0);
            this.callStartCallback();
            if (this._killed)
                return;
        }

        let reversed: boolean = false;
        let tt: number = this._elapsedTime - this._delay;
        if (this._breakpoint >= 0 && tt >= this._breakpoint) {
            tt = this._breakpoint;
            this._ended = 2;
        }

        if (this._repeat != 0) {
            let round: number = Math.floor(tt / this._duration);
            tt -= this._duration * round;
            if (this._yoyo)
                reversed = round % 2 == 1;

            if (this._repeat > 0 && this._repeat - round < 0) {
                if (this._yoyo)
                    reversed = this._repeat % 2 == 1;
                tt = this._duration;
                this._ended = 1;
            }
        }
        else if (tt >= this._duration) {
            tt = this._duration;
            this._ended = 1;
        }

        this._normalizedTime = this._easeFunc(reversed ? (this._duration - tt) : tt, 0, 1, this._duration, ...this._easeArgs);

        this.value.fill(0);
        this.deltaValue.fill(0);

        if (this._path) {
            let pt = this._path.getPointAt(this._normalizedTime, tmpPoint);
            if (this._snapping) {
                pt.x = Math.round(pt.x);
                pt.y = Math.round(pt.y);
            }
            this.deltaValue[0] = pt.x - this.value[0];
            this.deltaValue[1] = pt.y - this.value[1];
            this.value[0] = pt.x;
            this.value[1] = pt.y;
        }
        else {
            let j = 0;
            let p: TweenPropDef;
            let nj = 0;
            for (let i = 0, n = this.startValue.length; i < n; i++) {
                if (i == nj) {
                    p = this._props[j++];
                    nj = j < this._propsCnt ? this._props[j].i : -1;
                }

                let n1 = this.startValue[i];
                let n2 = this.endValue[i];
                let f: number;
                if (p && p.shake) {
                    if (this._ended === 0) {
                        let am = n2 * (1 - this._normalizedTime);
                        let am2: number = am * (Math.random() > 0.5 ? 1 : -1);
                        f = n1 + am2;
                    }
                    else
                        f = n1;
                }
                else
                    f = n1 + (n2 - n1) * this._normalizedTime;
                if (this._snapping)
                    f = Math.round(f);
                this.deltaValue[i] = f - this.value[i];
                this.value[i] = f;
            }
        }

        if (this._target != null) {
            for (let i = 0, n = this._propsCnt; i < n; i++) {
                let prop = this._props[i];
                if (prop.name)
                    this._target[prop.name] = this.value.read(prop.type, prop.i);
            }
        }

        this.callUpdateCallback();
    }

    private callStartCallback(): void {
        if (this._onStart) {
            try {
                this._onStart.call(this._onStartCaller, this);
            }
            catch (err) {
                console.warn("error in start callback > ", err);
            }
        }
    }

    private callUpdateCallback(): void {
        if (this._onUpdate) {
            try {
                this._onUpdate.call(this._onUpdateCaller, this);
            }
            catch (err) {
                console.warn("error in update callback > ", err);
            }
        }
    }

    private callCompleteCallback(): void {
        if (this._onComplete) {
            try {
                this._onComplete.call(this._onCompleteCaller, this);
            }
            catch (err) {
                console.warn("error in complete callback > ", err);
            }
        }
    }

    /**
     * @internal
     */
    static _pool: IPool<Tween> = Pool.createPool(Tween, e => e.init(), e => e.reset());

    /**
     * @internal
     */
    static _runAll(): void {
        let cnt = _totalActiveTweens;
        if (cnt == 0)
            return;

        let frame = ILaya.timer.currFrame;
        let dt = ILaya.timer.delta;
        let udt = ILaya.timer.unscaledDelta;
        let freePosStart = -1;
        for (let i = 0; i < cnt; i++) {
            let tweener = _activeTweens[i];
            if (tweener == null) {
                if (freePosStart == -1)
                    freePosStart = i;
            }
            else if (tweener._killed) {
                _activeTweenMap.delete(tweener.id);
                Tween._pool.returns(tweener);
                _activeTweens[i] = null;

                if (freePosStart == -1)
                    freePosStart = i;
            }
            else {
                if (tweener._target && (<Node>tweener._target).destroyed)
                    tweener._killed = true;
                else if (!tweener._paused)
                    tweener.update(tweener._startFrame == frame ? 0 : tweener._ignoreEngineScale ? udt : dt);

                if (freePosStart != -1) {
                    _activeTweens[freePosStart] = tweener;
                    _activeTweens[i] = null;
                    freePosStart++;
                }
            }
        }

        if (freePosStart >= 0) {
            if (_totalActiveTweens != cnt) { //new tweens added
                let j = cnt;
                cnt = _totalActiveTweens - cnt;
                for (let i = 0; i < cnt; i++) {
                    _activeTweens[freePosStart++] = _activeTweens[j];
                    _activeTweens[j] = null;
                    j++;
                }
            }
            _totalActiveTweens = freePosStart;
        }
    }

    /**
     * @internal
     */
    static _getMap(): ReadonlyMap<number, Tween> {
        return _activeTweenMap;
    }
}

var _idCounter = 0;
var _activeTweens: Tween[] = [];
var _activeTweenMap: Map<number, Tween> = new Map();
var _totalActiveTweens: number = 0;
const tmpPoint = new Point();