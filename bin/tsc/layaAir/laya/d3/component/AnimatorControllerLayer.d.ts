import { AnimatorState } from "./AnimatorState";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
/**
 * <code>AnimatorControllerLayer</code> 类用于创建动画控制器层。
 */
export declare class AnimatorControllerLayer implements IReferenceCounter, IClone {
    private _defaultState;
    private _referenceCount;
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
    private _removeClip;
    /**
     *
     * [实现IReferenceCounter接口]
     */
    _getReferenceCount(): number;
    /**
     * [实现IReferenceCounter接口]
     */
    _addReference(count?: number): void;
    /**
     * [实现IReferenceCounter接口]
     */
    _removeReference(count?: number): void;
    /**
     * [实现IReferenceCounter接口]
     */
    _clearReference(): void;
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
