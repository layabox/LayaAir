import { AnimationTransform3D } from "./AnimationTransform3D";
import { Avatar } from "../core/Avatar"
import { IClone } from "../core/IClone"
import { Quaternion } from "../math/Quaternion"
import { Vector3 } from "../math/Vector3"

/**
 * <code>BoneNode</code> 类用于实现骨骼节点。
 */
export class AnimationNode implements IClone {
	private _children: AnimationNode[];

	/**@internal */
	_parent: AnimationNode|null = null;
	/**@internal [只读]*/
	transform: AnimationTransform3D;

	/**节点名称。 */
	name: string|null = null;

	/**@internal	[NATIVE]*/
	_worldMatrixIndex: number = 0;

	/**
	 * 创建一个新的 <code>AnimationNode</code> 实例。
	 */
	constructor() {
		this._children = [];
		this.transform = new AnimationTransform3D(this);
	}

	/**
	 * 添加子节点。
	 * @param	child  子节点。
	 */
	addChild(child: AnimationNode): void {
		child._parent = this;
		child.transform.setParent(this.transform);
		this._children.push(child);
	}

	/**
	 * 移除子节点。
	 * @param	child 子节点。
	 */
	removeChild(child: AnimationNode): void {
		var index: number = this._children.indexOf(child);
		(index !== -1) && (this._children.splice(index, 1));
	}

	/**
	 * 根据名字获取子节点。
	 * @param	name 名字。
	 */
	getChildByName(name: string): AnimationNode|null {
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: AnimationNode = this._children[i];
			if (child.name === name)
				return child;
		}
		return null;
	}

	/**
	 * 根据索引获取子节点。
	 * @param	index 索引。
	 */
	getChildByIndex(index: number): AnimationNode {
		return this._children[index];
	}

	/**
	 * 获取子节点的个数。
	 */
	getChildCount(): number {
		return this._children.length;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destNode: AnimationNode = (<AnimationNode>destObject);
		destNode.name = this.name;
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: AnimationNode = this._children[i];
			var destChild: AnimationNode = child.clone();
			destNode.addChild(destChild);
			var transform: AnimationTransform3D = child.transform;
			var destTransform: AnimationTransform3D = destChild.transform;

			var destLocalPosition: Vector3 = destTransform.localPosition;
			var destLocalRotation: Quaternion = destTransform.localRotation;
			var destLocalScale: Vector3 = destTransform.localScale;

			transform.localPosition.cloneTo(destLocalPosition);
			transform.localRotation.cloneTo(destLocalRotation);
			transform.localScale.cloneTo(destLocalScale);

			destTransform.localPosition = destLocalPosition;//深拷贝
			destTransform.localRotation = destLocalRotation;//深拷贝
			destTransform.localScale = destLocalScale;//深拷贝
		}
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: AnimationNode = new AnimationNode();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @internal [NATIVE]
	 */
	_cloneNative(localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, animationNodeWorldMatrixs: Float32Array, animationNodeParentIndices: Int16Array, parentIndex: number, avatar: Avatar): any {
		var curID: number = avatar._nativeCurCloneCount;
		animationNodeParentIndices[curID] = parentIndex;
		var dest: AnimationNode = new AnimationNode();
		dest._worldMatrixIndex = curID;
		this._cloneToNative(dest, localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, curID, avatar);
		return dest;
	}

	/**
	 * @internal [NATIVE]
	 */
	_cloneToNative(destObject: any, localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, animationNodeWorldMatrixs: Float32Array, animationNodeParentIndices: Int16Array, parentIndex: number, avatar: Avatar): void {
		var destNode: AnimationNode = (<AnimationNode>destObject);
		destNode.name = this.name;
		for (var i: number = 0, n: number = this._children.length; i < n; i++) {
			var child: AnimationNode = this._children[i];
			avatar._nativeCurCloneCount++;
			var destChild: AnimationNode = child._cloneNative(localPositions, localRotations, localScales, animationNodeWorldMatrixs, animationNodeParentIndices, parentIndex, avatar);
			destNode.addChild(destChild);
			var transform: AnimationTransform3D = child.transform;
			var destTransform: AnimationTransform3D = destChild.transform;

			var destLocalPosition: Vector3 = destTransform.localPosition;
			var destLocalRotation: Quaternion = destTransform.localRotation;
			var destLocalScale: Vector3 = destTransform.localScale;

			transform.localPosition.cloneTo(destLocalPosition);
			transform.localRotation.cloneTo(destLocalRotation);
			transform.localScale.cloneTo(destLocalScale);

			destTransform.localPosition = destLocalPosition;//深拷贝
			destTransform.localRotation = destLocalRotation;//深拷贝
			destTransform.localScale = destLocalScale;//深拷贝
		}
	}

}


