import { AnimatorState } from "./AnimatorState";

/**
 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
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
	/**@internal */
	_playEventIndex: number;
	/**@internal */
	_lastIsFront: boolean;
	/**@internal */
	_currentState: AnimatorState|null = null;

	/**
	 * 播放状态的归一化时间,整数为循环次数，小数为单次播放时间。
	 */
	get normalizedTime(): number {
		return this._normalizedTime;
	}

	/**
	 * 当前动画的持续时间，以秒为单位。
	 */
	get duration(): number {
		return this._duration;
	}

	/**
	 * 动画状态机。
	 */
	get animatorState(): AnimatorState {
		return this._currentState!;
	}

	/**
	 * 创建一个 <code>AnimatorPlayState</code> 实例。
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	_resetPlayState(startTime: number,clipDuration:number): void {
		this._finish = false;
		this._startPlayTime = startTime;
		this._elapsedTime = startTime;
		this._playEventIndex = 0;
		this._lastIsFront = true;
		this._normalizedTime = this._elapsedTime/clipDuration;
		var playTime = this._normalizedTime % 1.0;
		this._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
	}

	/**
	 * @internal
	 */
	_cloneTo(dest: AnimatorPlayState): void {
		dest._finish = this._finish;
		dest._startPlayTime = this._startPlayTime;
		dest._elapsedTime = this._elapsedTime;
		dest._normalizedTime = this._normalizedTime;
		dest._normalizedPlayTime = this._normalizedPlayTime;
		dest._playEventIndex = this._playEventIndex;
		dest._lastIsFront = this._lastIsFront;
	}

}


