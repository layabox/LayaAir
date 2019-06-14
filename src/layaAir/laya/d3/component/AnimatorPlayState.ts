/**
 * <code>AnimatorPlayState</code> 类用于创建动画播放状态信息。
 */
export class AnimatorPlayState {
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
	get normalizedTime(): number {
		return this._normalizedTime;
	}

	/**
	 * 获取当前动画的持续时间，以秒为单位。
	 */
	get duration(): number {
		return this._duration;
	}

	/**
	 * 创建一个 <code>AnimatorPlayState</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
	}

	/**
	 * @private
	 */
	_resetPlayState(startTime: number): void {
		this._finish = false;
		this._startPlayTime = startTime;
		this._elapsedTime = startTime;
		this._playEventIndex = 0;
		this._lastIsFront = true;
	}

	/**
	 * @private
	 */
	_cloneTo(dest: AnimatorPlayState): void {
		dest._finish = this._finish;
		dest._startPlayTime = this._startPlayTime;
		dest._elapsedTime = this._elapsedTime;
		dest._playEventIndex = this._playEventIndex;
		dest._lastIsFront = this._lastIsFront;
	}

}


