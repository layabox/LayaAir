import { Animator } from "../component/Animator";
import { Mesh } from "../resource/models/Mesh";
import { Avatar } from "././Avatar";
import { Bounds } from "././Bounds";
import { MeshRenderer } from "././MeshRenderer";
import { RenderableSprite3D } from "././RenderableSprite3D";
import { Sprite3D } from "././Sprite3D";
import { Transform3D } from "././Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
/**
 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
 */
export declare class SkinnedMeshRenderer extends MeshRenderer {
    /**@private */
    private static _tempMatrix4x4;
    /**@private */
    private _cacheMesh;
    /** @private */
    private _bones;
    /** @private */
    _skinnedData: any[];
    /** @private */
    private _skinnedDataLoopMarks;
    /**@private */
    private _localBounds;
    /**@private */
    private _cacheAnimator;
    /**@private */
    private _cacheRootBone;
    /**
     * 获取局部边界。
     * @return 边界。
     */
    /**
    * 设置局部边界。
    * @param value 边界
    */
    localBounds: Bounds;
    /**
     * 获取根节点。
     * @return 根节点。
     */
    /**
    * 设置根节点。
    * @param value 根节点。
    */
    rootBone: Sprite3D;
    /**
     * 用于蒙皮的骨骼。
     */
    readonly bones: Sprite3D[];
    /**
     * 创建一个 <code>SkinnedMeshRender</code> 实例。
     */
    constructor(owner: RenderableSprite3D);
    /**
     * @private
     */
    private _computeSkinnedDataForNative;
    private _computeSkinnedData;
    /**
     * @private
     */
    private _computeSubSkinnedData;
    /**
     * @private
     */
    private _boundChange;
    /**
     *@inheritDoc
     */
    _createRenderElement(): RenderElement;
    /**
     *@inheritDoc
     */
    _onMeshChange(value: Mesh): void;
    /**
     * @private
     */
    _setCacheAnimator(animator: Animator): void;
    /**
     * @inheritDoc
     */
    protected _calculateBoundingBox(): void;
    /**
     * @inheritDoc
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void;
    /**
     * @inheritDoc
     */
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void;
    /**
     * @inheritDoc
     */
    _destroy(): void;
    /**@private */
    _rootBone: string;
    /**@private */
    private _cacheAvatar;
    /**@private */
    private _cacheRootAnimationNode;
    /** @private */
    private _cacheAnimationNode;
    /**
     * @private
     */
    _setRootBone(name: string): void;
    /**
     * @private
     */
    private _setRootNode;
    /**
     * @private
     */
    private _getCacheAnimationNodes;
    /**
     * @private
     */
    _setCacheAvatar(value: Avatar): void;
    /**@private	[NATIVE]*/
    private _cacheAnimationNodeIndices;
    /**
     * @private [NATIVE]
     */
    private _computeSubSkinnedDataNative;
}
