import { AnimationTransform3D } from "./AnimationTransform3D";
/**
 * <code>BoneNode</code> 类用于实现骨骼节点。
 */
export class AnimationNode {
    /**
     * 创建一个新的 <code>AnimationNode</code> 实例。
     */
    constructor(localPosition = null /*[NATIVE]*/, localRotation = null /*[NATIVE]*/, localScale = null /*[NATIVE]*/, worldMatrix = null /*[NATIVE]*/) {
        this._children = [];
        this.transform = new AnimationTransform3D(this, localPosition, localRotation, localScale, worldMatrix);
    }
    /**
     * 添加子节点。
     * @param	child  子节点。
     */
    addChild(child) {
        child._parent = this;
        child.transform.setParent(this.transform);
        this._children.push(child);
    }
    /**
     * 移除子节点。
     * @param	child 子节点。
     */
    removeChild(child) {
        var index = this._children.indexOf(child);
        (index !== -1) && (this._children.splice(index, 1));
    }
    /**
     * 根据名字获取子节点。
     * @param	name 名字。
     */
    getChildByName(name) {
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            if (child.name === name)
                return child;
        }
        return null;
    }
    /**
     * 根据索引获取子节点。
     * @param	index 索引。
     */
    getChildByIndex(index) {
        return this._children[index];
    }
    /**
     * 获取子节点的个数。
     */
    getChildCount() {
        return this._children.length;
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destNode = destObject;
        destNode.name = this.name;
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            var destChild = child.clone();
            destNode.addChild(destChild);
            var transform = child.transform;
            var destTransform = destChild.transform;
            var destLocalPosition = destTransform.localPosition;
            var destLocalRotation = destTransform.localRotation;
            var destLocalScale = destTransform.localScale;
            transform.localPosition.cloneTo(destLocalPosition);
            transform.localRotation.cloneTo(destLocalRotation);
            transform.localScale.cloneTo(destLocalScale);
            destTransform.localPosition = destLocalPosition; //深拷贝
            destTransform.localRotation = destLocalRotation; //深拷贝
            destTransform.localScale = destLocalScale; //深拷贝
        }
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new AnimationNode();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @internal [NATIVE]
     */
    _cloneNative(localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar) {
        var curID = avatar._nativeCurCloneCount;
        animationNodeParentIndices[curID] = parentIndex;
        var localPosition = new Float32Array(localPositions.buffer, curID * 3 * 4, 3);
        var localRotation = new Float32Array(localRotations.buffer, curID * 4 * 4, 4);
        var localScale = new Float32Array(localScales.buffer, curID * 3 * 4, 3);
        var worldMatrix = new Float32Array(animationNodeWorldMatrixs.buffer, curID * 16 * 4, 16);
        var dest = new AnimationNode(localPosition, localRotation, localScale, worldMatrix);
        dest._worldMatrixIndex = curID;
        this._cloneToNative(dest, localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, curID, avatar);
        return dest;
    }
    /**
     * @internal [NATIVE]
     */
    _cloneToNative(destObject, localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar) {
        var destNode = destObject;
        destNode.name = this.name;
        for (var i = 0, n = this._children.length; i < n; i++) {
            var child = this._children[i];
            avatar._nativeCurCloneCount++;
            var destChild = child._cloneNative(localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar);
            destNode.addChild(destChild);
            var transform = child.transform;
            var destTransform = destChild.transform;
            var destLocalPosition = destTransform.localPosition;
            var destLocalRotation = destTransform.localRotation;
            var destLocalScale = destTransform.localScale;
            transform.localPosition.cloneTo(destLocalPosition);
            transform.localRotation.cloneTo(destLocalRotation);
            transform.localScale.cloneTo(destLocalScale);
            destTransform.localPosition = destLocalPosition; //深拷贝
            destTransform.localRotation = destLocalRotation; //深拷贝
            destTransform.localScale = destLocalScale; //深拷贝
        }
    }
}
