import { IClone } from "../utils/IClone";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";
import { AnimatorTransition2D } from "./AnimatorTransition2D";

/**
 * @en Layer of 2D animation controllers
 * @zh 2D动画控制器层
 */
export class AnimatorControllerLayer2D implements IClone {

    /**
     * @en Mixed Mode: Overwrite
     * @zh 混合模式_覆盖。
     */
    static BLENDINGMODE_OVERRIDE: number = 0;

    /**
     * @en Mixed Mode: Stacking
     * @zh 混合模式_叠加。 
     */
    static BLENDINGMODE_ADDTIVE: number = 1;

    /**@internal */
    private _defaultState: AnimatorState2D | null;

    /**@internal */
    private _referenceCount = 0;

    /**@internal */
    private _defaultStateNameCatch: string;

    /**@internal*/
    _playStateInfo: AnimatorPlayState2D | null = new AnimatorPlayState2D();

    /**@internal*/
    _crossPlayStateInfo: AnimatorPlayState2D | null = new AnimatorPlayState2D();

    /**@internal*/
    _crossMark: number = 0;

    /**@internal */
    _crossNodesOwnersCount: number = 0;

    /**@internal */
    _crossNodesOwnersIndicesMap: any = {};

    /**@internal */
    _srcCrossClipNodeIndices: number[] = [];

    /**@internal */
    _destCrossClipNodeIndices: number[] = [];

    /**@internal */
    _enterTransition: AnimatorTransition2D;

    /**
     * @en layer name
     * @zh 层的名字
     */
    name: string;

    /**
     * @en Whether to play when the layer is started.
     * @zh 是否开始时播放
     */
    playOnWake = true;

    /**
     * @en Default weight
     * @zh 默认权重
     */
    defaultWeight = 1.0;

    /**
     * @en Mixed Mode
     * @zh 混合模式
     */
    blendingMode = AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;

    /**
     * @en Is it enabled
     * @zh 是否开启
     */
    enable = true;

    /**
     * @internal
     * @en State machine
     * @zh 状态机
     */
    _states: AnimatorState2D[] = [];

    /**
     * @internal 
     * @en 0:normal play, 1:dynamic fusing play, 2:fixed fusing play
     * @zh 0:常规播放、1:动态融合播放、2:固定融合播放
     */
    _playType = -1;

    /**
     * @en Constructor method of 2D animator controller Layer.
     * @zh 2D动画控制器层的构造方法
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * @en State machine
     * @zh 状态机
     */
    get states(): ReadonlyArray<AnimatorState2D> {
        return this._states;
    }

    set states(states: ReadonlyArray<AnimatorState2D>) {
        if (this._states === states)
            return;
        for (let i = this.states.length - 1; i >= 0; i--) {
            this.removeState(this.states[i]);
        }
        for (let i = states.length - 1; i >= 0; i--) {
            this.addState(states[i]);
        }
    }

    /**
     * @en The default state name.
     * @zh 默认状态名称。
     */
    get defaultStateName() {
        if (!this._defaultState) {
            return null;
        }
        return this._defaultState.name;
    }

    set defaultStateName(str: string) {
        this._defaultState = this.getStateByName(str);
        if (null == this._defaultState) {
            if (0 == this._states.length) {
                this._defaultStateNameCatch = str;
            } else {
                for (var i = this._states.length - 1; i >= 0; i--) {
                    if (this._states[i].name == str) {
                        this._defaultState = this._states[i];
                        break;
                    }
                }
            }
        }
    }

    /**
     * @en Default animation state machine
     * @zh 默认动画状态机。
     */
    get defaultState(): AnimatorState2D {
        return this._defaultState!;
    }

    set defaultState(value: AnimatorState2D) {
        this._defaultState = value;
        //this._statesMap[value.name] = value;
    }

    /**
     * 移除Clip
     * @param clipStateInfos 
     * @param index 
     * @param state 
     */
    private _removeClip(clipStateInfos: AnimatorState2D[], index: number, state: AnimatorState2D): void {
        clipStateInfos.splice(index, 1);
    }

    /**
     * @internal
     * @returns 
     */
    _getReferenceCount(): number {
        return this._referenceCount;
    }

    /**
     * @internal
     * @param count 
     */
    _addReference(count: number): void {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._addReference(count);
        this._referenceCount += count;
    }

    /**
     * @internal
     * @param count 
     */
    _removeReference(count = 1): void {
        for (var i = 0, n = this._states.length; i < n; i++)
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
     * @en Gets the current play state of the animator.
     * @returns The play state of the animation.
     * @zh 获取当前的动画播放状态。
     * @returns 动画的播放状态。
     */
    getCurrentPlayState(): AnimatorPlayState2D {
        return this._playStateInfo!;
    }

    /**
     * @en Gets an animator state by its name.
     * @param str The name of the state to retrieve.
     * @returns The AnimatorState2D object if found, otherwise null.
     * @zh 通过状态机名称获取动画状态对象。
     * @param str 要检索的状态名称。
     * @returns 如果找到，返回 AnimatorState2D 对象，否则返回 null。
     */
    getStateByName(str: string) {
        for (let i = this._states.length - 1; i >= 0; i--) {
            if (this._states[i].name == str) {
                return this._states[i];
            }
        }
        return null;
    }

    /**
     * @en Adds an animation state to the animator.
     * @param state The AnimatorState2D to add.
     * @zh 向动画机添加动画状态。
     * @param state 要添加的 AnimatorState2D。
     */
    addState(state: AnimatorState2D): void {
        var stateName = state.name;
        if (this.getStateByName(stateName)) {
            throw new Error("AnimatorControllerLayer:this stat's name has exist.");
        } else {
            this._states.push(state);
            if (stateName == this._defaultStateNameCatch) {
                this._defaultState = state;
                this._defaultStateNameCatch = null;
            }
        }
    }

    /**
     * @en Removes an animation state.
     * @param state The AnimatorState2D to remove.
     * @zh 移除动画状态。
     * @param state 要移除的 AnimatorState2D。
     */
    removeState(state: AnimatorState2D): void {
        var states = this._states;
        var index = -1;
        for (var i = 0, n = states.length; i < n; i++) {
            if (states[i] === state) {
                index = i;
                break;
            }
        }
        if (-1 != index)
            this._removeClip(states, index, state);
    }

    /**
     * @en Clones the current animator controller layer.
     * @returns A clone of the current animator controller layer.
     * @zh 克隆当前的动画控制器层。
     * @returns 当前动画控制器层的克隆副本。
     */
    clone() {
        var dest: AnimatorControllerLayer2D = new AnimatorControllerLayer2D(this.name);
        this.cloneTo(dest);
        return dest;
    }

    /**
     * @en Clones the current animator controller layer to a destination object.
     * @param destObject The destination object to clone to.
     * @zh 克隆当前的动画控制器层到目标对象。
     * @param destObject 克隆到的目标对象。
     */
    cloneTo(destObject: AnimatorControllerLayer2D): void {
        destObject.name = this.name;
    }

    /**
     * @en Destroys the animator controller layer and all its states.
     * @zh 销毁动画控制器层及其所有状态。
     */
    destroy() {
        this._removeReference();
        for (var i = 0, n = this._states.length; i < n; i++) {
            this._states[i].destroy();
        }
        this._states.length = 0;
    }
}