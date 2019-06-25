import { BatchMark } from "../core/render/BatchMark";
import { RenderElement } from "../core/render/RenderElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { StaticBatchManager } from "././StaticBatchManager";
import { VertexDeclaration } from "././VertexDeclaration";
/**
 * @private
 * <code>MeshSprite3DStaticBatchManager</code> 类用于网格精灵静态批处理管理。
 */
export declare class MeshRenderStaticBatchManager extends StaticBatchManager {
    /** @private */
    static _verDec: VertexDeclaration;
    /** @private */
    static instance: MeshRenderStaticBatchManager;
    /**@private */
    _opaqueBatchMarks: any[];
    /**@private [只读]*/
    _updateCountMark: number;
    /**
     * 创建一个 <code>MeshSprite3DStaticBatchManager</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    protected _compare(left: RenderableSprite3D, right: RenderableSprite3D): number;
    /**
     * @inheritDoc
     */
    _getBatchRenderElementFromPool(): RenderElement;
    /**
     * @private
     */
    private _getStaticBatch;
    /**
     * @inheritDoc
     */
    protected _initStaticBatchs(rootOwner: Sprite3D): void;
    /**
     * @private
     */
    _destroyRenderSprite(sprite: RenderableSprite3D): void;
    /**
     * @inheritDoc
     */
    _clear(): void;
    /**
     * @inheritDoc
     */
    _garbageCollection(): void;
    /**
     * @private
     */
    getBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, staticBatchID: number): BatchMark;
}
