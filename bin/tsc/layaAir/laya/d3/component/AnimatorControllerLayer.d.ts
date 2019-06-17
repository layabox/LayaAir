import { AnimatorState } from "./AnimatorState";
import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
import { Animator } from "./Animator";
/**
 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
 */
export declare class AnimatorControllerLayer implements IReferenceCounter, IClone {
    /**@private */
    static BLENDINGMODE_OVERRIDE: number;
    /**@private */
    static BLENDINGMODE_ADDTIVE: number;
    /**@private */
    private _defaultState;
    /**@private */
    private _referenceCount;
    /**@private 0:常规播放、1:动态融合播放、2:固定融合播放*/
    _playType: number;
    /**@private */
    _crossDuration: number;
    /**@private */
    _crossPlayState: AnimatorState;
    /**@private */
    _crossMark: number;
    /**@private */
    _crossNodesOwnersCount: number;
    /**@private */
    _crossNodesOwners: KeyframeNodeOwner[];
    /**@private */
    _crossNodesOwnersIndicesMap: any;
    /**@private */
    _srcCrossClipNodeIndices: number[];
    /**@private */
    _destCrossClipNodeIndices: number[];
    /**@private */
    _animator: Animator;
    /**@private */
    _currentPlayState: AnimatorState;
    /**@private */
    _statesMap: any;
    /**@private */
    _states: AnimatorState[];
    /**@private */
    _playStateInfo: AnimatorPlayState;
    /**@private */
    _crossPlayStateInfo: AnimatorPlayState;
    /** 层的名称。*/
    name: string;
    /** 名称。*/
    blendingMode: number;
    /** 权重。*/
    defaultWeight: number;
    /**	激活时是否自动播放*/
    playOnWake: boolean;
    /**
     * 获取默认动画状态。
     * @return 默认动画状态。
     */
    /**
    * 设置默认动画状态。
    * @param value 默认动画状态。
    */
    defaultState: AnimatorState;
    /**
     * 创建一个 <code>AnimatorControllerLayer</code> 实例。
     */
    constructor(name: string);
    /**
     * @private
     */
    private _removeClip;
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _getReferenceCount(): number;
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _addReference(count?: number): void;
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _removeReference(count?: number): void;
    /**
     * @private
     * [实现IReferenceCounter接口]
     */
    _clearReference(): void;
    /**
     * @private
     */
    getAnimatorState(name: string): AnimatorState;
    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state: AnimatorState): void;
    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state: AnimatorState): void;
    /**
     * @private
     */
    destroy(): void;
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject: any): void;
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any;
}
