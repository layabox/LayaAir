import { AnimationNode } from "./AnimationNode";
import { EventDispatcher } from "../../events/EventDispatcher";
/**
 * <code>AnimationTransform3D</code> 类用于实现3D变换。
 */
export declare class AnimationTransform3D extends EventDispatcher {
    private static _tempVector3;
    private static _angleToRandin;
    private _localMatrix;
    private _worldMatrix;
    private _localPosition;
    private _localRotation;
    private _localScale;
    private _localQuaternionUpdate;
    private _locaEulerlUpdate;
    private _localUpdate;
    private _parent;
    private _children;
    /**
     * 创建一个 <code>Transform3D</code> 实例。
     * @param owner 所属精灵。
     */
    constructor(owner: AnimationNode, localPosition?: Float32Array, localRotation?: Float32Array, localScale?: Float32Array, worldMatrix?: Float32Array);
    private _getlocalMatrix;
    private _onWorldTransform;
    /**
     * 获取世界矩阵。
     * @return	世界矩阵。
     */
    getWorldMatrix(): Float32Array;
    /**
     * 设置父3D变换。
     * @param	value 父3D变换。
     */
    setParent(value: AnimationTransform3D): void;
}
