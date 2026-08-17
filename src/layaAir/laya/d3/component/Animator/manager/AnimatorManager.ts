import { IElementComponentManager } from "../../../../components/IScenceComponentManager";
import { AnimatorUpdateMode } from "../../../../components/AnimatorUpdateMode";
import { NodeFlags } from "../../../../Const";
import { Stat } from "../../../../utils/Stat";
import { AnimationEvent } from "../../../animation/AnimationEvent";
import { Scene3D } from "../../../core/scene/Scene3D";
import { Animator } from "../Animator";
import { AnimatorControllerLayer } from "../AnimatorControllerLayer";
import { AnimatorPlayState } from "../AnimatorPlayState";
import { AnimatorState } from "../AnimatorState";
import { AnimatorTransition } from "../AnimatorTransition";
import { IAnimatorFactory } from "../factory/IAnimatorFactory";
import { WebAnimatorFactory } from "../factory/web/WebAnimatorFactory";

/** Cross-fade 完成时需要延迟到回写之后处理的状态切换。 */
interface PendingSwitch {
    controllerLayer: AnimatorControllerLayer;
    fromState: AnimatorState;
    toState: AnimatorState;
    playStateInfo: AnimatorPlayState;
    crossPlayStateInfo: AnimatorPlayState;
}

/**
 * Scene3D 级 Animator 管理器。
 *
 * 每帧分两阶段：
 *   阶段 1 — `tickOne` 推进状态机（time / transition / event）并把本帧 layer 任务提交到工厂的 TaskSlot；
 *           slot 内部做脏判定 + 维护 activeList / dirtyList。
 *   阶段 2 — `factory.flushEvaluate` + `factory.flushApply` 批处理；
 *           `drainPendingSwitches` 处理 cross-fade 完成的状态切换通知；
 *           最后 invoke 所有 animator 的 `_LateUpdateEvents`（transition 触发的 crossFade）。
 *
 * 工厂实例 per-AnimatorManager（即 per-Scene3D）。Native 启动序列覆盖
 * `AnimatorManager.factoryCreator = () => new RTAnimatorFactory()` 以注入 Native 后端。
 */
export class AnimatorManager implements IElementComponentManager {

    static __managerName: string = "AnimatorManager";

    /**
     * 工厂注入点：Native 启动序列覆盖。
     *
     * **必须在 `Laya.init` 之前覆盖，且只覆盖一次** —— Scene3D 创建时同步实例化 AnimatorManager 并锁定工厂，
     * 之后覆盖对已有 scene 无效。多 scene 场景下所有 scene 共享同一种工厂（不支持 per-scene 不同后端）。
     */
    static factoryCreator: () => IAnimatorFactory = () => new WebAnimatorFactory();

    name: string = AnimatorManager.__managerName;

    /** @internal */
    _factory: IAnimatorFactory;

    private _activeAnimators: Animator[] = [];
    private _pendingSwitches: PendingSwitch[] = [];

    constructor() {
        this._factory = AnimatorManager.factoryCreator();
    }

    Init(_data: any): void { }

    update(_dt: number): void {
        // ── 阶段1：状态机更新（tickOne 循环）──
        const list = this._activeAnimators;
        for (let i = 0, n = list.length; i < n; i++) {
            this.tickOne(list[i]);
        }

        // ── 阶段2：曲线解析（采样）──
        this._factory.flushEvaluate();

        // ── 阶段3：数据回写（各后端自行管理 Transform 批次与事件时序）──
        this._factory.flushApply();

        // 收尾（crossFade 切换 / LateUpdate 事件）归入状态机阶段
        this._drainPendingSwitches();
        this._drainLateUpdates(list);
    }

    /** @internal */
    addAnimator(animator: Animator): void {
        if (this._activeAnimators.indexOf(animator) === -1) {
            this._activeAnimators.push(animator);
        }
    }

    /** @internal */
    removeAnimator(animator: Animator): void {
        const idx = this._activeAnimators.indexOf(animator);
        if (idx >= 0) {
            this._activeAnimators.splice(idx, 1);
        }
    }

    destroy(): void {
        this._activeAnimators.length = 0;
        this._pendingSwitches.length = 0;
        this._factory.destroy();
    }

    /**
     * 单个 Animator 的逐帧推进。
     * 步骤：
     *   1) 取 delta 并按 updateMode 调整（LowFrame 抽帧 / UnScaleTime 等）；
     *   2) speed=0 / delta=0 / Stat 关闭 → 全 layer 置 Idle 并提前返回；
     *   3) bump slot._updateMark（applier 同帧多 layer 合并要用）；
     *   4) 遍历 controllerLayers：disable 或 sleep+finished+playType==0 → Idle；
     *      否则按 _playType 分派给 _tickPlayTypeNormal / Cross / FixedCross。
     */
    tickOne(animator: Animator): void {
        const slot = animator._taskSlot!;
        const scene = animator.owner._scene;
        const timer = scene.timer;
        let delta = timer.delta / 1000.0;
        delta = this._applyUpdateMode(animator, delta);
        if (animator._speed === 0 || delta === 0 || !Stat.enableAnimatorUpdate) {
            slot.submitAllIdle();
            return;
        }

        slot._updateMark++;
        const layers = animator._controllerLayers;

        for (let i = 0, n = layers.length; i < n; i++) {
            const controllerLayer: AnimatorControllerLayer = layers[i];
            if (!controllerLayer.enable) {
                slot.submitLayerIdle(i);
                continue;
            }
            const playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
            if (animator.sleep && playStateInfo._finish && controllerLayer._playType == 0) {
                slot.submitLayerIdle(i);
                continue;
            }
            const crossPlayStateInfo: AnimatorPlayState = controllerLayer._crossPlayStateInfo!;

            switch (controllerLayer._playType) {
                case 0:
                    this._tickPlayTypeNormal(animator, controllerLayer, playStateInfo, delta, i);
                    break;
                case 1:
                    this._tickPlayTypeCross(animator, controllerLayer, playStateInfo, crossPlayStateInfo, delta, i);
                    break;
                case 2:
                    this._tickPlayTypeFixedCross(animator, controllerLayer, playStateInfo, crossPlayStateInfo, delta, i);
                    break;
            }
        }
    }

    /**
     * playType=0：正常播放一个 state。
     * 步骤：state 已 finish → 触发 transition 判定（可能引发 LateUpdate crossFade）；未 finish → _updatePlayer
     * 推 time + event + state-finish 事件；提交 Normal layer 任务。
     */
    private _tickPlayTypeNormal(
        animator: Animator,
        controllerLayer: AnimatorControllerLayer,
        playStateInfo: AnimatorPlayState,
        delta: number,
        layerIdx: number
    ): void {
        const slot = animator._taskSlot!;
        const weight = controllerLayer.defaultWeight;
        const animatorState = playStateInfo.currentState!;
        const speed = animator._speed * animatorState.speed;
        const finish = playStateInfo._finish;
        if (finish) {
            this._applyTransition(animator, animatorState, layerIdx, animatorState._eventtransition(playStateInfo._normalizedPlayTime, animator.animatorParams));
        } else {
            this._updatePlayer(animator, animatorState, playStateInfo, delta * speed, animatorState.islooping, layerIdx);
        }
        slot.submitLayerNormal(layerIdx, animatorState, playStateInfo, weight);
        if (!finish) {
            this._updateEventScript(animator, animatorState, playStateInfo);
            this._updateStateFinish(animatorState, playStateInfo);
        }
    }

    /**
     * playType=1：动态交叉融合（cross）。
     * 步骤：按 crossDuration 推 destState 的 time；算 crossWeight；
     *   - crossWeight ≥ 1 → 提交为完成态 Normal layer + 入 pendingSwitches 等 flush 后切换；
     *   - 否则 src 还未 finish 也要推 src 的 time；提交 Cross layer 任务；
     * 末尾刷新两个 state 的 event / state-finish。
     */
    private _tickPlayTypeCross(
        animator: Animator,
        controllerLayer: AnimatorControllerLayer,
        playStateInfo: AnimatorPlayState,
        crossPlayStateInfo: AnimatorPlayState,
        delta: number,
        layerIdx: number
    ): void {
        const slot = animator._taskSlot!;
        const weight = controllerLayer.defaultWeight;
        const animatorState = playStateInfo.currentState!;
        const crossState = controllerLayer._crossPlayState;
        const crossClip = crossState._clip!;
        const crossDuration = controllerLayer._crossDuration;
        const startPlayTime = crossPlayStateInfo._startPlayTime;
        const crossClipDuration = crossClip._duration - startPlayTime;
        const crossScale = (crossDuration > crossClipDuration && 0 != crossClipDuration) ? crossClipDuration / crossDuration : 1.0;
        const crossSpeed = animator._speed * crossState.speed;
        this._updatePlayer(animator, crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossClip.islooping, layerIdx);

        const crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuration;
        let needUpdateFinishCurrentState = false;
        if (crossWeight >= 1.0) {
            slot.submitLayerNormal(layerIdx, crossState, crossPlayStateInfo, weight);
            this._pendingSwitches.push({
                controllerLayer,
                fromState: animatorState,
                toState: crossState,
                playStateInfo,
                crossPlayStateInfo,
            });
        } else {
            if (!playStateInfo._finish) {
                const speed = animator._speed * animatorState.speed;
                needUpdateFinishCurrentState = true;
                this._updatePlayer(animator, animatorState, playStateInfo, delta * speed, animatorState.islooping, layerIdx);
            }
            slot.submitLayerCross(layerIdx, animatorState, playStateInfo, crossState, crossPlayStateInfo, crossWeight);
        }
        this._updateEventScript(animator, animatorState, playStateInfo);
        this._updateEventScript(animator, crossState, crossPlayStateInfo);
        this._updateStateFinish(crossState, crossPlayStateInfo);
        needUpdateFinishCurrentState && this._updateStateFinish(playStateInfo.currentState!, playStateInfo);
    }

    /**
     * playType=2：固定交叉融合（fixed-cross，src 取 owner.crossFixedValue）。
     * 步骤：按 crossDuration 推 destState 的 time；算 crossWeight；
     *   - crossWeight ≥ 1 → 提交完成态 Normal layer（weight 强制 1.0，非 controllerLayer.defaultWeight）+ 入 pendingSwitches；
     *   - 否则提交 FixedCross layer 任务；
     * 末尾刷新 destState 的 event / state-finish。
     */
    private _tickPlayTypeFixedCross(
        animator: Animator,
        controllerLayer: AnimatorControllerLayer,
        playStateInfo: AnimatorPlayState,
        crossPlayStateInfo: AnimatorPlayState,
        delta: number,
        layerIdx: number
    ): void {
        const slot = animator._taskSlot!;
        const animatorState = playStateInfo.currentState!;
        const crossState = controllerLayer._crossPlayState;
        const crossClip = crossState._clip!;
        const crossDuration = controllerLayer._crossDuration;
        const startPlayTime = crossPlayStateInfo._startPlayTime;
        const crossClipDuration = crossClip._duration - startPlayTime;
        const crossScale = crossDuration > crossClipDuration ? crossClipDuration / crossDuration : 1.0;
        const crossSpeed = animator._speed * crossState.speed;
        this._updatePlayer(animator, crossState, crossPlayStateInfo, delta * crossScale * crossSpeed, crossState.islooping, layerIdx);

        const crossWeight = ((crossPlayStateInfo._elapsedTime - startPlayTime) / crossScale) / crossDuration;
        if (crossWeight >= 1.0) {
            slot.submitLayerNormal(layerIdx, crossState, crossPlayStateInfo, 1.0);
            this._pendingSwitches.push({
                controllerLayer,
                fromState: animatorState,
                toState: crossState,
                playStateInfo,
                crossPlayStateInfo,
            });
        } else {
            slot.submitLayerFixedCross(layerIdx, crossState, crossPlayStateInfo, crossWeight);
        }
        this._updateEventScript(animator, crossState, crossPlayStateInfo);
        this._updateStateFinish(crossState, crossPlayStateInfo);
    }

    private _drainPendingSwitches(): void {
        const list = this._pendingSwitches;
        for (let i = 0, n = list.length; i < n; i++) {
            const s = list[i];
            s.controllerLayer._playType = 0;
            s.playStateInfo.currentState = s.toState;
            if (s.fromState) s.fromState._eventSwitch(s.toState);
            s.crossPlayStateInfo._cloneTo(s.playStateInfo);
        }
        list.length = 0;
    }

    private _drainLateUpdates(animators: ReadonlyArray<Animator>): void {
        for (let i = 0, n = animators.length; i < n; i++) {
            const a = animators[i];
            a._LateUpdateEvents.invoke();
            a._LateUpdateEvents.clear();
        }
    }

    private _applyUpdateMode(animator: Animator, delta: number): number {
        switch (animator._updateMode) {
            case AnimatorUpdateMode.Normal:
                return delta;
            case AnimatorUpdateMode.LowFrame:
                return (Stat.loopCount % animator._lowUpdateDelty == 0) ? delta * animator._lowUpdateDelty : 0;
            case AnimatorUpdateMode.UnScaleTime:
                return 0;
        }
        return delta;
    }

    private _updatePlayer(animator: Animator, animatorState: AnimatorState, playState: AnimatorPlayState, elapsedTime: number, islooping: boolean, layerIndex: number): void {
        const clipDuration: number = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
        const lastElapsedTime: number = playState._elapsedTime;
        const elapsedPlaybackTime: number = lastElapsedTime + elapsedTime;
        playState._lastElapsedTime = lastElapsedTime;
        playState._elapsedTime = elapsedPlaybackTime;
        const normalizedTime: number = elapsedPlaybackTime / clipDuration;
        playState._normalizedTime = normalizedTime;
        const playTime: number = normalizedTime % 1.0;
        const normalizedPlayTime = playTime < 0 ? playTime + 1.0 : playTime;
        playState._normalizedPlayTime = normalizedPlayTime;
        playState._duration = clipDuration;
        if (elapsedPlaybackTime >= clipDuration) {
            if (!islooping) {
                playState._finish = true;
                playState._elapsedTime = clipDuration;
                playState._normalizedPlayTime = animatorState.clipEnd;
            } else {
                const loopNum = Math.floor(elapsedPlaybackTime / clipDuration);
                const pLoopNum = Math.floor(lastElapsedTime / clipDuration);
                if (pLoopNum != loopNum) {
                    // 仅 additive layer 需要按圈刷新叠加基准；override（单层/多层）回写时不读 defaultValue，
                    // 跳过可省下大量 owner 遍历与 native 跨界（大量循环动画时尤为明显）。
                    if (animator._controllerLayers[layerIndex].blendingMode === AnimatorControllerLayer.BLENDINGMODE_ADDTIVE) {
                        this._factory.updateDefaultValues(animator._keyframeNodeOwners);
                    }
                    animatorState._eventLoop();
                }
            }
        }

        (!playState._finish) && animatorState._eventStateUpdate(playState._normalizedPlayTime);
        this._applyTransition(animator, animatorState, layerIndex, animatorState._eventtransition(playState._normalizedPlayTime, animator.animatorParams));
    }

    private _applyTransition(animator: Animator, state: AnimatorState, layerIndex: number, transition: AnimatorTransition): void {
        if (!transition) {
            if (state.curTransition)
                state.curTransition = null;
            return;
        }
        if (transition == state.curTransition)
            return;
        state.curTransition = transition;
        animator._LateUpdateEvents.add(animator.crossFade, animator, [transition.destState.name, transition.transduration, layerIndex, transition.transstartoffset]);
    }

    private _updateStateFinish(animatorState: AnimatorState, playState: AnimatorPlayState): void {
        if (playState._finish) {
            animatorState._eventExit();
        }
    }

    private _updateEventScript(animator: Animator, stateInfo: AnimatorState, playStateInfo: AnimatorPlayState): void {
        if (!animator.owner._getBit(NodeFlags.HAS_SCRIPT))
            return;

        const clip = stateInfo._clip!;
        const events = clip._animationEvents;
        if (!events || 0 == events.length || null == playStateInfo.animatorState) return;
        const clipDuration = playStateInfo._duration;
        const time = playStateInfo.animatorState.clipStart * clipDuration + playStateInfo._normalizedPlayTime * clipDuration;
        let parentPlayTime = playStateInfo._parentPlayTime;
        if (null == parentPlayTime) {
            parentPlayTime = clipDuration * playStateInfo.animatorState.clipStart;
        }
        if (time < parentPlayTime) {
            this._eventScript(animator, events, parentPlayTime, clipDuration * playStateInfo.animatorState.clipEnd);
            parentPlayTime = clipDuration * playStateInfo.animatorState.clipStart;
        }
        this._eventScript(animator, events, parentPlayTime, time);
        playStateInfo._parentPlayTime = time;
    }

    private _eventScript(animator: Animator, events: AnimationEvent[], parentPlayTime: number, currPlayTime: number): void {
        const scripts = animator.owner.components;
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            if (e.time > parentPlayTime && e.time <= currPlayTime) {
                for (let j = 0, m = scripts.length; j < m; j++) {
                    const script = scripts[j];
                    if (script._isScript()) {
                        const fun = (script as unknown as { [key: string]: Function | undefined })[e.eventName];
                        (fun) && (fun.apply(script, e.params));
                    }
                }
            } else if (e.time > currPlayTime) {
                break;
            }
        }
    }
}

Scene3D.regManager(AnimatorManager.__managerName, AnimatorManager);
