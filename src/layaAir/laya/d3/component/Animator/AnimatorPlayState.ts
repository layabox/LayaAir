import { AnimatorState } from "./AnimatorState";

/**
 * @en The AnimatorPlayState class is used to create animation play state information.
 * @zh AnimatorPlayState 类用于创建动画播放状态信息。
 */
export class AnimatorPlayState {
	/**@internal */
	_finish: boolean;
	/**@internal */
	_startPlayTime: number;
	/**@internal */
	_lastElapsedTime: number;
	/**@internal 动画播放时间*/
	_elapsedTime: number;
	/**@internal 播放状态的归一化时间,整数为循环次数，小数为单次播放时间。*/
	_normalizedTime: number;
	/**@internal 单词播放归一化时间 */
	_normalizedPlayTime: number;
	/**@internal */
	_duration: number;
	/**@internal 上次播放的时间，event事件使用*/
	_parentPlayTime: number;
	/**@internal */
	_playEventIndex: number;
	/**@internal */
	_lastIsFront: boolean;
	/**@internal */
	private _currentState: AnimatorState | null = null;

	/**
	 * @en The current AnimatorState.
	 * @zh 当前的动画状态。
	 */
	public get currentState(): AnimatorState | null {
		return this._currentState;
	}
	public set currentState(value: AnimatorState | null) {
		this._currentState = value;
		this._currentState.curTransition = null;//清空目前条件判断
	}

	/**
	 * @en The normalized time of the play state. The integer part represents the number of loops, and the fractional part represents the time of a single play.
	 * @returns The normalized time of the animation.
	 * @zh 播放状态的归一化时间。整数部分表示循环次数，小数部分表示单次播放时间。
	 * @returns 动画的归一化时间。
	 */
	get normalizedTime(): number {
		return this._normalizedTime;
	}

	/**
	 * @en The duration of the current animation in seconds.
	 * @zh 当前动画的持续时间，以秒为单位。
	 */
	get duration(): number {
		return this._duration;
	}

	/**
	 * @en The current animator state.
	 * @zh 当前的动画状态机。
	 */
	get animatorState(): AnimatorState {
		return this._currentState!;
	}

	/**
	 * @en constructor
	 * @zh 构造函数
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	_resetPlayState(startTime: number, clipDuration: number): void {
		this._finish = false;
		this._playEventIndex = 0;
		this._startPlayTime = startTime;
		this._elapsedTime = startTime;
		this._lastIsFront = true;
		this._normalizedTime = this._elapsedTime / clipDuration;
		var playTime = this._normalizedTime % 1.0;
		this._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
	}

	/**
	 * @internal
	 */
	_cloneTo(dest: AnimatorPlayState): void {
		dest._finish = this._finish;
		dest._startPlayTime = this._startPlayTime;
		dest._playEventIndex = this._playEventIndex;
		dest._elapsedTime = this._elapsedTime;
		dest._normalizedTime = this._normalizedTime;
		dest._normalizedPlayTime = this._normalizedPlayTime;
		dest._lastIsFront = this._lastIsFront;
	}

}


