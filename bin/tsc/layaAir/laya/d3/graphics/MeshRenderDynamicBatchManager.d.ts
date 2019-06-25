import { DynamicBatchManager } from "././DynamicBatchManager";
import { VertexDeclaration } from "././VertexDeclaration";
import { BufferState } from "../core/BufferState";
import { BatchMark } from "../core/render/BatchMark";
import { RenderElement } from "../core/render/RenderElement";
/**
 * @private
 * <code>MeshSprite3DDynamicBatchManager</code> 类用于网格精灵动态批处理管理。
 */
export declare class MeshRenderDynamicBatchManager extends DynamicBatchManager {
    /** @private */
    static instance: MeshRenderDynamicBatchManager;
    /**@private */
    private _instanceBatchOpaqueMarks;
    /**@private */
    private _vertexBatchOpaqueMarks;
    /**@private */
    private _cacheBufferStates;
    /**@private [只读]*/
    _updateCountMark: number;
    /**
     * 创建一个 <code>MeshSprite3DDynamicBatchManager</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    getInstanceBatchOpaquaMark(receiveShadow: boolean, materialID: number, subMeshID: number, invertFace: boolean): BatchMark;
    /**
     * @private
     */
    getVertexBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, verDecID: number): BatchMark;
    /**
     * @private
     */
    _getBufferState(vertexDeclaration: VertexDeclaration): BufferState;
    /**
     * @inheritDoc
     */
    _getBatchRenderElementFromPool(): RenderElement;
    /**
     * @inheritDoc
     */
    _clear(): void;
}
