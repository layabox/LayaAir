import { IClone } from "../utils/IClone";
import { AnimatorPlayState2D } from "./AnimatorPlayState2D";
import { AnimatorState2D } from "./AnimatorState2D";

export class AnimatorControllerLayer2D implements IClone {
    /**混合模式_覆盖。 */
    static BLENDINGMODE_OVERRIDE: number = 0;
    /**混合模式_叠加。 */
    static BLENDINGMODE_ADDTIVE: number = 1;

    /**层的名字 */
    name: string;
    private _defaultState: AnimatorState2D | null;
    private _referenceCount = 0;
    /**	激活时是否自动播放。*/
    playOnWake = true;
    _playStateInfo: AnimatorPlayState2D | null = new AnimatorPlayState2D();
    _crossPlayStateInfo: AnimatorPlayState2D | null = new AnimatorPlayState2D();
    _statesMap: Record<string, AnimatorState2D> = {};
    /** 默认权重。*/
    defaultWeight = 1.0;

    /** 混合模式。*/
    blendingMode = AnimatorControllerLayer2D.BLENDINGMODE_OVERRIDE;

    /** 是否开启 */
    enable = true;

    _states: AnimatorState2D[] = [];

    /**@internal 0:常规播放、1:动态融合播放、2:固定融合播放*/
    _playType = -1;

    constructor(name: string) {
        this.name = name;
    }


    public set states(states: ReadonlyArray<AnimatorState2D>) {
        if (this._states === states)
            return;

        for (let i = this.states.length - 1; i >= 0; i--) {
            this.removeState(this.states[i]);
        }
        for (let i = states.length - 1; i >= 0; i--) {
            this.addState(states[i]);
        }

        // if (this._states.length > 0) {
        //     let removed = this._states.filter(s => states.indexOf(s) == -1);
        //     for (let state of removed)
        //         this.removeState(state);
        // }

        // if (states.length > 0) {
        //     let newAdded = states.filter(s => this._states.indexOf(s) == -1);
        //     for (let state of newAdded)
        //         this.addState(state);
        // }

        // this._states.length = 0;
        // this._states.push(...states);
    }
    public get states(): ReadonlyArray<AnimatorState2D> {
        return this._states;
    }



    /**
    * 获取当前的播放状态。
    * @return 动画播放状态。
    */
    getCurrentPlayState(): AnimatorPlayState2D {
        return this._playStateInfo!;
    }

    private _defaultStateNameCatch: string;

    set defaultStateName(str: string) {
        this._defaultState = this._statesMap[str];
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
    get defaultStateName() {
        if (!this._defaultState) {
            return null;
        }
        return this._defaultState.name;
    }

    /**
     * 默认动画状态机。
     */
    get defaultState(): AnimatorState2D {
        return this._defaultState!;
    }

    set defaultState(value: AnimatorState2D) {
        this._defaultState = value;
        //this._statesMap[value.name] = value;
    }

    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state: AnimatorState2D): void {
        var stateName = state.name;
        if (this._statesMap[stateName]) {
            throw "AnimatorControllerLayer:this stat's name has exist.";
        } else {
            this._statesMap[stateName] = state;
            this._states.push(state);
            if (stateName == this._defaultStateNameCatch) {
                this._defaultState = state;
                this._defaultStateNameCatch = null;
            }
        }
    }




    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
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
            this._removeClip(states, this._statesMap, index, state);
    }
    private _removeClip(clipStateInfos: AnimatorState2D[], statesMap: any, index: number, state: AnimatorState2D): void {
        var clip = state._clip!;
        var clipStateInfo = clipStateInfos[index];

        clipStateInfos.splice(index, 1);
        delete statesMap[state.name];
    }

    /**
         * 克隆。
         * @return	 克隆副本。
         */
    clone() {
        var dest: AnimatorControllerLayer2D = new AnimatorControllerLayer2D(this.name);
        this.cloneTo(dest);
        return dest;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void {
        var dest: AnimatorControllerLayer2D = (<AnimatorControllerLayer2D>destObject);
        dest.name = this.name;


    }
    _getReferenceCount(): number {
        return this._referenceCount;
    }
    _addReference(count: number): void {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._addReference(count);
        this._referenceCount += count;
    }
    _removeReference(count = 1): void {
        for (var i = 0, n = this._states.length; i < n; i++)
            this._states[i]._removeReference(count);
        this._referenceCount -= count;
    }
    _clearReference(): void {
        this._removeReference(-this._referenceCount);
    }
    destroy() {
        this._statesMap = null;
        this._removeReference();
        for (var i = 0, n = this._states.length; i < n; i++) {
            this._states[i].destroy();
        }
        this._states.length = 0;
    }
}