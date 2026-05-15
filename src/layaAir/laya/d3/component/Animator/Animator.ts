import { Component } from "../../../components/Component";
import { AnimatorUpdateMode } from "../../../components/AnimatorUpdateMode";
import { AnimatorStateCondition } from "../../../components/AnimatorStateCondition";
import { Delegate } from "../../../utils/Delegate";
import { KeyframeNode } from "../../animation/KeyframeNode";
import { Sprite3D } from "../../core/Sprite3D";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimatorState } from "./AnimatorState";
import { AnimatorController } from "./AnimatorController";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { AnimatorBindContext } from "./factory/AnimatorBindContext";
import { ITaskSlot } from "./factory/TaskSlot";
import { AnimatorManager } from "./manager/AnimatorManager";

export type AnimatorParams = { [key: number]: number | boolean };


/**
 * @en The `Animator` class is used to create 3D animation components.
 *      Per-frame推进和回写均由 AnimatorManager + 工厂的 TaskSlot 接管；本类只保留对外 API + 必要状态字段。
 * @zh `Animator` 类用于创建3D动画组件。
 *      每帧推进和数据回写由 AnimatorManager + 工厂 TaskSlot 接管，本类只保留对外 API + 必要状态字段。
 */
export class Animator extends Component {
    /**
     * @en Culling mode: Always animate.
     * @zh 裁剪模式：始终播放动画。
     */
    static readonly CULLINGMODE_ALWAYSANIMATE: number = 0;
    /**
     * @en Culling mode: Don't animate when not visible.
     * @zh 裁剪模式：不可见时完全不播放动画。
     */
    static readonly CULLINGMODE_CULLCOMPLETELY: number = 2;

    /** @internal */
    _speed: number;
    /** @internal */
    _keyframeNodeOwnerMap: Record<string, KeyframeNodeOwner>;
    /** @internal */
    _keyframeNodeOwners: KeyframeNodeOwner[] = [];
    /** @internal */
    _controllerLayers: AnimatorControllerLayer[];
    /** @internal 更新模式 */
    _updateMode: AnimatorUpdateMode = AnimatorUpdateMode.Normal;
    /** @internal 降低更新频率调整值 */
    _lowUpdateDelty: number = 20;
    /** @internal 状态机过渡事件延迟队列，AnimatorManager._drainLateUpdates 调 invoke。 */
    _LateUpdateEvents: Delegate = new Delegate();
    /** @internal */
    _controller: AnimatorController;
    /** @internal Manager.tickOne 通过它提交本帧 layer 任务到工厂 slot。 */
    _taskSlot: ITaskSlot | null = null;

    private _animatorParams: AnimatorParams = {};
    private _finishSleep: boolean = false;
    private _manager: AnimatorManager | null = null;
    private _cachedBindContext: AnimatorBindContext;
    /** 反序列化期间 manager 未就绪时累积的 prepare state；_onEnable 时统一刷一次。 */
    private _pendingPrepareStates: AnimatorState[] = [];

    /**
     * @en Culling mode. Defaults to don't animate when not visible.
     * @zh 裁剪模式。默认为不可见时完全不播放动画。
     */
    cullingMode: number = Animator.CULLINGMODE_CULLCOMPLETELY;

    /**
     * @en The animation controller.
     * @zh 动画控制器。
     */
    get controller() {
        return this._controller;
    }
    set controller(val: AnimatorController) {
        if (this._controller)
            this._controller._removeReference();
        this._controller = val;
        if (val) {
            val._addReference();
            val.updateTo(this);
        }
    }

    /**
     * @en The playback speed of the animation. 1.0 is the normal playback speed.
     * @zh 动画的播放速度。1.0 为正常播放速度。
     */
    get speed(): number {
        return this._speed;
    }
    set speed(value: number) {
        this._speed = value;
    }

    /**
     * @en The update mode for the animator.
     * @zh 动画更新模式。
     */
    set updateMode(value: AnimatorUpdateMode) {
        this._updateMode = value;
    }

    /**
     * @en Low update interval.
     * @zh 低更新模式步长。
     */
    set lowUpdateDelty(value: number) {
        this._lowUpdateDelty = value;
    }

    /**
     * @en The number of layers in the state machine animation.
     * @zh 状态机动画层的数量。
     */
    get controllerLayerCount(): number {
        return this._controllerLayers.length;
    }

    /**
     * @en The map of animator parameters.
     * @zh 状态机参数map。
     */
    get animatorParams() {
        return this._animatorParams;
    }
    set animatorParams(values: AnimatorParams) {
        this._animatorParams = values;
    }

    /**
     * @en Whether to stop updating after the animation is completed.
     * @zh 动画完成后是否停止更新。
     */
    get sleep() {
        return this._finishSleep;
    }
    set sleep(value: boolean) {
        this._finishSleep = value;
    }

    /**
     * @ignore
     * @en The constructor of Animator.
     * @zh 构造方法，创建动画组件。
     */
    constructor() {
        super();
        this._controllerLayers = [];
        this._speed = 1.0;
        this._keyframeNodeOwnerMap = {};
    }

    /**
     * @internal 工厂用的窄上下文：lazy 构造一次后复用，sprite 字段每次刷新以兼容 owner 重绑。
     */
    get _bindContext(): AnimatorBindContext {
        let ctx = this._cachedBindContext;
        if (!ctx) {
            ctx = this._cachedBindContext = {
                sprite: this.owner as Sprite3D,
                ownerMap: this._keyframeNodeOwnerMap,
                owners: this._keyframeNodeOwners,
                layers: this._controllerLayers,
            };
        }
        ctx.sprite = this.owner as Sprite3D;
        return ctx;
    }

    /**
     * @internal
     */
    _removeKeyframeNodeOwner(nodeOwners: (KeyframeNodeOwner | null)[], node: KeyframeNode): void {
        this._manager?._factory.removeKeyframeNodeOwner(this._bindContext, nodeOwners, node);
    }

    /**
     * @internal manager 未就绪时（构造 / 反序列化期）把 state buffer 到 _pendingPrepareStates，
     * _onEnable 时统一 prepare。
     */
    _getOwnersByClip(clipStateInfo: AnimatorState): void {
        const factory = this._manager?._factory;
        if (factory) {
            factory.prepareStateOwners(this._bindContext, clipStateInfo);
        } else {
            this._pendingPrepareStates.push(clipStateInfo);
        }
    }

    /**
     * @internal
     */
    _handleSpriteOwnersBySprite(isLink: boolean, path: string[], sprite: Sprite3D): void {
        this._manager?._factory.handleSpriteOwnersBySprite(this._bindContext, isLink, path, sprite);
    }

    private _updateDefaultValues(): void {
        this._manager?._factory.updateDefaultValues(this._keyframeNodeOwners);
    }

    private _revertDefaultKeyframeNodes(clipStateInfo: AnimatorState): void {
        this._manager?._factory.revertDefaultKeyframeNodes(clipStateInfo);
    }

    /** @internal */
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

    protected _onEnable(): void {
        this._resolveManager();
        if (!this._manager) return;
        this._manager.addAnimator(this);
        this._taskSlot = this._manager._factory.bindAnimator(this._bindContext);
        this._taskSlot.resizeLayers(this._controllerLayers.length);

        // 反序列化 / 构造期间累积的 state prepare 一次性 flush
        if (this._pendingPrepareStates.length > 0) {
            const factory = this._manager._factory;
            const ctx = this._bindContext;
            const pending = this._pendingPrepareStates;
            for (let i = 0, n = pending.length; i < n; i++) {
                factory.prepareStateOwners(ctx, pending[i]);
            }
            pending.length = 0;
        }

        for (let i = 0, n = this._controllerLayers.length; i < n; i++) {
            if (this._controllerLayers[i].playOnWake) {
                let defaultClip: AnimatorState = this.getDefaultState(i);
                (defaultClip) && (this.play(null, i, defaultClip.cycleOffset));
            }
        }
    }

    protected _onDisable(): void {
        if (this._manager) this._manager.removeAnimator(this);
        // 不释放 slot（disable→enable 复用），但要从 activeList 出列免得 flush 处理上一帧的数据。
        this._taskSlot?.submitAllIdle();
    }

    protected _onDestroy() {
        if (this._manager) {
            this._manager.removeAnimator(this);
            this._manager._factory.unbindAnimator(this._bindContext);
            this._manager = null;
        }
        this._taskSlot = null;
        if (this._controller) {
            this._controller._removeReference();
            this._controller = null;
        }
        for (let i = 0, n = this._controllerLayers.length; i < n; i++)
            this._controllerLayers[i]._removeReference();
    }

    private _resolveManager(): void {
        if (this._manager) return;
        const scene = (this.owner as Sprite3D)?.scene;
        if (!scene) return;
        this._manager = scene.getComponentElementManager(AnimatorManager.__managerName) as AnimatorManager;
    }

    /**
     * @internal
     */
    _cloneTo(dest: Animator): void {
        dest.cullingMode = this.cullingMode;

        for (var i: number = 0, n: number = this._controllerLayers.length; i < n; i++) {
            var controllLayer: AnimatorControllerLayer = this._controllerLayers[i];
            dest.addControllerLayer(controllLayer.clone());
            var animatorStates: AnimatorState[] = controllLayer._states;
            for (var j: number = 0, m: number = animatorStates.length; j < m; j++) {
                var state: AnimatorState = animatorStates[j].clone();
                var cloneLayer: AnimatorControllerLayer = dest.getControllerLayer(i);
                cloneLayer.addState(state);
                (j === 0) && (cloneLayer.defaultState = state);
            }
        }
        dest.controller = this._controller;
    }

    /**
     * @en Reset the base values for additive animations. Call this when you manually modify animated properties and want the additive animation to use the new values as base.
     * @zh 重置additive动画的基础值。当手动修改了被动画控制的属性，并希望additive动画基于新值叠加时调用此方法。
     */
    resetAdditiveBaseValues(): void {
        this._updateDefaultValues();
    }

    /**
     * @en Gets the default animation state.
     * @param layerIndex The layer index.
     * @returns The default animation state.
     * @zh 获取默认动画状态。
     * @param layerIndex 层索引。
     * @return 默认动画状态。
     */
    getDefaultState(layerIndex: number = 0): AnimatorState {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        return controllerLayer.defaultState;
    }

    /**
     * @en Adds an animation state.
     * @param state The animation state to add.
     * @param layerIndex The layer index.
     * @zh 添加动画状态。
     * @param state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state: AnimatorState, layerIndex: number = 0): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.addState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.addState() instead.");
    }

    /**
     * @en Removes an animation state.
     * @param state The animation state to remove.
     * @param layerIndex The layer index.
     * @zh 移除动画状态。
     * @param state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state: AnimatorState, layerIndex: number = 0): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        controllerLayer.removeState(state);
        console.warn("Animator:this function is discard,please use animatorControllerLayer.removeState() instead.");
    }

    /**
     * @en Adds a controller layer.
     * @param controllerLayer The animation controller layer to add.
     * @zh 添加控制器层。
     * @param controllerLayer 动画控制层。
     */
    addControllerLayer(controllerLayer: AnimatorControllerLayer): void {
        this._controllerLayers.push(controllerLayer);
        controllerLayer._animator = this;//TODO:可以复用,不应该这么设计
        controllerLayer._addReference();
        // 若 slot 已就绪（enable 后），同步 layers 数组长度
        this._taskSlot?.resizeLayers(this._controllerLayers.length);
        var states: AnimatorState[] = controllerLayer._states;
        for (var i: number = 0, n: number = states.length; i < n; i++)
            this._getOwnersByClip(states[i]);
    }

    /**
     * @en Gets the controller layer.
     * @param layerIndex The layer index. Defaults to 0.
     * @returns The AnimatorControllerLayer at the specified index.
     * @zh 获取控制器层。
     * @param layerIndex 层索引。
     * @return 指定索引处的AnimatorControllerLayer。
     */
    getControllerLayer(layerIndex: number = 0): AnimatorControllerLayer {
        return this._controllerLayers[layerIndex];
    }

    /**
     * @en Plays an animation.
     * @param name If null, plays the default animation; otherwise, plays the animation clip with the specified name.
     * @param layerIndex The layer index. Defaults to 0.
     * @param normalizedTime The normalized start time of the animation. Defaults to Number.NEGATIVE_INFINITY.
     * @zh 播放动画。
     * @param name 如果为null则播放默认动画，否则按名字播放动画片段。
     * @param layerIndex 层索引。
     * @param normalizedTime 归一化的播放起始时间。
     */
    play(name: string | null = null, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
        var controllerLayer: AnimatorControllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var defaultState: AnimatorState = controllerLayer.defaultState;
            if (!name && !defaultState)
                throw new Error("Animator:must have default clip value,please set clip property.");
            var playStateInfo: AnimatorPlayState = controllerLayer._playStateInfo!;
            var curPlayState: AnimatorState = playStateInfo.currentState!;

            var animatorState: AnimatorState = name ? controllerLayer.getAnimatorState(name) : defaultState;
            if (!animatorState || !animatorState._clip) {
                throw new Error("Animator:must have clip value,please set clip property.");
                return;
            }

            this._updateDefaultValues();

            var clipDuration: number = animatorState._clip!._duration;
            var calclipduration = animatorState._clip!._duration * (animatorState.clipEnd - animatorState.clipStart);
            if (curPlayState !== animatorState) {
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                else
                    playStateInfo._resetPlayState(0.0, calclipduration);
                (curPlayState !== null && curPlayState !== animatorState) && (this._revertDefaultKeyframeNodes(curPlayState));
                controllerLayer._playType = 0;
                playStateInfo.currentState = animatorState;
            } else {
                if (normalizedTime !== Number.NEGATIVE_INFINITY) {
                    playStateInfo._resetPlayState(clipDuration * normalizedTime, calclipduration);
                    controllerLayer._playType = 0;
                } else {
                    playStateInfo._resetPlayState(clipDuration * animatorState.clipStart, calclipduration);
                }
            }
            if (curPlayState) curPlayState._eventSwitch(animatorState);
            animatorState._eventStart(this, layerIndex);

        } else {
            console.warn("Invalid layerIndex " + layerIndex + ".");
        }
    }

    /**
     * @en Performs a crossfade transition between the current animation state and the target animation state.
     * @param name The name of the target animation state.
     * @param transitionDuration The transition duration, normalized to the current animation state's duration. Value should be between 0.0 and 1.0.
     * @param layerIndex The layer index. Defaults to 0.
     * @param normalizedTime The normalized start time of the animation. Defaults to Number.NEGATIVE_INFINITY.
     * @zh 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param name 目标动画状态。
     * @param transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
     * @param layerIndex 层索引。
     * @param normalizedTime 归一化的播放起始时间。
     */
    crossFade(name: string, transitionDuration: number, layerIndex: number = 0, normalizedTime: number = Number.NEGATIVE_INFINITY): void {
        var controllerLayer = this._controllerLayers[layerIndex];
        if (controllerLayer) {
            var destAnimatorState = controllerLayer.getAnimatorState(name);
            if (destAnimatorState) {
                var playType = controllerLayer._playType;
                if (playType === -1) {
                    this.play(name, layerIndex, normalizedTime);
                    return;
                }

                this._updateDefaultValues();

                var crossPlayStateInfo = controllerLayer._crossPlayStateInfo;
                var crossNodeOwners = controllerLayer._crossNodesOwners;
                var crossNodeOwnerIndicesMap = controllerLayer._crossNodesOwnersIndicesMap;

                var srcAnimatorState = controllerLayer._playStateInfo!.currentState;
                var destNodeOwners = destAnimatorState._nodeOwners;
                var destCrossClipNodeIndices = controllerLayer._destCrossClipNodeIndices;
                var destClip = destAnimatorState._clip;
                var destNodes = destClip._nodes!;
                var destNodesMap = destClip._nodesDic;
                var crossCount = 0;
                switch (playType) {
                    case 0:
                        var srcNodeOwners = srcAnimatorState!._nodeOwners;
                        var scrCrossClipNodeIndices = controllerLayer._srcCrossClipNodeIndices;
                        var srcClip = srcAnimatorState!._clip;
                        var srcNodes = srcClip!._nodes!;
                        var srcNodesMap = srcClip!._nodesDic;
                        controllerLayer._playType = 1;

                        var crossMark = ++controllerLayer._crossMark;
                        crossCount = controllerLayer._crossNodesOwnersCount = 0;

                        for (var i = 0, n = srcNodes.count; i < n; i++) {
                            var srcNode = srcNodes.getNodeByIndex(i);
                            var srcIndex = srcNode._indexInList;
                            var srcNodeOwner = srcNodeOwners[srcIndex];
                            if (srcNodeOwner) {
                                var srcFullPath = srcNode.fullPath;
                                scrCrossClipNodeIndices[crossCount] = srcIndex;
                                var destNode = destNodesMap[srcFullPath];
                                if (destNode)
                                    destCrossClipNodeIndices[crossCount] = destNode._indexInList;
                                else
                                    destCrossClipNodeIndices[crossCount] = -1;

                                crossNodeOwnerIndicesMap[srcFullPath] = crossMark;
                                crossNodeOwners[crossCount] = srcNodeOwner;
                                crossCount++;
                            }
                        }

                        for (i = 0, n = destNodes.count; i < n; i++) {
                            destNode = destNodes.getNodeByIndex(i);
                            var destIndex = destNode._indexInList;
                            var destNodeOwner = destNodeOwners[destIndex];
                            if (destNodeOwner) {
                                var destFullPath = destNode.fullPath;
                                if (!srcNodesMap[destFullPath]) {
                                    scrCrossClipNodeIndices[crossCount] = -1;
                                    destCrossClipNodeIndices[crossCount] = destIndex;

                                    crossNodeOwnerIndicesMap[destFullPath] = crossMark;
                                    crossNodeOwners[crossCount] = destNodeOwner;
                                    crossCount++;
                                }
                            }
                        }
                        break;
                    case 1:
                    case 2:
                        controllerLayer._playType = 2;
                        for (i = 0, n = crossNodeOwners.length; i < n; i++) {
                            var nodeOwner = crossNodeOwners[i];
                            nodeOwner.saveCrossFixedValue();
                            destNode = destNodesMap[nodeOwner.fullPath!];
                            if (destNode)
                                destCrossClipNodeIndices[i] = destNode._indexInList;
                            else
                                destCrossClipNodeIndices[i] = -1;
                        }

                        crossCount = controllerLayer._crossNodesOwnersCount;
                        crossMark = controllerLayer._crossMark;
                        for (i = 0, n = destNodes.count; i < n; i++) {
                            destNode = destNodes.getNodeByIndex(i);
                            destIndex = destNode._indexInList;
                            destNodeOwner = destNodeOwners[destIndex];
                            if (destNodeOwner) {
                                destFullPath = destNode.fullPath;
                                if (crossNodeOwnerIndicesMap[destFullPath] !== crossMark) {
                                    destCrossClipNodeIndices[crossCount] = destIndex;

                                    crossNodeOwnerIndicesMap[destFullPath] = crossMark;
                                    nodeOwner = destNodeOwners[destIndex];
                                    crossNodeOwners[crossCount] = nodeOwner;
                                    nodeOwner.saveCrossFixedValue();
                                    crossCount++;
                                }
                            }
                        }
                        break;
                    default:
                }
                controllerLayer._crossNodesOwnersCount = crossCount;
                controllerLayer._crossPlayState = destAnimatorState;
                controllerLayer._crossDuration = srcAnimatorState!._clip!._duration * transitionDuration;
                if (normalizedTime !== Number.NEGATIVE_INFINITY)
                    crossPlayStateInfo!._resetPlayState(destClip._duration * normalizedTime, controllerLayer._crossDuration);
                else
                    crossPlayStateInfo!._resetPlayState(0.0, controllerLayer._crossDuration);
                destAnimatorState._eventStart(this, layerIndex);
            }
            else {
                console.warn("Invalid name " + layerIndex + ".");
            }
        }
        else {
            console.warn("Invalid layerIndex " + layerIndex + ".");
        }
    }

    /**
     * @en Enables a trigger parameter.
     * @param name The name or index of the trigger parameter.
     * @zh 启用触发条件参数。
     * @param name 触发条件的名字或者索引
     */
    setParamsTrigger(name: number): void;
    setParamsTrigger(name: string): void;
    setParamsTrigger(name: string | number) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = true;
    }

    /**
     * @en Sets the value of a number parameter.
     * @param name The name or index of the parameter.
     * @param value The value to set.
     * @zh 设置数值类型参数的值。
     * @param name 属性的名字或者索引
     * @param value 属性值
     */
    setParamsNumber(name: number, value: number): void;
    setParamsNumber(name: string, value: number): void;
    setParamsNumber(name: string | number, value: number) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = value;
    }

    /**
     * @en Sets the value of a boolean parameter.
     * @param name The name or index of the parameter.
     * @param value The value to set.
     * @zh 设置布尔类型参数的值。
     * @param name 属性的名字或者索引
     * @param value 属性值
     */
    setParamsBool(name: number, value: boolean): void;
    setParamsBool(name: string, value: boolean): void;
    setParamsBool(name: string | number, value: boolean) {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        this._animatorParams[id] = value;
    }

    /**
     * @en Gets the value of a parameter.
     * @param name The name or index of the parameter.
     * @returns The value of the parameter.
     * @zh 获取参数的值。
     * @param name 属性的名字或者索引
     * @return 属性值
     */
    getParamsvalue(name: number): number | boolean;
    getParamsvalue(name: string): number | boolean;
    getParamsvalue(name: string | number): number | boolean {
        let id;
        if (typeof name == "number")
            id = name;
        else
            id = AnimatorStateCondition.conditionNameToID(name);
        return this._animatorParams[id];
    }

    /**
     * @deprecated 请使用animator.getControllerLayer(layerIndex).getCurrentPlayState()替换。
     */
    getCurrentAnimatorPlayState(layerIndex: number = 0): AnimatorPlayState {
        return this._controllerLayers[layerIndex]._playStateInfo!;
    }
}
