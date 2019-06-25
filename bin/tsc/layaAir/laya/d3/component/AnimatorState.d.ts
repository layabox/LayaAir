import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { AnimationClip } from "../animation/AnimationClip";
import { AnimatorStateScript } from "../animation/AnimatorStateScript";
import { IClone } from "../core/IClone";
import { IReferenceCounter } from "../resource/IReferenceCounter";
/**
 * <code>AnimatorState</code> 类用于创建动作状态。
 */
export declare class AnimatorState implements IReferenceCounter, IClone {
    /**@private */
    private _referenceCount;
    /**@private */
    _clip: AnimationClip;
    /**@private */
    _nodeOwners: KeyframeNodeOwner[];
    /**@private */
    _currentFrameIndices: Int16Array;
    /**@private */
    _scripts: AnimatorStateScript[];
    /**名称。*/
    name: string;
    /**动画播放速度,1.0为正常播放速度。*/
    speed: number;
    /**动作播放起始时间。*/
    clipStart: number;
    /**动作播放结束时间。*/
    clipEnd: number;
    /**
     * 获取动作。
     * @return 动作
     */
    /**
    * 设置动作。
    * @param value 动作。
    */
    clip: AnimationClip;
    /**
     * 创建一个 <code>AnimatorState</code> 实例。
     */
    constructor();
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
    _resetFrameIndices(): void;
    /**
     * 添加脚本。
     * @param	type  组件类型。
     * @return 脚本。
     *
     */
    addScript(type: new () => any): AnimatorStateScript;
    /**
     * 获取脚本。
     * @param	type  组件类型。
     * @return 脚本。
     *
     */
    getScript(type: new () => any): AnimatorStateScript;
    /**
     * 获取脚本集合。
     * @param	type  组件类型。
     * @return 脚本集合。
     *
     */
    getScripts(type: new () => any): AnimatorStateScript[];
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
