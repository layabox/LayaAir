import { DynamicBatchManager } from "./DynamicBatchManager";
import { BufferState } from "../core/BufferState"
import { BatchMark } from "../core/render/BatchMark"
import { RenderElement } from "../core/render/RenderElement"
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement"
import { SingletonList } from "../../utils/SingletonList";

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


