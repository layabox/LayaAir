import { EventDispatcher } from "../events/EventDispatcher";
/**
 * 整个缓动结束的时候会调度
 * @eventType Event.COMPLETE
 */
/**
 * 当缓动到达标签时会调度。
 * @eventType Event.LABEL
 */
/**
 * <code>TimeLine</code> 是一个用来创建时间轴动画的类。
 */
export declare class TimeLine extends EventDispatcher {
    private _labelDic;
    private _tweenDic;
    private _tweenDataList;
    private _endTweenDataList;
    private _currTime;
    private _lastTime;
    private _startTime;
    /**当前动画数据播放到第几个了*/
    private _index;
    /**为TWEEN创建属于自己的唯一标识，方便管理*/
    private _gidIndex;
    /**保留所有对象第一次注册动画时的状态（根据时间跳转时，需要把对象的恢复，再计算接下来的状态）*/
    private _firstTweenDic;
    /**是否需要排序*/
    private _startTimeSort;
    private _endTimeSort;
    /**是否循环*/
    private _loopKey;
    /** 缩放动画播放的速度。*/
    scale: number;
    private _frameRate;
    private _frameIndex;
    private _total;
    /**
     * 控制一个对象，从当前点移动到目标点。
     * @param	target		要控制的对象。
     * @param	props		要控制对象的属性。
     * @param	duration	对象TWEEN的时间。
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    static to(target: any, props: any, duration: number, ease?: Function, offset?: number): TimeLine;
    /**
     * 从 props 属性，缓动到当前状态。
     * @param	target		target 目标对象(即将更改属性值的对象)
     * @param	props		要控制对象的属性
     * @param	duration	对象TWEEN的时间
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）
     */
    static from(target: any, props: any, duration: number, ease?: Function, offset?: number): TimeLine;
    /**
     * 控制一个对象，从当前点移动到目标点。
     * @param	target		要控制的对象。
     * @param	props		要控制对象的属性。
     * @param	duration	对象TWEEN的时间。
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）。
     */
    to(target: any, props: any, duration: number, ease?: Function, offset?: number): TimeLine;
    /**
     * 从 props 属性，缓动到当前状态。
     * @param	target		target 目标对象(即将更改属性值的对象)
     * @param	props		要控制对象的属性
     * @param	duration	对象TWEEN的时间
     * @param	ease		缓动类型
     * @param	offset		相对于上一个对象，偏移多长时间（单位：毫秒）
     */
    from(target: any, props: any, duration: number, ease?: Function, offset?: number): TimeLine;
    /** @private */
    private _create;
    /**
     * 在时间队列中加入一个标签。
     * @param	label	标签名称。
     * @param	offset	标签相对于上个动画的偏移时间(单位：毫秒)。
     */
    addLabel(label: string, offset: number): TimeLine;
    /**
     * 移除指定的标签
     * @param	label
     */
    removeLabel(label: string): void;
    /**
     * 动画从整个动画的某一时间开始。
     * @param	time(单位：毫秒)。
     */
    gotoTime(time: number): void;
    /**
     * 从指定的标签开始播。
     * @param	Label 标签名。
     */
    gotoLabel(Label: string): void;
    /**
     * 暂停整个动画。
     */
    pause(): void;
    /**
     * 恢复暂停动画的播放。
     */
    resume(): void;
    /**
     * 播放动画。
     * @param	timeOrLabel 开启播放的时间点或标签名。
     * @param	loop 是否循环播放。
     */
    play(timeOrLabel?: any, loop?: boolean): void;
    /**
     * 更新当前动画。
     */
    private _update;
    /**
     * 指定的动画索引处的动画播放完成后，把此动画从列表中删除。
     * @param	index
     */
    private _animComplete;
    /** @private */
    private _complete;
    /**
     * @private
     * 得到帧索引
     */
    /**
    * @private
    * 设置帧索引
    */
    index: number;
    /**
     * 得到总帧数。
     */
    readonly total: number;
    /**
     * 重置所有对象，复用对象的时候使用。
     */
    reset(): void;
    /**
     * 彻底销毁此对象。
     */
    destroy(): void;
}
