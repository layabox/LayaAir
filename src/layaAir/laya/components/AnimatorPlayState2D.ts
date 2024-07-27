import { AnimatorState2D } from "./AnimatorState2D";

/**
 * @en 2D Animator Play State.
 * @zh 2D 动画播放状态。
 */
export class AnimatorPlayState2D {
	_finish: boolean;
	/**@internal */
	_startPlayTime: number;
	/**@internal */
	_lastElapsedTime: number;
	/**
	 * @internal 
	 * @en Animation playback time
	 * @zh 动画播放时间
	 */
	_elapsedTime: number;
	/**
	 * @internal 
	 * @en Playback count
	 * @zh 播放的次数
	 */
	_playNum: number;

	/**
	 * @en Total play time, not affected by negative speed values.
	 * @zh 总播放时间，不受速度为负数的影响。
	 */
	_playAllTime: number;

	/**
	 * @internal
	 * @en Normalized time for a single playback.
	 * @zh 单次播放的归一化时间。
	 */
	_normalizedPlayTime: number;
	/**@internal */
	_duration: number;
	/**
	 * @internal
	 * @en The time of the last playback, used by event events.
	 * @zh 上次播放的时间，用于event事件。
	 */
	_parentPlayTime: number;
	/**@internal */
	_lastIsFront: boolean;
	/**@internal */
	_currentState: AnimatorState2D | null = null;

	/**
	 * @en Indicates if the playback is in forward direction.
	 * @zh 表示播放是否为正向。
	 */
	_frontPlay = true;


	/**
	 * @en The duration of the current animation, in seconds.
	 * @zh 当前动画的持续时间，以秒为单位。
	 */
	get duration(): number {
		return this._duration;
	}

	// checkPlayNext(): Animation2DNext {
	//     var nexts = this._currentState.nexts;
	//     if (nexts) {
	//         for (var i = 0, len = nexts.length; i < len; i++) {
	//             var no = nexts[i];
	//             //TODO 需要检测next的条件
	//             return no;
	//         }
	//     }
	//     return null;
	// }

	/**
	 * @en Animation state machine
	 * @zh 动画状态机。
	 */
	get animatorState(): AnimatorState2D {
		return this._currentState!;
	}

	/**
	 * @en Constructor method of AnimatorPlayState2D class.
	 * @zh AnimatorPlayState2D类的构造方法
	 */
	constructor() {
	}

	/**
	 * @internal
	 */
	_resetPlayState(startTime: number, clipDuration: number): void {
		this._finish = false;
		this._startPlayTime = startTime;
		this._elapsedTime = startTime;
		this._lastIsFront = true;
		this._parentPlayTime = null;
		this._playNum = 0;
		this._playAllTime = 0;
		var playTime = (this._elapsedTime / clipDuration) % 1.0;
		this._normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
		this._frontPlay = true;
	}

	/**
	 * @internal
	 */
	_cloneTo(dest: AnimatorPlayState2D): void {
		dest._finish = this._finish;
		dest._startPlayTime = this._startPlayTime;
		dest._elapsedTime = this._elapsedTime;
		dest._playNum = this._playNum;
		dest._parentPlayTime = this._parentPlayTime;
		dest._normalizedPlayTime = this._normalizedPlayTime;
		dest._lastIsFront = this._lastIsFront;
		dest._frontPlay = this._frontPlay;
		dest._playAllTime = this._playAllTime;
	}

}