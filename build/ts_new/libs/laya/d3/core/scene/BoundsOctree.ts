import { BoundsOctreeNode } from "./BoundsOctreeNode";
import { OctreeMotionList } from "./OctreeMotionList";
import { IOctreeObject } from "./IOctreeObject";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { RenderContext3D } from "../render/RenderContext3D";
import { BoundBox } from "../../math/BoundBox";
import { Ray } from "../../math/Ray";
import { Vector3 } from "../../math/Vector3";
import { Shader3D } from "../../shader/Shader3D";
import { CameraCullInfo } from "../../graphics/FrustumCulling";

/**
 * <code>BoundsOctree</code> 类用于创建八叉树。
 */
export class BoundsOctree {
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();

	/**@internal */
	private _initialSize: number;
	/**@internal */
	private _rootNode: BoundsOctreeNode;
	/**@internal */
	private _motionObjects: OctreeMotionList = new OctreeMotionList();

	/**@internal */
	_looseness: number;
	/**@internal */
	_minSize: number;

	/**@internal [只读]*/
	count: number = 0;

	/**
	 * 创建一个 <code>BoundsOctree</code> 实例。
	 * @param	initialWorldSize 八叉树尺寸
	 * @param	initialWorldPos 八叉树中心
	 * @param	minNodeSize  节点最小尺寸
	 * @param	loosenessVal 松散值
	 */
	constructor(initialWorldSize: number, initialWorldPos: Vector3, minNodeSize: number, looseness: number) {
		if (minNodeSize > initialWorldSize) {
			console.warn("Minimum node size must be at least as big as the initial world size. Was: " + minNodeSize + " Adjusted to: " + initialWorldSize);
			minNodeSize = initialWorldSize;
		}
		this._initialSize = initialWorldSize;
		this._minSize = minNodeSize;
		this._looseness = Math.min(Math.max(looseness, 1.0), 2.0);
		this._rootNode = new BoundsOctreeNode(this, null, initialWorldSize, initialWorldPos);
	}

	/**
	 * @internal
	 */
	private _getMaxDepth(node: BoundsOctreeNode, depth: number): number {
		depth++;
		var children: BoundsOctreeNode[] = node._children;
		if (children != null) {
			var curDepth: number = depth;
			for (var i: number = 0, n: number = children.length; i < n; i++) {
				var child: BoundsOctreeNode = children[i];
				child && (depth = Math.max(this._getMaxDepth(child, curDepth), depth));
			}
		}
		return depth;
	}

	/**
	 * @internal
	 */
	_grow(growObjectCenter: Vector3): void {
		var xDirection: number = growObjectCenter.x >= 0 ? 1 : -1;
		var yDirection: number = growObjectCenter.y >= 0 ? 1 : -1;
		var zDirection: number = growObjectCenter.z >= 0 ? 1 : -1;
		var oldRoot: BoundsOctreeNode = this._rootNode;
		var half: number = this._rootNode.baseLength / 2;
		var newLength: number = this._rootNode.baseLength * 2;
		var rootCenter: Vector3 = this._rootNode.center;
		var newCenter: Vector3 = new Vector3(rootCenter.x + xDirection * half, rootCenter.y + yDirection * half, rootCenter.z + zDirection * half);

		//创建新的八叉树根节点
		this._rootNode = new BoundsOctreeNode(this, null, newLength, newCenter);

		if (oldRoot.hasAnyObjects()) {
			var rootPos: number = this._rootNode._bestFitChild(oldRoot.center);
			var children: BoundsOctreeNode[] = [];
			for (var i: number = 0; i < 8; i++) {
				if (i == rootPos) {
					oldRoot._parent = this._rootNode;
					children[i] = oldRoot;
				}
			}
			// Attach the new children to the new root node
			this._rootNode._children = children;
		}
	}

	/**
	 * 添加物体
	 * @param	object
	 */
	add(object: IOctreeObject): void {
		var count: number = 0;
		while (!this._rootNode.add(object)) {
			var growCenter: Vector3 = BoundsOctree._tempVector30;
			Vector3.subtract(object.bounds.getCenter(), this._rootNode.center, growCenter);
			this._grow(growCenter);
			if (++count > 20) {
				throw "Aborted Add operation as it seemed to be going on forever (" + (count - 1) + ") attempts at growing the octree.";
			}
		}
		this.count++;
	}

	/**
	 * 移除物体
	 * @return 是否成功
	 */
	remove(object: IOctreeObject): boolean {
		var removed: boolean = object._getOctreeNode().remove(object);
		if (removed) {
			this.count--;
		}
		return removed;
	}

	/**
	 * 更新物体
	 */
	update(object: IOctreeObject): boolean {
		var count: number = 0;
		var octreeNode: BoundsOctreeNode = object._getOctreeNode();
		if (octreeNode) {
			while (!octreeNode._update(object)) {
				var growCenter: Vector3 = BoundsOctree._tempVector30;
				Vector3.subtract(object.bounds.getCenter(), this._rootNode.center, growCenter);
				this._grow(growCenter);
				if (++count > 20) {
					throw "Aborted Add operation as it seemed to be going on forever (" + (count - 1) + ") attempts at growing the octree.";
				}
			}

			return true;
		} else {//节点从场景中移除时octreeNode为空
			return false;
		}
	}

	/**
	 * 如果可能则收缩根节点。
	 */
	shrinkRootIfPossible(): void {
		this._rootNode = this._rootNode.shrinkIfPossible(this._initialSize);
	}

	/**
	 * 添加运动物体。
	 * @param 运动物体。
	 */
	addMotionObject(object: IOctreeObject): void {
		this._motionObjects.add(object);
	}

	/**
	 * 移除运动物体。
	 * @param 运动物体。
	 */
	removeMotionObject(object: IOctreeObject): void {
		this._motionObjects.remove(object);
	}

	/**
	 * 更新所有运动物体。
	 */
	updateMotionObjects(): void {
		var elements: IOctreeObject[] = this._motionObjects.elements;
		for (var i: number = 0, n: number = this._motionObjects.length; i < n; i++) {
			var object: IOctreeObject = <any>elements[i];
			this.update(object);
			object._setIndexInMotionList(-1);
		}
		this._motionObjects.length = 0;
	}

	/**
	 * 获取是否与指定包围盒相交。
	 * @param checkBound AABB包围盒。
	 * @return 是否相交。
	 */
	isCollidingWithBoundBox(checkBounds: BoundBox): boolean {
		return this._rootNode.isCollidingWithBoundBox(checkBounds);
	}

	/**
	 *	获取是否与指定射线相交。
	 * 	@param	ray 射线。
	 * 	@param	maxDistance 射线的最大距离。
	 *  @return 是否相交。
	 */
	isCollidingWithRay(ray: Ray, maxDistance: number = Number.MAX_VALUE): boolean {
		return this._rootNode.isCollidingWithRay(ray, maxDistance);
	}

	/**
	 * 获取与指定包围盒相交的物体列表。
	 * @param checkBound AABB包围盒。
	 * @param result 相交物体列表
	 */
	getCollidingWithBoundBox(checkBound: BoundBox, result: any[]): void {
		this._rootNode.getCollidingWithBoundBox(checkBound, result);
	}

	/**
	 *	获取与指定射线相交的的物理列表。
	 * 	@param	ray 射线。
	 * 	@param	result 相交物体列表。
	 * 	@param	maxDistance 射线的最大距离。
	 */
	getCollidingWithRay(ray: Ray, result: any[], maxDistance: number = Number.MAX_VALUE): void {
		this._rootNode.getCollidingWithRay(ray, result, maxDistance);
	}

	/**
	 *	获取与指定视锥相交的的物理列表。
	 *  @param 渲染上下文。
	 */
	getCollidingWithFrustum(cameraCullInfo: CameraCullInfo, context: RenderContext3D, shader: Shader3D, replacementTag: string, isShadowCasterCull: boolean): void {
		this._rootNode.getCollidingWithFrustum(cameraCullInfo, context, shader, replacementTag, isShadowCasterCull);
	}

	/**
	 * 获取最大包围盒
	 * @return 最大包围盒
	 */
	getMaxBounds(): BoundBox {
		return this._rootNode.getBound();
	}

	/**
	 * @internal
	 * [Debug]
	 */
	drawAllBounds(pixelLine: PixelLineSprite3D): void {
		var maxDepth: number = this._getMaxDepth(this._rootNode, -1);
		this._rootNode.drawAllBounds(pixelLine, -1, maxDepth);
	}

	/**
	 * @internal
	 * [Debug]
	 */
	drawAllObjects(pixelLine: PixelLineSprite3D): void {
		var maxDepth: number = this._getMaxDepth(this._rootNode, -1);
		this._rootNode.drawAllObjects(pixelLine, -1, maxDepth);
	}

}


