import { KeyframeNodeOwner } from "./KeyframeNodeOwner";
import { AnimatorControllerLayer } from "./AnimatorControllerLayer";
import { AnimatorState } from "./AnimatorState";
import { AnimatorPlayState } from "./AnimatorPlayState";
import { KeyframeNode } from "../animation/KeyframeNode";
import { Avatar } from "../core/Avatar";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { Scene3D } from "../core/scene/Scene3D";
import { Component } from "../../components/Component";
/**
 * <code>Animator</code> 类用于创建动画组件。
 */
export declare class Animator extends Component {
    /** @private */
    private static _tempVector30;
    /** @private */
    private static _tempVector31;
    /** @private */
    private static _tempQuaternion0;
    /** @private */
    private static _tempQuaternion1;
    /** @private */
    private static _tempVector3Array0;
    /** @private */
    private static _tempVector3Array1;
    /** @private */
    private static _tempQuaternionArray0;
    /** @private */
    private static _tempQuaternionArray1;
    /** 裁剪模式_始终播放动画。*/
    static CULLINGMODE_ALWAYSANIMATE: number;
    /** 裁剪模式_不可见时完全不播放动画。*/
    static CULLINGMODE_CULLCOMPLETELY: number;
    /**
     * @private
     */
    static _update(scene: Scene3D): void;
    /**@private */
    private _speed;
    /**@private */
    private _keyframeNodeOwnerMap;
    /**@private */
    private _keyframeNodeOwners;
    /**@private */
    private _updateMark;
    /**@private */
    private _controllerLayers;
    /**@private */
    _linkSprites: any;
    /**@private	*/
    _avatarNodeMap: any;
    /**@private */
    _linkAvatarSpritesData: any;
    /**@private */
    _linkAvatarSprites: Sprite3D[];
    /**@private */
    _renderableSprites: RenderableSprite3D[];
    /**	裁剪模式*/
    cullingMode: number;
    /**@private	[NATIVE]*/
    _animationNodeLocalPositions: Float32Array;
    /**@private	[NATIVE]*/
    _animationNodeLocalRotations: Float32Array;
    /**@private	[NATIVE]*/
    _animationNodeLocalScales: Float32Array;
    /**@private	[NATIVE]*/
    _animationNodeWorldMatrixs: Float32Array;
    /**@private	[NATIVE]*/
    _animationNodeParentIndices: Int16Array;
    /**
     * 获取动画的播放速度,1.0为正常播放速度。
     * @return 动画的播放速度。
     */
    /**
    * 设置动画的播放速度,1.0为正常播放速度。
    * @param 动画的播放速度。
    */
    speed: number;
    /**
     * 创建一个 <code>Animation</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _linkToSprites;
    /**
     * @private
     */
    private _addKeyframeNodeOwner;
    /**
     * @private
     */
    _removeKeyframeNodeOwner(nodeOwners: KeyframeNodeOwner[], node: KeyframeNode): void;
    /**
     * @private
     */
    _getOwnersByClip(clipStateInfo: AnimatorState): void;
    /**
     * @private
     */
    private _updatePlayer;
    /**
     * @private
     */
    private _eventScript;
    /**
     * @private
     */
    private _updateEventScript;
    /**
     * @private
     */
    private _updateClipDatas;
    /**
     * @private
     */
    private _applyFloat;
    /**
     * @private
     */
    private _applyPositionAndRotationEuler;
    /**
     * @private
     */
    private _applyRotation;
    /**
     * @private
     */
    private _applyScale;
    /**
     * @private
     */
    private _applyCrossData;
    /**
     * @private
     */
    private _setClipDatasToNode;
    /**
     * @private
     */
    private _setCrossClipDatasToNode;
    /**
     * @private
     */
    private _setFixedCrossClipDatasToNode;
    /**
     * @private
     */
    private _revertDefaultKeyframeNodes;
    /**
     * @inheritDoc
     */
    _onAdded(): void;
    /**
     * @inheritDoc
     */
    protected _onDestroy(): void;
    /**
     * @inheritDoc
     */
    protected _onEnable(): void;
    /**
     * @inheritDoc
     */
    protected _onDisable(): void;
    /**
     * @private
     */
    _handleSpriteOwnersBySprite(isLink: boolean, path: string[], sprite: Sprite3D): void;
    /**
     * @inheritDoc
     */
    _parse(data: any): void;
    /**
     * @private
     */
    _update(): void;
    /**
     * @private
     */
    _cloneTo(dest: Component): void;
    /**
     * 获取默认动画状态。
     * @param	layerIndex 层索引。
     * @return 默认动画状态。
     */
    getDefaultState(layerIndex?: number): AnimatorState;
    /**
     * 添加动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    addState(state: AnimatorState, layerIndex?: number): void;
    /**
     * 移除动画状态。
     * @param	state 动画状态。
     * @param   layerIndex 层索引。
     */
    removeState(state: AnimatorState, layerIndex?: number): void;
    /**
     * 添加控制器层。
     */
    addControllerLayer(controllderLayer: AnimatorControllerLayer): void;
    /**
     * 获取控制器层。
     */
    getControllerLayer(layerInex?: number): AnimatorControllerLayer;
    /**
     * 获取当前的播放状态。
     *	@param   layerIndex 层索引。
     * 	@return  动画播放状态。
     */
    getCurrentAnimatorPlayState(layerInex?: number): AnimatorPlayState;
    /**
     * 播放动画。
     * @param	name 如果为null则播放默认动画，否则按名字播放动画片段。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    play(name?: string, layerIndex?: number, normalizedTime?: number): void;
    /**
     * 在当前动画状态和目标动画状态之间进行融合过渡播放。
     * @param	name 目标动画状态。
     * @param	transitionDuration 过渡时间,该值为当前动画状态的归一化时间，值在0.0~1.0之间。
     * @param	layerIndex 层索引。
     * @param	normalizedTime 归一化的播放起始时间。
     */
    crossFade(name: string, transitionDuration: number, layerIndex?: number, normalizedTime?: number): void;
    /**@private */
    private _avatar;
    /**
     * 获取avatar。
     * @return avator。
     */
    /**
    * 设置avatar。
    * @param value avatar。
    */
    avatar: Avatar;
    /**
     * @private
     */
    private _getAvatarOwnersAndInitDatasAsync;
    /**
     * @private
     */
    private _isLinkSpriteToAnimationNode;
    /**
     * @private
     */
    private _isLinkSpriteToAnimationNodeData;
    /**
     *@private
     */
    _updateAvatarNodesToSprite(): void;
    /**
     * 关联精灵节点到Avatar节点,此Animator必须有Avatar文件。
     * @param nodeName 关联节点的名字。
     * @param sprite3D 精灵节点。
     * @return 是否关联成功。
     */
    linkSprite3DToAvatarNode(nodeName: string, sprite3D: Sprite3D): boolean;
    /**
     * 解除精灵节点到Avatar节点的关联,此Animator必须有Avatar文件。
     * @param sprite3D 精灵节点。
     * @return 是否解除关联成功。
     */
    unLinkSprite3DToAvatarNode(sprite3D: Sprite3D): boolean;
    /**
     *@private
     * [NATIVE]
     */
    _updateAnimationNodeWorldMatix(localPositions: Float32Array, localRotations: Float32Array, localScales: Float32Array, worldMatrixs: Float32Array, parentIndices: Int16Array): void;
}
