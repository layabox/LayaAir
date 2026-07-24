import { Matrix } from "../../../../maths/Matrix";
import { Vector4 } from "../../../../maths/Vector4";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { BlendModeHandler } from "../../../../webgl/canvas/BlendMode";
import { BlendMode } from "../../../../webgl/canvas/BlendMode";
import { Texture2D } from "../../../../resource/Texture2D";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import type { GraphicsOp2DRenderState } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import {
    GRAPHICS_INFO_DEFAULT_QUAD_INDICES,
    GRAPHICS_INFO_VERTEX_BLOCK_SIZE,
    GRAPHICS_INFO_VERTEX_FLAG_DISABLED,
    GRAPHICS_INFO_VERTEX_FLAG_ENABLED,
} from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsHandleDirtyFlag, GraphicsHandleUpdateField, GraphicsOpInfoField, GraphicsOpProfile } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
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
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { Web2DGraphic2DVertexDataView } from "./Web2DGraphic2DBufferDataView";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import {
	WebGraphicsBatchEntry,
	WebGraphicsRenderUnit,
	WebGraphicsRenderUnitPool,
} from "./WebGraphicsOp2DRuntimeBuffers";

/** @internal Shared Graphics material state owned by the primitive data handle. */
export type WebGraphicsMaterialState = {
	subShader: SubShader | null;
	shaderData: ShaderData | null;
	useSpriteState: boolean;
};

/** @internal */
export class WebGraphicsOp2DRuntime {
	private _ops: ReadonlyArray<WebGraphicsOp2D> = [];
	private _opRenderRanges: Int32Array = null;
	private _opRenderRangeCapacity: number = 0;
	private _opRefs: WebGraphicsOp2D[] = [];
	private _renderElements: IPrimitiveRenderElement2D[] = [];
	private _renderUnits: WebGraphicsRenderUnit[] = [];
	private _spareOpRenderRanges: Int32Array = null;
	private _spareOpRenderRangeCapacity: number = 0;
	private _spareOpRefs: WebGraphicsOp2D[] = null;
	private _spareRenderElements: IPrimitiveRenderElement2D[] = null;
	private _spareRenderUnits: WebGraphicsRenderUnit[] = null;
	private _spareOpCursor: number = 0;
	private _preferredSpareRenderStart: number = -1;
	private _preferredSpareRenderEnd: number = -1;
	private _active: boolean = false;
	private _needsRematerialize: boolean = false;
	private _pointScratch: Float32Array = new Float32Array(2);
	private _matrixScratch: Matrix = new Matrix();
	private _singleTextureQuadRenderIndex: number = -1;
	private _singleTextureQuadOp: WebGraphicsTextureQuadOp2D = null;
	private _singleTextureQuadVertexView: Web2DGraphic2DVertexDataView = null;
	private _singleTextureQuadX0: number = 0;
	private _singleTextureQuadY0: number = 0;
	private _singleTextureQuadX1: number = 0;
	private _singleTextureQuadY1: number = 0;
	private _singleTextureQuadX2: number = 0;
	private _singleTextureQuadY2: number = 0;
	private _singleTextureQuadX3: number = 0;
	private _singleTextureQuadY3: number = 0;
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
		if (this._needsRematerialize) {
			this._ops = nextOps;
			this._rebuildRenderOps(true);
			this._needsRematerialize = false;
			this._publishOwnerElements();
			this._markHandleUpdatesHandled();
			return;
		}
		if (this._ops !== nextOps) {
			this._ops = nextOps;
			this._rebuildRenderOps();
			this._publishOwnerElements();
			this._markHandleUpdatesHandled();
			return;
		}
		if (!this._handleUpdateInt32) {
			if (!this._sameOpRefs(nextOps)) {
				this._rebuildRenderOps();
				this._publishOwnerElements();
				return;
			}
			this._syncRenderElementTransforms();
			this._cacheSingleTextureQuadFastPath();
			return;
		}
		if (this._isHandleUpdateVersionHandled())
			return;
		let update = this._handleUpdateInt32;
		if (update[GraphicsHandleUpdateField.HandledTopologyVersion] === update[GraphicsHandleUpdateField.TopologyVersion]
			&& this._syncDirtyOpsFromHandle())
			return;
		// Op identity/order/structure is only reconciled when the producer advances
		// the explicit topology version. Payload-only ranges therefore stay O(range).
		this._rebuildRenderOps();
		this._publishOwnerElements();
		this._markHandleUpdatesHandled();
	}

	syncOp(op: WebGraphicsOp2D, renderIndex: number = this._ops ? this._ops.indexOf(op) : -1, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1, clearDirty: boolean = true): void {
		if (!op || renderIndex < 0)
			return;
		let ref = this._renderUnits[renderIndex];
		switch (op.opProfile) {
			case GraphicsOpProfile.TextureQuadPixel:
			case GraphicsOpProfile.TextureQuadPercent:
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeTextureQuad(renderIndex, op as WebGraphicsTextureQuadOp2D, mat, ownerAlpha);
				else
					this._syncTextureQuadDirtyOp(renderIndex, op as WebGraphicsTextureQuadOp2D, mat, ownerAlpha);
				break;
			case GraphicsOpProfile.FillTexture:
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeFillTexture(renderIndex, op as WebGraphicsFillTextureOp2D, mat, ownerAlpha);
				else
					this._syncFillTextureDirtyOp(renderIndex, op as WebGraphicsFillTextureOp2D, mat, ownerAlpha);
				break;
			case GraphicsOpProfile.SolidQuadPixel:
			case GraphicsOpProfile.SolidQuadPercent:
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeSolidQuad(renderIndex, op as WebGraphicsSolidQuadOp2D, mat, ownerAlpha);
				else
					this._syncSolidQuadDirtyOp(renderIndex, op as WebGraphicsSolidQuadOp2D, mat, ownerAlpha);
				break;
			case GraphicsOpProfile.GenericMesh:
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeMesh(renderIndex, op as WebGraphicsMeshOp2D, mat, ownerAlpha);
				else
					this._syncMeshDirtyOp(renderIndex, op as WebGraphicsMeshOp2D, mat, ownerAlpha);
				break;
			case GraphicsOpProfile.Text: {
				let textStart = ref ? ref.recordStart : 0;
				let textCount = ref ? ref.recordCount : (op as WebGraphicsTextOp2D).recordCount;
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeText(renderIndex, op as WebGraphicsTextOp2D, textStart, textCount, mat, ownerAlpha);
				else
					this._syncTextDirtyOp(renderIndex, op as WebGraphicsTextOp2D, textStart, textCount, mat, ownerAlpha);
				break;
			}
			case GraphicsOpProfile.MultiQuad:
				if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
					this._writeMultiQuad(renderIndex, op as WebGraphicsMultiQuadOp2D, ref ? ref.recordStart : 0, ref ? ref.recordCount : (op as WebGraphicsMultiQuadOp2D).recordCount, mat, ownerAlpha);
				else
					this._syncMultiQuadDirtyOp(renderIndex, op as WebGraphicsMultiQuadOp2D, ref ? ref.recordStart : 0, ref ? ref.recordCount : (op as WebGraphicsMultiQuadOp2D).recordCount, mat, ownerAlpha);
				break;
		}
		if (clearDirty)
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
		if (renderElementIndex == null || renderElementIndex < 0)
			return null;
		let unit = this._renderUnits[renderElementIndex];
		return unit && unit.sourceIndexView && unit.viStore ? unit : null;
	}

	syncGraphicsUseSpriteState(): void {
		let useSpriteState = this._materialState.useSpriteState;
		let ownerBlendMode = this._owner.blendMode;
		let blendMask = ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL - 1;
		for (let element of this._renderElements) {
			if (element)
				element.renderStateIsBySprite = useSpriteState && (element.typeKey & blendMask) === ownerBlendMode;
		}
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
			this._markHandleUpdatesHandled();
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
				this._markHandleUpdatesHandled();
				return true;
			}
			let rangeOffset = opIndex * 2;
			let rangeCount = this._opRenderRanges ? this._opRenderRanges[rangeOffset + 1] : 0;
			if (rangeCount <= 0) {
				op.clearDirty();
				continue;
			}
			if (op.dirtyFlags === GraphicsOp2DDirtyFlag.None)
				continue;
			let rangeStart = this._opRenderRanges[rangeOffset];
			for (let renderIndex = rangeStart, n = rangeStart + rangeCount; renderIndex < n; renderIndex++)
				this.syncOp(op, renderIndex, mat, ownerAlpha, false);
			op.clearDirty();
		}
		this._markHandleUpdatesHandled();
		this._cacheSingleTextureQuadFastPath();
		return true;
	}

	destroy(): void {
		this._active = false;
		this._clearRenderOps();
		this._ops = [];
		this._owner = null;
	}

	private _rebuildRenderOps(forceStructure: boolean = false): void {
		let hasPreviousUnits = this._renderUnits.length > 0;
		if (hasPreviousUnits)
			this._snapshotRenderOpsToSpare();
		else {
			this._renderElements.length = 0;
			this._opRefs.length = 0;
			this._renderUnits.length = 0;
		}
		let renderIndex = 0;
		this._spareOpCursor = 0;
		for (let i = 0, n = this._ops.length; i < n; i++) {
			let op = this._ops[i];
			this._opRefs[i] = op;
			this._preferredSpareRenderStart = -1;
			this._preferredSpareRenderEnd = -1;
			let oldOpIndex = hasPreviousUnits ? this._findSpareOpIndex(op) : -1;
			if (!forceStructure && oldOpIndex >= 0 && (op.dirtyFlags & GraphicsOp2DDirtyFlag.Structure) === 0) {
				let needsSync = op.dirtyFlags !== GraphicsOp2DDirtyFlag.None;
				let oldRangeOffset = oldOpIndex * 2;
				let oldRenderStart = this._spareOpRenderRanges[oldRangeOffset];
				let count = this._spareOpRenderRanges[oldRangeOffset + 1];
				this._setOpRenderRange(i, renderIndex, count);
				for (let oldRenderIndex = oldRenderStart, end = oldRenderIndex + count; oldRenderIndex < end; oldRenderIndex++) {
					this._reuseSpareRenderElement(oldRenderIndex, renderIndex, op, i);
					if (needsSync)
						this.syncOp(op, renderIndex, undefined, undefined, false);
					renderIndex++;
				}
				if (needsSync || count === 0)
					op.clearDirty();
				continue;
			}
			if (oldOpIndex >= 0) {
				let oldRangeOffset = oldOpIndex * 2;
				this._preferredSpareRenderStart = this._spareOpRenderRanges[oldRangeOffset];
				this._preferredSpareRenderEnd = this._preferredSpareRenderStart + this._spareOpRenderRanges[oldRangeOffset + 1];
			}
			if (op.opProfile === GraphicsOpProfile.Text) {
				let startRenderIndex = renderIndex;
				renderIndex = this._appendTextRenderElements(renderIndex, op as WebGraphicsTextOp2D, i);
				this._setOpRenderRange(i, startRenderIndex, renderIndex - startRenderIndex);
				continue;
			}
			if (op.opProfile === GraphicsOpProfile.MultiQuad) {
				let startRenderIndex = renderIndex;
				renderIndex = this._appendMultiQuadRenderElements(renderIndex, op as WebGraphicsMultiQuadOp2D, i);
				this._setOpRenderRange(i, startRenderIndex, renderIndex - startRenderIndex);
				continue;
			}
			let vertexCount = this._getVertexCount(op);
			let indexCount = this._getIndexCount(op);
			if (vertexCount <= 0 || indexCount <= 0) {
				this._setOpRenderRange(i, renderIndex, 0);
				op.clearDirty();
				continue;
			}
			if (!this._createRenderElement(renderIndex, vertexCount, indexCount, op, i, 0, 1)) {
				this._setOpRenderRange(i, renderIndex, 0);
				continue;
			}
			this._setOpRenderRange(i, renderIndex, 1);
			this.syncOp(op, renderIndex);
			renderIndex++;
		}
		this._destroyUnusedSpareRenderUnits();
		this._cacheSingleTextureQuadFastPath();
	}

	private _isHandleUpdateVersionHandled(): boolean {
		let update = this._handleUpdateInt32;
		return !!update
			&& update[GraphicsHandleUpdateField.HandledVersion] === update[GraphicsHandleUpdateField.UpdateVersion]
			&& update[GraphicsHandleUpdateField.HandledTopologyVersion] === update[GraphicsHandleUpdateField.TopologyVersion];
	}

	private _markHandleUpdatesHandled(): void {
		let update = this._handleUpdateInt32;
		if (!update)
			return;
		update[GraphicsHandleUpdateField.HandledTopologyVersion] = update[GraphicsHandleUpdateField.TopologyVersion];
		// Acknowledge last so the producer never merges against a partial commit.
		update[GraphicsHandleUpdateField.HandledVersion] = update[GraphicsHandleUpdateField.UpdateVersion];
	}

	private _snapshotRenderOpsToSpare(): void {
		if (!this._spareRenderUnits) {
			this._spareOpRefs = [];
			this._spareRenderElements = [];
			this._spareRenderUnits = [];
		}
		for (let i = 0, n = this._renderUnits.length; i < n; i++) {
			this._spareRenderUnits[i] = this._renderUnits[i];
			this._spareRenderElements[i] = this._renderElements[i];
		}
		this._spareRenderUnits.length = this._renderUnits.length;
		this._spareRenderElements.length = this._renderElements.length;
		this._ensureSpareOpRenderRangeCapacity(this._opRefs.length);
		for (let i = 0, n = this._opRefs.length; i < n; i++) {
			this._spareOpRefs[i] = this._opRefs[i];
			let rangeOffset = i * 2;
			this._spareOpRenderRanges[rangeOffset] = this._opRenderRanges[rangeOffset];
			this._spareOpRenderRanges[rangeOffset + 1] = this._opRenderRanges[rangeOffset + 1];
		}
		this._spareOpRefs.length = this._opRefs.length;
		this._renderElements.length = 0;
		this._opRefs.length = 0;
		this._renderUnits.length = 0;
	}

	private _findSpareOpIndex(op: WebGraphicsOp2D): number {
		let n = this._spareOpRefs.length;
		while (this._spareOpCursor < n) {
			let candidateIndex = this._spareOpCursor;
			let candidate = this._spareOpRefs[candidateIndex];
			if (candidate === op) {
				this._spareOpCursor++;
				return candidateIndex;
			}
			if (candidate.commandIndex < op.commandIndex) {
				this._spareOpCursor++;
				continue;
			}
			if (candidate.commandIndex > op.commandIndex)
				return -1;
			for (let i = candidateIndex + 1; i < n && this._spareOpRefs[i].commandIndex === op.commandIndex; i++) {
				if (this._spareOpRefs[i] === op) {
					this._spareOpCursor = i + 1;
					return i;
				}
			}
			return -1;
		}
		return -1;
	}

	private _reuseSpareRenderElement(oldRenderIndex: number, renderIndex: number, op: WebGraphicsOp2D, opIndex: number): void {
		let unit = this._spareRenderUnits[oldRenderIndex];
		unit.op = op;
		unit.opIndex = opIndex;
		this._renderUnits[renderIndex] = unit;
		this._renderElements[renderIndex] = this._spareRenderElements[oldRenderIndex];
		this._spareRenderUnits[oldRenderIndex] = null;
	}

	private _destroyUnusedSpareRenderUnits(): void {
		if (!this._spareRenderUnits)
			return;
		for (let i = 0, n = this._spareRenderUnits.length; i < n; i++) {
			let unit = this._spareRenderUnits[i];
			if (!unit)
				continue;
			WebGraphicsRenderUnitPool.recover(unit);
			this._spareRenderUnits[i] = null;
			this._spareRenderElements[i] = null;
		}
		this._spareRenderUnits.length = 0;
		this._spareRenderElements.length = 0;
		this._spareOpRefs.length = 0;
	}

	private _takePreferredSpareRenderUnit(vertexCount: number, indexCount: number): WebGraphicsRenderUnit {
		if (!this._spareRenderUnits || this._preferredSpareRenderStart < 0)
			return null;
		for (let i = this._preferredSpareRenderStart; i < this._preferredSpareRenderEnd; i++) {
			let unit = this._spareRenderUnits[i];
			if (!unit || !unit.canReuse(vertexCount, indexCount))
				continue;
			this._spareRenderUnits[i] = null;
			unit.reactivate(this._owner, this._materialState.subShader, this._materialState.shaderData);
			return unit;
		}
		return null;
	}


	private _appendMultiQuadRenderElements(renderIndex: number, op: WebGraphicsMultiQuadOp2D, opIndex: number): number {
		return this._appendGroupedQuadRenderElements(renderIndex, op, opIndex);
	}

	private _appendTextRenderElements(renderIndex: number, op: WebGraphicsTextOp2D, opIndex: number): number {
		return this._appendGroupedQuadRenderElements(renderIndex, op, opIndex);
	}

	private _appendGroupedQuadRenderElements(renderIndex: number, op: WebGraphicsMultiQuadOp2D | WebGraphicsTextOp2D, opIndex: number): number {
		let maxRecords = this._getMaxQuadRecordsPerRenderElement();
		let groupStart = 0;
		let groupTexture: GraphicsOp2DTextureHost = op.recordCount > 0 ? op.textures[0] || null : null;
		for (let i = 1, n = op.recordCount; i <= n; i++) {
			let texture = i < n ? op.textures[i] || null : null;
			if (i < n && texture === groupTexture)
				continue;
			let groupCount = i - groupStart;
			for (let offset = 0; offset < groupCount;) {
				let count = Math.min(maxRecords, groupCount - offset);
				if (!this._createRenderElement(renderIndex, count * 4, count * 6, op, opIndex, groupStart + offset, count))
					break;
				let recordStart = groupStart + offset;
				if (op.opProfile === GraphicsOpProfile.Text)
					this._writeText(renderIndex, op as WebGraphicsTextOp2D, recordStart, count);
				else
					this._writeMultiQuad(renderIndex, op as WebGraphicsMultiQuadOp2D, recordStart, count);
				renderIndex++;
				offset += count;
			}
			groupStart = i;
			groupTexture = texture;
		}
		op.clearDirty();
		return renderIndex;
	}

	private _getVertexCount(op: WebGraphicsOp2D): number {
		switch (op.opProfile) {
			case GraphicsOpProfile.TextureQuadPixel:
			case GraphicsOpProfile.TextureQuadPercent:
			case GraphicsOpProfile.FillTexture:
			case GraphicsOpProfile.SolidQuadPixel:
			case GraphicsOpProfile.SolidQuadPercent:
				return (op as WebGraphicsTextureQuadOp2D | WebGraphicsFillTextureOp2D | WebGraphicsSolidQuadOp2D).recordCount > 0 ? 4 : 0;
			case GraphicsOpProfile.MultiQuad:
				return (op as WebGraphicsMultiQuadOp2D).recordCount * 4;
			case GraphicsOpProfile.GenericMesh:
				return op._int32[GraphicsOpInfoField.WordCount + GraphicsMeshPayloadWordOffset.VertexCount];
			default:
				return 0;
		}
	}

	private _getIndexCount(op: WebGraphicsOp2D): number {
		switch (op.opProfile) {
			case GraphicsOpProfile.TextureQuadPixel:
			case GraphicsOpProfile.TextureQuadPercent:
			case GraphicsOpProfile.FillTexture:
			case GraphicsOpProfile.SolidQuadPixel:
			case GraphicsOpProfile.SolidQuadPercent:
				return (op as WebGraphicsTextureQuadOp2D | WebGraphicsFillTextureOp2D | WebGraphicsSolidQuadOp2D).recordCount > 0 ? 6 : 0;
			case GraphicsOpProfile.MultiQuad:
				return (op as WebGraphicsMultiQuadOp2D).recordCount * 6;
			case GraphicsOpProfile.GenericMesh:
				return op._int32[GraphicsOpInfoField.WordCount + GraphicsMeshPayloadWordOffset.IndexCount];
			default:
				return 0;
		}
	}

	private _getMaxQuadRecordsPerRenderElement(): number {
		return Math.max(1, Math.floor(GraphicsDefines.GRAPHICS_MAX_VERTEX / 4));
	}

	private _setOpRenderRange(opIndex: number, start: number, count: number): void {
		this._ensureOpRenderRangeCapacity(opIndex + 1);
		let offset = opIndex * 2;
		this._opRenderRanges[offset] = start;
		this._opRenderRanges[offset + 1] = count;
	}

	private _ensureOpRenderRangeCapacity(opCount: number): void {
		if (opCount <= this._opRenderRangeCapacity)
			return;
		let capacity = Math.max(8, this._opRenderRangeCapacity || 0);
		while (capacity < opCount)
			capacity <<= 1;
		let ranges = new Int32Array(capacity * 2);
		if (this._opRenderRanges)
			ranges.set(this._opRenderRanges);
		this._opRenderRanges = ranges;
		this._opRenderRangeCapacity = capacity;
	}

	private _ensureSpareOpRenderRangeCapacity(opCount: number): void {
		if (opCount <= this._spareOpRenderRangeCapacity)
			return;
		let capacity = Math.max(8, this._spareOpRenderRangeCapacity || 0);
		while (capacity < opCount)
			capacity <<= 1;
		this._spareOpRenderRanges = new Int32Array(capacity * 2);
		this._spareOpRenderRangeCapacity = capacity;
	}

	private _createRenderElement(renderIndex: number, vertexCount: number, indexCount: number, op: WebGraphicsOp2D, opIndex: number, recordStart: number, recordCount: number): boolean {
		let unit = this._takePreferredSpareRenderUnit(vertexCount, indexCount);
		if (!unit)
			unit = WebGraphicsRenderUnitPool.take(vertexCount, indexCount, this._owner,
				this._materialState.subShader, this._materialState.shaderData);
		if (!unit) {
			unit = WebGraphicsRenderUnit.create(vertexCount, indexCount, this._owner, this._materialState.subShader, this._materialState.shaderData);
			if (!unit)
				return false;
		}
		this._renderElements[renderIndex] = unit.element;
		unit.op = op;
		unit.opIndex = opIndex;
		unit.recordStart = recordStart;
		unit.recordCount = recordCount;
		this._renderUnits[renderIndex] = unit;
		return true;
	}

	activate(): void {
		this._active = true;
		this._publishOwnerElements();
	}

	deactivate(): void {
		if (!this._active)
			return;
		this._active = false;
		this._releaseRenderUnitsToPool();
		this._needsRematerialize = this._ops.length > 0;
	}

	private _releaseRenderUnitsToPool(): void {
		for (let i = 0, n = this._renderUnits.length; i < n; i++) {
			let unit = this._renderUnits[i];
			if (unit)
				WebGraphicsRenderUnitPool.recover(unit);
		}
		this._renderElements.length = 0;
		this._renderUnits.length = 0;
		this._opRefs.length = 0;
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
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTextureOrState(renderIndex, dirtyFlags, texture, 0, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], hasCustomMaterial);
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
			this._syncTextureState(renderIndex, op._int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
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
			this._syncTextureOrState(renderIndex, dirtyFlags, texture, ShaderDefines2D.DEFINE_BIT_FILLTEXTURE, i32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
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
		let texture = op.textures[start] || null;
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
		let texture = op.textures[start] || null;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTextureOrState(renderIndex, dirtyFlags, texture, 0, op._int32[bodyOffset + start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMultiQuadRange(renderIndex, op, start, count, mat, ownerAlpha, texture != null);
	}

	private _writeText(renderIndex: number, op: WebGraphicsTextOp2D, start: number, count: number, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (count <= 0)
			return;
		let texture = op.textures[start] || null;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		this._syncTexture(renderIndex, texture, 0, op._int32[bodyOffset + start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		this._writeMultiQuadRange(renderIndex, op, start, count, mat, ownerAlpha, texture != null);
		this._writeQuadIndex(renderIndex, count);
	}

	private _syncTextDirtyOp(renderIndex: number, op: WebGraphicsTextOp2D, start: number, count: number, mat: Matrix = this._owner ? this._owner.renderMatrix : null, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		if (count <= 0)
			return;
		let dirtyFlags = op.dirtyFlags;
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Structure) !== 0) {
			this._writeText(renderIndex, op, start, count, mat, ownerAlpha);
			return;
		}
		let texture = op.textures[start] || null;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._syncTextureOrState(renderIndex, dirtyFlags, texture, 0, op._int32[bodyOffset + start * GraphicsQuadPayloadWordCount + GraphicsQuadPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMultiQuadRange(renderIndex, op, start, count, mat, ownerAlpha, texture != null);
	}

	private _writeMultiQuadRange(renderIndex: number, op: WebGraphicsMultiQuadOp2D, start: number, count: number, mat: Matrix, ownerAlpha: number, uvEnabled: boolean): void {
		let view: Web2DGraphic2DVertexDataView = null;
		let blockData: Float32Array = null;
		let vertexIndex = 0;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		for (let i = start, n = start + count; i < n; i++) {
			if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE === 0) {
				view = this._renderUnits[renderIndex].vertexViews[Math.floor(vertexIndex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE)];
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
			this._syncTextureOrState(renderIndex, dirtyFlags, op._texture, 0, int32[wordOffset + GraphicsMeshPayloadWordOffset.BlendMode], this._materialState.shaderData != null);
		if ((dirtyFlags & (GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State)) !== 0)
			this._writeMeshData(renderIndex, op, wordOffset, mat, ownerAlpha);
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Geometry) !== 0)
			this._writeMeshIndex(renderIndex, op, wordOffset);
	}

	private _writeMeshIndex(renderIndex: number, op: WebGraphicsMeshOp2D, wordOffset: number): void {
		let int32 = op._int32;
		let indexDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexDataOffset];
		let indexCount = int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexCount];
		let unit = this._renderUnits[renderIndex];
		let indexData = unit.sourceIndexView._getData();
		let blocks = unit.vertexBlocks;
		for (let j = 0; j < indexCount; j++) {
			let localVertex = int32[indexDataOffset + j];
			let blockIndex = Math.floor(localVertex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let vertexInBlock = localVertex - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			indexData[j] = blocks[blockIndex] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE + vertexInBlock;
		}
		unit.sourceIndexView._modify();
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
			let view = this._renderUnits[renderIndex].vertexViews[blockIndex];
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
		let view = this._renderUnits[renderIndex].vertexViews[0];
		let data = view._getData();
		data.fill(0);
		this._writeQuadVerticesInto(data, 0, float32, int32, wordOffset, mat, false, ownerAlpha);
		view._modify();
	}

	private _writeQuadVertexData(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, mat: Matrix, uvEnabled: boolean, ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		let view = this._renderUnits[renderIndex].vertexViews[0];
		let data = view._getData();
		data.fill(0);
		this._writeQuadVerticesInto(data, 0, float32, int32, wordOffset, mat, uvEnabled, ownerAlpha);
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
		let unit = this._renderUnits[renderIndex];
		let indexData = unit.sourceIndexView._getData();
		let blocks = unit.vertexBlocks;
		for (let i = 0; i < quadCount; i++) {
			let vertexBase = i * 4;
			let blockIndex = Math.floor(vertexBase / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let blockBase = blocks[blockIndex] * GRAPHICS_INFO_VERTEX_BLOCK_SIZE + vertexBase - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			for (let j = 0; j < 6; j++)
				indexData[i * 6 + j] = blockBase + GRAPHICS_INFO_DEFAULT_QUAD_INDICES[j];
		}
		unit.sourceIndexView._modify();
	}

	private _updateSingleTextureQuadTransformValuesOnly(a: number, b: number, c: number, d: number, tx: number, ty: number, globalAlpha: number, writeAlpha: boolean = true): boolean {
		let op = this._singleTextureQuadOp;
		if (!op || op.recordCount <= 0 || this._singleTextureQuadRenderIndex < 0)
			return false;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		let view = this._singleTextureQuadVertexView;
		if (!view)
			return false;
		let data = view._getData();
		let x0 = this._singleTextureQuadX0;
		let y0 = this._singleTextureQuadY0;
		let x1 = this._singleTextureQuadX1;
		let y1 = this._singleTextureQuadY1;
		let x2 = this._singleTextureQuadX2;
		let y2 = this._singleTextureQuadY2;
		let x3 = this._singleTextureQuadX3;
		let y3 = this._singleTextureQuadY3;
		if (a === 1 && b === 0 && c === 0 && d === 1) {
			data[0] = x0 + tx;
			data[1] = y0 + ty;
			data[16] = x1 + tx;
			data[17] = y1 + ty;
			data[32] = x2 + tx;
			data[33] = y2 + ty;
			data[48] = x3 + tx;
			data[49] = y3 + ty;
		}
		else {
			data[0] = x0 * a + y0 * c + tx;
			data[1] = x0 * b + y0 * d + ty;
			data[16] = x1 * a + y1 * c + tx;
			data[17] = x1 * b + y1 * d + ty;
			data[32] = x2 * a + y2 * c + tx;
			data[33] = x2 * b + y2 * d + ty;
			data[48] = x3 * a + y3 * c + tx;
			data[49] = x3 * b + y3 * d + ty;
		}
		if (writeAlpha) {
			let alpha = op._float32[GraphicsOpInfoField.WordCount + GraphicsQuadPayloadWordOffset.Alpha] * globalAlpha;
			data[10] = alpha;
			data[26] = alpha;
			data[42] = alpha;
			data[58] = alpha;
		}
		view._modify();
		return true;
	}

	private _updateQuadTransformOnly(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, globalAlpha: number, mat: Matrix, writeAlpha: boolean = true): boolean {
		return this._updateQuadTransformValuesOnly(renderIndex, float32, int32, wordOffset, globalAlpha, mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty, writeAlpha);
	}

	private _updateQuadTransformValuesOnly(renderIndex: number, float32: Float32Array, int32: Int32Array, wordOffset: number, globalAlpha: number, a: number, b: number, c: number, d: number, tx: number, ty: number, writeAlpha: boolean): boolean {
		let unit = this._renderUnits[renderIndex];
		let view = unit && unit.vertexViews[0];
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
		if (int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix]) {
			let la = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA];
			let lb = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB];
			let lc = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC];
			let ld = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD];
			let ltx = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx];
			let lty = float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy];
			let px0 = x0, py0 = y0, px1 = x1, py1 = y1;
			x0 = px0 * la + py0 * lc + ltx;
			y0 = px0 * lb + py0 * ld + lty;
			x1 = px1 * la + py1 * lc + ltx;
			y1 = px1 * lb + py1 * ld + lty;
			let topRightX = px1 * la + py0 * lc + ltx;
			let topRightY = px1 * lb + py0 * ld + lty;
			let bottomLeftX = px0 * la + py1 * lc + ltx;
			let bottomLeftY = px0 * lb + py1 * ld + lty;
			if (a === 1 && b === 0 && c === 0 && d === 1) {
				data[0] = x0 + tx;
				data[1] = y0 + ty;
				data[16] = topRightX + tx;
				data[17] = topRightY + ty;
				data[32] = x1 + tx;
				data[33] = y1 + ty;
				data[48] = bottomLeftX + tx;
				data[49] = bottomLeftY + ty;
			}
			else {
				data[0] = x0 * a + y0 * c + tx;
				data[1] = x0 * b + y0 * d + ty;
				data[16] = topRightX * a + topRightY * c + tx;
				data[17] = topRightX * b + topRightY * d + ty;
				data[32] = x1 * a + y1 * c + tx;
				data[33] = x1 * b + y1 * d + ty;
				data[48] = bottomLeftX * a + bottomLeftY * c + tx;
				data[49] = bottomLeftX * b + bottomLeftY * d + ty;
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
		let view = this._singleTextureQuadVertexView;
		if (!view)
			return false;
		let data = view._getData();
		let alpha = op._float32[GraphicsOpInfoField.WordCount + GraphicsQuadPayloadWordOffset.Alpha] * globalAlpha;
		data[10] = alpha;
		data[26] = alpha;
		data[42] = alpha;
		data[58] = alpha;
		view._modify();
		return true;
	}

	private _updateQuadAlphaOnly(renderIndex: number, alpha: number): boolean {
		let unit = this._renderUnits[renderIndex];
		let view = unit && unit.vertexViews[0];
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
		let views = this._renderUnits[renderIndex].vertexViews;
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
		let views = this._renderUnits[renderIndex].vertexViews;
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

	private _syncOpTransformOnly(op: WebGraphicsOp2D, renderIndex: number, ref: WebGraphicsRenderUnit, mat: Matrix, ownerAlpha: number, writeAlpha: boolean): boolean {
		if (!op || renderIndex < 0)
			return true;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		let wordOffset = GraphicsOpInfoField.WordCount;
		switch (op.opProfile) {
			case GraphicsOpProfile.TextureQuadPixel:
			case GraphicsOpProfile.TextureQuadPercent: {
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
			case GraphicsOpProfile.FillTexture: {
				let fillOp = op as WebGraphicsFillTextureOp2D;
				if (fillOp.recordCount <= 0)
					return true;
				return mat
					? this._updateQuadTransformOnly(renderIndex, fillOp._float32, fillOp._int32, wordOffset, ownerAlpha, mat, writeAlpha)
					: this._updateQuadTransformValuesOnly(renderIndex, fillOp._float32, fillOp._int32, wordOffset, ownerAlpha, 1, 0, 0, 1, 0, 0, writeAlpha);
			}
			case GraphicsOpProfile.SolidQuadPixel:
			case GraphicsOpProfile.SolidQuadPercent: {
				let solidOp = op as WebGraphicsSolidQuadOp2D;
				if (solidOp.recordCount <= 0)
					return true;
				return mat
					? this._updateQuadTransformOnly(renderIndex, solidOp._float32, solidOp._int32, wordOffset, ownerAlpha, mat, writeAlpha)
					: this._updateQuadTransformValuesOnly(renderIndex, solidOp._float32, solidOp._int32, wordOffset, ownerAlpha, 1, 0, 0, 1, 0, 0, writeAlpha);
			}
			case GraphicsOpProfile.GenericMesh:
				this._updateMeshTransformOnly(renderIndex, op as WebGraphicsMeshOp2D, wordOffset, mat, ownerAlpha, writeAlpha);
				return true;
			case GraphicsOpProfile.Text: {
				let textOp = op as WebGraphicsTextOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : textOp.recordCount;
				if (count <= 0)
					return true;
				this._updateMultiQuadTransformOnly(renderIndex, textOp, start, count, mat, ownerAlpha, writeAlpha);
				return true;
			}
			case GraphicsOpProfile.MultiQuad: {
				let multiOp = op as WebGraphicsMultiQuadOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : multiOp.recordCount;
				if (count <= 0)
					return true;
				this._updateMultiQuadTransformOnly(renderIndex, multiOp, start, count, mat, ownerAlpha, writeAlpha);
				return true;
			}
		}
		return true;
	}

	private _updateMultiQuadTransformOnly(renderIndex: number, op: WebGraphicsMultiQuadOp2D, start: number, count: number, ownerMat: Matrix, ownerAlpha: number, writeAlpha: boolean): void {
		let view: Web2DGraphic2DVertexDataView = null;
		let blockData: Float32Array = null;
		let vertexIndex = 0;
		let bodyOffset = GraphicsOpInfoField.WordCount;
		for (let i = start, n = start + count; i < n; i++) {
			if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE === 0) {
				view = this._renderUnits[renderIndex].vertexViews[Math.floor(vertexIndex / GRAPHICS_INFO_VERTEX_BLOCK_SIZE)];
				blockData = view._getData();
			}
			this._updateQuadTransformInto(blockData, vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE, op._float32, op._int32,
				bodyOffset + i * GraphicsQuadPayloadWordCount, ownerMat, ownerAlpha, writeAlpha);
			vertexIndex += 4;
			if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE === 0)
				view._modify();
		}
		if (vertexIndex % GRAPHICS_INFO_VERTEX_BLOCK_SIZE !== 0)
			view._modify();
	}

	private _updateQuadTransformInto(data: Float32Array, vertexStart: number, float32: Float32Array, int32: Int32Array,
		wordOffset: number, ownerMat: Matrix, ownerAlpha: number, writeAlpha: boolean): void {
		let x = float32[wordOffset + GraphicsQuadPayloadWordOffset.X];
		let y = float32[wordOffset + GraphicsQuadPayloadWordOffset.Y];
		let width = float32[wordOffset + GraphicsQuadPayloadWordOffset.Width];
		let height = float32[wordOffset + GraphicsQuadPayloadWordOffset.Height];
		let point = this._transformPayloadPoint(x, y, float32, int32, wordOffset, ownerMat);
		let offset = vertexStart * GraphicsDefines.stride;
		data[offset] = point[0];
		data[offset + 1] = point[1];
		point = this._transformPayloadPoint(x + width, y, float32, int32, wordOffset, ownerMat);
		offset += GraphicsDefines.stride;
		data[offset] = point[0];
		data[offset + 1] = point[1];
		point = this._transformPayloadPoint(x + width, y + height, float32, int32, wordOffset, ownerMat);
		offset += GraphicsDefines.stride;
		data[offset] = point[0];
		data[offset + 1] = point[1];
		point = this._transformPayloadPoint(x, y + height, float32, int32, wordOffset, ownerMat);
		offset += GraphicsDefines.stride;
		data[offset] = point[0];
		data[offset + 1] = point[1];
		if (writeAlpha) {
			let alpha = float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] * ownerAlpha;
			offset = vertexStart * GraphicsDefines.stride + 10;
			data[offset] = alpha;
			data[offset + GraphicsDefines.stride] = alpha;
			data[offset + GraphicsDefines.stride * 2] = alpha;
			data[offset + GraphicsDefines.stride * 3] = alpha;
		}
	}

	private _updateMeshTransformOnly(renderIndex: number, op: WebGraphicsMeshOp2D, wordOffset: number, ownerMat: Matrix, ownerAlpha: number, writeAlpha: boolean): void {
		let float32 = op._float32;
		let int32 = op._int32;
		let vertexCount = int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexCount];
		let vertexDataOffset = wordOffset + int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexDataOffset];
		let x = float32[wordOffset + GraphicsMeshPayloadWordOffset.X];
		let y = float32[wordOffset + GraphicsMeshPayloadWordOffset.Y];
		let alpha = writeAlpha ? float32[wordOffset + GraphicsMeshPayloadWordOffset.Alpha] * ownerAlpha : 0;
		let modifiedView: Web2DGraphic2DVertexDataView = null;
		for (let i = 0; i < vertexCount; i++) {
			let blockIndex = Math.floor(i / GRAPHICS_INFO_VERTEX_BLOCK_SIZE);
			let localVertex = i - blockIndex * GRAPHICS_INFO_VERTEX_BLOCK_SIZE;
			let view = this._renderUnits[renderIndex].vertexViews[blockIndex];
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
			if (writeAlpha)
				data[vi + 10] = alpha;
		}
		modifiedView && modifiedView._modify();
	}

	private _syncOpAlphaOnly(op: WebGraphicsOp2D, renderIndex: number, ref: WebGraphicsRenderUnit, ownerAlpha: number): boolean {
		if (!op || renderIndex < 0)
			return true;
		if (op.dirtyFlags !== GraphicsOp2DDirtyFlag.None)
			return false;
		let wordOffset = GraphicsOpInfoField.WordCount;
		switch (op.opProfile) {
			case GraphicsOpProfile.TextureQuadPixel:
			case GraphicsOpProfile.TextureQuadPercent:
			case GraphicsOpProfile.FillTexture:
			case GraphicsOpProfile.SolidQuadPixel:
			case GraphicsOpProfile.SolidQuadPercent:
				return this._updateQuadAlphaOnly(renderIndex, op._float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] * ownerAlpha);
			case GraphicsOpProfile.GenericMesh:
				return this._updateMeshAlphaOnly(renderIndex, op as WebGraphicsMeshOp2D, wordOffset, ownerAlpha);
			case GraphicsOpProfile.Text: {
				let textOp = op as WebGraphicsTextOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : textOp.recordCount;
				return this._updateMultiQuadAlphaOnly(renderIndex, textOp, start, count, ownerAlpha);
			}
			case GraphicsOpProfile.MultiQuad: {
				let multiOp = op as WebGraphicsMultiQuadOp2D;
				let start = ref ? ref.recordStart : 0;
				let count = ref ? ref.recordCount : multiOp.recordCount;
				return this._updateMultiQuadAlphaOnly(renderIndex, multiOp, start, count, ownerAlpha);
			}
		}
		return true;
	}

	private _syncTextureOrState(renderIndex: number, dirtyFlags: GraphicsOp2DDirtyFlag, value: GraphicsOp2DTextureHost, featureBits: number, blendMode: number, useCustomMaterial: boolean): void {
		if ((dirtyFlags & GraphicsOp2DDirtyFlag.Texture) !== 0)
			this._syncTexture(renderIndex, value, featureBits, blendMode, useCustomMaterial);
		else
			this._syncTextureState(renderIndex, blendMode, useCustomMaterial);
	}

	private _syncTexture(renderIndex: number, value: GraphicsOp2DTextureHost, featureBits: number, blendMode: number, useCustomMaterial: boolean = false): void {
		let element = this._renderElements[renderIndex];
		let unit = this._renderUnits[renderIndex];
		let shaderData = unit && unit.primitiveShaderData;
		if (!element || !shaderData)
			return;
		let texture = value;
		if (!texture)
			texture = Texture2D.whiteTexture;
		let renderState = GraphicsOpRenderStateHelper.syncShaderData(shaderData, value, blendMode, (featureBits & ShaderDefines2D.DEFINE_BIT_FILLTEXTURE) !== 0, useCustomMaterial, false, this._renderStateScratch);
		if ((renderState.typeKey & ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY) !== 0)
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY, texture);
		else
			shaderData.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, texture);
		BlendModeHandler.setShaderData(blendMode as BlendMode, shaderData);
		element.renderStateIsBySprite = this._materialState.useSpriteState && blendMode === this._owner.blendMode;
		element.textureKey = renderState.textureKey;
		element.typeKey = renderState.typeKey;
	}

	private _syncTextureState(renderIndex: number, blendMode: number, useCustomMaterial: boolean): void {
		let element = this._renderElements[renderIndex];
		let unit = this._renderUnits[renderIndex];
		let shaderData = unit && unit.primitiveShaderData;
		if (!element || !shaderData)
			return;
		let defineBits = element.typeKey & ~((1 << ShaderDefines2D.TYPE_KEY_DEFINE_SHIFT) - 1);
		element.typeKey = defineBits | blendMode | (useCustomMaterial ? ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL : 0);
		BlendModeHandler.setShaderData(blendMode as BlendMode, shaderData);
		element.renderStateIsBySprite = this._materialState.useSpriteState && blendMode === this._owner.blendMode;
	}

	private _syncFillTextureRange(renderIndex: number, u0: number, v0: number, u1: number, v1: number): void {
		let unit = this._renderUnits[renderIndex];
		let shaderData = unit && unit.primitiveShaderData;
		if (!shaderData)
			return;
		let range = unit.fillTextureRange;
		if (!range) {
			range = new Vector4();
			unit.fillTextureRange = range;
		}
		range.setValue(u0, v0, u1 - u0, v1 - v0);
		shaderData.setVector(ShaderDefines2D.UNIFORM_TEXRANGE, range);
	}

	private _cacheSingleTextureQuadFastPath(): void {
		this._singleTextureQuadRenderIndex = -1;
		this._singleTextureQuadOp = null;
		this._singleTextureQuadVertexView = null;
		if (this._ops.length !== 1)
			return;
		let op = this._ops[0];
		if ((op.opProfile === GraphicsOpProfile.TextureQuadPixel || op.opProfile === GraphicsOpProfile.TextureQuadPercent)
			&& (op as WebGraphicsTextureQuadOp2D).recordCount > 0) {
			this._singleTextureQuadRenderIndex = 0;
			this._singleTextureQuadOp = op as WebGraphicsTextureQuadOp2D;
			let wordOffset = GraphicsOpInfoField.WordCount;
			let unit = this._renderUnits[0];
			this._singleTextureQuadVertexView = unit && unit.vertexViews[0];
			let x0 = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.X];
			let y0 = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.Y];
			let x1 = x0 + op._float32[wordOffset + GraphicsQuadPayloadWordOffset.Width];
			let y1 = y0 + op._float32[wordOffset + GraphicsQuadPayloadWordOffset.Height];
			if (op._int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix]) {
				let a = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA];
				let b = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB];
				let c = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC];
				let d = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD];
				let tx = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx];
				let ty = op._float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy];
				this._singleTextureQuadX0 = x0 * a + y0 * c + tx;
				this._singleTextureQuadY0 = x0 * b + y0 * d + ty;
				this._singleTextureQuadX1 = x1 * a + y0 * c + tx;
				this._singleTextureQuadY1 = x1 * b + y0 * d + ty;
				this._singleTextureQuadX2 = x1 * a + y1 * c + tx;
				this._singleTextureQuadY2 = x1 * b + y1 * d + ty;
				this._singleTextureQuadX3 = x0 * a + y1 * c + tx;
				this._singleTextureQuadY3 = x0 * b + y1 * d + ty;
			}
			else {
				this._singleTextureQuadX0 = x0;
				this._singleTextureQuadY0 = y0;
				this._singleTextureQuadX1 = x1;
				this._singleTextureQuadY1 = y0;
				this._singleTextureQuadX2 = x1;
				this._singleTextureQuadY2 = y1;
				this._singleTextureQuadX3 = x0;
				this._singleTextureQuadY3 = y1;
			}
		}
	}

	private _publishOwnerElements(): void {
		if (this._owner)
			this._owner.renderElements = this._renderElements;
	}

	private _clearRenderOps(): void {
		for (let i = 0, n = this._renderUnits.length; i < n; i++) {
			let unit = this._renderUnits[i];
			if (unit)
				WebGraphicsRenderUnitPool.recover(unit);
		}
		this._destroyUnusedSpareRenderUnits();
		this._renderElements.length = 0;
		this._opRefs.length = 0;
		this._renderUnits.length = 0;
		this._singleTextureQuadRenderIndex = -1;
		this._singleTextureQuadOp = null;
		this._singleTextureQuadVertexView = null;
		this._needsRematerialize = false;
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
		for (let renderIndex = 0, n = this._renderUnits.length; renderIndex < n; renderIndex++) {
			let ref = this._renderUnits[renderIndex];
			if (!this._syncOpTransformOnly(ref ? ref.op : null, renderIndex, ref, ownerMat, ownerAlpha, writeAlpha))
				this.syncOp(ref ? ref.op : null, renderIndex, ownerMat, ownerAlpha);
		}
	}

	private _syncRenderElementAlphaOnly(ownerAlpha: number = this._owner ? this._owner.globalAlpha : 1): void {
		let ownerMat: Matrix = null;
		for (let renderIndex = 0, n = this._renderUnits.length; renderIndex < n; renderIndex++) {
			let ref = this._renderUnits[renderIndex];
			if (!this._syncOpAlphaOnly(ref ? ref.op : null, renderIndex, ref, ownerAlpha)) {
				if (!ownerMat)
					ownerMat = this._owner ? this._owner.renderMatrix : null;
				this.syncOp(ref ? ref.op : null, renderIndex, ownerMat, ownerAlpha);
			}
		}
	}
}
