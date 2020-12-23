import { BoundsOctreeNode } from "./BoundsOctreeNode";
import { Bounds } from "../Bounds"

/**
 * <code>IOctreeObject</code> 类用于实现八叉树物体规范。
 */
export interface IOctreeObject {
	/**获得八叉树节点 */
	_getOctreeNode(): BoundsOctreeNode;
	/**设置八叉树节点 */
	_setOctreeNode(value: BoundsOctreeNode): void;
	/**获得动态列表中的Index */
	_getIndexInMotionList(): number;
	/**设置动态列表中的Index */
	_setIndexInMotionList(value: number): void;
	/**包围盒 */
	bounds: Bounds;
}
