import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { LayaGL } from "../../../../layagl/LayaGL";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";
import { Texture2D } from "../../../../resource/Texture2D";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { TextureDimension } from "../../../../RenderEngine/RenderEnum/TextureDimension";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import type { GraphicsOp2DRenderState } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import {
    GRAPHICS_INFO_DEFAULT_QUAD_INDICES,
    GRAPHICS_INFO_VERTEX_BLOCK_SIZE,
    GRAPHICS_INFO_VERTEX_FLAG_DISABLED,
    GRAPHICS_INFO_VERTEX_FLAG_ENABLED,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsHandleDirtyFlag, GraphicsHandleUpdateField, GraphicsOpInfoField } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import type {
	WebGraphicsFillTextureOp2D,
	WebGraphicsMeshOp2D,
	WebGraphicsMultiQuadOp2D,
	WebGraphicsOp2D,
	WebGraphicsSolidQuadOp2D,
	WebGraphicsTextOp2D,
	WebGraphicsTextureQuadOp2D,
} from "./WebGraphicsOp2D";
import { GraphicsOp2DDirtyFlag, type GraphicsOp2DTextureHost } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import {
	GraphicsMeshPayloadWordCount,
	GraphicsMeshPayloadWordOffset,
	GraphicsQuadPayloadWordCount,
	GraphicsQuadPayloadWordOffset,
} from "./WebGraphicsOp2DBufferSchema";
import { IPrimitiveRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Web2DGraphic2DIndexCloneDataView, Web2DGraphic2DIndexDataView, Web2DGraphic2DVertexDataView } from "./Web2DGraphic2DBufferDataView";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import {
	WebGraphicsBatchEntry,
	WebGraphicsOpVIAllocation,
	WebGraphicsOpVIStore,
	WebGraphicsOpVIStorePool,
} from "./WebGraphicsOp2DRuntimeBuffers";

type WebGraphicsTextureGroup = {
	start: number;
	count: number;
	texture: GraphicsOp2DTextureHost;
};

type WebGraphicsRenderOpRef = {
	op: WebGraphicsOp2D;
	opIndex: number;
	recordStart: number;
	recordCount: number;
};

type WebGraphicsOpRenderRange = {
	start: number;
	count: number;
};

/** @internal Shared Graphics material state owned by the primitive data handle. */
export type WebGraphicsMaterialState = {
	subShader: SubShader | null;
	shaderData: ShaderData | null;
};

/** @internal */
export class WebGraphicsOp2DRuntime {
	private _ops: ReadonlyArray<WebGraphicsOp2D> = [];
	private _renderOpRefs: WebGraphicsRenderOpRef[] = [];
	private _opRenderRanges: WebGraphicsOpRenderRange[] = [];
	private _opRefs: WebGraphicsOp2D[] = [];
	private _textureGroups: WebGraphicsTextureGroup[] = [];
	private _renderElements: IPrimitiveRenderElement2D[] = [];
	private _viStores: WebGraphicsOpVIStore[] = [];
	private _vertexViews: Web2DGraphic2DVertexDataView[][] = [];
	private _vertexBlocks: number[][] = [];
	private _indexViews: Web2DGraphic2DIndexDataView[] = [];
	private _geometries: IRenderGeometryElement[] = [];
	private _primitiveShaderData: ShaderData[] = [];
	private _batchEntries: WebGraphicsBatchEntry[] = [];
	private _fillTextureRanges: Vector4[] = [];
	private _pointScratch: Float32Array = new Float32Array(2);
	private _matrixScratch: Matrix = new Matrix();
	private _singleTextureQuadRenderIndex: number = -1;
	private _singleTextureQuadOp: WebGraphicsTextureQuadOp2D = null;
	private _graphicsHandleUpdateBuffer: ArrayBuffer = null;
	private _handleUpdateInt32: Int32Array = null;
	private _handleUpdateFloat32: Float32Array = null;
	private _renderStateScratch: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null };

	constructor(private _owner: WebRenderStruct2D, private _materialState: WebGraphicsMaterialState) {
	}

	syncGraphicsSubShader(): void {
		let subShader = this._materialState.subShader;
		for (let element of this._renderElements)
			if (element)
				element.subShader = subShader;
	}

	syncGraphicsShaderData(): void {
		let shaderData = this._materialState.shaderData;
		let customMaterial = shaderData != null;
		for (let element of this._renderElements) {
			if (!element)
				continue;
			element.materialShaderData = shaderData;
			element.typeKey = customMaterial
				? element.typeKey | ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL
				: element.typeKey & ~ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL;
		}
	}

	setGraphicsHandleUpdateBuffer(buffer: ArrayBuffer): void {
		if (this._graphicsHandleUpdateBuffer === buffer)
			return;
		this._graphicsHandleUpdateBuffer = buffer;
		this._handleUpdateInt32 = buffer ? new Int32Array(buffer) : null;
		this._handleUpdateFloat32 = buffer ? new Float32Array(buffer) : null;
	}

	syncGraphicsOps(ops: ReadonlyArray<WebGraphicsOp2D>): void {
		let nextOps = ops || [];
		if (this._ops !== nextOps) {
			this._ops = nextOps;
			this._rebuildRenderOps();
			this._publishOwnerElements();
			return;
		}
		if (this._hasPendingDirtyRange() && this._syncDirtyOpsFromHandle())
			return;
		if (!this._sameOpRefs(nextOps)) {
			this._rebuildRenderOps();
			this._publishOwnerElements();
			return;
		}
		if (this._syncDirtyOpsFromHandle())
			return;
		this._syncRenderElementTransforms();
		this._cacheSingleTextureQuadFastPath();
	}

	syncOp(op: WebGraphicsOp2D, renderIndex: number = this._ops ? this._ops.indexOf(op) : -1, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (!op || renderIndex < 0)
			return;
		let ref = this._renderOpRefs[renderIndex];
		switch (op.opType) {
			case "textureQuad":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeTextureQuad(renderIndex, op as WebGraphicsTextureQuadOp2D, mat, ownerAlpha);
				else
					this._syncTextureQuadDirtyOp(renderIndex, op as WebGraphicsTextureQuadOp2D, mat, ownerAlpha);
				break;
			case "fillTexture":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeFillTexture(renderIndex, op as WebGraphicsFillTextureOp2D, mat, ownerAlpha);
				else
					this._syncFillTextureDirtyOp(renderIndex, op as WebGraphicsFillTextureOp2D, mat, ownerAlpha);
				break;
			case "solidQuad":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeSolidQuad(renderIndex, op as WebGraphicsSolidQuadOp2D, mat, ownerAlpha);
				else
					this._syncSolidQuadDirtyOp(renderIndex, op as WebGraphicsSolidQuadOp2D, mat, ownerAlpha);
				break;
			case "mesh":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeMesh(renderIndex, op as WebGraphicsMeshOp2D, mat, ownerAlpha);
				else
					this._syncMeshDirtyOp(renderIndex, op as WebGraphicsMeshOp2D, mat, ownerAlpha);
				break;
			case "text":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeText(renderIndex, op as WebGraphicsTextOp2D, this._textureGroups[renderIndex], mat, ownerAlpha);
				else
					this._syncTextDirtyOp(renderIndex, op as WebGraphicsTextOp2D, this._textureGroups[renderIndex], mat, ownerAlpha);
				break;
			case "multiQuad":
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeMultiQuad(renderIndex, op as WebGraphicsMultiQuadOp2D, ref ? ref.recordStart : 0, ref ? ref.recordCount : (op as WebGraphicsMultiQuadOp2D).recordCount, mat, ownerAlpha);
				else
					this._syncMultiQuadDirtyOp(renderIndex, op as WebGraphicsMultiQuadOp2D, ref ? ref.recordStart : 0, ref ? ref.recordCount : (op as WebGraphicsMultiQuadOp2D).recordCount, mat, ownerAlpha);
				break;
		}
		op.clearDirty();
	}

	updateTransform(mat: Matrix, globalAlpha: number, writeAlpha: boolean = true): void {
		if (mat)
			this.updateTransformValues(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty, globalAlpha, writeAlpha);
		else
			this.updateTransformValues(1, 0, 0, 1, 0, 0, globalAlpha, writeAlpha);
	}

	updateTransformValues(a: number, b: number, c: number, d: number, tx: number, ty: number, globalAlpha: number, writeAlpha: boolean = true): void {
		if (this._updateSingleTextureQuadTransformValuesOnly(a, b, c, d, tx, ty, globalAlpha, writeAlpha))
			return;
		let mat = this._matrixScratch;
		mat.a = a;
		mat.b = b;
		mat.c = c;
		mat.d = d;
		mat.tx = tx;
		mat.ty = ty;
		mat._bTransform = a !== 1 || b !== 0 || c !== 0 || d !== 1;
		this._syncRenderElementTransforms(mat, globalAlpha, writeAlpha);
	}

	updateGlobalAlpha(globalAlpha: number): void {
		if (this._updateSingleTextureQuadGlobalAlphaOnly(globalAlpha))
			return;
		this._syncRenderElementAlphaOnly(globalAlpha);
	}

	getGraphicsBatchEntry(renderElementIndex: number): WebGraphicsBatchEntry {
		let entry: WebGraphicsBatchEntry = null;
		if (renderElementIndex != null && renderElementIndex >= 0) {
			let indexView = this._indexViews[renderElementIndex];
			let viStore = this._viStores[renderElementIndex];
			let element = this._renderElements[renderElementIndex];
			if (indexView && viStore) {
				entry = this._batchEntries[renderElementIndex];
				if (!entry || entry.sourceIndexView !== indexView) {
					if (entry && element && element._graphicsBatchEntry === entry)
						element._graphicsBatchEntry = null;
					this._destroyBatchEntry(entry);
					entry = this._createGraphicsBatchEntry(indexView, viStore.vertexBuffer);
					this._batchEntries[renderElementIndex] = entry;
					if (element)
						element._graphicsBatchEntry = entry;
				}
			}
			else {
				let staleEntry = this._batchEntries[renderElementIndex];
				if (element)
					element._graphicsBatchEntry = null;
				this._destroyBatchEntry(staleEntry);
				this._batchEntries[renderElementIndex] = null;
			}
		}
		return entry;
	}

	private _syncDirtyOpsFromHandle(): boolean {
		let update = this._handleUpdateInt32;
		if (!update)
			return false;
		let updateVersion = update[GraphicsHandleUpdateField.UpdateVersion];
		if (update[GraphicsHandleUpdateField.HandledVersion] === updateVersion)
			return true;
		let dirtyFlags = update[GraphicsHandleUpdateField.DirtyFlags];
		let start = update[GraphicsHandleUpdateField.DirtyOpStart];
		let count = update[GraphicsHandleUpdateField.DirtyOpCount];
		if (dirtyFlags === GraphicsHandleDirtyFlag.None || start < 0 || count <= 0) {
			update[GraphicsHandleUpdateField.HandledVersion] = updateVersion;
			return true;
		}
		let end = Math.min(start + count, this._ops.length);
		let mat = this._owner ? this._owner.renderMatrix : null;
		let ownerAlpha = this._owner ? this._owner.globalAlpha : 1;
		for (let opIndex = start; opIndex < end; opIndex++) {
			let op = this._ops[opIndex];
			if ((op.dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
				this._rebuildRenderOps();
				this._publishOwnerElements();
				update[GraphicsHandleUpdateField.HandledVersion] = updateVersion;
				return true;
			}
			let range = this._opRenderRanges[opIndex];
			if (!range || range.count <= 0)
				continue;
			for (let renderIndex = range.start, n = range.start + range.count; renderIndex < n; renderIndex++)
				this.syncOp(op, renderIndex, mat, ownerAlpha);
		}
		update[GraphicsHandleUpdateField.HandledVersion] = updateVersion;
		this._cacheSingleTextureQuadFastPath();
		return true;
	}

	private _hasPendingDirtyRange(): boolean {
		let update = this._handleUpdateInt32;
		if (!update)
			return false;
		let updateVersion = update[GraphicsHandleUpdateField.UpdateVersion];
		return update[GraphicsHandleUpdateField.HandledVersion] !== updateVersion
			&& update[GraphicsHandleUpdateField.DirtyFlags] !== GraphicsHandleDirtyFlag.None
			&& update[GraphicsHandleUpdateField.DirtyOpStart] >= 0
			&& update[GraphicsHandleUpdateField.DirtyOpCount] > 0;
	}

	destroy(): void {
		this._clearRenderOps();
		this._ops = [];
		this._owner = null;
	}

	private _rebuildRenderOps(): void {
		this._clearRenderOps();
		let renderIndex = 0;
		for (let i = 0, n = this._ops.length; i < n; i++) {
			let op = this._ops[i];
			this._opRefs[i] = op;
			if (op.opType === "text") {
				let startRenderIndex = renderIndex;
				renderIndex = this._appendTextRenderElements(renderIndex, op as WebGraphicsTextOp2D, i);
				this._setOpRenderRange(i, startRenderIndex, renderIndex - startRenderIndex);
				continue;
			}
			if (op.opType === "multiQuad") {
				let startRenderIndex = renderIndex;
				renderIndex = this._appendMultiQuadRenderElements(renderIndex, op as WebGraphicsMultiQuadOp2D, i);
				this._setOpRenderRange(i, startRenderIndex, renderIndex - startRenderIndex);
				continue;
			}
			let vertexCount = this._getVertexCount(op);
			let indexCount = this._getIndexCount(op);
			if (vertexCount <= 0 || indexCount <= 0)
				continue;
			let allocation = WebGraphicsOpVIStorePool.allocate(vertexCount, indexCount);
			if (!allocation)
				continue;
			this._createRenderElement(renderIndex, allocation, op, i, 0, 1);
			this._setOpRenderRange(i, renderIndex, 1);
			this.syncOp(op, renderIndex);
			renderIndex++;
		}
		this._cacheSingleTextureQuadFastPath();
	}

	private _appendMultiQuadRenderElements(renderIndex: number, op: WebGraphicsMultiQuadOp2D, opIndex: number): number {
		return this._appendGroupedQuadRenderElements(renderIndex, op, opIndex);
	}

	private _appendTextRenderElements(renderIndex: number, op: WebGraphicsTextOp2D, opIndex: number): number {
		return this._appendGroupedQuadRenderElements(renderIndex, op, opIndex);
	}

	private _appendGroupedQuadRenderElements(renderIndex: number, op: WebGraphicsMultiQuadOp2D | WebGraphicsTextOp2D, opIndex: number): number {
		let groups = this._collectTextureGroups(op);
		for (let i = 0, n = groups.length; i < n; i++) {
			let group = groups[i];
			let maxRecords = this._getMaxQuadRecordsPerRenderElement();
			for (let offset = 0; offset < group.count;) {
				let count = Math.min(maxRecords, group.count - offset);
				let allocation = WebGraphicsOpVIStorePool.allocate(count * 4, count * 6);
				if (!allocation)
					break;
				let splitGroup = { start: group.start + offset, count, texture: group.texture };
				this._createRenderElement(renderIndex, allocation, op, opIndex, splitGroup.start, splitGroup.count);
				this._textureGroups[renderIndex] = splitGroup;
				if (op.opType === "text")
					this._writeText(renderIndex, op as WebGraphicsTextOp2D, splitGroup);
				else
					this._writeMultiQuad(renderIndex, op as WebGraphicsMultiQuadOp2D, splitGroup.start, splitGroup.count);
				renderIndex++;
				offset += count;
			}
		}
		op.clearDirty();
		return renderIndex;
	}

	private _getVertexCount(op: WebGraphicsOp2D): number {
		switch (op.opType) {
			case "textureQuad":
			case "fillTexture":
			case "solidQuad":
				return (op as WebGraphicsTextureQuadOp2D | WebGraphicsFillTextureOp2D | WebGraphicsSolidQuadOp2D).recordCount > 0 ? 4 : 0;
			case "multiQuad":
				return (op as WebGraphicsMultiQuadOp2D).recordCount * 4;
			case "mesh":
				return op._int32[GraphicsOpInfoField.WordCount + GraphicsMeshPayloadWordOffset.VertexCount];
			default:
				return 0;
		}
	}

	private _getIndexCount(op: WebGraphicsOp2D): number {
		switch (op.opType) {
			case "textureQuad":
			case "fillTexture":
			case "solidQuad":
				return (op as WebGraphicsTextureQuadOp2D | WebGraphicsFillTextureOp2D | WebGraphicsSolidQuadOp2D).recordCount > 0 ? 6 : 0;
			case "multiQuad":
				return (op as WebGraphicsMultiQuadOp2D).recordCount * 6;
			case "mesh":
				return op._int32[GraphicsOpInfoField.WordCount + GraphicsMeshPayloadWordOffset.IndexCount];
			default:
				return 0;
		}
	}

	private _getMaxQuadRecordsPerRenderElement(): number {
		return Math.max(1, Math.floor(GraphicsDefines.GRAPHICS_MAX_VERTEX / 4));
	}

	private _setOpRenderRange(opIndex: number, start: number, count: number): void {
		this._opRenderRanges[opIndex] = { start, count };
	}

	private _createRenderElement(renderIndex: number, allocation: WebGraphicsOpVIAllocation, op: WebGraphicsOp2D, opIndex: number, recordStart: number, recordCount: number): void {
		let primitiveShaderData = LayaGL.renderDeviceFactory.createShaderData();
		BlendModeHandler.initBlendMode(primitiveShaderData);
		let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
		element.nodeCommonMap = ["Sprite2D"];
		element.owner = this._owner;
		element.value2DShaderData = this._owner.spriteShaderData;
		element.globalShaderData = this._owner.globalRenderData ? this._owner.globalRenderData.globalShaderData : null;
		element.primitiveShaderData = primitiveShaderData;
		element.subShader = this._materialState.subShader;
		element.materialShaderData = this._materialState.shaderData;
		element.renderStateIsBySprite = false;
		element.typeKey = 0;
		element.textureKey = 0;
		let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
		geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
		geometry.bufferState = allocation.viStore.bufferState;
		element.geometry = geometry;
		let indexView = allocation.indexView;
		indexView.setGeometry(geometry);
		let batchEntry = this._createGraphicsBatchEntry(indexView, allocation.viStore.vertexBuffer);
		element._graphicsBatchEntry = batchEntry;
		this._renderElements[renderIndex] = element;
		this._renderOpRefs[renderIndex] = { op, opIndex, recordStart, recordCount };
		this._viStores[renderIndex] = allocation.viStore;
		this._vertexViews[renderIndex] = allocation.vertexViews;
		this._vertexBlocks[renderIndex] = allocation.vertexBlocks;
		this._indexViews[renderIndex] = indexView;
		this._geometries[renderIndex] = geometry;
		this._primitiveShaderData[renderIndex] = primitiveShaderData;
		this._batchEntries[renderIndex] = batchEntry;
		this._fillTextureRanges[renderIndex] = new Vector4(0, 0, 1, 1);
	}

	private _createGraphicsBatchEntry(sourceIndexView: Web2DGraphic2DIndexDataView, vertexBuffer: IVertexBuffer): WebGraphicsBatchEntry {
		let cloneIndexView = sourceIndexView._clone(false, false) as Web2DGraphic2DIndexCloneDataView;
		sourceIndexView._cloneView(cloneIndexView);
		cloneIndexView._geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
		cloneIndexView._geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
		return { vertexBuffer, sourceIndexView, cloneIndexView };
	}

	private _writeTextureQuad(renderIndex: number, op: WebGraphicsTextureQuadOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let wordOffset = GraphicsOpInfoField.WordCount;
		let texture = op._texture;
		let hasCustomMaterial = this._materialState.shaderData != null;
		this._syncTexture(renderIndex, texture, 0, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], hasCustomMaterial);
		this._writeQuadVertexData(renderIndex, op._float32, op._int32, wordOffset, mat, texture != null, ownerAlpha);
		this._writeQuadIndex(renderIndex, 1);
	}

	private _syncTextureQuadDirtyOp(renderIndex: number, op: WebGraphicsTextureQuadOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeTextureQuad(renderIndex, op, mat, ownerAlpha);
			return;
		}
		let wordOffset = GraphicsOpInfoField.WordCount;
		let texture = op._texture;
		let hasCustomMaterial = this._materialState.shaderData != null;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0) {
			this._syncTexture(renderIndex, texture, 0, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], hasCustomMaterial);
			if ((dirtyFlags & GraphicsOp2DDirtyFlag.Geometry) === 0 && op.textureLayerDirty)
				this._writeQuadTextureLayer(renderIndex, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.TextureLayer]);
		}
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Geometry) !== 0)
			this._writeQuadVertexData(renderIndex, op._float32, op._int32, wordOffset, mat, texture != null, ownerAlpha);
	}

	private _syncSolidQuadDirtyOp(renderIndex: number, op: WebGraphicsSolidQuadOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeSolidQuad(renderIndex, op, mat, ownerAlpha);
			return;
		}
		let wordOffset = GraphicsOpInfoField.WordCount;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.State) !== 0)
			this._syncTexture(renderIndex, null, 0, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeSolidQuadVertexData(renderIndex, op._float32, op._int32, wordOffset, mat, ownerAlpha);
	}

	private _writeSolidQuad(renderIndex: number, op: WebGraphicsSolidQuadOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let wordOffset = GraphicsOpInfoField.WordCount;
		this._syncTexture(renderIndex, null, 0, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		this._writeSolidQuadVertexData(renderIndex, op._float32, op._int32, wordOffset, mat, ownerAlpha);
		this._writeQuadIndex(renderIndex, 1);
	}

	private _writeFillTexture(renderIndex: number, op: WebGraphicsFillTextureOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let wordOffset = GraphicsOpInfoField.WordCount;
		let f32 = op._float32;
		let i32 = op._int32;
		let texture = op._texture;
		this._syncTexture(renderIndex, texture, ShaderDefines2D.DEFINE_BIT_FILLTEXTURE, i32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		this._syncFillTextureRange(renderIndex,
			f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX],
			f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY],
			f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX] + f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeWidth],
			f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY] + f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeHeight]);
		this._writeQuadVertexData(renderIndex, f32, i32, wordOffset, mat, texture != null, ownerAlpha);
		this._writeQuadIndex(renderIndex, 1);
	}

	private _syncFillTextureDirtyOp(renderIndex: number, op: WebGraphicsFillTextureOp2D, mat: Matrix, ownerAlpha: number): void {
		if (op.recordCount <= 0)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeFillTexture(renderIndex, op, mat, ownerAlpha);
			return;
		}
		let wordOffset = GraphicsOpInfoField.WordCount;
		let f32 = op._float32;
		let i32 = op._int32;
		let texture = op._texture;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTexture(renderIndex, texture, ShaderDefines2D.DEFINE_BIT_FILLTEXTURE, i32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.Geometry)) !== 0)
			this._syncFillTextureRange(renderIndex,
				f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX],
				f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY],
				f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX] + f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeWidth],
				f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY] + f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeHeight]);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeQuadVertexData(renderIndex, f32, i32, wordOffset, mat, texture != null, ownerAlpha);
	}

	private _writeMultiQuad(renderIndex: number, op: WebGraphicsMultiQuadOp2D, start: number = 0, count: number = op.recordCount, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (count <= 0)
			return;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		let group = this._textureGroups[renderIndex];
		let texture = group ? group.texture : op._texture;
		this._syncTexture(renderIndex, texture, 0, op._int32[bodyOffset + start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		this._writeMultiQuadRange(renderIndex, op, start, count, mat, ownerAlpha, texture != null);
		this._writeQuadIndex(renderIndex, count);
	}

	private _syncMultiQuadDirtyOp(renderIndex: number, op: WebGraphicsMultiQuadOp2D, start: number = 0, count: number = op.recordCount, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (count <= 0)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeMultiQuad(renderIndex, op, start, count, mat, ownerAlpha);
			return;
		}
		let bodyOffset = GraphicsOpInfoField.WordCount;
		let group = this._textureGroups[renderIndex];
		let texture = group ? group.texture : op._texture;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTexture(renderIndex, texture, 0, op._int32[bodyOffset + start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMultiQuadRange(renderIndex, op, start, count, mat, ownerAlpha, texture != null);
	}

	private _writeText(renderIndex: number, op: WebGraphicsTextOp2D, group: WebGraphicsTextureGroup = null, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (!group) {
			let groups = this._collectTextureGroups(op);
			group = groups.length > 0 ? groups[0] : null;
		}
		if (!group)
			return;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		this._syncTexture(renderIndex, group.texture, 0, op.recordCount > 0 ? op._int32[bodyOffset + group.start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode] : 0, this._materialState.shaderData != null);
		this._writeMultiQuadRange(renderIndex, op, group.start, group.count, mat, ownerAlpha, group.texture != null);
		this._writeQuadIndex(renderIndex, group.count);
	}

	private _syncTextDirtyOp(renderIndex: number, op: WebGraphicsTextOp2D, group: WebGraphicsTextureGroup = null, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (!group) {
			let groups = this._collectTextureGroups(op);
			group = groups.length > 0 ? groups[0] : null;
		}
		if (!group)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeText(renderIndex, op, group, mat, ownerAlpha);
			return;
		}
		let bodyOffset = GraphicsOpInfoField.WordCount;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTexture(renderIndex, group.texture, 0, op.recordCount > 0 ? op._int32[bodyOffset + group.start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode] : 0, this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMultiQuadRange(renderIndex, op, group.start, group.count, mat, ownerAlpha, group.texture != null);
	}

	private _writeMultiQuadRange(renderIndex: number, op: WebGraphicsMultiQuadOp2D, start: number, count: number, mat: Matrix, ownerAlpha: number, uvEnabled: boolean): void {
		let view: Web2DGraphic2DVertexDataView = null;
		let blockData: Float32Array = null;
		let vertexIndex = 0;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		for (let i = start, n = start + count; i < n; i++) {
			if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE === 0) {
				view = this._vertexViews[renderIndex][Math.floor(vertexIndex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE)];
				blockData = view._getData();
				blockData.fill(0);
			}
			this._writeQuadVerticesInto(blockData, vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE, op._float32, op._int32, bodyOffset + i * GraphicsQuadPayloadWordCount, mat, uvEnabled, ownerAlpha);
			vertexIndex += 4;
			if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE === 0)
				view._modify();
		}
		if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE !== 0)
			view._modify();
	}

	private _collectTextureGroups(op: WebGraphicsMultiQuadOp2D | WebGraphicsTextOp2D): WebGraphicsTextureGroup[] {
		let groups: WebGraphicsTextureGroup[] = [];
		let start = 0;
		let currentTexture: GraphicsOp2DTextureHost = null;
		for (let i = 0, n = op.recordCount; i < n; i++) {
			let texture = op.textures[i] || null;
			if (i === 0) {
				currentTexture = texture;
				continue;
			}
			if (texture !== currentTexture) {
				groups.push({ start, count: i - start, texture: currentTexture });
				start = i;
				currentTexture = texture;
			}
		}
		if (op.recordCount > 0)
			groups.push({ start, count: op.recordCount - start, texture: currentTexture });
		return groups;
	}

	private _writeMesh(renderIndex: number, op: WebGraphicsMeshOp2D, mat: Matrix, ownerAlpha: number): void {
		let wordOffset = GraphicsOpInfoField.WordCount;
		let int32 = op._int32;
		this._syncTexture(renderIndex, op._texture, 0, int32[wordOffset + GraphicsMeshPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		this._writeMeshData(renderIndex, op, wordOffset, mat, ownerAlpha);
		this._writeMeshIndex(renderIndex, op, wordOffset);
	}

	private _syncMeshDirtyOp(renderIndex: number, op: WebGraphicsMeshOp2D, mat: Matrix, ownerAlpha: number): void {
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeMesh(renderIndex, op, mat, ownerAlpha);
			return;
		}
		let wordOffset = GraphicsOpInfoField.WordCount;
		let int32 = op._int32;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTexture(renderIndex, op._texture, 0, int32[wordOffset + GraphicsMeshPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMeshData(renderIndex, op, wordOffset, mat, ownerAlpha);
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Geometry) !== 0)
			this._writeMeshIndex(renderIndex, op, wordOffset);
	}

	private _writeMeshIndex(renderIndex: number, op: WebGraphicsMeshOp2D, wordOffset: number): void {
		let int32 = op._int32;
		let indexDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexDataOffset];
		let indexCount = int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexCount];
		let indexData = this._indexViews[renderIndex]._getData();
		let blocks = this._vertexBlocks[renderIndex];
		for (let j = 0; j < indexCount; j++) {
			let localVertex = int32[indexDataOffset + j];
			let blockIndex = Math.floor(localVertex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let vertexInBlock = localVertex - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			indexData[j] = blocks[blockIndex] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE + vertexInBlock;
		}
		this._indexViews[renderIndex]._modify();
	}

	private _writeMeshData(renderIndex: number, op: WebGraphicsMeshOp2D, wordOffset: number, ownerMat: Matrix, ownerAlpha: number): void {
		let float32 = op._float32;
		let int32 = op._int32;
		let vertexCount = int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexCount];
		let hasUV = int32[wordOffset + GraphicsMeshPayloadWordOffset.HasUV] !== 0;
		let hasColors = int32[wordOffset + GraphicsMeshPayloadWordOffset.HasColors] !== 0;
		let vertexDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexDataOffset];
		let uvDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.UVDataOffset];
		let colorDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.ColorDataOffset];
		let color = int32[wordOffset + GraphicsMeshPayloadWordOffset.PackedColor] >>> 0;
		let r = (color & 0xff) / 255.0;
		let g = ((color >>> 8) & 0xff) / 255.0;
		let b = ((color >>> 16) & 0xff) / 255.0;
		let a = (color >>> 24) / 255.0;
		let alpha = float32[wordOffset + GraphicsMeshPayloadWordOffset.Alpha] * ownerAlpha;
		let x = float32[wordOffset + GraphicsMeshPayloadWordOffset.X];
		let y = float32[wordOffset + GraphicsMeshPayloadWordOffset.Y];
		let textureLayer = int32[wordOffset + GraphicsMeshPayloadWordOffset.TextureLayer];
		let texture = op._texture;
		let modifiedView: Web2DGraphic2DVertexDataView = null;
		for (let i = 0; i < vertexCount; i++) {
			let globalVertex = i;
			let blockIndex = Math.floor(globalVertex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let localVertex = globalVertex - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			let view = this._vertexViews[renderIndex][blockIndex];
			if (view !== modifiedView) {
				modifiedView && modifiedView._modify();
				modifiedView = view;
			}
			let data = view._getData();
			let vi = localVertex * GraphicsDefines.stride;
			let vertexOffset = vertexDataOffset + i * 2;
			let point = this._transformMeshPayloadPoint(x + float32[vertexOffset], y + float32[vertexOffset + 1], float32, int32, wordOffset, ownerMat);
			data[vi] = point[0];
			data[vi + 1] = point[1];
			if (hasUV) {
				let uvOffset = uvDataOffset + i * 2;
				data[vi + 2] = float32[uvOffset];
				data[vi + 3] = float32[uvOffset + 1];
			}
			if (hasColors) {
				let c = colorDataOffset + i * 4;
				data[vi + 4] = float32[c];
				data[vi + 5] = float32[c + 1];
				data[vi + 6] = float32[c + 2];
				data[vi + 7] = float32[c + 3];
			}
			else {
				data[vi + 4] = r;
				data[vi + 5] = g;
				data[vi + 6] = b;
				data[vi + 7] = a;
			}
			data[vi + 8] = texture ? GRAPHICS_INFO_VERTEX_FLAG_ENABLED : GRAPHICS_INFO_VERTEX_FLAG_DISABLED;
			data[vi + 9] = int32[wordOffset + GraphicsMeshPayloadWordOffset.UVClipEnabled] ? GRAPHICS_INFO_VERTEX_FLAG_ENABLED : GRAPHICS_INFO_VERTEX_FLAG_DISABLED;
			data[vi + 10] = alpha;
			data[vi + 11] = textureLayer;
			data[vi + 12] = float32[wordOffset + GraphicsMeshPayloadWordOffset.UVClipX];
			data[vi + 13] = float32[wordOffset + GraphicsMeshPayloadWordOffset.UVClipY];
			data[vi + 14] = float32[wordOffset + GraphicsMeshPayloadWordOffset.UVClipWidth];
			data[vi + 15] = float32[wordOffset + GraphicsMeshPayloadWordOffset.UVClipHeight];
		}
		modifiedView && modifiedView._modify();
	}

	private _writeSolidQuadVertexData(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, mat: Matrix, ownerAlpha: number): void {
		let view = this._vertexViews[renderIndex][0];
		let data = view._getData();
		data.fill(0);
		this._writeQuadVerticesInto(data, 0, float32, int32, wordOffset, mat, false, ownerAlpha);
		view._modify();
	}

	private _writeQuadVertexData(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, mat: Matrix, uvEnabled: boolean, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		let view = this._vertexViews[renderIndex][0];
		let data = view._getData();
		data.fill(0);
		this._writeQuadVerticesInto(data, 0, float32, int32, wordOffset, mat, uvEnabled, ownerAlpha);
		view._modify();
	}

	private _writeQuadTextureLayer(renderIndex: number, textureLayer: number): void {
		let view = this._vertexViews[renderIndex] && this._vertexViews[renderIndex][0];
		if (!view)
			return;
		let data = view._getData();
		for (let vertexIndex = 0; vertexIndex < 4; vertexIndex++)
			data[vertexIndex * GraphicsDefines.stride + 11] = textureLayer;
		view._modify();
	}

	private _writeQuadVerticesInto(data: Float32Array, vertexStart: number, float32: Float32Array, int32: Int32Array, wordOffset: number, mat: Matrix, uvEnabled: boolean, ownerAlpha: number): void {
		let color = int32[wordOffset + GraphicsQuadPayloadWordOffset.PackedColor] >>> 0;
		let r = (color & 0xff) / 255.0;
		let g = ((color >>> 8) & 0xff) / 255.0;
		let b = ((color >>> 16) & 0xff) / 255.0;
		let a = (color >>> 24) / 255.0;
		let alpha = float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] * ownerAlpha;
		let x = float32[wordOffset + GraphicsQuadPayloadWordOffset.X];
		let y = float32[wordOffset + GraphicsQuadPayloadWordOffset.Y];
		let width = float32[wordOffset + GraphicsQuadPayloadWordOffset.Width];
		let height = float32[wordOffset + GraphicsQuadPayloadWordOffset.Height];
		let u0 = float32[wordOffset + GraphicsQuadPayloadWordOffset.U0];
		let v0 = float32[wordOffset + GraphicsQuadPayloadWordOffset.V0];
		let u1 = float32[wordOffset + GraphicsQuadPayloadWordOffset.U1];
		let v1 = float32[wordOffset + GraphicsQuadPayloadWordOffset.V1];
		let textureLayer = int32[wordOffset + GraphicsQuadPayloadWordOffset.TextureLayer];
		this._writePayloadVertex(data, vertexStart, x, y, u0, v0, r, g, b, a, alpha, float32, int32, wordOffset, mat, uvEnabled, textureLayer);
		this._writePayloadVertex(data, vertexStart + 1, x + width, y, u1, v0, r, g, b, a, alpha, float32, int32, wordOffset, mat, uvEnabled, textureLayer);
		this._writePayloadVertex(data, vertexStart + 2, x + width, y + height, u1, v1, r, g, b, a, alpha, float32, int32, wordOffset, mat, uvEnabled, textureLayer);
		this._writePayloadVertex(data, vertexStart + 3, x, y + height, u0, v1, r, g, b, a, alpha, float32, int32, wordOffset, mat, uvEnabled, textureLayer);
	}

	private _writePayloadVertex(data: Float32Array, vertexIndex: number, x: number, y: number, u: number, v: number, r: number, g: number, b: number, a: number, alpha: number, float32: Float32Array, int32: Int32Array, wordOffset: number, ownerMat: Matrix, uvEnabled: boolean, textureLayer: number): void {
		let vi = vertexIndex * GraphicsDefines.stride;
		let point = this._transformPayloadPoint(x, y, float32, int32, wordOffset, ownerMat);
		data[vi] = point[0];
		data[vi + 1] = point[1];
		data[vi + 2] = u;
		data[vi + 3] = v;
		data[vi + 4] = r;
		data[vi + 5] = g;
		data[vi + 6] = b;
		data[vi + 7] = a;
		data[vi + 8] = uvEnabled ? GRAPHICS_INFO_VERTEX_FLAG_ENABLED : GRAPHICS_INFO_VERTEX_FLAG_DISABLED;
		data[vi + 9] = int32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipEnabled] ? GRAPHICS_INFO_VERTEX_FLAG_ENABLED : GRAPHICS_INFO_VERTEX_FLAG_DISABLED;
		data[vi + 10] = alpha;
		data[vi + 11] = textureLayer;
		data[vi + 12] = float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipX];
		data[vi + 13] = float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipY];
		data[vi + 14] = float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipWidth];
		data[vi + 15] = float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipHeight];
	}

	private _transformPayloadPoint(x: number, y: number, float32: Float32Array, int32: Int32Array, wordOffset: number, ownerMat: Matrix): Float32Array {
		let out = this._pointScratch;
		if (int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix]) {
			let px = x;
			let py = y;
			x = px * float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA] + py * float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC] + float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx];
			y = px * float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB] + py * float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD] + float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy];
		}
		if (ownerMat) {
			let px = x;
			let py = y;
			x = px * ownerMat.a + py * ownerMat.c + ownerMat.tx;
			y = px * ownerMat.b + py * ownerMat.d + ownerMat.ty;
		}
		out[0] = x;
		out[1] = y;
		return out;
	}

	private _transformMeshPayloadPoint(x: number, y: number, float32: Float32Array, int32: Int32Array, wordOffset: number, ownerMat: Matrix): Float32Array {
		let out = this._pointScratch;
		if (int32[wordOffset + GraphicsMeshPayloadWordOffset.HasMatrix]) {
			let px = x;
			let py = y;
			x = px * float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixA] + py * float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixC] + float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTx];
			y = px * float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixB] + py * float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixD] + float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTy];
		}
		if (ownerMat) {
			let px = x;
			let py = y;
			x = px * ownerMat.a + py * ownerMat.c + ownerMat.tx;
			y = px * ownerMat.b + py * ownerMat.d + ownerMat.ty;
		}
		out[0] = x;
		out[1] = y;
		return out;
	}

	private _writeQuadIndex(renderIndex: number, quadCount: number): void {
		let indexData = this._indexViews[renderIndex]._getData();
		let blocks = this._vertexBlocks[renderIndex];
		for (let i = 0; i < quadCount; i++) {
			let vertexBase = i * 4;
			let blockIndex = Math.floor(vertexBase / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let blockBase = blocks[blockIndex] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE + vertexBase - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			for (let j = 0; j < 6; j++)
				indexData[i * 6 + j] = blockBase + GRAPHICS_INFO_DEFAULT_QUAD_INDICES[j];
		}
		this._indexViews[renderIndex]._modify();
	}

	private _updateSingleTextureQuadTransformValuesOnly(a: number, b: number, c: number, d: number, tx: number, ty: number, globalAlpha: number, writeAlpha: boolean = true): boolean {
		let op = this._singleTextureQuadOp;
		if (!op || op.recordCount <= 0 || this._singleTextureQuadRenderIndex < 0)
			return false;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		return this._updateQuadTransformValuesOnly(this._singleTextureQuadRenderIndex, op._float32, op._int32, GraphicsOpInfoField.WordCount, globalAlpha, a, b, c, d, tx, ty, writeAlpha);
	}

	private _updateQuadTransformOnly(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, globalAlpha: number, mat: Matrix, writeAlpha: boolean = true): boolean {
		return this._updateQuadTransformValuesOnly(renderIndex, float32, int32, wordOffset, globalAlpha, mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty, writeAlpha);
	}

	private _updateQuadTransformValuesOnly(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, globalAlpha: number, a: number, b: number, c: number, d: number, tx: number, ty: number, writeAlpha: boolean): boolean {
		if (int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix])
			return false;
		let view = this._vertexViews[renderIndex] && this._vertexViews[renderIndex][0];
		if (!view)
			return true;
		let data = view._getData();
		let x = float32[wordOffset + GraphicsQuadPayloadWordOffset.X];
		let y = float32[wordOffset + GraphicsQuadPayloadWordOffset.Y];
		let width = float32[wordOffset + GraphicsQuadPayloadWordOffset.Width];
		let height = float32[wordOffset + GraphicsQuadPayloadWordOffset.Height];
		let x0 = x;
		let y0 = y;
		let x1 = x + width;
		let y1 = y + height;
		if (a === 1 && b === 0 && c === 0 && d === 1) {
			if (tx === 0 && ty === 0) {
				data[0] = x0;
				data[1] = y0;
				data[16] = x1;
				data[17] = y0;
				data[32] = x1;
				data[33] = y1;
				data[48] = x0;
				data[49] = y1;
			}
			else {
				data[0] = x0 + tx;
				data[1] = y0 + ty;
				data[16] = x1 + tx;
				data[17] = y0 + ty;
				data[32] = x1 + tx;
				data[33] = y1 + ty;
				data[48] = x0 + tx;
				data[49] = y1 + ty;
			}
		}
		else {
			let px = x0, py = y0;
			data[0] = px * a + py * c + tx;
			data[1] = px * b + py * d + ty;
			px = x1;
			py = y0;
			data[16] = px * a + py * c + tx;
			data[17] = px * b + py * d + ty;
			px = x1;
			py = y1;
			data[32] = px * a + py * c + tx;
			data[33] = px * b + py * d + ty;
			px = x0;
			py = y1;
			data[48] = px * a + py * c + tx;
			data[49] = px * b + py * d + ty;
		}
		if (writeAlpha) {
			let alpha = float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] * globalAlpha;
			data[10] = alpha;
			data[26] = alpha;
			data[42] = alpha;
			data[58] = alpha;
		}
		view._modify();
		return true;
	}

	private _updateSingleTextureQuadGlobalAlphaOnly(globalAlpha: number): boolean {
		let op = this._singleTextureQuadOp;
		if (!op || op.recordCount <= 0 || this._singleTextureQuadRenderIndex < 0)
			return false;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		return this._updateQuadAlphaOnly(this._singleTextureQuadRenderIndex, op._float32[GraphicsOpInfoField.WordCount + GraphicsQuadPayloadWordOffset.Alpha] * globalAlpha);
	}

	private _updateQuadAlphaOnly(renderIndex: number, alpha: number): boolean {
		let view = this._vertexViews[renderIndex] && this._vertexViews[renderIndex][0];
		if (!view)
			return true;
		let data = view._getData();
		data[10] = alpha;
		data[26] = alpha;
		data[42] = alpha;
		data[58] = alpha;
		view._modify();
		return true;
	}

	private _updateMultiQuadAlphaOnly(renderIndex: number, op: WebGraphicsMultiQuadOp2D | WebGraphicsTextOp2D, start: number, count: number, ownerAlpha: number): boolean {
		let views = this._vertexViews[renderIndex];
		if (!views)
			return true;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		let currentView: Web2DGraphic2DVertexDataView = null;
		for (let i = start, n = start + count, vertexIndex = 0; i < n; i++) {
			let alpha = op._float32[bodyOffset + i * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.Alpha] * ownerAlpha;
			for (let j = 0; j < 4; j++, vertexIndex++) {
				let blockIndex = Math.floor(vertexIndex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
				let view = views[blockIndex];
				if (!view)
					continue;
				if (view !== currentView) {
					if (currentView)
						currentView._modify();
					currentView = view;
				}
				let data = view._getData();
				let localVertex = vertexIndex - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
				data[localVertex * GraphicsDefines.stride + 10] = alpha;
			}
		}
		if (currentView)
			currentView._modify();
		return true;
	}

	private _updateMeshAlphaOnly(renderIndex: number, op: WebGraphicsMeshOp2D, wordOffset: number, ownerAlpha: number): boolean {
		let views = this._vertexViews[renderIndex];
		if (!views)
			return true;
		let vertexCount = op._int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexCount];
		let alpha = op._float32[wordOffset + GraphicsMeshPayloadWordOffset.Alpha] * ownerAlpha;
		let currentView: Web2DGraphic2DVertexDataView = null;
		for (let i = 0; i < vertexCount; i++) {
			let blockIndex = Math.floor(i / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let view = views[blockIndex];
			if (!view)
				continue;
			if (view !== currentView) {
				if (currentView)
					currentView._modify();
				currentView = view;
			}
			let data = view._getData();
			let localVertex = i - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			data[localVertex * GraphicsDefines.stride + 10] = alpha;
		}
		if (currentView)
			currentView._modify();
		return true;
	}

	private _syncOpTransformOnly(op: WebGraphicsOp2D, renderIndex: number, ref: WebGraphicsRenderOpRef, mat: Matrix, ownerAlpha: number, writeAlpha: boolean): boolean {
		if (!op || renderIndex < 0)
			return true;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		let wordOffset = GraphicsOpInfoField.WordCount;
		switch (op.opType) {
			case "textureQuad": {
				let textureOp = op as WebGraphicsTextureQuadOp2D;
				if (textureOp.recordCount <= 0)
					return true;
				if (mat
					? this._updateQuadTransformOnly(renderIndex, textureOp._float32, textureOp._int32, wordOffset, ownerAlpha, mat, writeAlpha)
					: this._updateQuadTransformValuesOnly(renderIndex, textureOp._float32, textureOp._int32, wordOffset, ownerAlpha, 1, 0, 0, 1, 0, 0, writeAlpha))
					return true;
				this._writeQuadVertexData(renderIndex, textureOp._float32, textureOp._int32, wordOffset, mat, textureOp._texture != null, ownerAlpha);
				return true;
			}
			case "fillTexture": {
				let fillOp = op as WebGraphicsFillTextureOp2D;
				if (fillOp.recordCount <= 0)
					return true;
				this._writeQuadVertexData(renderIndex, fillOp._float32, fillOp._int32, wordOffset, mat, fillOp._texture != null, ownerAlpha);
				return true;
			}
			case "solidQuad": {
				let solidOp = op as WebGraphicsSolidQuadOp2D;
				if (solidOp.recordCount <= 0)
					return true;
				this._writeSolidQuadVertexData(renderIndex, solidOp._float32, solidOp._int32, wordOffset, mat, ownerAlpha);
				return true;
			}
			case "mesh":
				this._writeMeshData(renderIndex, op as WebGraphicsMeshOp2D, wordOffset, mat, ownerAlpha);
				return true;
			case "text": {
				let textOp = op as WebGraphicsTextOp2D;
				let group = this._textureGroups[renderIndex];
				if (!group)
					return true;
				this._writeMultiQuadRange(renderIndex, textOp, group.start, group.count, mat, ownerAlpha, group.texture != null);
				return true;
			}
			case "multiQuad": {
				let multiOp = op as WebGraphicsMultiQuadOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : multiOp.recordCount;
				if (count <= 0)
					return true;
				let group = this._textureGroups[renderIndex];
				let texture = group ? group.texture : multiOp._texture;
				this._writeMultiQuadRange(renderIndex, multiOp, start, count, mat, ownerAlpha, texture != null);
				return true;
			}
		}
		return true;
	}

	private _syncOpAlphaOnly(op: WebGraphicsOp2D, renderIndex: number, ref: WebGraphicsRenderOpRef, ownerAlpha: number): boolean {
		if (!op || renderIndex < 0)
			return true;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		let wordOffset = GraphicsOpInfoField.WordCount;
		switch (op.opType) {
			case "textureQuad":
			case "fillTexture":
			case "solidQuad":
				return this._updateQuadAlphaOnly(renderIndex, op._float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] * ownerAlpha);
			case "mesh":
				return this._updateMeshAlphaOnly(renderIndex, op as WebGraphicsMeshOp2D, wordOffset, ownerAlpha);
			case "text": {
				let group = this._textureGroups[renderIndex];
				if (!group)
					return true;
				return this._updateMultiQuadAlphaOnly(renderIndex, op as WebGraphicsTextOp2D, group.start, group.count, ownerAlpha);
			}
			case "multiQuad": {
				let multiOp = op as WebGraphicsMultiQuadOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : multiOp.recordCount;
				return this._updateMultiQuadAlphaOnly(renderIndex, multiOp, start, count, ownerAlpha);
			}
		}
		return true;
	}

	private _syncTexture(renderIndex: number, value: GraphicsOp2DTextureHost, featureBits: number, blendMode: number, useCustomMaterial: boolean = false): void {
		let element = this._renderElements[renderIndex];
		let shaderData = this._primitiveShaderData[renderIndex];
		if (!element || !shaderData)
			return;
		let texture = value;
		if (!texture)
			texture = Texture2D.whiteTexture;
		let renderState = GraphicsOpRenderStateHelper.syncShaderData(shaderData, value, blendMode, (featureBits & ShaderDefines2D.DEFINE_BIT_FILLTEXTURE) !== 0, useCustomMaterial, false, this._renderStateScratch);
		if (texture && texture.dimension === TextureDimension.Texture2DArray)
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, texture);
		else
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, texture);
		BlendModeHandler.setShaderData(blendMode as BlendMode, shaderData);
		element.textureKey = renderState.textureKey;
		element.typeKey = renderState.typeKey;
	}

	private _syncFillTextureRange(renderIndex: number, u0: number, v0: number, u1: number, v1: number): void {
		let shaderData = this._primitiveShaderData[renderIndex];
		if (!shaderData)
			return;
		let range = this._fillTextureRanges[renderIndex];
		if (!range) {
			range = new Vector4();
			this._fillTextureRanges[renderIndex] = range;
		}
		range.setValue(u0, v0, u1 - u0, v1 - v0);
		shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, range);
	}

	private _cacheSingleTextureQuadFastPath(): void {
		this._singleTextureQuadRenderIndex = -1;
		this._singleTextureQuadOp = null;
		if (this._ops.length !== 1)
			return;
		let op = this._ops[0];
		let wordOffset = GraphicsOpInfoField.WordCount;
		if (op.opType === "textureQuad" && (op as WebGraphicsTextureQuadOp2D).recordCount > 0 && !op._int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix]) {
			this._singleTextureQuadRenderIndex = 0;
			this._singleTextureQuadOp = op as WebGraphicsTextureQuadOp2D;
		}
	}

	private _publishOwnerElements(): void {
		if (this._owner)
			this._owner.renderElements = this._renderElements;
	}

	private _destroyBatchEntry(entry: WebGraphicsBatchEntry): void {
		if (!entry)
			return;
		let cloneIndexView = entry.cloneIndexView;
		if (cloneIndexView) {
			let owner = cloneIndexView.owner;
			if (owner && (cloneIndexView._prev || cloneIndexView._next || owner._first === cloneIndexView || owner._last === cloneIndexView))
				owner.removeDataView(cloneIndexView);
			if (cloneIndexView._geometry)
				cloneIndexView._geometry.destroy();
			cloneIndexView.destroy();
		}
	}

	private _clearRenderOps(): void {
		for (let i = 0, n = this._renderElements.length; i < n; i++) {
			let element = this._renderElements[i];
			if (element)
				element._graphicsBatchEntry = null;
			this._destroyBatchEntry(this._batchEntries[i]);
			let viStore = this._viStores[i];
			if (viStore) {
				viStore.releaseVertexBlocks(this._vertexBlocks[i]);
				this._indexViews[i] && viStore.releaseIndexView(this._indexViews[i]);
			}
			if (element) {
				element.geometry = null;
				element.primitiveShaderData = null;
				element.destroy();
			}
			let geometry = this._geometries[i];
			if (geometry) {
				geometry.bufferState = null;
				geometry.destroy();
			}
			this._primitiveShaderData[i] && this._primitiveShaderData[i].destroy();
		}
		this._renderElements.length = 0;
		this._renderOpRefs.length = 0;
		this._opRenderRanges.length = 0;
		this._opRefs.length = 0;
		this._viStores.length = 0;
		this._vertexViews.length = 0;
		this._vertexBlocks.length = 0;
		this._indexViews.length = 0;
		this._geometries.length = 0;
		this._primitiveShaderData.length = 0;
		this._batchEntries.length = 0;
		this._fillTextureRanges.length = 0;
		this._textureGroups.length = 0;
		this._singleTextureQuadRenderIndex = -1;
		this._singleTextureQuadOp = null;
	}

	private _sameOpRefs(ops: ReadonlyArray<WebGraphicsOp2D>): boolean {
		if (!ops || this._opRefs.length !== ops.length)
			return false;
		for (let i = 0, n = ops.length; i < n; i++) {
			if (this._opRefs[i] !== ops[i])
				return false;
		}
		return true;
	}

	private _syncRenderElementTransforms(mat: Matrix = null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1, writeAlpha: boolean = true): void {
		let ownerMat = mat || (this._owner ? this._owner.renderMatrix : null);
		for (let renderIndex = 0, n = this._renderOpRefs.length; renderIndex < n; renderIndex++) {
			let ref = this._renderOpRefs[renderIndex];
			if (!this._syncOpTransformOnly(ref ? ref.op : null, renderIndex, ref, ownerMat, ownerAlpha, writeAlpha))
				this.syncOp(ref ? ref.op : null, renderIndex, ownerMat, ownerAlpha);
		}
	}

	private _syncRenderElementAlphaOnly(ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		let ownerMat: Matrix = null;
		for (let renderIndex = 0, n = this._renderOpRefs.length; renderIndex < n; renderIndex++) {
			let ref = this._renderOpRefs[renderIndex];
			if (!this._syncOpAlphaOnly(ref ? ref.op : null, renderIndex, ref, ownerAlpha)) {
				if (!ownerMat)
					ownerMat = this._owner ? this._owner.renderMatrix : null;
				this.syncOp(ref ? ref.op : null, renderIndex, ownerMat, ownerAlpha);
			}
		}
	}
}
