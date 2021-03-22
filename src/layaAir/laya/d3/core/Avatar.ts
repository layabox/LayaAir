import { IClone } from "./IClone";
import { AnimationNode } from "../animation/AnimationNode"
import { AnimationTransform3D } from "../animation/AnimationTransform3D"
import { Animator } from "../component/Animator"
import { Quaternion } from "../math/Quaternion"
import { Vector3 } from "../math/Vector3"
import { Resource } from "../../resource/Resource"
import { Handler } from "../../utils/Handler"
import { ILaya } from "../../../ILaya";
/**
 * <code>Avatar</code> 类用于创建Avatar。
 */
export class Avatar extends Resource implements IClone {
	/**Avatar资源。*/
	static AVATAR: string = "AVATAR";

	/**
	 * @inheritDoc
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): Avatar {
		var avatar: Avatar = new Avatar();
		avatar._rootNode = new AnimationNode();//[NATIVE],需要优化
		if (data.version) {
			var rootNode: any = data.rootNode;
			(rootNode) && (avatar._parseNode(rootNode, avatar._rootNode));
		}
		return avatar;
	}

	/**
	 * 加载Avatar文件。
	 * @param url Avatar文件。
	 * @param complete 完成回掉。
	 */
	static load(url: string, complete: Handler): void {
		ILaya.loader.create(url, complete, null, Avatar.AVATAR);
	}

	/**@internal */
	_rootNode: AnimationNode;

	/** [NATIVE]*/
	private _nativeNodeCount: number = 0;
	/**@internal [NATIVE]*/
	_nativeCurCloneCount: number = 0;

	/**
	 * 创建一个 <code>Avatar</code> 实例。
	 */
	constructor() {
		super();
	}


	private _initCloneToAnimator(destNode: AnimationNode, destAnimator: Animator): void {
		destAnimator._avatarNodeMap[destNode.name] = destNode;

		for (var i: number = 0, n: number = destNode.getChildCount(); i < n; i++)
			this._initCloneToAnimator(destNode.getChildByIndex(i), destAnimator);
	}

	private _parseNode(nodaData: any, node: AnimationNode): void {
		var name: string = nodaData.props.name;
		node.name = name;
		var props: any = nodaData.props;
		var transform: AnimationTransform3D = node.transform;
		var pos: Vector3 = transform.localPosition;
		var rot: Quaternion = transform.localRotation;
		var sca: Vector3 = transform.localScale;
		pos.fromArray(props.translate);
		rot.fromArray(props.rotation);
		sca.fromArray(props.scale);
		transform.localPosition = pos;
		transform.localRotation = rot;
		transform.localScale = sca;

		var childrenData: any[] = nodaData.child;
		for (var j: number = 0, n: number = childrenData.length; j < n; j++) {
			var childData: any = childrenData[j];
			var childBone: AnimationNode = new AnimationNode();//[NATIVE],需要优化
			node.addChild(childBone);
			this._parseNode(childData, childBone);
		}
	}

	/**
	 * 克隆数据到Avatr。
	 * @param	destObject 克隆源。
	 */
	_cloneDatasToAnimator(destAnimator: Animator): void {
		var destRoot: AnimationNode;
		destRoot = this._rootNode.clone();

		var transform: AnimationTransform3D = this._rootNode.transform;
		var destTransform: AnimationTransform3D = destRoot.transform;

		var destPosition: Vector3 = destTransform.localPosition;
		var destRotation: Quaternion = destTransform.localRotation;
		var destScale: Vector3 = destTransform.localScale;
		transform.localPosition.cloneTo(destPosition);
		transform.localRotation.cloneTo(destRotation);
		transform.localScale.cloneTo(destScale);
		destTransform.localPosition = destPosition;//深拷贝
		destTransform.localRotation = destRotation;//深拷贝
		destTransform.localScale = destScale;//深拷贝

		destAnimator._avatarNodeMap = {};
		this._initCloneToAnimator(destRoot, destAnimator);
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destAvatar: Avatar = (<Avatar>destObject);
		var destRoot: AnimationNode = this._rootNode.clone();
		destAvatar._rootNode = destRoot;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: Avatar = new Avatar();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @internal [NATIVE]
	 */
	_cloneDatasToAnimatorNative(destAnimator: Animator): void {
		var animationNodeLocalPositions: Float32Array = new Float32Array(this._nativeNodeCount * 3);
		var animationNodeLocalRotations: Float32Array = new Float32Array(this._nativeNodeCount * 4);
		var animationNodeLocalScales: Float32Array = new Float32Array(this._nativeNodeCount * 3);
		var animationNodeWorldMatrixs: Float32Array = new Float32Array(this._nativeNodeCount * 16);
		var animationNodeParentIndices: Int16Array = new Int16Array(this._nativeNodeCount);
		destAnimator._animationNodeLocalPositions = animationNodeLocalPositions;
		destAnimator._animationNodeLocalRotations = animationNodeLocalRotations;
		destAnimator._animationNodeLocalScales = animationNodeLocalScales;
		destAnimator._animationNodeWorldMatrixs = animationNodeWorldMatrixs;
		destAnimator._animationNodeParentIndices = animationNodeParentIndices;
		this._nativeCurCloneCount = 0;
		var destRoot: AnimationNode = this._rootNode._cloneNative(animationNodeLocalPositions, animationNodeLocalRotations, animationNodeLocalScales, animationNodeWorldMatrixs, animationNodeParentIndices, -1, this);

		var transform: AnimationTransform3D = this._rootNode.transform;
		var destTransform: AnimationTransform3D = destRoot.transform;

		var destPosition: Vector3 = destTransform.localPosition;
		var destRotation: Quaternion = destTransform.localRotation;
		var destScale: Vector3 = destTransform.localScale;
		transform.localPosition.cloneTo(destPosition);
		transform.localRotation.cloneTo(destRotation);
		transform.localScale.cloneTo(destScale);
		destTransform.localPosition = destPosition;//深拷贝
		destTransform.localRotation = destRotation;//深拷贝
		destTransform.localScale = destScale;//深拷贝

		destAnimator._avatarNodeMap = {};
		this._initCloneToAnimator(destRoot, destAnimator);
	}
}

