import { BoundFrustum } from "../math/BoundFrustum";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Mesh } from "../resource/models/Mesh";
import { RenderableSprite3D } from "././RenderableSprite3D";
import { Transform3D } from "././Transform3D";
import { BaseRender } from "./render/BaseRender";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
/**
 * <code>MeshRenderer</code> 类用于网格渲染器。
 */
export declare class MeshRenderer extends BaseRender {
    /**@private */
    private static _tempVector30;
    /**@private */
    private static _tempVector31;
    /** @private */
    protected _oriDefineValue: number;
    /** @private */
    protected _projectionViewWorldMatrix: Matrix4x4;
    /**
     * 创建一个新的 <code>MeshRender</code> 实例。
     */
    constructor(owner: RenderableSprite3D);
    /**
     * @private
     */
    _createRenderElement(): RenderElement;
    /**
     * @private
     */
    _onMeshChange(mesh: Mesh): void;
    /**
     * @inheritDoc
     */
    protected _calculateBoundingBox(): void;
    /**
     * @inheritDoc
     */
    _needRender(boundFrustum: BoundFrustum): boolean;
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
    _renderUpdateWithCameraForNative(context: RenderContext3D, transform: Transform3D): void;
    /**
     * @private
     */
    _revertBatchRenderUpdate(context: RenderContext3D): void;
    /**
     * @inheritDoc
     */
    _destroy(): void;
}
