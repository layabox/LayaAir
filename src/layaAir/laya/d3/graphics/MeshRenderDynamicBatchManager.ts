import { DynamicBatchManager } from "././DynamicBatchManager";
import { SubMeshDynamicBatch } from "././SubMeshDynamicBatch";
import { VertexDeclaration } from "././VertexDeclaration";
import { VertexBuffer3D } from "././VertexBuffer3D";
import { BufferState } from "../core/BufferState"
import { BatchMark } from "../core/render/BatchMark"
import { RenderElement } from "../core/render/RenderElement"
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement"

/**
 * @private
 * <code>MeshSprite3DDynamicBatchManager</code> 类用于网格精灵动态批处理管理。
 */
export class MeshRenderDynamicBatchManager extends DynamicBatchManager {
	/** @private */
	static instance: MeshRenderDynamicBatchManager = new MeshRenderDynamicBatchManager();

	/**@private */
	private _instanceBatchOpaqueMarks: any[] = [];
	/**@private */
	private _vertexBatchOpaqueMarks: any[] = [];

	/**@private */
	private _cacheBufferStates: BufferState[] = [];
	/**@private [只读]*/
	_updateCountMark: number;

	/**
	 * 创建一个 <code>MeshSprite3DDynamicBatchManager</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		this._updateCountMark = 0;
	}

	/**
	 * @private
	 */
	getInstanceBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, subMeshID: number): BatchMark {
		var instanceLightMapMarks: any[] = (this._instanceBatchOpaqueMarks[lightMapIndex]) || (this._instanceBatchOpaqueMarks[lightMapIndex] = []);
		var instanceReceiveShadowMarks: any[] = (instanceLightMapMarks[receiveShadow ? 0 : 1]) || (instanceLightMapMarks[receiveShadow ? 0 : 1] = []);
		var instanceMaterialMarks: BatchMark[] = (instanceReceiveShadowMarks[materialID]) || (instanceReceiveShadowMarks[materialID] = []);
		return instanceMaterialMarks[subMeshID] || (instanceMaterialMarks[subMeshID] = new BatchMark());
	}

	/**
	 * @private
	 */
	getVertexBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, verDecID: number): BatchMark {
		var dynLightMapMarks: any[] = (this._vertexBatchOpaqueMarks[lightMapIndex]) || (this._vertexBatchOpaqueMarks[lightMapIndex] = []);
		var dynReceiveShadowMarks: any[] = (dynLightMapMarks[receiveShadow ? 0 : 1]) || (dynLightMapMarks[receiveShadow ? 0 : 1] = []);
		var dynMaterialMarks: BatchMark[] = (dynReceiveShadowMarks[materialID]) || (dynReceiveShadowMarks[materialID] = []);
		return dynMaterialMarks[verDecID] || (dynMaterialMarks[verDecID] = new BatchMark());
	}

	/**
	 * @private
	 */
	_getBufferState(vertexDeclaration: VertexDeclaration): BufferState {
		var bufferState: BufferState = this._cacheBufferStates[vertexDeclaration.id];
		if (!bufferState) {
			var instance: SubMeshDynamicBatch = SubMeshDynamicBatch.instance;
			bufferState = new BufferState();
			bufferState.bind();
			var vertexBuffer: VertexBuffer3D = instance._vertexBuffer;
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
		/*override*/  _getBatchRenderElementFromPool(): RenderElement {
		var renderElement: SubMeshRenderElement = (<SubMeshRenderElement>this._batchRenderElementPool[this._batchRenderElementPoolIndex++]);
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
		/*override*/  _clear(): void {
		super._clear();
		this._updateCountMark++;
	}

}


