import { DynamicBatchManager } from "./DynamicBatchManager";
import { SubMeshDynamicBatch } from "./SubMeshDynamicBatch";
import { VertexDeclaration } from "./VertexDeclaration";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { BufferState } from "../core/BufferState"
import { BatchMark } from "../core/render/BatchMark"
import { RenderElement } from "../core/render/RenderElement"
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement"
import { SingletonList } from "../component/SingletonList";

/**
 * @internal
 * <code>MeshSprite3DDynamicBatchManager</code> 类用于网格精灵动态批处理管理。
 */
export class MeshRenderDynamicBatchManager extends DynamicBatchManager {
	/** @internal */
	static instance: MeshRenderDynamicBatchManager = new MeshRenderDynamicBatchManager();

	/**@internal */
	private _instanceBatchOpaqueMarks: any[] = [];
	/**@internal */
	private _vertexBatchOpaqueMarks: any[] = [];

	/**@internal */
	private _cacheBufferStates: BufferState[] = [];
	/**@internal [只读]*/
	_updateCountMark: number;

	/**
	 * 创建一个 <code>MeshSprite3DDynamicBatchManager</code> 实例。
	 */
	constructor() {
		super();
		this._updateCountMark = 0;
	}

	/**
	 * @internal
	 */
	getInstanceBatchOpaquaMark(receiveShadow: boolean, materialID: number, subMeshID: number, invertFace: boolean): BatchMark {
		var instanceReceiveShadowMarks: any[] = (this._instanceBatchOpaqueMarks[receiveShadow ? 0 : 1]) || (this._instanceBatchOpaqueMarks[receiveShadow ? 0 : 1] = []);
		var instanceMaterialMarks: any[] = (instanceReceiveShadowMarks[materialID]) || (instanceReceiveShadowMarks[materialID] = []);
		var instancSubMeshMarks: BatchMark[] = (instanceMaterialMarks[subMeshID]) || (instanceMaterialMarks[subMeshID] = []);
		return instancSubMeshMarks[invertFace ? 1 : 0] || (instancSubMeshMarks[invertFace ? 1 : 0] = new BatchMark());
	}

	/**
	 * @internal
	 */
	getVertexBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, verDecID: number): BatchMark {
		var dynLightMapMarks: any[] = (this._vertexBatchOpaqueMarks[lightMapIndex]) || (this._vertexBatchOpaqueMarks[lightMapIndex] = []);
		var dynReceiveShadowMarks: any[] = (dynLightMapMarks[receiveShadow ? 0 : 1]) || (dynLightMapMarks[receiveShadow ? 0 : 1] = []);
		var dynMaterialMarks: BatchMark[] = (dynReceiveShadowMarks[materialID]) || (dynReceiveShadowMarks[materialID] = []);
		return dynMaterialMarks[verDecID] || (dynMaterialMarks[verDecID] = new BatchMark());
	}

	/**
	 * @internal
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
	 * @override
	 */
	_getBatchRenderElementFromPool(): RenderElement {
		var renderElement: SubMeshRenderElement = (<SubMeshRenderElement>this._batchRenderElementPool[this._batchRenderElementPoolIndex++]);
		if (!renderElement) {
			renderElement = new SubMeshRenderElement();
			this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
			renderElement.vertexBatchElementList = new SingletonList<SubMeshRenderElement>();
			renderElement.instanceBatchElementList = new SingletonList<SubMeshRenderElement>();
		}
		return renderElement;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_clear(): void {
		super._clear();
		this._updateCountMark++;
	}

}


