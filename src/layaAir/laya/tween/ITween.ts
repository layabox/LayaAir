import { Ease } from "./Ease";
import type { Tween } from "./Tween";

/**
 * @en Tween callback function.
 * @param tweener The current tweener.
 * @zh 缓动回调函数。
 * @param tweener 当前的tweener。
 */
export type TweenCallback = (tweener: ITweener) => void;

/**
 * @en Builtin ease function names.
 * @zh 内置的缓动函数名称。
 */
export type EaseType = keyof typeof Ease;

/**
 * @en Ease function is a function that takes a time parameter and returns a value between 0 and 1.
 * @param t Current time between 0 and the duration (inclusive).
 * @param b The initial value of the animated property.
 * @param c The total change in the animated property.
 * @param d The duration of the motion.
 * @param args Additional arguments.
 * @zh Ease函数是一个接受时间参数并返回0到1之间值的函数。
 * @param t 当前时间，取值范围是0到持续时间（包括持续时间）。
 * @param b 属性的初始值。
 * @param c 属性的变化总量。
 * @param d 动画的持续时间。
 * @param args 额外的参数。
 */
export type EaseFunction = (t: number, b: number, c: number, d: number, ...args: any[]) => number;

/**
 * @en TweenInterpolator is a function that calculates the value of the tween at a given time.
 * @param time The current time.
 * @param start The start value.
 * @param end The end value.
 * @param result The result value.
 * @param args The additional arguments.
 * @zh TweenInterpolator 是一个在给定时间计算缓动值的函数。
 * @param time 当前时间。
 * @param start 开始值。
 * @param end 结束值。
 * @param result 结果值。
 * @param args 额外的参数。
 */
export type TweenInterpolator<T extends any[]> = (time: number, start: ReadonlyArray<number>, end: ReadonlyArray<number>, result: Array<number>, ...args: T) => void;

/**
 * @en The Tween system uses adapters to convert different value types to and from number arrays for tween calculations.
 * @zh Tween系统通过适配器来将不同的值类型与数字数组互相转换，以便进行缓动计算。
 */
export type TweenValueAdapter = {
    /**
     * @en Push value to number array.
     * @param array The number array to write to. 
     * @param value The value to write. 
     * @zh 将值推入到数字数组中。
     * @param array 要写入的数字数组。 
     * @param value 要写入的值。
     */
    write: (array: Array<number>, value: any) => void;

    /**
     * @en Read value from number array.
     * @param array The number array to read from. 
     * @param offset The offset of the number array. 
     * @returns The value read.
     * @zh 从数字数组中读取值。
     * @param array 要读取的数字数组。
     * @param offset 数字数组的偏移量。
     * @returns 读取的值。
     */
    read: (array: Array<number>, offset: number) => any;
};

export interface ITweenValue {
    /**
     * @en The numbers array of the tween value.
     * @zh 缓动值的数字数组。
     */
    readonly nums: Array<number>;

    /**
     * @en Get value by property name.
     * @param name Property name. 
     * @returns Value.
     * @zh 通过属性名称获取值。
     * @param name 属性名称。
     * @returns 值。
     */
    get(name: string): any;

    /**
     * @en Get value by property index.
     * @param index Property index.
     * @returns Value.
     * @zh 通过属性索引获取值。
     * @param index 属性索引。
     * @returns 值。
     */
    getAt(index: number): any;

    /**
     * @en Set value by property name.
     * @param name Property name. 
     * @param value Value.
     * @zh 通过属性名称设置值。
     * @param name 属性名称。
     * @param value 值。 
     */
    set(name: string, value: any): void;

    /**
     * @en Set value by property index.
     * @param index Property index. 
     * @param value Value.
     * @zh 通过属性索引设置值。
     * @param index 属性索引。
     * @param value 值。 
     */
    setAt(index: number, value: any): void;

    /**
     * @en The number of properties in the tween value.
     * @zh 缓动值中的属性数量。
     */
    readonly count: number;

    /**
     * @en Copy all values from another ITweenValue.
     * @param source The source ITweenValue.
     * @returns The current ITweenValue.
     * @zh 从另一个 ITweenValue 复制所有值。
     * @param source 源 ITweenValue。
     * @returns 当前 ITweenValue。 
     */
    copy(source: ITweenValue): this;
}

export interface ITweener {
    /**
     * @en The starting value of the tweener. Even if the tweener is running, you can still modify it.
     * @zh 缓动的初始值。即使tweener在运行过程中，也可以修改它。
     */
    readonly startValue: ITweenValue;
    /**
     * @en The end value of the tweener. Even if the tweener is running, you can still modify it.
     * @zh 缓动的结束值。即使tweener在运行过程中，也可以修改它。
     */
    readonly endValue: ITweenValue;
    /**
     * @en The current value of the tweener. You can get the tweener value at any time during the tweener.
     * @zh 缓动的当前值。可以在缓动进行中的任意时刻获取tweener的值。
     */
    readonly value: Readonly<ITweenValue>;
    /**
     * @en The difference between the value of the last update callback and the value of the current update callback.
     * @zh 上一次update回调与本次update回调的value值的差值。
     */
    readonly deltaValue: Readonly<ITweenValue>;

    /**
     * @en The name of the Tweener.
     * @zh Tweener的名称。 
     */
    readonly name: string;

    /**
     * @en The owner of the Tweener.
     * @zh 获取Tweener的拥有者。
     */
    readonly owner: Tween;
    /**
     * @en Get the target of the tweener.
     * @zh 获得缓动的目标对象。
     */
    readonly target: any;

    /**
     * @en Get the duration of the tweener.
     * @zh 获取缓动的持续时间，以毫秒为单位。
     */
    duration: number;

    /**
     * @en Get the delay time in milliseconds.
     * @zh 获取延迟时间，以毫秒为单位。
     */
    delay: number;

    /**
     * @en The breakpoint of the tweener. If the time reaches the breakpoint, the tweener will end.
     * @zh 缓动的断点时间。如果时间达到断点时间，缓动将会结束。
     */
    breakpoint: number;

    /**
     * @en Get the number of repetitions of the tweener.
     * If the repeat is 0, then the tweener will play once. If the repeat is -1, then the tweener will loop indefinitely. 
     * If the repeat is 1, then the tweener will play twice, and so on.
     * @zh 获取缓动的重复次数。
     * 如果 repeat 为 0，则缓动将播放一次。如果 repeat 为 -1，则缓动将无限循环。
     * 如果 repeat 为 1，则缓动将播放两次，依此类推。
     */
    repeat: number;

    /**
     * @en If yoyo is true, after the first play, the tweener will alternate back and forth. 
     * @zh 如果 yoyo 为 true，缓动将在第一次播放后来回交替播放。
     */
    yoyo: boolean;

    /**
     * @en The time scale of the tweener.
     * @zh 设置缓动的时间缩放。
     */
    timeScale: number;

    /**
     * @en Whether the tweener ignores the time scale from Laya.timer.
     * @zh 缓动是否忽略Laya.timer的时间缩放。
     */
    ignoreEngineTimeScale: boolean;

    /**
     * @en The user data of the tweener.
     * @zh 缓动的用户数据。
     */
    userData: any;

    /**
     * @en Get or set the pause state of the tweener.
     * @zh 获取或者设置tweener的暂停状态.
     */
    paused: boolean;

    /**
     * @en The normalized time of the tweener. The value is between 0 and 1.
     * @zh 缓动的归一化时间。取值在 0 和 1 之间。
     */
    readonly normalizedTime: number;

    /**
     * @en When the tweener reaches the breakpoint and ends, it is true.
     * @zh 当缓动到达breakpoint后结束，此值为true。
     */
    readonly breaking: boolean;

    /**
     * @en Seek the tweener to a specified time.
     * @param time The time to seek to, in milliseconds.
     * @returns The tweener object.
     * @zh 将缓动播放头跳转到指定的时间。
     * @param time 要跳转到的时间，以毫秒为单位。
     * @return tweener对象。
     */
    seek(time: number): void;

    /**
     * @en Kill the tweener. The tweener will be stopped and will be removed from the Tween system.
     * @param complete If true, the tweener will be set to the end state, and the complete callback will be called.
     * If false, the complete callback will not be called.
     * @returns The tweener object.
     * @zh 结束缓动。缓动将会停止，并从缓动系统中移除。
     * @param complete 如果为 true，缓动将设置到结束状态, complete 回调将会被执行。
     * 如果为 false，complete 回调将不会被执行。
     * @return tweener对象。 
     */
    kill(complete?: boolean): void;
}