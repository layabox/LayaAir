import { Handler } from "./Handler";
/**
     * <code>Tween</code>  是一个缓动类。使用此类能够实现对目标对象属性的渐变。
     */
export declare class Tween {
    /**@private */
    private static tweenMap;
    /**@private */
    private _complete;
    /**@private */
    private _target;
    /**@private */
    private _ease;
    /**@private */
    private _props;
    /**@private */
    private _duration;
    /**@private */
    private _delay;
    /**@private */
    private _startTimer;
    /**@private */
    private _usedTimer;
    /**@private */
    private _usedPool;
    /**@private */
    private _delayParam;
    /**@private 唯一标识，TimeLintLite用到*/
    gid: number;
    /**更新回调，缓动数值发生变化时，回调变化的值*/
    update: Handler;
    /**重播次数，如果repeat=0，则表示无限循环播放*/
    repeat: number;
    /**当前播放次数*/
    private _count;
    /**
     * 缓动对象的props属性到目标值。
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
    static to(target: any, props: any, duration: number, ease?: Function, complete?: Handler, delay?: number, coverBefore?: boolean, autoRecover?: boolean): Tween;
    /**
     * 从props属性，缓动到当前状态。
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
    static from(target: any, props: any, duration: number, ease?: Function, complete?: Handler, delay?: number, coverBefore?: boolean, autoRecover?: boolean): Tween;
    /**
     * 缓动对象的props属性到目标值。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    to(target: any, props: any, duration: number, ease?: Function, complete?: Handler, delay?: number, coverBefore?: boolean): Tween;
    /**
     * 从props属性，缓动到当前状态。
     * @param	target 目标对象(即将更改属性值的对象)。
     * @param	props 变化的属性列表，比如{x:100,y:20,ease:Ease.backOut,complete:Handler.create(this,onComplete),update:new Handler(this,onComplete)}。
     * @param	duration 花费的时间，单位毫秒。
     * @param	ease 缓动类型，默认为匀速运动。
     * @param	complete 结束回调函数。
     * @param	delay 延迟执行时间。
     * @param	coverBefore 是否覆盖之前的缓动。
     * @return	返回Tween对象。
     */
    from(target: any, props: any, duration: number, ease?: Function, complete?: Handler, delay?: number, coverBefore?: boolean): Tween;
    private firstStart;
    private _initProps;
    private _beginLoop;
    /**执行缓动**/
    private _doEase;
    /**设置当前执行比例**/
    progress: number;
    /**
     * 立即结束缓动并到终点。
     */
    complete(): void;
    /**
     * 暂停缓动，可以通过resume或restart重新开始。
     */
    pause(): void;
    /**
     * 设置开始时间。
     * @param	startTime 开始时间。
     */
    setStartTime(startTime: number): void;
    /**
     * 清理指定目标对象上的所有缓动。
     * @param	target 目标对象。
     */
    static clearAll(target: any): void;
    /**
     * 清理某个缓动。
     * @param	tween 缓动对象。
     */
    static clear(tween: Tween): void;
    /**@private 同clearAll，废弃掉，尽量别用。*/
    static clearTween(target: any): void;
    /**
     * 停止并清理当前缓动。
     */
    clear(): void;
    /** 回收到对象池。*/
    recover(): void;
    private _remove;
    /**
     * 重新开始暂停的缓动。
     */
    restart(): void;
    /**
     * 恢复暂停的缓动。
     */
    resume(): void;
    private static easeNone;
}
