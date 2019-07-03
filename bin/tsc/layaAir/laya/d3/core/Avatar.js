import { AnimationNode } from "../animation/AnimationNode";
import { Render } from "../../renders/Render";
import { Resource } from "../../resource/Resource";
import { ILaya } from "../../../ILaya";
/**
 * <code>Avatar</code> 类用于创建Avatar。
 */
export class Avatar extends Resource {
    /**
     * 创建一个 <code>Avatar</code> 实例。
     */
    constructor() {
        super();
        /** [NATIVE]*/
        this._nativeNodeCount = 0;
        /**@internal [NATIVE]*/
        this._nativeCurCloneCount = 0;
    }
    /**
     * @inheritDoc
     */
    static _parse(data, propertyParams = null, constructParams = null) {
        var avatar = new Avatar();
        avatar._rootNode = new AnimationNode(new Float32Array(3), new Float32Array(4), new Float32Array(3), new Float32Array(16)); //[NATIVE],需要优化
        if (Render.supportWebGLPlusAnimation)
            avatar._nativeNodeCount++; //[NATIVE]
        if (data.version) {
            var rootNode = data.rootNode;
            (rootNode) && (avatar._parseNode(rootNode, avatar._rootNode));
        }
        return avatar;
    }
    /**
     * 加载Avatar文件。
     * @param url Avatar文件。
     * @param complete 完成回掉。
     */
    static load(url, complete) {
        ILaya.loader.create(url, complete, null, Avatar.AVATAR);
    }
    _initCloneToAnimator(destNode, destAnimator) {
        destAnimator._avatarNodeMap[destNode.name] = destNode;
        for (var i = 0, n = destNode.getChildCount(); i < n; i++)
            this._initCloneToAnimator(destNode.getChildByIndex(i), destAnimator);
    }
    _parseNode(nodaData, node) {
        var name = nodaData.props.name;
        node.name = name;
        var props = nodaData.props;
        var transform = node.transform;
        var pos = transform.localPosition;
        var rot = transform.localRotation;
        var sca = transform.localScale;
        pos.fromArray(props.translate);
        rot.fromArray(props.rotation);
        sca.fromArray(props.scale);
        transform.localPosition = pos;
        transform.localRotation = rot;
        transform.localScale = sca;
        var childrenData = nodaData.child;
        for (var j = 0, n = childrenData.length; j < n; j++) {
            var childData = childrenData[j];
            var childBone = new AnimationNode(new Float32Array(3), new Float32Array(4), new Float32Array(3), new Float32Array(16)); //[NATIVE],需要优化
            node.addChild(childBone);
            if (Render.supportWebGLPlusAnimation)
                this._nativeNodeCount++; //[NATIVE]
            this._parseNode(childData, childBone);
        }
    }
    /**
     * 克隆数据到Avatr。
     * @param	destObject 克隆源。
     */
    _cloneDatasToAnimator(destAnimator) {
        var destRoot;
        destRoot = this._rootNode.clone();
        var transform = this._rootNode.transform;
        var destTransform = destRoot.transform;
        var destPosition = destTransform.localPosition;
        var destRotation = destTransform.localRotation;
        var destScale = destTransform.localScale;
        transform.localPosition.cloneTo(destPosition);
        transform.localRotation.cloneTo(destRotation);
        transform.localScale.cloneTo(destScale);
        destTransform.localPosition = destPosition; //深拷贝
        destTransform.localRotation = destRotation; //深拷贝
        destTransform.localScale = destScale; //深拷贝
        destAnimator._avatarNodeMap = {};
        this._initCloneToAnimator(destRoot, destAnimator);
    }
    /**
     * 克隆。
     * @param	destObject 克隆源。
     */
    cloneTo(destObject) {
        var destAvatar = destObject;
        var destRoot = this._rootNode.clone();
        destAvatar._rootNode = destRoot;
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new Avatar();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @internal [NATIVE]
     */
    _cloneDatasToAnimatorNative(destAnimator) {
        var animationNodeLocalPositions = new Float32Array(this._nativeNodeCount * 3);
        var animationNodeLocalRotations = new Float32Array(this._nativeNodeCount * 4);
        var animationNodeLocalScales = new Float32Array(this._nativeNodeCount * 3);
        var animationNodeWorldMatrixs = new Float32Array(this._nativeNodeCount * 16);
        var animationNodeParentIndices = new Int16Array(this._nativeNodeCount);
        destAnimator._animationNodeLocalPositions = animationNodeLocalPositions;
        destAnimator._animationNodeLocalRotations = animationNodeLocalRotations;
        destAnimator._animationNodeLocalScales = animationNodeLocalScales;
        destAnimator._animationNodeWorldMatrixs = animationNodeWorldMatrixs;
        destAnimator._animationNodeParentIndices = animationNodeParentIndices;
        this._nativeCurCloneCount = 0;
        var destRoot = this._rootNode._cloneNative(animationNodeLocalPositions, animationNodeLocalRotations, animationNodeLocalScales, animationNodeWorldMatrixs, animationNodeParentIndices, -1, this);
        var transform = this._rootNode.transform;
        var destTransform = destRoot.transform;
        var destPosition = destTransform.localPosition;
        var destRotation = destTransform.localRotation;
        var destScale = destTransform.localScale;
        transform.localPosition.cloneTo(destPosition);
        transform.localRotation.cloneTo(destRotation);
        transform.localScale.cloneTo(destScale);
        destTransform.localPosition = destPosition; //深拷贝
        destTransform.localRotation = destRotation; //深拷贝
        destTransform.localScale = destScale; //深拷贝
        destAnimator._avatarNodeMap = {};
        this._initCloneToAnimator(destRoot, destAnimator);
    }
}
/**Avatar资源。*/
Avatar.AVATAR = "AVATAR";
