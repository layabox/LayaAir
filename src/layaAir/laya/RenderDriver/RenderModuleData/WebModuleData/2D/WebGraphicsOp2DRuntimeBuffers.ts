import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import {
    GRAPHICS_INFO_INDEX_BLOCK_SIZE,
    GRAPHICS_INFO_VERTEX_BLOCK_SIZE,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsIndexBuffer, Web2DGraphicsVertexBuffer } from "./Web2DGraphic2DBuffer";
import { Web2DGraphic2DIndexDataView, Web2DGraphic2DVertexDataView } from "./Web2DGraphic2DBufferDataView";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { Vector4 } from "../../../../maths/Vector4";
import { IPrimitiveRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import type { WebRenderStruct2D } from "./WebRenderStruct2D";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import type { WebGraphicsOp2D } from "./WebGraphicsOp2D";

/** @internal */
export interface WebGraphicsBatchEntry {
	vertexBuffer: IVertexBuffer;
	sourceIndexView: Web2DGraphic2DIndexDataView;
	batchGeometry: IRenderGeometryElement;
}

/**
 * Stable render-unit resource bundle shared by CommandStream and SingleQuad.
 * The unit itself is the existing Graphics batch entry; no adapter object is allocated.
 * @internal
 */
export class WebGraphicsRenderUnit implements WebGraphicsBatchEntry {
	op: WebGraphicsOp2D = null;
	opIndex: number = -1;
	recordStart: number = 0;
	recordCount: number = 0;
	element: IPrimitiveRenderElement2D = null;
	viStore: WebGraphicsOpVIStore = null;
	vertexViews: Web2DGraphic2DVertexDataView[] = [];
	vertexBlocks: number[] = [];
	vertexBuffer: IVertexBuffer = null;
	sourceIndexView: Web2DGraphic2DIndexDataView = null;
	sourceGeometry: IRenderGeometryElement = null;
	batchGeometry: IRenderGeometryElement = null;
	primitiveShaderData: ShaderData = null;
	fillTextureRange: Vector4 = null;

	get vertexBlockCapacity(): number {
		return this.vertexBlocks ? this.vertexBlocks.length : 0;
	}

	get indexCapacity(): number {
		return this.sourceIndexView ? this.sourceIndexView.length : 0;
	}

	canReuse(vertexCount: number, indexCount: number): boolean {
		return this.indexCapacity === indexCount
			&& this.vertexBlockCapacity >= Math.ceil(vertexCount / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
	}

	reactivate(owner: WebRenderStruct2D, subShader: SubShader, materialShaderData: ShaderData): void {
		let element = this.element;
		if (!element)
			return;
		if (element.owner !== owner)
			element.owner = owner;
		if (element.value2DShaderData !== owner.spriteShaderData)
			element.value2DShaderData = owner.spriteShaderData;
		let globalShaderData = owner.globalRenderData ? owner.globalRenderData.globalShaderData : null;
		if (element.globalShaderData !== globalShaderData)
			element.globalShaderData = globalShaderData;
		if (element.subShader !== subShader)
			element.subShader = subShader;
		if (element.materialShaderData !== materialShaderData)
			element.materialShaderData = materialShaderData;
	}

	static create(vertexCount: number, indexCount: number, owner: WebRenderStruct2D, subShader: SubShader, materialShaderData: ShaderData): WebGraphicsRenderUnit {
		let unit = new WebGraphicsRenderUnit();
		if (!WebGraphicsOpVIStorePool.allocateInto(unit, vertexCount, indexCount))
			return null;

		let primitiveShaderData = LayaGL.renderDeviceFactory.createShaderData();
		BlendModeHandler.initBlendMode(primitiveShaderData);
		let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
		element.nodeCommonMap = ["Sprite2D"];
		element.owner = owner;
		element.value2DShaderData = owner.spriteShaderData;
		element.globalShaderData = owner.globalRenderData ? owner.globalRenderData.globalShaderData : null;
		element.primitiveShaderData = primitiveShaderData;
		element.subShader = subShader;
		element.materialShaderData = materialShaderData;
		element.renderStateIsBySprite = false;
		element.typeKey = 0;
		element.textureKey = 0;

		let sourceGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
		sourceGeometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
		sourceGeometry.bufferState = unit.viStore.bufferState;
		element.geometry = sourceGeometry;
		unit.sourceIndexView.setGeometry(sourceGeometry);

		let batchGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
		batchGeometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;

		unit.element = element;
		unit.vertexBuffer = unit.viStore.vertexBuffer;
		unit.sourceGeometry = sourceGeometry;
		unit.batchGeometry = batchGeometry;
		unit.primitiveShaderData = primitiveShaderData;
		element._graphicsBatchEntry = unit;
		return unit;
	}

	destroy(): void {
		let element = this.element;
		if (element)
			element._graphicsBatchEntry = null;
		if (this.batchGeometry)
			this.batchGeometry.destroy();
		if (this.viStore) {
			this.viStore.releaseVertexBlocks(this.vertexBlocks);
			if (this.sourceIndexView)
				this.viStore.releaseIndexView(this.sourceIndexView);
			WebGraphicsOpVIStorePool.prefer(this.viStore);
		}
		if (element) {
			element.geometry = null;
			element.primitiveShaderData = null;
			element.destroy();
		}
		if (this.sourceGeometry) {
			this.sourceGeometry.bufferState = null;
			this.sourceGeometry.destroy();
		}
		if (this.primitiveShaderData)
			this.primitiveShaderData.destroy();

		this.op = null;
		this.opIndex = -1;
		this.recordStart = 0;
		this.recordCount = 0;
		this.element = null;
		this.viStore = null;
		this.vertexViews.length = 0;
		this.vertexBlocks.length = 0;
		this.vertexBuffer = null;
		this.sourceIndexView = null;
		this.sourceGeometry = null;
		this.batchGeometry = null;
		this.primitiveShaderData = null;
		this.fillTextureRange = null;
	}
}

/** @internal Allocation counters for validating retained Graphics buffer growth. */
export interface WebGraphicsVIStoreStats {
	storeCount: number;
	vertexReservedBytes: number;
	indexReservedBytes: number;
	allocateMissCount: number;
	newStoreCount: number;
}

/**
 * Backend-global bounded pool shared by every Graphics rendering mode.
 * Renderers never own dormant units; they only borrow active units from here.
 * @internal
 */
export class WebGraphicsRenderUnitPool {
	private static readonly _maxCount: number = 1024;
	private static _count: number = 0;
	private static _buckets: Map<number, Map<number, WebGraphicsRenderUnit[]>> = new Map();

	static take(vertexCount: number, indexCount: number, owner: WebRenderStruct2D,
		subShader: SubShader, materialShaderData: ShaderData): WebGraphicsRenderUnit {
		let vertexBlockCount = Math.ceil(vertexCount / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
		let indexBuckets = WebGraphicsRenderUnitPool._buckets.get(vertexBlockCount);
		let units = indexBuckets && indexBuckets.get(indexCount);
		if (!units || units.length === 0)
			return null;
		let unit = units.pop();
		WebGraphicsRenderUnitPool._count--;
		if (units.length === 0) {
			indexBuckets.delete(indexCount);
			if (indexBuckets.size === 0)
				WebGraphicsRenderUnitPool._buckets.delete(vertexBlockCount);
		}
		unit.reactivate(owner, subShader, materialShaderData);
		return unit;
	}

	static recover(unit: WebGraphicsRenderUnit): void {
		if (!unit)
			return;
		unit.op = null;
		unit.opIndex = -1;
		unit.recordStart = 0;
		unit.recordCount = 0;
		if (WebGraphicsRenderUnitPool._count >= WebGraphicsRenderUnitPool._maxCount) {
			unit.destroy();
			return;
		}
		let vertexBlockCount = unit.vertexBlockCapacity;
		let indexCount = unit.indexCapacity;
		let indexBuckets = WebGraphicsRenderUnitPool._buckets.get(vertexBlockCount);
		if (!indexBuckets) {
			indexBuckets = new Map();
			WebGraphicsRenderUnitPool._buckets.set(vertexBlockCount, indexBuckets);
		}
		let units = indexBuckets.get(indexCount);
		if (!units) {
			units = [];
			indexBuckets.set(indexCount, units);
		}
		units.push(unit);
		WebGraphicsRenderUnitPool._count++;
	}
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

	get vertexReservedBytes(): number {
		return this._canVertexBlockCount * this._vertexBlockLength * 4;
	}

	get indexReservedBytes(): number {
		return this._indexBufferMaxLength * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
	}

	constructor(blockCount: number) {
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

		this._resizeVertexBuffer(blockCount);
		this._resizeIndexBuffer(GRAPHICS_INFO_INDEX_BLOCK_SIZE);
	}

	checkVertexInto(vertexCount: number, vertexViews: Web2DGraphic2DVertexDataView[], vertexBlocks: number[]): boolean {
		let requiredBlocks = Math.ceil(vertexCount / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
		let availableNewBlocks = this._canVertexBlockCount - this._vertexViews.length;
		if (requiredBlocks > this._vertexFreeBlocks.length + availableNewBlocks)
			return false;

		vertexBlocks.length = 0;
		vertexViews.length = 0;
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

		return true;
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
		if (!blocks || blocks.length === 0)
			return;
		let freeBlocks = this._vertexFreeBlocks;
		let offset = freeBlocks.length;
		freeBlocks.length = offset + blocks.length;
		for (let i = 0, n = blocks.length; i < n; i++)
			freeBlocks[offset + i] = blocks[i];
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
	private static readonly _defaultVertexBlocks: number = 4096 / GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
	private static _stores: WebGraphicsOpVIStore[] = [];
	private static _preferredStore: WebGraphicsOpVIStore = null;
	private static _allocateMissCount: number = 0;
	private static _newStoreCount: number = 0;

	static allocateInto(unit: WebGraphicsRenderUnit, vertexCount: number, indexCount: number): boolean {
		if (!unit || vertexCount <= 0 || indexCount <= 0 || vertexCount > GraphicsDefines.GRAPHICS_MAX_VERTEX)
			return false;
		let stores = WebGraphicsOpVIStorePool._stores;
		let preferred = WebGraphicsOpVIStorePool._preferredStore;
		if (preferred && WebGraphicsOpVIStorePool._tryAllocateInto(preferred, unit, vertexCount, indexCount))
			return true;
		for (let i = 0, n = stores.length; i < n; i++) {
			let store = stores[i];
			if (store !== preferred && WebGraphicsOpVIStorePool._tryAllocateInto(store, unit, vertexCount, indexCount)) {
				WebGraphicsOpVIStorePool._preferredStore = store;
				return true;
			}
		}

		WebGraphicsOpVIStorePool._allocateMissCount++;
		let requiredBlocks = Math.ceil(vertexCount / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
		let store = new WebGraphicsOpVIStore(Math.max(WebGraphicsOpVIStorePool._defaultVertexBlocks, requiredBlocks));
		if (WebGraphicsOpVIStorePool._tryAllocateInto(store, unit, vertexCount, indexCount)) {
			stores.push(store);
			WebGraphicsOpVIStorePool._preferredStore = store;
			WebGraphicsOpVIStorePool._newStoreCount++;
			return true;
		}
		store.destroy();
		return false;
	}

	static prefer(store: WebGraphicsOpVIStore): void {
		if (store)
			WebGraphicsOpVIStorePool._preferredStore = store;
	}

	static getStats(out: WebGraphicsVIStoreStats): WebGraphicsVIStoreStats {
		let stores = WebGraphicsOpVIStorePool._stores;
		let vertexReservedBytes = 0;
		let indexReservedBytes = 0;
		for (let i = 0, n = stores.length; i < n; i++) {
			vertexReservedBytes += stores[i].vertexReservedBytes;
			indexReservedBytes += stores[i].indexReservedBytes;
		}
		out.storeCount = stores.length;
		out.vertexReservedBytes = vertexReservedBytes;
		out.indexReservedBytes = indexReservedBytes;
		out.allocateMissCount = WebGraphicsOpVIStorePool._allocateMissCount;
		out.newStoreCount = WebGraphicsOpVIStorePool._newStoreCount;
		return out;
	}

	private static _tryAllocateInto(store: WebGraphicsOpVIStore, unit: WebGraphicsRenderUnit, vertexCount: number, indexCount: number): boolean {
		if (!store.checkVertexInto(vertexCount, unit.vertexViews, unit.vertexBlocks))
			return false;

		let indexView = store.checkIndex(indexCount);
		if (!indexView) {
			store.releaseVertexBlocks(unit.vertexBlocks);
			unit.vertexViews.length = 0;
			unit.vertexBlocks.length = 0;
			return false;
		}

		unit.viStore = store;
		unit.sourceIndexView = indexView;
		return true;
	}
}
