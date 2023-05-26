import { AnimatorState2D } from "./AnimatorState2D";

export class AnimatorPlayState2D {
	_finish: boolean;
	/**@internal */
	_startPlayTime: number;
	/**@internal */
	_lastElapsedTime: number;
	/**@internal 动画播放时间*/
	_elapsedTime: number;
	/**@internal 播放的次数*/
	_playNum: number;

	/**播放总时间，不受speed为负数的影响 */
	_playAllTime: number;

	/**@internal 单词播放归一化时间 */
	_normalizedPlayTime: number;
	/**@internal */
	_duration: number;
	/**@internal 上次播放的时间，event事件使用*/
	_parentPlayTime: number;
	/**@internal */
	_lastIsFront: boolean;
	/**@internal */
	_currentState: AnimatorState2D | null = null;

	/**是为正向播放 */
	_frontPlay = true;


	/**
	 * 当前动画的持续时间，以秒为单位。
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
	 * 动画状态机。
	 */
	get animatorState(): AnimatorState2D {
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
	_resetPlayState(startTime: number, clipDuration: number): void {
		this._finish = false;
		this._startPlayTime = startTime;
		this._elapsedTime = startTime;
		this._lastIsFront = true;
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
		dest._normalizedPlayTime = this._normalizedPlayTime;
		dest._lastIsFront = this._lastIsFront;
		dest._frontPlay = this._frontPlay;
		dest._playAllTime = this._playAllTime;
	}

}