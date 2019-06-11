import { DynamicBatchManager } from "././DynamicBatchManager";
import { SubMeshDynamicBatch } from "././SubMeshDynamicBatch";
import { BufferState } from "../core/BufferState";
import { BatchMark } from "../core/render/BatchMark";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
/**
 * @private
 * <code>MeshSprite3DDynamicBatchManager</code> 类用于网格精灵动态批处理管理。
 */
export class MeshRenderDynamicBatchManager extends DynamicBatchManager {
    /**
     * 创建一个 <code>MeshSprite3DDynamicBatchManager</code> 实例。
     */
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /**@private */
        this._instanceBatchOpaqueMarks = [];
        /**@private */
        this._vertexBatchOpaqueMarks = [];
        /**@private */
        this._cacheBufferStates = [];
        this._updateCountMark = 0;
    }
    /**
     * @private
     */
    getInstanceBatchOpaquaMark(lightMapIndex, receiveShadow, materialID, subMeshID) {
        var instanceLightMapMarks = (this._instanceBatchOpaqueMarks[lightMapIndex]) || (this._instanceBatchOpaqueMarks[lightMapIndex] = []);
        var instanceReceiveShadowMarks = (instanceLightMapMarks[receiveShadow ? 0 : 1]) || (instanceLightMapMarks[receiveShadow ? 0 : 1] = []);
        var instanceMaterialMarks = (instanceReceiveShadowMarks[materialID]) || (instanceReceiveShadowMarks[materialID] = []);
        return instanceMaterialMarks[subMeshID] || (instanceMaterialMarks[subMeshID] = new BatchMark());
    }
    /**
     * @private
     */
    getVertexBatchOpaquaMark(lightMapIndex, receiveShadow, materialID, verDecID) {
        var dynLightMapMarks = (this._vertexBatchOpaqueMarks[lightMapIndex]) || (this._vertexBatchOpaqueMarks[lightMapIndex] = []);
        var dynReceiveShadowMarks = (dynLightMapMarks[receiveShadow ? 0 : 1]) || (dynLightMapMarks[receiveShadow ? 0 : 1] = []);
        var dynMaterialMarks = (dynReceiveShadowMarks[materialID]) || (dynReceiveShadowMarks[materialID] = []);
        return dynMaterialMarks[verDecID] || (dynMaterialMarks[verDecID] = new BatchMark());
    }
    /**
     * @private
     */
    _getBufferState(vertexDeclaration) {
        var bufferState = this._cacheBufferStates[vertexDeclaration.id];
        if (!bufferState) {
            var instance = SubMeshDynamicBatch.instance;
            bufferState = new BufferState();
            bufferState.bind();
            var vertexBuffer = instance._vertexBuffer;
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            bufferState.applyVertexBuffer(vertexBuffer);
            bufferState.applyIndexBuffer(instance._indexBuffer);
            bufferState.unBind();
            this._cacheBufferStates[vertexDeclaration.id] = bufferState;
        }
        return bufferState;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _getBatchRenderElementFromPool() {
        var renderElement = this._batchRenderElementPool[this._batchRenderElementPoolIndex++];
        if (!renderElement) {
            renderElement = new SubMeshRenderElement();
            this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
            renderElement.vertexBatchElementList = [];
            renderElement.instanceBatchElementList = [];
        }
        return renderElement;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _clear() {
        super._clear();
        this._updateCountMark++;
    }
}
/** @private */
MeshRenderDynamicBatchManager.instance = new MeshRenderDynamicBatchManager();
