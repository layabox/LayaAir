import { BoundFrustum } from "../math/BoundFrustum";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Transform3D } from "./Transform3D";
import { BaseRender } from "./render/BaseRender";
import { RenderContext3D } from "./render/RenderContext3D";
/**
 * <code>MeshRenderer</code> 类用于网格渲染器。
 */
export declare class MeshRenderer extends BaseRender {
    /**
     * 创建一个新的 <code>MeshRender</code> 实例。
     */
    constructor(owner: RenderableSprite3D);
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
     * @inheritDoc
     */
    _destroy(): void;
}
