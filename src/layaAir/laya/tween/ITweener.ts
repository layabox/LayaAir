import type { Tween } from "./Tween";
import { TweenValue } from "./TweenValue";

export type TweenCallback = (tween: ITweener) => void;

export type EaseFunction = (t: number, b: number, c: number, d: number, ...args: any[]) => number;

export type TweenInterpolator<T extends any[]> = (time: number, start: number, end: number, value: number, index: number, ...args: T) => number;

/**
 * @internal
 */
export enum TweenValueType {
    Number,
    Boolean,
    Vec2,
    Vec3,
    Vec4,
    Color,
    StringColor
}

/**
 * @internal
 */
export type TweenPropInfo = { name: string; type: TweenValueType; offset: number; };

export interface ITweener {
    /**
     * @en The starting value of the tweener. Even if the tweener is running, you can still modify it.
     * @zh 缓动的初始值。即使tweener在运行过程中，也可以修改它。
     */
    readonly startValue: TweenValue;
    /**
     * @en The end value of the tweener. Even if the tweener is running, you can still modify it.
     * @zh 缓动的结束值。即使tweener在运行过程中，也可以修改它。
     */
    readonly endValue: TweenValue;
    /**
     * @en The current value of the tweener. You can get the tweener value at any time during the tweener.
     * @zh 缓动的当前值。可以在缓动进行中的任意时刻获取tweener的值。
     */
    readonly value: Readonly<TweenValue>;
    /**
     * @en The difference between the value of the last update callback and the value of the current update callback.
     * @zh 上一次update回调与本次update回调的value值的差值。
     */
    readonly deltaValue: Readonly<TweenValue>;

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