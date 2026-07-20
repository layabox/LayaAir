import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import {
    GRAPHICS_INFO_INDEX_BLOCK_SIZE,
    GRAPHICS_INFO_VERTEX_BLOCK_SIZE,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsIndexBuffer, Web2DGraphicsVertexBuffer } from "./Web2DGraphic2DBuffer";
import { Web2DGraphic2DIndexCloneDataView, Web2DGraphic2DIndexDataView, Web2DGraphic2DVertexDataView } from "./Web2DGraphic2DBufferDataView";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";

/** @internal */
export interface WebGraphicsBatchEntry {
	vertexBuffer: IVertexBuffer;
	sourceIndexView: Web2DGraphic2DIndexDataView;
	cloneIndexView: Web2DGraphic2DIndexCloneDataView;
}

/** @internal */
export type WebGraphicsOpVertexAllocation = {
	vertexViews: Web2DGraphic2DVertexDataView[];
	vertexBlocks: number[];
}

/** @internal */
export type WebGraphicsOpVIAllocation = WebGraphicsOpVertexAllocation & {
	viStore: WebGraphicsOpVIStore;
	indexView: Web2DGraphic2DIndexDataView;
}

/** @internal */
export class WebGraphicsOpVIStore {
	private _bufferState: IBufferState;
	private _vertexBuffer: IVertexBuffer;
	private _indexBuffer: IIndexBuffer;
	private _wholeVertex: Web2DGraphicsVertexBuffer;
	private _wholeIndex: Web2DGraphicsIndexBuffer;
	private _vertexViews: Web2DGraphic2DVertexDataView[] = [];
	private _vertexFreeBlocks: number[] = [];
	private _indexViewPool: Map<number, Web2DGraphic2DIndexDataView[]> = new Map();
	private _indexBufferLength: number = 0;
	private _indexBufferMaxLength: number = 0;
	private _canVertexBlockCount: number = 0;
	private _vertexBlockLength: number = GRAPHICS_INFO_VERTEX_BLOCK_SIZE * GraphicsDefines.stride;

	get bufferState(): IBufferState {
		return this._bufferState;
	}

	get vertexBuffer(): IVertexBuffer {
		return this._vertexBuffer;
	}

	constructor() {
		this._vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
		this._wholeVertex = new Web2DGraphicsVertexBuffer();
		this._wholeVertex.buffer = this._vertexBuffer;

		this._indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
		this._indexBuffer.indexType = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
		this._wholeIndex = new Web2DGraphicsIndexBuffer();
		this._wholeIndex.buffer = this._indexBuffer;

		this._bufferState = LayaGL.renderDeviceFactory.createBufferState();
		this._vertexBuffer.vertexDeclaration = GraphicsDefines.vertexDeclarition;
		this._bufferState.applyState([this._vertexBuffer], this._indexBuffer);

		this._resizeVertexBuffer(GraphicsDefines.GRAPHICS_MAX_VERTEX / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
		this._resizeIndexBuffer(GRAPHICS_INFO_INDEX_BLOCK_SIZE);
	}

	checkVertex(vertexCount: number): WebGraphicsOpVertexAllocation {
		let requiredBlocks = Math.ceil(vertexCount / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
		let availableNewBlocks = this._canVertexBlockCount - this._vertexViews.length;
		if (requiredBlocks > this._vertexFreeBlocks.length + availableNewBlocks)
			return null;

		let vertexBlocks: number[] = [];
		let vertexViews: Web2DGraphic2DVertexDataView[] = [];
		while (requiredBlocks > 0 && this._vertexFreeBlocks.length > 0) {
			let block = this._vertexFreeBlocks.pop();
			vertexBlocks.push(block);
			vertexViews.push(this._vertexViews[block]);
			requiredBlocks--;
		}

		while (requiredBlocks > 0) {
			let block = this._vertexViews.length;
			let view = new Web2DGraphic2DVertexDataView(
				this._wholeVertex,
				block * this._vertexBlockLength,
				this._vertexBlockLength,
				GraphicsDefines.stride
			);
			this._vertexViews[block] = view;
			vertexBlocks.push(block);
			vertexViews.push(view);
			requiredBlocks--;
		}

		return { vertexViews, vertexBlocks };
	}

	checkIndex(indexCount: number): Web2DGraphic2DIndexDataView {
		if (this._indexBufferLength + indexCount > this._indexBufferMaxLength)
			this._extendIndexBuffer(indexCount);
		let pool = this._indexViewPool.get(indexCount);
		let view = pool && pool.pop();
		if (!view)
			view = new Web2DGraphic2DIndexDataView(this._wholeIndex, indexCount);
		this._wholeIndex.addDataView(view);
		this._indexBufferLength += indexCount;
		return view;
	}

	releaseVertexBlocks(blocks: number[]): void {
		if (blocks && blocks.length > 0)
			this._vertexFreeBlocks.push(...blocks);
	}

	releaseIndexView(indexView: Web2DGraphic2DIndexDataView): void {
		if (!indexView)
			return;
		this._indexBufferLength -= indexView.length;
		this._wholeIndex.removeDataView(indexView);
		indexView.setGeometry(null);
		let pool = this._indexViewPool.get(indexView.length);
		if (!pool) {
			pool = [];
			this._indexViewPool.set(indexView.length, pool);
		}
		pool.push(indexView);
	}

	destroy(): void {
		this._vertexViews.length = 0;
		this._vertexFreeBlocks.length = 0;
		this._indexViewPool.forEach(pool => {
			for (let i = 0, n = pool.length; i < n; i++)
				pool[i].destroy();
		});
		this._indexViewPool.clear();
		this._bufferState && this._bufferState.destroy();
		this._vertexBuffer && this._vertexBuffer.destroy();
		this._indexBuffer && this._indexBuffer.destroy();
		this._wholeVertex && this._wholeVertex.destroy();
		this._wholeIndex && this._wholeIndex.destroy();
		this._bufferState = null;
		this._vertexBuffer = null;
		this._indexBuffer = null;
		this._wholeVertex = null;
		this._wholeIndex = null;
	}

	private _resizeVertexBuffer(blockCount: number): void {
		let byteLength = blockCount * GRAPHICS_INFO_VERTEX_BLOCK_SIZE * GraphicsDefines.stride * 4;
		this._wholeVertex.resetData(byteLength);
		this._vertexBuffer.setDataLength(byteLength);
		this._canVertexBlockCount = blockCount;
	}

	private _resizeIndexBuffer(indexCount: number): void {
		let byteLength = indexCount * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
		this._wholeIndex.resetData(byteLength);
		this._indexBuffer._setIndexDataLength(byteLength);
		this._indexBufferMaxLength = indexCount;
	}

	private _extendIndexBuffer(indexCount: number): void {
		let nextCount = Math.ceil((this._indexBufferLength + indexCount) / GRAPHICS_INFO_INDEX_BLOCK_SIZE) * GRAPHICS_INFO_INDEX_BLOCK_SIZE;
		this._resizeIndexBuffer(nextCount);
	}

}

/** @internal */
export class WebGraphicsOpVIStorePool {
	private static _stores: WebGraphicsOpVIStore[] = [];

	static allocate(vertexCount: number, indexCount: number): WebGraphicsOpVIAllocation {
		let stores = WebGraphicsOpVIStorePool._stores;
		for (let i = 0, n = stores.length; i < n; i++) {
			let allocation = WebGraphicsOpVIStorePool._tryAllocate(stores[i], vertexCount, indexCount);
			if (allocation)
				return allocation;
		}

		let store = new WebGraphicsOpVIStore();
		let allocation = WebGraphicsOpVIStorePool._tryAllocate(store, vertexCount, indexCount);
		if (allocation) {
			stores.push(store);
			return allocation;
		}
		store.destroy();
		return null;
	}

	private static _tryAllocate(store: WebGraphicsOpVIStore, vertexCount: number, indexCount: number): WebGraphicsOpVIAllocation {
		let vertexBlockInfo = store.checkVertex(vertexCount);
		if (!vertexBlockInfo)
			return null;

		let indexView = store.checkIndex(indexCount);
		if (!indexView) {
			store.releaseVertexBlocks(vertexBlockInfo.vertexBlocks);
			return null;
		}

		return {
			viStore: store,
			vertexViews: vertexBlockInfo.vertexViews,
			vertexBlocks: vertexBlockInfo.vertexBlocks,
			indexView,
		};
	}
}
