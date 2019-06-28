import { BoundsOctreeNode } from "./BoundsOctreeNode";
import { Bounds } from "../Bounds"

/**
 * <code>IOctreeObject</code> 类用于实现八叉树物体规范。
 */
export interface IOctreeObject {
	_getOctreeNode(): BoundsOctreeNode;
	_setOctreeNode(value: BoundsOctreeNode): void;
	_getIndexInMotionList(): number;
	_setIndexInMotionList(value: number): void;
	bounds: Bounds;
}
