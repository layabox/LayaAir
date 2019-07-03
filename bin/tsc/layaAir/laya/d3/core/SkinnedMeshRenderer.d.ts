import { Mesh } from "../resource/models/Mesh";
import { Bounds } from "./Bounds";
import { MeshRenderer } from "./MeshRenderer";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Sprite3D } from "./Sprite3D";
import { Transform3D } from "./Transform3D";
import { RenderContext3D } from "./render/RenderContext3D";
import { RenderElement } from "./render/RenderElement";
/**
 * <code>SkinMeshRenderer</code> 类用于蒙皮渲染器。
 */
export declare class SkinnedMeshRenderer extends MeshRenderer {
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
    private _computeSkinnedData;
    /**
     *@inheritDoc
        */
    _createRenderElement(): RenderElement;
    /**
     *@inheritDoc
        */
    _onMeshChange(value: Mesh): void;
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
    /**
     * 获取包围盒,只读,不允许修改其值。
     * @return 包围盒。
     */
    readonly bounds: Bounds;
}
