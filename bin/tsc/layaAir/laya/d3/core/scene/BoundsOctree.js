import { BoundsOctreeNode } from "././BoundsOctreeNode";
import { OctreeMotionList } from "././OctreeMotionList";
import { Vector3 } from "../../math/Vector3";
/**
 * <code>BoundsOctree</code> 类用于创建八叉树。
 */
export class BoundsOctree {
    /**
     * 创建一个 <code>BoundsOctree</code> 实例。
     * @param	initialWorldSize 八叉树尺寸
     * @param	initialWorldPos 八叉树中心
     * @param	minNodeSize  节点最小尺寸
     * @param	loosenessVal 松散值
     */
    constructor(initialWorldSize, initialWorldPos, minNodeSize, looseness) {
        /**@private */
        this._motionObjects = new OctreeMotionList();
        /**@private [只读]*/
        this.count = 0;
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
     * @private
     */
    _getMaxDepth(node, depth) {
        depth++;
        var children = node._children;
        if (children != null) {
            var curDepth = depth;
            for (var i = 0, n = children.length; i < n; i++) {
                var child = children[i];
                child && (depth = Math.max(this._getMaxDepth(child, curDepth), depth));
            }
        }
        return depth;
    }
    /**
     * @private
     */
    _grow(growObjectCenter) {
        var xDirection = growObjectCenter.x >= 0 ? 1 : -1;
        var yDirection = growObjectCenter.y >= 0 ? 1 : -1;
        var zDirection = growObjectCenter.z >= 0 ? 1 : -1;
        var oldRoot = this._rootNode;
        var half = this._rootNode.baseLength / 2;
        var newLength = this._rootNode.baseLength * 2;
        var rootCenter = this._rootNode.center;
        var newCenter = new Vector3(rootCenter.x + xDirection * half, rootCenter.y + yDirection * half, rootCenter.z + zDirection * half);
        //创建新的八叉树根节点
        this._rootNode = new BoundsOctreeNode(this, null, newLength, newCenter);
        if (oldRoot.hasAnyObjects()) {
            var rootPos = this._rootNode._bestFitChild(oldRoot.center);
            var children = [];
            for (var i = 0; i < 8; i++) {
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
    add(object) {
        var count = 0;
        while (!this._rootNode.add(object)) {
            var growCenter = BoundsOctree._tempVector30;
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
    remove(object) {
        var removed = object._getOctreeNode().remove(object);
        if (removed) {
            this.count--;
        }
        return removed;
    }
    /**
     * 更新物体
     */
    update(object) {
        var count = 0;
        var octreeNode = object._getOctreeNode();
        if (octreeNode) {
            while (!octreeNode._update(object)) {
                this._grow(object.bounds.getCenter());
                if (++count > 20) {
                    throw "Aborted Add operation as it seemed to be going on forever (" + (count - 1) + ") attempts at growing the octree.";
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * 如果可能则收缩根节点。
     */
    shrinkRootIfPossible() {
        this._rootNode = this._rootNode.shrinkIfPossible(this._initialSize);
    }
    /**
     * 添加运动物体。
     * @param 运动物体。
     */
    addMotionObject(object) {
        this._motionObjects.add(object);
    }
    /**
     * 移除运动物体。
     * @param 运动物体。
     */
    removeMotionObject(object) {
        this._motionObjects.remove(object);
    }
    /**
     * 更新所有运动物体。
     */
    updateMotionObjects() {
        var elements = this._motionObjects.elements;
        for (var i = 0, n = this._motionObjects.length; i < n; i++) {
            var object = elements[i];
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
    isCollidingWithBoundBox(checkBounds) {
        return this._rootNode.isCollidingWithBoundBox(checkBounds);
    }
    /**
     *	获取是否与指定射线相交。
     * 	@param	ray 射线。
     * 	@param	maxDistance 射线的最大距离。
     *  @return 是否相交。
     */
    isCollidingWithRay(ray, maxDistance = Number.MAX_VALUE) {
        return this._rootNode.isCollidingWithRay(ray, maxDistance);
    }
    /**
     * 获取与指定包围盒相交的物体列表。
     * @param checkBound AABB包围盒。
     * @param result 相交物体列表
     */
    getCollidingWithBoundBox(checkBound, result) {
        this._rootNode.getCollidingWithBoundBox(checkBound, result);
    }
    /**
     *	获取与指定射线相交的的物理列表。
     * 	@param	ray 射线。
     * 	@param	result 相交物体列表。
     * 	@param	maxDistance 射线的最大距离。
     */
    getCollidingWithRay(ray, result, maxDistance = Number.MAX_VALUE) {
        this._rootNode.getCollidingWithRay(ray, result, maxDistance);
    }
    /**
     *	获取与指定视锥相交的的物理列表。
     *  @param 渲染上下文。
     */
    getCollidingWithFrustum(context) {
        this._rootNode.getCollidingWithFrustum(context);
    }
    /**
     * 获取最大包围盒
     * @return 最大包围盒
     */
    getMaxBounds() {
        return this._rootNode.getBound();
    }
    /**
     * @private
     * [Debug]
     */
    drawAllBounds(pixelLine) {
        var maxDepth = this._getMaxDepth(this._rootNode, -1);
        this._rootNode.drawAllBounds(pixelLine, -1, maxDepth);
    }
    /**
     * @private
     * [Debug]
     */
    drawAllObjects(pixelLine) {
        var maxDepth = this._getMaxDepth(this._rootNode, -1);
        this._rootNode.drawAllObjects(pixelLine, -1, maxDepth);
    }
}
/**@private */
BoundsOctree._tempVector30 = new Vector3();
