import { Animator2DBase } from "./Animator2DBase";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimationClip2D } from "./AnimationClip2D";

/**
 * @en 2D animator component that plays a single AnimationClip2D directly, without a state machine.
 * @zh 直接播放单个 2D 动画片段的组件，无需状态机。
 */
export class AnimatorClip2D extends Animator2DBase {
    /**@internal */
    private _clip: AnimationClip2D | null = null;
    /**@internal */
    private _playStateInfo: AnimatorPlayState2D = new AnimatorPlayState2D();
    /**@internal 用于复用的单 clip 状态，与 Animator2D 共用 _updateClipDatas 等逻辑 */
    private _clipState: AnimatorState2D = new AnimatorState2D();
    /**@internal */
    private _defaultWeight: number = 1;
    /**@internal */
    private _additive: boolean = false;
    /**@internal */
    private _autoPlay: boolean = true;

    constructor() {
        super();
        this._clipState.name = "ClipState";
        this._clipState.clipStart = 0;
        this._clipState.clipEnd = 1;
        this._playStateInfo._currentState = this._clipState;
    }

    /**
     * @en The animation clip to play.
     * @zh 要播放的动画片段。
     */
    get clip(): AnimationClip2D | null {
        return this._clip;
    }

    set clip(value: AnimationClip2D | null) {
        if (this._clip === value) return;
        if (this._clip) {
            this._clip._removeReference(1);
            this._clipState.clip = null;
        }
        this._clip = value;
        if (value) {
            value._addReference(1);
            this._clipState.clip = value;
            // 切换 clip 时重置播放状态，避免沿用旧 clip 的 elapsedTime/duration 导致错帧
            const clipDuration = value._duration * (this._clipState.clipEnd - this._clipState.clipStart);
            this._playStateInfo._resetPlayState(0, clipDuration);
        }
    }

    /**
     * @en Apply weight when writing to node (default 1).
     * @zh 写入节点时的权重，默认 1。
     */
    get defaultWeight(): number {
        return this._defaultWeight;
    }

    set defaultWeight(v: number) {
        this._defaultWeight = v;
    }

    /**
     * @en Whether to blend additively.
     * @zh 是否叠加混合。
     */
    get additive(): boolean {
        return this._additive;
    }

    set additive(v: boolean) {
        this._additive = v;
    }

    /**
     * @en If true, automatically call play() when the component is enabled and clip is set.
     * @zh 为 true 时，组件启用且已设置 clip 时自动播放。
     */
    get autoPlay(): boolean {
        return this._autoPlay;
    }

    set autoPlay(v: boolean) {
        this._autoPlay = v;
    }

    /**
     * @en Number of loops: -1 use clip's islooping, 0 infinite, 1 once, 2 twice, etc.
     * @zh 循环次数：-1 使用 clip 的 islooping，0 无限，1 一次，2 两次等。
     */
    get loop(): number {
        return this._clipState.loop;
    }

    set loop(v: number) {
        this._clipState.loop = v;
    }

    /**
     * @en Whether to play forward then backward (yoyo).
     * @zh 是否往返播放（先正向后反向）。
     */
    get yoyo(): boolean {
        return this._clipState.yoyo;
    }

    set yoyo(v: boolean) {
        this._clipState.yoyo = v;
    }

    /**
     * @en Play the clip from start or from the given normalized time.
     * @zh 播放片段，可从开头或指定归一化时间开始。
     * @param normalizedTime 0~1, omit to start from 0
     */
    play(normalizedTime?: number): void {
        if (!this._clip) return;
        const clipDuration = this._clip._duration;
        const calclipduration = clipDuration * (this._clipState.clipEnd - this._clipState.clipStart);
        this._updateDefVal();
        const startTime = normalizedTime != null ? clipDuration * normalizedTime : 0;
        this._playStateInfo._resetPlayState(startTime, calclipduration);
        if (normalizedTime != null) {
            this._playStateInfo._normalizedPlayTime = normalizedTime;
        }
        this._isPlaying = true;
        this._clipState._eventStart(this as any, 0);
    }

    /**
     * @en Stop playing.
     * @zh 停止播放。
     */
    stop(): void {
        this._isPlaying = false;
    }

    /**
     * @en Go to the given normalized time and stop.
     * @zh 跳转到指定归一化时间并停止。
     * @param normalizedTime 0~1
     */
    gotoAndStop(normalizedTime: number): void {
        if (!this._clip) return;
        const clipDuration = this._clip._duration;
        const calclipduration = clipDuration * (this._clipState.clipEnd - this._clipState.clipStart);
        this._updateDefVal();
        this._playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
        this._playStateInfo._normalizedPlayTime = normalizedTime;
        this._isPlaying = false;
        this._updateClipDatas(this._clipState, this._additive, this._playStateInfo);
        this._setClipDatasToNode(this._clipState, this._additive, this._defaultWeight);
    }

    /**
     * @en Jump to the given frame and stop.
     * @zh 跳转到指定帧并停止。
     * @param frame Frame index
     */
    gotoAndStopByFrame(frame: number): void {
        if (!this._clip) return;
        const allFrame = this._clip._duration * this._clip._frameRate;
        let normalizedTime = frame / allFrame;
        if (normalizedTime > 1) normalizedTime = 1;
        this.gotoAndStop(normalizedTime);
    }

    onEnable(): void {
        if (this._autoPlay && this._clip) {
            this.play();
        } else
            this._isPlaying = false;
    }

    onUpdate(): void {
        if (!this._isPlaying || !this._clip) return;

        const delta = this.owner.timer.delta / 1000.0;
        const appliedDelta = this._applyUpdateMode(delta);
        if (this.speed === 0 || appliedDelta === 0) return;

        const animatorState = this._clipState;
        const playStateInfo = this._playStateInfo;
        const speed = this.speed * animatorState.speed;
        const finish = playStateInfo._finish;

        let loop = animatorState.loop;
        if (loop <= -1) {
            if (this._clip.islooping) loop = 0;
            else loop = 1;
        }

        const dir = playStateInfo._frontPlay ? 1 : -1;
        const elapsed = appliedDelta * speed * dir;

        if (finish) {
            this._updateStateFinish(animatorState, playStateInfo);
        } else {
            this._updatePlayerTime(animatorState, playStateInfo, elapsed, loop);
        }

        this._updateClipDatas(animatorState, this._additive, playStateInfo);
        if (!finish) {
            this._setClipDatasToNode(animatorState, this._additive, this._defaultWeight);
            this._updateEventScript(animatorState, playStateInfo);
        }
        this._updateStateFinish(animatorState, playStateInfo);
    }

    onDestroy(): void {
        this.clip = null;
        this._playStateInfo._currentState = null;
        this._clipState.destroy();
        super.onDestroy();
    }
}
