/**
 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
 */
export declare class AnimatorPlayState {
    /**@private */
    _finish: boolean;
    /**@private */
    _startPlayTime: number;
    /**@private */
    _lastElapsedTime: number;
    /**@private */
    _elapsedTime: number;
    /**@private */
    _normalizedTime: number;
    /**@private */
    _normalizedPlayTime: number;
    /**@private */
    _duration: number;
    /**@private */
    _playEventIndex: number;
    /**@private */
    _lastIsFront: boolean;
    /**
     * 获取播放状态的归一化时间,整数为循环次数，小数为单次播放时间。
     */
    readonly normalizedTime: number;
    /**
     * 获取当前动画的持续时间，以秒为单位。
     */
    readonly duration: number;
    /**
     * 创建一个 <code>AnimatorPlayState</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    _resetPlayState(startTime: number): void;
    /**
     * @private
     */
    _cloneTo(dest: AnimatorPlayState): void;
}
