import { Animator2DBase } from "./Animator2DBase";
import { AnimatorControllerLayer2D } from "./AnimatorControllerLayer2D";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";
import { Animation2DParm } from "./Animation2DParm";
import { AnimatorController2D } from "./AnimatorController2D";
import { AniParmType } from "./AnimatorControllerParse";
import { AnimatorTransition2D } from "./AnimatorTransition2D";
import { Vector3 } from "../maths/Vector3";
import { CurvePath } from "../tween/CurvePath";

type AnimationValue2D = AnimatorState2D["_realtimeDatas"][number];

/**
 * @en 2D animation components
 * @zh 2D动画组件
 */
export class Animator2D extends Animator2DBase {
    /**@internal */
    _parameters: Record<string, Animation2DParm>;
    /**@internal */
    _controllerLayers: AnimatorControllerLayer2D[];
    /**@internal */
    _controller: AnimatorController2D;
    /**@internal */
    _checkEnterIndex: number[];

    /**
     * @en Constructor method of Animator2D Component.
     * @zh 2D动画组件构造方法。
     */
    constructor() {
        super();
        this._controllerLayers = [];
        this._parameters = {};
    }

    /**
     * @en The 2D animation controller.
     * @zh 2D动画控制器。
     */
    get controller() {
        return this._controller;
    }

    set controller(val: AnimatorController2D) {
        if (this._controller)
            this._controller._removeReference();
        this._controller = val;
        if (val) {
            val._addReference();
            val.updateTo(this);
        }
    }

    /**
     * @en The current 2D animation controller.
     * @zh 动画参数
     */
    get parameters() {
        return this._parameters;
    }

    set parameters(val: Record<string, Animation2DParm>) {
        this._parameters = val;
    }

    /**
     * @internal
     * @param parentState 
     * @param currentState 
     */
    private _switchState(parentState: AnimatorState2D, currentState: AnimatorState2D): void {
        if (parentState) {
            parentState._eventSwitch(currentState);
        }
    }

    /**
     * @internal
     */
    private _updatePlayer(animatorState: AnimatorState2D, playState: AnimatorPlayState2D, elapsedTime: number, loop: number, layerIndex: number): void {
        const isReplay = this._updatePlayerTime(animatorState, playState, elapsedTime, loop);
        this._applyTransition(layerIndex, animatorState._eventtransition(playState._normalizedPlayTime, this.parameters, isReplay));
    }

    /**
     * 启用过渡
     * @param layerindex 
     * @param transition 
     * @returns 
     */
    private _applyTransition(layerindex: number, transition: AnimatorTransition2D) {
        if (!transition)
            return false;
        return this.crossFade(transition.destState.name, layerindex, transition.transstartoffset, transition.transduration);
    }

    /**
     * @en Jump to the specified frame and stop playing the animation.
     * @param name The name of the animation.
     * @param layerIndex The index of the animation layer.
     * @param frame The specified frame to jump to.
     * @zh 跳转到指定帧并停止播放动画。
     * @param name 动画名称
     * @param layerIndex 动画层
     * @param frame 指定帧
     */
    gotoAndStopByFrame(name: string, layerIndex: number, frame: number) {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var animatorState = controllerLayer.getStateByName(name);
            if (!animatorState || !animatorState._clip)
                return;
            var allFrame = animatorState._clip!._duration * animatorState._clip!._frameRate;
            let normalizedTime = frame / allFrame;
            if (1 < normalizedTime) normalizedTime = 1;
            this.gotoAndStop(name, layerIndex, normalizedTime);
        }
    }
    /**
     * @en Gets the controller layer.
     * @param layerIndex The layer index. Defaults to 0.
     * @returns The AnimatorControllerLayer at the specified index.
     * @zh 获取控制器层。
     * @param layerIndex 层索引。
     * @return 指定索引处的AnimatorControllerLayer。
     */
    getControllerLayer(layerIndex: number = 0): AnimatorControllerLayer2D {
        return this._controllerLayers[layerIndex];
    }

    /**
     * @en Jump to the specified time and stop playing the animation.
     * @param name The name of the animation.
     * @param layerIndex The index of the layer.
     * @param normalizedTime The normalized playback time of the animation.
     * @zh 跳转到指定时间并停止播放动画。
     * @param name 动画名称
     * @param layerIndex 层索引
     * @param normalizedTime 归一化播放动画时间
     */
    gotoAndStop(name: string, layerIndex: number, normalizedTime: number) {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var animatorState = controllerLayer.getStateByName(name);
            if (!animatorState || !animatorState._clip)
                return;

            var playStateInfo = controllerLayer._playStateInfo!;
            var curPlayState = playStateInfo._currentState!;

            var clipDuration = animatorState._clip!._duration;
            var calclipduration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);

            this._clearCrossFade(controllerLayer);

            // 更新owner映射中的defVal，以支持additive模式基于最新值叠加
            this._updateDefVal();

            playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
            playStateInfo._normalizedPlayTime = normalizedTime;
            controllerLayer._playType = 0;
            if (curPlayState !== animatorState) {
                playStateInfo._currentState = animatorState;
                this._switchState(curPlayState, animatorState);
            }
            animatorState._eventStart(this, layerIndex);
            let addtive = controllerLayer.blendingMode != AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;
            this._updateClipDatas(animatorState, addtive, playStateInfo);
            this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight);
            this.stop();
        }
    }

    /**
     * @en Play animation
     * @param name The name of the animation.
     * @param layerIndex The index of the layer.
     * @param normalizedTime The normalized time.
     * @zh 播放动画
     * @param name 动画名称
     * @param layerIndex 层索引
     * @param normalizedTime 归一化时间
     */
    play(name?: string, layerIndex = 0, normalizedTime: number = Number.NEGATIVE_INFINITY) {
        if (this._checkEnterIndex) {
            let i = this._checkEnterIndex.indexOf(layerIndex);
            if (0 <= i) {
                this._checkEnterIndex.splice(i, 1);
            }
        }
        this._isPlaying = true;
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var defaultState = controllerLayer.defaultState;
            if (!name && !defaultState)
                throw new Error("Animator:must have default clip value,please set clip property.");

            var playStateInfo = controllerLayer._playStateInfo!;
            var curPlayState = playStateInfo._currentState!;
            var animatorState = name ? controllerLayer.getStateByName(name) : defaultState;

            if (!animatorState._clip)
                return;

            var clipDuration = animatorState._clip!._duration;
            var calclipduration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);

            this._clearCrossFade(controllerLayer);

            // 更新owner映射中的defVal，以支持additive模式基于最新值叠加
            this._updateDefVal();

            // this.resetDefOwerVal();
            // playStateInfo._resetPlayState(0.0, calclipduration);
            // if (curPlayState != animatorState) {
            //     playStateInfo._currentState = animatorState;
            // }
            // controllerLayer._playType = 0;、

            if (curPlayState !== animatorState) {
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                else
                    playStateInfo._resetPlayState(0.0, calclipduration);
                (curPlayState !== null && curPlayState !== animatorState);
                controllerLayer._playType = 0;
                playStateInfo._currentState = animatorState;
            } else {
                if (normalizedTime !== Number.NEGATIVE_INFINITY) {
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                    controllerLayer._playType = 0;
                } else {
                    playStateInfo._resetPlayState(clipDuration * animatorState.clipStart, calclipduration);
                }
            }
            controllerLayer._playType = 0;
            this._switchState(curPlayState, animatorState);
            animatorState._eventStart(this, layerIndex);
        }
        // var scripts = animatorState._scripts!;
        // if (scripts) {
        //     for (var i = 0, n = scripts.length; i < n; i++)
        //         scripts[i].onStateEnter();
        // }
    }

    /**
     * @en Stop playing animation.
     * @zh 停止播放动画
     */
    stop() {
        this._isPlaying = false;
    }

    /**
     * @en Frame Loop
     * @zh 帧循环 
     */
    onUpdate(): void {
        if (!this._isPlaying) return;

        if (this._checkEnterIndex) {
            for (let i = this._checkEnterIndex.length - 1; i >= 0; i--) {
                let index = this._checkEnterIndex[i];
                let enterTransition = this._controllerLayers[index]._enterTransition;
                if (enterTransition.check(0, this.parameters, true)) {
                    var defaultClip = this.getDefaultState(index);
                    this.play(null, index, defaultClip.cycleOffset);
                }
            }
        }


        var delta = this.owner.timer.delta / 1000.0;
        delta = this._applyUpdateMode(delta);
        if (0 == this.speed || 0 == delta) {
            // speed=0或delta=0时仍需检查已完成状态的转换（用户可能在动画结束后设置了新参数）
            for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
                var controllerLayer = this._controllerLayers[i];
                if (!controllerLayer.enable) continue;
                var playStateInfo = controllerLayer._playStateInfo!;
                if (playStateInfo._finish && controllerLayer._playType == 0) {
                    var animatorState = playStateInfo._currentState!;
                    this._applyTransition(i, animatorState._eventtransition(playStateInfo._normalizedPlayTime, this.parameters, false));
                }
            }
            return;
        }
        var needRender = true;//TODO:有渲染节点才可将needRender变为true

        for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
            var controllerLayer = this._controllerLayers[i];
            if (!controllerLayer.enable)
                continue;


            var playStateInfo = controllerLayer._playStateInfo!;

            var addtive = controllerLayer.blendingMode != AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;
            switch (controllerLayer._playType) {
                case 0:
                    var animatorState = playStateInfo._currentState!;
                    var speed = this._speed * animatorState.speed;
                    var finish = playStateInfo._finish;

                    var loop = animatorState.loop;
                    if (-1 >= loop) {
                        var clip = animatorState._clip!;
                        if (clip.islooping) {
                            loop = 0;
                        } else {
                            loop = 1;
                        }
                    }

                    // 播放方向控制
                    let dir = 1;
                    if (!playStateInfo._frontPlay) {
                        dir = -1;
                    }

                    if (finish) {
                        // 动画已结束，但仍需检查条件触发的过渡（用户可能在动画结束后设置条件）
                        this._applyTransition(i, animatorState._eventtransition(playStateInfo._normalizedPlayTime, this.parameters, false));
                    } else {
                        this._updatePlayer(animatorState, playStateInfo, delta * speed * dir, loop, i);
                    }
                    // A transition started while updating the source. Render its initial pose
                    // without advancing either clip a second time this frame.
                    if (controllerLayer._playType !== 0) {
                        if (!finish) {
                            this._updateEventScript(animatorState, playStateInfo);
                            this._updateStateFinish(animatorState, playStateInfo);
                        }
                        if (controllerLayer._playType === 1 || controllerLayer._playType === 2)
                            this._updateCrossFade(controllerLayer, i, 0);
                        break;
                    }
                    playStateInfo = controllerLayer._playStateInfo!;
                    animatorState = playStateInfo._currentState!;
                    if (needRender) {
                        this._updateClipDatas(animatorState, addtive, playStateInfo);
                        if (!finish) {
                            this._setClipDatasToNode(animatorState, addtive, controllerLayer.defaultWeight);
                            this._updateEventScript(animatorState, playStateInfo);
                        }
                    }
                    finish || this._updateStateFinish(animatorState, playStateInfo);
                    break;
                case 1:
                case 2:
                    this._updateCrossFade(controllerLayer, i, delta);
                    break;
            }
        }
    }

    private _clearCrossFade(layer: AnimatorControllerLayer2D): void {
        layer._crossMark++;
        layer._crossNodes.length = layer._crossDefaultValues.length = layer._crossValues.length = layer._crossFixedValues.length = 0;
        layer._srcCrossClipNodeIndices.length = layer._destCrossClipNodeIndices.length = 0;
        layer._crossPlayStateInfo._currentState = null;
    }

    private _blendValue(source: AnimationValue2D, target: AnimationValue2D, weight: number): AnimationValue2D {
        if (typeof source === "number" && typeof target === "number")
            return source + (target - source) * weight;
        if (source && target && typeof source === "object" && typeof target === "object") {
            const blendVector = (a: Vector3, b: Vector3): Vector3 => {
                if (!a || !b) return weight < 1 ? a : b;
                return new Vector3(a.x + (b.x - a.x) * weight, a.y + (b.y - a.y) * weight, a.z + (b.z - a.z) * weight);
            };
            return { pos: blendVector(source.pos, target.pos), rotation: blendVector(source.rotation, target.rotation) };
        }
        // Texture references, strings and booleans cannot be interpolated.
        return weight < 1 ? source : target;
    }

    /** Advance a clip without checking its outgoing transitions. */
    private _advanceCrossState(layer: AnimatorControllerLayer2D, info: AnimatorPlayState2D, delta: number, additive: boolean): boolean {
        const mark = layer._crossMark;
        const state = info._currentState;
        const finished = info._finish;
        if (!finished && delta !== 0) {
            const loop = state.loop <= -1 ? (state._clip.islooping ? 0 : 1) : state.loop;
            this._updatePlayerTime(state, info, delta * this._speed * state.speed * (info._frontPlay ? 1 : -1), loop);
            if (mark !== layer._crossMark) return false;
        }
        this._updateClipDatas(state, additive, info);
        if (!finished && delta !== 0) {
            this._updateEventScript(state, info);
            if (mark !== layer._crossMark) return false;
            this._updateStateFinish(state, info);
        }
        return mark === layer._crossMark;
    }

    private _updateCrossFade(layer: AnimatorControllerLayer2D, layerIndex: number, delta: number): void {
        const mark = layer._crossMark;
        const sourceInfo = layer._playStateInfo;
        const targetInfo = layer._crossPlayStateInfo;
        const source = sourceInfo._currentState;
        const target = targetInfo._currentState;
        const additive = layer.blendingMode !== AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;
        if (layer._playType === 1 && !this._advanceCrossState(layer, sourceInfo, delta, additive)) return;
        const previousTime = targetInfo._elapsedTime;
        if (!this._advanceCrossState(layer, targetInfo, delta, additive)) return;
        layer._crossElapsedTime += Math.abs(delta * this._speed);
        const weight = Math.min(layer._crossElapsedTime / layer._crossDuration, 1);
        for (let j = 0; j < layer._crossNodes.length; j++) {
            const srcIndex = layer._srcCrossClipNodeIndices[j];
            const dstIndex = layer._destCrossClipNodeIndices[j];
            const fallback = layer._crossDefaultValues[j];
            const srcValue = layer._playType === 2 ? layer._crossFixedValues[j] : (srcIndex < 0 ? fallback : source._realtimeDatas[srcIndex]);
            const dstValue = dstIndex < 0 ? fallback : target._realtimeDatas[dstIndex];
            const value = this._blendValue(srcValue == null ? fallback : srcValue, dstValue == null ? fallback : dstValue, weight);
            layer._crossValues[j] = value;
            const owner = this.getOwner(layer._crossNodes[j]);
            if (owner && value != null) this._applyAniData(owner, additive, layer.defaultWeight, value);
            if (mark !== layer._crossMark) return;
        }
        if (weight === 1) {
            const sourceFinished = sourceInfo._finish;
            targetInfo._cloneTo(sourceInfo);
            sourceInfo._currentState = target;
            layer._playType = 0;
            this._clearCrossFade(layer);
            const completedMark = layer._crossMark;
            if (!sourceFinished && source !== target) source._eventExit();
            if (completedMark !== layer._crossMark) return;
        }
        const duration = targetInfo._duration;
        const replay = Math.floor(Math.abs(previousTime) / duration) !== Math.floor(Math.abs(targetInfo._elapsedTime) / duration);
        this._applyTransition(layerIndex, target._eventtransition(targetInfo._normalizedPlayTime, this.parameters, replay));
    }

    /**
     * @en Adds an animator controller layer.
     * @param controllerLayer The animator controller layer to be added.
     * @zh 增加一个动画控制器层。
     * @param controllerLayer 动画控制器层.
     */
    addControllerLayer(controllerLayer: AnimatorControllerLayer2D): void {
        this._controllerLayers.push(controllerLayer);
    }

    /**
     * @en Cross-fades between the current and target animation states.
     * @param name The name of the target animation state.
     * @param layerIndex The index of the layer.
     * @param normalizedTime The normalized start time for playback.
     * @param transitionDuration The duration of the transition in normalized time (between 0.0 and 1.0).
     * @zh 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param name 目标动画状态。
     * @param layerIndex 层索引。
     * @param normalizedTime 归一化的播放起始时间。
     * @param transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
     */
    crossFade(name: string, layerIndex: number, normalizedTime: number, transitionDuration: number): boolean;
    /**
     * @en Cross-fades between the current and target animation states with an optional transition duration.
     * @param name The name of the target animation state.
     * @param layerIndex The index of the layer.
     * @param normalizedTime The normalized start time for playback.
     * @zh 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param name 目标动画状态的名称。
     * @param layerIndex 层的索引。
     * @param normalizedTime 归一化的播放起始时间。
     */
    crossFade(name: string, layerIndex: number, normalizedTime: number): boolean;
    crossFade(name: string, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY, transitionDuration?: number): boolean {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var destAnimatorState = controllerLayer.getStateByName(name);
            if (destAnimatorState && destAnimatorState._clip) {
                const sourceInfo = controllerLayer._playStateInfo;
                const source = sourceInfo._currentState;
                if (!source || !(transitionDuration > 0) || !Number.isFinite(transitionDuration)) {
                    this.play(name, layerIndex, normalizedTime);
                    return true;
                }
                const duration = source._clip._duration * (source.clipEnd - source.clipStart) * transitionDuration;
                if (!(duration > 0)) {
                    this.play(name, layerIndex, normalizedTime);
                    return true;
                }
                const additive = controllerLayer.blendingMode !== AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;
                const interrupted = controllerLayer._playType === 1 || controllerLayer._playType === 2;
                const fixed = interrupted || source === destAnimatorState;
                const nodes = interrupted ? controllerLayer._crossNodes.slice() : [];
                const values = interrupted ? controllerLayer._crossValues.slice() : [];
                const defaults = interrupted ? controllerLayer._crossDefaultValues.slice() : [];
                const previousTarget = interrupted ? controllerLayer._crossPlayStateInfo._currentState : source;
                const previousTargetFinished = interrupted && controllerLayer._crossPlayStateInfo._finish;
                this._updateClipDatas(source, additive, sourceInfo);
                const sourceNodes = source._clip._nodes;
                const targetNodes = destAnimatorState._clip._nodes;
                if (!interrupted) {
                    for (let j = 0; j < sourceNodes.count; j++)
                        nodes.push(sourceNodes.getNodeByIndex(j));
                }
                const known = new Set(nodes.map(node => node.fullPath));
                for (let j = 0; j < targetNodes.count; j++) {
                    const node = targetNodes.getNodeByIndex(j);
                    if (!known.has(node.fullPath)) {
                        nodes.push(node);
                        known.add(node.fullPath);
                    }
                }
                this._clearCrossFade(controllerLayer);
                controllerLayer._crossNodes = nodes;
                for (let j = 0; j < nodes.length; j++) {
                    const node = nodes[j];
                    const srcNode = source._clip._nodesDic[node.fullPath];
                    const dstNode = destAnimatorState._clip._nodesDic[node.fullPath];
                    const srcIndex = srcNode ? srcNode._indexInList : -1;
                    const dstIndex = dstNode ? dstNode._indexInList : -1;
                    const owner = this.getOwner(node);
                    let fallback: AnimationValue2D = defaults[j];
                    if (fallback == null && owner && owner.pro) {
                        // CurvePath tracks write the property owner itself, not pro[key].
                        const isPath = node.keyFramesCount > 0 && node.getKeyframeByIndex(0).data.val instanceof CurvePath;
                        const value = isPath ? owner.pro.ower : owner.pro.defVal;
                        fallback = isPath && value
                            ? { pos: new Vector3(value.x, value.y, 0), rotation: new Vector3(0, 0, value.rotation || 0) }
                            : value;
                        if (additive && typeof fallback === "number") fallback = 0;
                    }
                    const sourceValue = srcIndex < 0 ? fallback : source._realtimeDatas[srcIndex];
                    controllerLayer._srcCrossClipNodeIndices[j] = srcIndex;
                    controllerLayer._destCrossClipNodeIndices[j] = dstIndex;
                    controllerLayer._crossDefaultValues[j] = fallback;
                    controllerLayer._crossFixedValues[j] = interrupted && j < values.length ? values[j] : sourceValue;
                    controllerLayer._crossValues[j] = fixed ? controllerLayer._crossFixedValues[j] : sourceValue;
                }
                const targetInfo = controllerLayer._crossPlayStateInfo;
                const clipDuration = destAnimatorState._clip._duration;
                targetInfo._resetPlayState(normalizedTime === Number.NEGATIVE_INFINITY ? 0 : clipDuration * normalizedTime,
                    clipDuration * (destAnimatorState.clipEnd - destAnimatorState.clipStart));
                targetInfo._currentState = destAnimatorState;
                controllerLayer._crossDuration = duration;
                controllerLayer._crossElapsedTime = 0;
                controllerLayer._playType = fixed ? 2 : 1;
                this._isPlaying = true;
                if (this._checkEnterIndex) {
                    const index = this._checkEnterIndex.indexOf(layerIndex);
                    if (index >= 0) this._checkEnterIndex.splice(index, 1);
                }
                if (interrupted && previousTarget !== source && !previousTargetFinished) previousTarget._eventExit();
                this._switchState(previousTarget, destAnimatorState);
                destAnimatorState._eventStart(this, layerIndex);
                return true;
            }
            else {
                console.warn("Invalid animation state " + name + ".");
            }
        }
        return false;
    }

    /**
     * @internal
     * @returns 
     */
    onAfterDeserialize(): void {
        let arr = (<any>this).controllerLayers;
        if (!arr || null != this.controller)
            return;
        delete (<any>this).controllerLayers;
        this._controllerLayers.length = 0;
        for (let layer of arr) {
            this.addControllerLayer(layer);
        }
    }

    /**
     * @internal
     */
    onEnable() {
        if (this._checkEnterIndex) this._checkEnterIndex.length = 0;
        else this._checkEnterIndex = [];

        if (this._isPlaying) {
            for (var i = 0, n = this._controllerLayers.length; i < n; i++) {
                if (this._controllerLayers[i].playOnWake) {
                    var defaultClip = this.getDefaultState(i);
                    //(defaultClip) && (this.play(null, i, defaultClip.cycleOffset));
                    if (defaultClip) {
                        let enterTransition = this._controllerLayers[i]._enterTransition;
                        if (enterTransition) {
                            this._isPlaying = true;
                            if (enterTransition.check(0, this.parameters, true)) {
                                this.play(null, i, defaultClip.cycleOffset);
                            } else {
                                this._checkEnterIndex.push(i);
                            }
                        } else {
                            this.play(null, i, defaultClip.cycleOffset);
                        }
                    }
                }
            }
        }
    }

    /**
     * @en Get the default State Machine
     * @param layerIndex The index of the layer.
     * @zh 获取默认状态机
     * @param layerIndex 层索引
     */
    getDefaultState(layerIndex = 0) {
        var controllerLayer = this._controllerLayers[layerIndex];
        return controllerLayer.defaultState;
    }

    /**
     * @en Set a parameter's trigger value.
     * @param name The name of the parameter.
     * @zh 设置参数Trigger值
     * @param name 名字
     */
    setParamsTrigger(name: string) {
        const data = this._parameters[name];
        if (data && data.type === AniParmType.Trigger) {
            data.value = true;
        } else {
            this._parameters[name] = { name: name, type: AniParmType.Trigger, value: true };
        }
    }

    /**
     * @en Set a parameter's float value.
     * @param name The name of the parameter.
     * @param value The value of the parameter.
     * @zh 设置参数Number值
     * @param name 名字
     * @param value 值
     */
    setParamsNumber(name: string, value: number) {
        const data = this._parameters[name];
        if (data && data.type === AniParmType.Float) {
            data.value = value;
        } else {
            this._parameters[name] = { name: name, type: AniParmType.Float, value: value };
        }
    }

    /**
     * @en Set a parameter's bool value.
     * @param name The name of the parameter.
     * @param value The value of the parameter.
     * @zh 设置参数Bool值
     * @param name 名字
     * @param value 值
     */
    setParamsBool(name: string, value: boolean) {
        const data = this._parameters[name];
        if (data && data.type === AniParmType.Bool) {
            data.value = value;
        } else {
            this._parameters[name] = { name: name, type: AniParmType.Bool, value: value };
        }
    }

    /**
     * @en Get a parameter's trigger value.
     * @param name The name of the parameter.
     * @zh 得到参数值
     * @param name 名字
     */
    getParamsvalue(name: string) {
        let parm = this._parameters[name];
        if (parm) {
            return parm.value;
        }
        return null;
    }

    /**
     * @internal
     */
    onDestroy() {
        if (this._controller) {
            this._controller._removeReference();
            this._controller = null;
        }
        for (var i = 0, n = this._controllerLayers.length; i < n; i++)
            this._controllerLayers[i].destroy();
        this._controllerLayers.length = 0;
        this._isPlaying = false;
        this._parameters = null;
    }
}
