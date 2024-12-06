import { IClone } from "../../../utils/IClone";
import { AnimationClip } from "../../animation/AnimationClip";
import { Animator } from "./Animator";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { AnimatorState } from "./AnimatorState";
import { AvatarMask } from "./AvatarMask";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";


/**
 * @en The `AnimatorControllerLayer` class is used to create animation controller layers.
 * @zh `AnimatorControllerLayer` 类用于创建动画控制器层。
 */
export class AnimatorControllerLayer implements IClone {
    /**
     * @en Blending mode: Override. 
     * @zh 混合模式：覆盖。
     */
    static BLENDINGMODE_OVERRIDE: number = 0;
    /**
     * @en Blending mode: Additive. 
     * @zh 混合模式：叠加。
     */
    static BLENDINGMODE_ADDTIVE: number = 1;

    /**@internal */
    private _defaultState: AnimatorState | null;
    /**@internal */
    private _referenceCount: number = 0;

    /**
     * @internal
     * @en Play type of the layer. 0: Normal play, 1: Dynamic blend play, 2: Fixed blend play
     * @zh 层的播放类型。0：常规播放、1：动态融合播放、2：固定融合播放
     */
    _playType: number = -1;
    /**@internal */
    _crossDuration: number = -1;
    /**@internal */
    _crossPlayState: AnimatorState;
    /**@internal */
    _crossMark: number = 0;
    /**@internal */
    _crossNodesOwnersCount: number = 0;
    /**@internal */
    _crossNodesOwners: KeyframeNodeOwner[] = [];
    /**@internal */
    _crossNodesOwnersIndicesMap: any = {};
    /**@internal */
    _srcCrossClipNodeIndices: number[] = [];
    /**@internal */
    _destCrossClipNodeIndices: number[] = [];

    /**@internal */
    _animator: Animator;
    /**@internal */
    _states: AnimatorState[] = [];
    /**@internal */
    _playStateInfo: AnimatorPlayState | null = new AnimatorPlayState();
    /**@internal */
    _crossPlayStateInfo: AnimatorPlayState | null = new AnimatorPlayState();
    /**@internal */
    _avatarMask: AvatarMask;
    /**
     * @en The name of the layer.
     * @zh 层的名称。
     */
    name: string;
    /**
     * @en The blending mode of the layer.
     * @zh 层的混合模式。
     */
    blendingMode: number = AnimatorControllerLayer.BLENDINGMODE_OVERRIDE;
    /**
     * @en The default weight of the layer.
     * @zh 层的默认权重。
     */
    defaultWeight: number = 1.0;
    /**
     * @en Whether to automatically play when activated.
     * @zh 激活时是否自动播放。
     */
    playOnWake: boolean = true;
    /**
     * @en Whether the layer is enabled.
     * @zh 层是否启用。
     */
    enable: boolean = true;

    /**
     * @en Default animation state machine.
     * @zh 默认动画状态机。
     */
    get defaultState(): AnimatorState {
        return this._defaultState!;
    }

    set defaultState(value: AnimatorState) {
        this._defaultState = value;
    }

    /**
     * @en The avatar mask of the layer.
     * @zh 层的骨骼遮罩。
     */
    get avatarMask(): AvatarMask {
        return this._avatarMask;
    }

    set avatarMask(value: AvatarMask) {
        this._avatarMask = value;
    }

    /**
     * @internal
     * @en The name of the default animation state machine for this layer.
     * @zh 此层的默认动画状态机的名称。
     */
    public get defaultStateName() {
        if (!this._defaultState) {
            return null;
        }
        return this._defaultState.name;
    }

    private _defaultStateNameCatch: string;

    public set defaultStateName(value: string) {
        this._defaultState = this.getAnimatorState(value);
        if (null == this._defaultState) {
            if (0 == this._states.length) {
                this._defaultStateNameCatch = value;
            } else {
                for (var i = this._states.length - 1; i >= 0; i--) {
                    if (this._states[i].name == value) {
                        this._defaultState = this._states[i];
                        break;
                    }
                }
            }
        }
    }

    /**
     * @en The AnimatorStates in this layer.
     * @zh 此层中动画状态
     */
    public get states(): ReadonlyArray<AnimatorState> {
        return this._states;
    }

    public set states(states: ReadonlyArray<AnimatorState>) {
        if (this._states === states)
            return;

        if (this._states.length > 0) {
            let removed = this._states.filter(s => states.indexOf(s) == -1);
            for (let state of removed)
                this.removeState(state);
        }

        if (states.length > 0) {
            let newAdded = states.filter(s => this._states.indexOf(s) == -1);
            for (let state of newAdded)
                this.addState(state);
        }

        this._states.length = 0;
        this._states.push(...states);
    }

    /**
     * @en Constructor method.
     * @param name 动画层名称
     * @zh 构造方法
     * @param name 动画层名称
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * @internal
     */
    private _removeClip(clipStateInfos: AnimatorState[], index: number, state: AnimatorState): void {
        var clip: AnimationClip = state._clip!;
        var clipStateInfo: AnimatorState = clipStateInfos[index];

        clipStateInfos.splice(index, 1);

        if (this._animator) {
            var frameNodes = clip._nodes;
            var nodeOwners: KeyframeNodeOwner[] = clipStateInfo._nodeOwners;
            clip._removeReference();
            for (var i: number = 0, n: number = frameNodes!.count; i < n; i++)
                this._animator._removeKeyframeNodeOwner(nodeOwners, frameNodes!.getNodeByIndex(i));
        }
    }

    /**
     * @internal
     */
    _getReferenceCount(): number {
        return this._referenceCount;
    }

    /**
     * @internal
     */
    _addReference(count: number = 1): void {
        for (var i: number = 0, n: number = this._states.length; i < n; i++)
            this._states[i]._addReference(count);
        this._referenceCount += count;
    }

    /**
     * @internal
     */
    _removeReference(count: number = 1): void {
        for (var i: number = 0, n: number = this._states.length; i < n; i++)
            this._states[i]._removeReference(count);
        this._referenceCount -= count;
    }

    /**
     * @internal
     */
    _clearReference(): void {
        this._removeReference(-this._referenceCount);
    }

    /**
     * @en Gets the current play state of the animation.
     * @returns The current AnimatorPlayState.
     * @zh 获取当前的动画播放状态。
     * @return 动画播放状态。
     */
    getCurrentPlayState(): AnimatorPlayState {
        return this._playStateInfo!;
    }

    /**
     * @en Gets an animator state by its name.
     * @param name The name of the animator state to find.
     * @returns The AnimatorState if found, or null if not found.
     * @zh 通过名称获取动画状态。
     * @param name 要查找的动画状态的名称。
     * @returns 如果找到则返回AnimatorState，否则返回null。
     */
    getAnimatorState(name: string): AnimatorState | null {
        var state: AnimatorState;;
        for (let i = 0; i < this._states.length; i++) {
            if (this._states[i].name == name) {
                state = this._states[i];
                break;
            }
        }
        return state ? state : null;
    }

    /**
     * @en Adds an animation state to the layer.
     * @param state The AnimatorState to add.
     * @zh 向层中添加动画状态。
     * @param state 要添加的AnimatorState。
     */
    addState(state: AnimatorState): void {
        var stateName: string = state.name;
        if (this.getAnimatorState(stateName)) {
            throw new Error("AnimatorControllerLayer:this stat's name has exist.");
        } else {
            this._states.push(state);
            if (stateName == this._defaultStateNameCatch) {
                this._defaultState = state;
                this._defaultStateNameCatch = null;
            }

            if (this._animator) {
                (state._clip) && (state._clip!._addReference());
                this._animator._getOwnersByClip(state);
            }
        }
    }

    /**
     * @en Removes an animation state from the layer.
     * @param state The AnimatorState to remove.
     * @zh 从层中移除动画状态。
     * @param state 要移除的动画状态。
     */
    removeState(state: AnimatorState): void {
        var states: AnimatorState[] = this._states;
        var index: number = -1;
        for (var i: number = 0, n: number = states.length; i < n; i++) {
            if (states[i] === state) {
                index = i;
                break;
            }
        }
        if (index !== -1)
            this._removeClip(states, index, state);
    }

    /**
     * @en Destroys the AnimatorControllerLayer and clears all references.
     * @zh 销毁AnimatorControllerLayer并清除所有引用。
     */
    destroy(): void {
        this._clearReference();
        this._states = [];
        this._playStateInfo = null;
        this._crossPlayStateInfo = null;
        this._defaultState = null;
    }

    /**
     * @en Clones the properties of this AnimatorControllerLayer to another object.
     * @param destObject The target object to clone to.
     * @zh 将此AnimatorControllerLayer的属性克隆到另一个对象。
     * @param destObject 要克隆到的目标对象。
     */
    cloneTo(destObject: AnimatorControllerLayer): void {
        destObject.name = this.name;
        destObject.blendingMode = this.blendingMode;
        destObject.defaultWeight = this.defaultWeight;
        destObject.playOnWake = this.playOnWake;
        this.avatarMask && (destObject.avatarMask = this._avatarMask.clone());
    }

    /**
     * @en Creates and returns a clone of this AnimatorControllerLayer.
     * @returns A new AnimatorControllerLayer instance with properties copied from this one.
     * @zh 创建并返回此AnimatorControllerLayer的克隆副本。
     * @returns 一个新的AnimatorControllerLayer实例，其属性从当前实例复制。
     */
    clone(): any {
        var dest: AnimatorControllerLayer = new AnimatorControllerLayer(this.name);
        this.cloneTo(dest);
        return dest;
    }

}


