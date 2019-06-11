import { AnimationNode } from "./AnimationNode";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { EventDispatcher } from "laya/events/EventDispatcher";
/**
 * <code>AnimationTransform3D</code> 类用于实现3D变换。
 */
export declare class AnimationTransform3D extends EventDispatcher {
    /**@private */
    private static _tempVector3;
    /**@private */
    private static _angleToRandin;
    /** @private */
    private _localMatrix;
    /** @private */
    private _worldMatrix;
    /** @private */
    private _localPosition;
    /** @private */
    private _localRotation;
    /** @private */
    private _localScale;
    /** @private */
    private _localQuaternionUpdate;
    /** @private */
    private _locaEulerlUpdate;
    /** @private */
    private _localUpdate;
    /** @private */
    private _parent;
    /** @private */
    private _children;
    /**@private */
    _localRotationEuler: Vector3;
    /**@private */
    _owner: AnimationNode;
    /** @private */
    _worldUpdate: boolean;
    /**
     * 创建一个 <code>Transform3D</code> 实例。
     * @param owner 所属精灵。
     */
    constructor(owner: AnimationNode, localPosition?: Float32Array, localRotation?: Float32Array, localScale?: Float32Array, worldMatrix?: Float32Array);
    /**
     * @private
     */
    private _getlocalMatrix;
    /**
     * @private
     */
    private _onWorldTransform;
    /**
     * @private
     */
    /**
    * @private
    */
    localPosition: Vector3;
    /**
     * @private
     */
    /*
    * @private
    */
    localRotation: Quaternion;
    /**
     * @private
     */
    /**
    * @private
    */
    localScale: Vector3;
    /**
     * @private
     */
    /**
    * @private
    */
    localRotationEuler: Vector3;
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
