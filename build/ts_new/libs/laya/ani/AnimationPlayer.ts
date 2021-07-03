import { AnimationTemplet } from "./AnimationTemplet";
import { AnimationState } from "./AnimationState";
import { Stat } from "../utils/Stat";
import { Event } from "../events/Event";
import { IDestroy } from "../resource/IDestroy";
import { EventDispatcher } from "../events/EventDispatcher";


/**开始播放时调度。
 * @eventType Event.PLAYED
 * */
/*[Event(name = "played", type = "laya.events.Event")]*/
/**暂停时调度。
 * @eventType Event.PAUSED
 * */
/*[Event(name = "paused", type = "laya.events.Event")]*/
/**完成一次循环时调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event")]*/
/**停止时调度。
 * @eventType Event.STOPPED
 * */
/*[Event(name = "stopped", type = "laya.events.Event")]*/

/**
 * <code>AnimationPlayer</code> 类用于动画播放器。
 */
export class AnimationPlayer extends EventDispatcher implements IDestroy {
	/**@internal */
	private _destroyed: boolean;
	/** @internal 数据模板*/
	private _templet: AnimationTemplet;
	/** @internal 当前精确时间，不包括重播时间*/
	private _currentTime: number;
	/** @internal 当前帧时间，不包括重播时间*/
	private _currentFrameTime: number;	// 这个是根据当前帧数反向计算的时间。
	/** @internal 动画播放的起始时间位置*/
	private _playStart: number;
	/** @internal 动画播放的结束时间位置*/
	private _playEnd: number;
	/** @internal 动画播放一次的总时间*/
	private _playDuration: number;
	/** @internal 动画播放总时间*/
	private _overallDuration: number;
	/** @internal 是否在一次动画结束时停止。 设置这个标志后就不会再发送complete事件了*/
	private _stopWhenCircleFinish: boolean;
	/**@internal 已播放时间，包括重播时间*/
	_elapsedPlaybackTime: number;
	/** @internal 播放时帧数*/
	private _startUpdateLoopCount: number;
	/** @internal 当前动画索引*/
	private _currentAnimationClipIndex: number;
	/** @internal 当前帧数*/
	private _currentKeyframeIndex: number;
	/** @internal 是否暂停*/
	private _paused: boolean;
	/** @internal 默认帧率,必须大于0*/
	private _cacheFrameRate: number;
	/** @internal 帧率间隔时间*/
	private _cacheFrameRateInterval: number;
	/** @internal 缓存播放速率*/
	private _cachePlayRate: number;

	/**是否缓存*/
	isCache: boolean = true;
	/** 播放速率*/
	playbackRate: number = 1.0;
	/** 停止时是否归零*/
	returnToZeroStopped: boolean;

	/**
	 * 获取动画数据模板
	 * @param	value 动画数据模板
	 */
	get templet(): AnimationTemplet {
		return this._templet;
	}

	/**
	 * 设置动画数据模板,注意：修改此值会有计算开销。
	 * @param	value 动画数据模板
	 */
	set templet(value: AnimationTemplet) {
		if (!(this.state === AnimationState.stopped))
			this.stop(true);

		if (this._templet !== value) {
			this._templet = value;
			//if (value.loaded)
			this._computeFullKeyframeIndices();
			//else
			//value.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, _cacheFrameRate]);
		}
	}

	/**
	 * 动画播放的起始时间位置。
	 * @return	 起始时间位置。
	 */
	get playStart(): number {
		return this._playStart;
	}

	/**
	 * 动画播放的结束时间位置。
	 * @return	 结束时间位置。
	 */
	get playEnd(): number {
		return this._playEnd;
	}

	/**
	 * 获取动画播放一次的总时间
	 * @return	 动画播放一次的总时间
	 */
	get playDuration(): number {
		return this._playDuration;
	}

	/**
	 * 获取动画播放的总总时间
	 * @return	 动画播放的总时间
	 */
	get overallDuration(): number {
		return this._overallDuration;
	}

	/**
	 * 获取当前动画索引
	 * @return	value 当前动画索引
	 */
	get currentAnimationClipIndex(): number {
		return this._currentAnimationClipIndex;
	}

	/**
	 * 获取当前帧数
	 * @return	 当前帧数
	 */
	get currentKeyframeIndex(): number {
		return this._currentKeyframeIndex;
	}

	/**
	 *  获取当前精确时间，不包括重播时间
	 * @return	value 当前时间
	 */
	get currentPlayTime(): number {
		return this._currentTime + this._playStart;
	}

	/**
	 *  获取当前帧时间，不包括重播时间
	 * @return	value 当前时间
	 */
	get currentFrameTime(): number {
		return this._currentFrameTime;
	}

	/**
	 *  获取缓存播放速率。*
	 * @return	 缓存播放速率。
	 */
	get cachePlayRate(): number {
		return this._cachePlayRate;
	}

	/**
	 *  设置缓存播放速率,默认值为1.0,注意：修改此值会有计算开销。*
	 * @return	value 缓存播放速率。
	 */
	set cachePlayRate(value: number) {
		if (this._cachePlayRate !== value) {
			this._cachePlayRate = value;
			if (this._templet)
				//if (_templet.loaded)
				this._computeFullKeyframeIndices();
			//else
			//_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [value, _cacheFrameRate]);
		}
	}

	/**
	 *  获取默认帧率*
	 * @return	value 默认帧率
	 */
	get cacheFrameRate(): number {
		return this._cacheFrameRate;
	}

	/**
	 *  设置默认帧率,每秒60帧,注意：修改此值会有计算开销。*
	 * @return	value 缓存帧率
	 */
	set cacheFrameRate(value: number) {
		if (this._cacheFrameRate !== value) {
			this._cacheFrameRate = value;
			this._cacheFrameRateInterval = 1000.0 / this._cacheFrameRate;
			if (this._templet)
				//if (_templet.loaded)
				this._computeFullKeyframeIndices();
			//else
			//_templet.once(Event.LOADED, this, _onTempletLoadedComputeFullKeyframeIndices, [_cachePlayRate, value]);
		}
	}

	/**
	 * 设置当前播放位置
	 * @param	value 当前时间
	 */
	set currentTime(value: number) {
		if (this._currentAnimationClipIndex === -1 || !this._templet /*|| !_templet.loaded*/)
			return;

		if (value < this._playStart || value > this._playEnd)
			throw new Error("AnimationPlayer:value must large than playStartTime,small than playEndTime.");

		this._startUpdateLoopCount = Stat.loopCount;
		var cacheFrameInterval: number = this._cacheFrameRateInterval * this._cachePlayRate;
		this._currentTime = value /*% playDuration*/;
		this._currentKeyframeIndex = Math.floor(this.currentPlayTime / cacheFrameInterval);
		this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
	}

	/**
	 * 获取当前是否暂停
	 * @return	是否暂停
	 */
	get paused(): boolean {
		return this._paused;
	}

	/**
	 * 设置是否暂停
	 * @param	value 是否暂停
	 */
	set paused(value: boolean) {
		this._paused = value;
		value && this.event(Event.PAUSED);
	}

	/**
	 * 获取缓存帧率间隔时间
	 * @return	缓存帧率间隔时间
	 */
	get cacheFrameRateInterval(): number {
		return this._cacheFrameRateInterval;
	}

	/**
	 * 获取当前播放状态
	 * @return	当前播放状态
	 */
	get state(): number {
		if (this._currentAnimationClipIndex === -1)
			return AnimationState.stopped;
		if (this._paused)
			return AnimationState.paused;
		return AnimationState.playing;
	}

	/**
	 * 获取是否已销毁。
	 * @return 是否已销毁。
	 */
	get destroyed(): boolean {
		return this._destroyed;
	}

	/**
	 * 创建一个 <code>AnimationPlayer</code> 实例。
	 */
	constructor() {
		super();
		this._destroyed = false;
		this._currentAnimationClipIndex = -1;
		this._currentKeyframeIndex = -1;
		this._currentTime = 0.0;
		this._overallDuration = Number.MAX_VALUE;
		this._stopWhenCircleFinish = false;
		this._elapsedPlaybackTime = 0;
		this._startUpdateLoopCount = -1;
		this._cachePlayRate = 1.0;
		this.cacheFrameRate = 60;
		this.returnToZeroStopped = false;
	}

	/**
	 * @internal
	 */
	_onTempletLoadedComputeFullKeyframeIndices(cachePlayRate: number, cacheFrameRate: number, templet: AnimationTemplet): void {
		if (this._templet === templet && this._cachePlayRate === cachePlayRate && this._cacheFrameRate === cacheFrameRate)
			this._computeFullKeyframeIndices();
	}

	/**
	 * @internal
	 */
	private _computeFullKeyframeIndices(): void {
		return;// 先改成实时计算了。否则占用内存太多
		var templet: AnimationTemplet = this._templet;
		if (templet._fullFrames)
			return;



		var anifullFrames: any[] = this._templet._fullFrames = [];

		var cacheFrameInterval: number = this._cacheFrameRateInterval * this._cachePlayRate;

		for (var i: number = 0, iNum: number = templet.getAnimationCount(); i < iNum; i++) {
			var aniFullFrame: any[] = [];
			if (!templet.getAnimation(i).nodes) {
				anifullFrames.push(aniFullFrame);
				continue;
			}
			for (var j: number = 0, jNum: number = templet.getAnimation(i).nodes.length; j < jNum; j++) {
				var node: any = templet.getAnimation(i).nodes[j];
				var frameCount: number = Math.round(node.playTime / cacheFrameInterval);
				var nodeFullFrames: Uint16Array = new Uint16Array(frameCount + 1);//本骨骼对应的全帧关键帧编号
				// 先把关键帧所在的位置填上
				var stidx: number = -1;// 第一帧的位置，应该是0
				var nodeframes: any[] = node.keyFrame;
				for (var n: number = 0, nNum: number = nodeframes.length; n < nNum; n++) {
					var keyFrame: any = nodeframes[n];
					var pos: number = Math.round(keyFrame.startTime / cacheFrameInterval);
					if (stidx < 0 && pos > 0) {
						stidx = pos;
					}
					if (pos <= frameCount) {// 实际大小是frameCount+1
						nodeFullFrames[pos] = n;
					}
				}
				// 再把空隙填满
				var cf: number = 0;
				for (n = stidx; n < frameCount; n++) {	// 实际大小是frameCount+1 
					if (nodeFullFrames[n] == 0) {
						nodeFullFrames[n] = cf;
					} else {
						cf = nodeFullFrames[n]; 	// 新的开始
					}
				}
				aniFullFrame.push(nodeFullFrames);
			}
			anifullFrames.push(aniFullFrame);
		}
	}

	/**
	 * @internal
	 */
	private _onAnimationTempletLoaded(): void {
		(this.destroyed) || (this._calculatePlayDuration());
	}

	/**
	 * @internal
	 */
	private _calculatePlayDuration(): void {
		if (this.state !== AnimationState.stopped) {//防止动画已停止，异步回调导致BUG
			var oriDuration: number = this._templet.getAniDuration(this._currentAnimationClipIndex);
			(this._playEnd === 0) && (this._playEnd = oriDuration);

			if (this._playEnd > oriDuration)//以毫秒为最小时间单位,取整。FillTextureSprite
				this._playEnd = oriDuration;

			this._playDuration = this._playEnd - this._playStart;
		}
	}

	/**
	 * @private
	 */
	private _setPlayParams(time: number, cacheFrameInterval: number): void {
		this._currentTime = time;
		this._currentKeyframeIndex = Math.floor((this.currentPlayTime) / cacheFrameInterval + 0.01);
		this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
	}

	/**
	 * 动画停止了对应的参数。目前都是设置时间为最后
	 * @private
	 */
	private _setPlayParamsWhenStop(currentAniClipPlayDuration: number, cacheFrameInterval: number, playEnd: number = -1): void {
		this._currentTime = currentAniClipPlayDuration;
		var endTime: number = playEnd > 0 ? playEnd : currentAniClipPlayDuration;
		this._currentKeyframeIndex = Math.floor(endTime / cacheFrameInterval + 0.01);
		this._currentKeyframeIndex = Math.floor(currentAniClipPlayDuration / cacheFrameInterval + 0.01);
		this._currentFrameTime = this._currentKeyframeIndex * cacheFrameInterval;
		this._currentAnimationClipIndex = -1;//动画结束	
	}

	/**
	 * @internal
	 */
	_update(elapsedTime: number): void {
		if (this._currentAnimationClipIndex === -1 || this._paused || !this._templet /*|| !_templet.loaded*/)//动画停止或暂停，不更新
			return;

		var cacheFrameInterval: number = this._cacheFrameRateInterval * this._cachePlayRate;
		var time: number = 0;	// 时间间隔
		// 计算经过的时间
		(this._startUpdateLoopCount !== Stat.loopCount) && (time = elapsedTime * this.playbackRate, this._elapsedPlaybackTime += time);//elapsedTime为距离上一帧时间,首帧播放如果_startPlayLoopCount===Stat.loopCount，则不累加时间

		var currentAniClipPlayDuration: number = this.playDuration;
		// 如果设置了总播放时间，并且超过总播放时间了，就发送stop事件
		// 如果没有设置_overallDuration，且播放时间超过的动画总时间，也发送stop事件？  也就是说单次播放不会发出complete事件？
		// 如果设置了loop播放，则会设置 _overallDuration 
		time += this._currentTime;
		if ((this._overallDuration !== 0 && this._elapsedPlaybackTime >= this._overallDuration) || (this._overallDuration === 0 && this._elapsedPlaybackTime >= currentAniClipPlayDuration
			|| (this._overallDuration === 0 && time >= this.playEnd))) {
			this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval, this.playEnd);	// (总播放时间,缓存帧的时间间隔(33.33))
			this.event(Event.STOPPED);
			return;
		}
		if (currentAniClipPlayDuration > 0) {// 如果设置了 总动画时间，一般都设置了把，就是动画文件本身记录的时间
			if (time >= currentAniClipPlayDuration) {	// 如果超出了总动画时间
				if (this._stopWhenCircleFinish) {// 如果只播放一次，就发送stop事件
					this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);// (总播放时间,缓存帧的时间间隔(33.33))
					this._stopWhenCircleFinish = false;
					this.event(Event.STOPPED);
					return;
				} else {
					// 如果多次播放,发送complete事件
					time = time % currentAniClipPlayDuration;
					this._setPlayParams(time, cacheFrameInterval);
					this.event(Event.COMPLETE);
					return;
				}
			} else {
				this._setPlayParams(time, cacheFrameInterval);
			}
		} else {
			if (this._stopWhenCircleFinish) {
				this._setPlayParamsWhenStop(currentAniClipPlayDuration, cacheFrameInterval);
				this._stopWhenCircleFinish = false;
				this.event(Event.STOPPED);
				return;
			}
			this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
			this.event(Event.COMPLETE);
		}
	}

	/**
	 * @internal
	 */
	_destroy(): void {
		this.offAll();
		this._templet = null;
		//_fullFrames = null;
		this._destroyed = true;
	}

	/**
	 * 播放动画。
	 * @param	index 动画索引。
	 * @param	playbackRate 播放速率。
	 * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
	 * @param	playStart 播放的起始时间位置。
	 * @param	playEnd 播放的结束时间位置。（0为动画一次循环的最长结束时间位置）。
	 */
	play(index: number = 0, playbackRate: number = 1.0, overallDuration: number = /*int.MAX_VALUE*/ 2147483647, playStart: number = 0, playEnd: number = 0): void {
		if (!this._templet)
			throw new Error("AnimationPlayer:templet must not be null,maybe you need to set url.");

		if (overallDuration < 0 || playStart < 0 || playEnd < 0)
			throw new Error("AnimationPlayer:overallDuration,playStart and playEnd must large than zero.");

		if ((playEnd !== 0) && (playStart > playEnd))
			throw new Error("AnimationPlayer:start must less than end.");

		this._currentTime = 0;
		this._currentFrameTime = 0;
		this._elapsedPlaybackTime = 0;
		this.playbackRate = playbackRate;
		this._overallDuration = overallDuration;
		this._playStart = playStart;
		this._playEnd = playEnd;
		this._paused = false;
		this._currentAnimationClipIndex = index;
		this._currentKeyframeIndex = 0;
		this._startUpdateLoopCount = Stat.loopCount;
		this.event(Event.PLAYED);

		//if (_templet.loaded)
		this._calculatePlayDuration();
		//else
		//_templet.once(Event.LOADED, this, _onAnimationTempletLoaded);

		this._update(0);//如果分段播放,可修正帧率
	}

	/**
	 * 播放动画。
	 * @param	index 动画索引。
	 * @param	playbackRate 播放速率。
	 * @param	duration 播放时长（0为1次,Number.MAX_VALUE为循环播放）。
	 * @param	playStartFrame 播放的原始起始帧率位置。
	 * @param	playEndFrame 播放的原始结束帧率位置。（0为动画一次循环的最长结束时间位置）。
	 */
	playByFrame(index: number = 0, playbackRate: number = 1.0, overallDuration: number = /*int.MAX_VALUE*/ 2147483647, playStartFrame: number = 0, playEndFrame: number = 0, fpsIn3DBuilder: number = 30): void {
		var interval: number = 1000.0 / fpsIn3DBuilder;
		this.play(index, playbackRate, overallDuration, playStartFrame * interval, playEndFrame * interval);
	}

	/**
	 * 停止播放当前动画
	 * 如果不是立即停止就等待动画播放完成后再停止
	 * @param	immediate 是否立即停止
	 */
	stop(immediate: boolean = true): void {
		if (immediate) {
			this._currentTime = this._currentFrameTime = this._currentKeyframeIndex = 0;
			this._currentAnimationClipIndex = -1;
			this.event(Event.STOPPED);
		} else {
			this._stopWhenCircleFinish = true;
		}
	}

	/**
	 * @private
	 */
	destroy(): void {

	}

}

