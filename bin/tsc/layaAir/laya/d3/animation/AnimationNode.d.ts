import { AnimationTransform3D } from "././AnimationTransform3D";
import { Avatar } from "../core/Avatar";
import { IClone } from "../core/IClone";
/**
 * <code>BoneNode</code> 类用于实现骨骼节点。
 */
export declare class AnimationNode implements IClone {
    /**@private */
    private _children;
    /**@private */
    _parent: AnimationNode;
    /**@private [只读]*/
    transform: AnimationTransform3D;
    /**节点名称。 */
    name: string;
    /**@private	[NATIVE]*/
    _worldMatrixIndex: number;
    /**
     * 创建一个新的 <code>AnimationNode</code> 实例。
     */
    constructor(localPosition?: Float32Array, localRotation?: Float32Array, localScale?: Float32Array, worldMatrix?: Float32Array);
    /**
     * 添加子节点。
     * @param	child  子节点。
     */
    addChild(child: AnimationNode): void;
    /**
     * 移除子节点。
     * @param	child 子节点。
     */
    removeChild(child: AnimationNode): void;
    /**
     * 根据名字获取子节点。
     * @param	name 名字。
     */
    getChildByName(name: string): AnimationNode;
    /**
     * 根据索引获取子节点。
     * @param	index 索引。
     */
    getChildByIndex(index: number): AnimationNode;
    /**
     * 获取子节点的个数。
     */
    getChildCount(): number;
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
    /**
     * @private [NATIVE]
     */
    _cloneNative(localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, animationNodeWorldMatrixs: Float32Array, animationNodeParentIndices: Int16Array, parentIndex: number, avatar: Avatar): any;
    /**
     * @private [NATIVE]
     */
    _cloneToNative(destObject: any, localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, animationNodeWorldMatrixs: Float32Array, animationNodeParentIndices: Int16Array, parentIndex: number, avatar: Avatar): void;
}
