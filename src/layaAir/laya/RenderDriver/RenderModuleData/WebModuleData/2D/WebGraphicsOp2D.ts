import type { Matrix } from "../../../../maths/Matrix";
import type { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { GraphicsOpInfoField, GraphicsOpProfile } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOp2DDirtyFlag, GraphicsOp2DKind, type GraphicsCommandId, type GraphicsOp2DTextureHost, type GraphicsOp2DType } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import type { GraphicsOp2DRenderState } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsMeshPayloadWordCount, GraphicsMeshPayloadWordOffset, GraphicsQuadPayloadWordCount, GraphicsQuadPayloadWordOffset, writeFillTexturePayloadValues, writeMeshPayloadValues, writeOpInfoBuffer, writeQuadPayloadValues } from "./WebGraphicsOp2DBufferSchema";
import type { IGraphicsFillTextureOp2D, IGraphicsMeshOp2D, IGraphicsMultiQuadOp2D, IGraphicsOp2D, IGraphicsSolidQuadOp2D, IGraphicsTextOp2D, IGraphicsTextureQuadOp2D } from "../../Design/2D/IRender2DDataHandle";

/** @internal */
export abstract class WebGraphicsOp2D implements IGraphicsOp2D {
	dirtyFlags: GraphicsOp2DDirtyFlag = GraphicsOp2DDirtyFlag.All;
	protected _version: number = 0;
	_texture: GraphicsOp2DTextureHost | null = null;
	_subShader: SubShader | null = null;
	_shaderData: ShaderData | null = null;
	_buffer: ArrayBuffer;
	_float32: Float32Array;
	_int32: Int32Array;
	private _renderStateScratch: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null };

	constructor(
		readonly kind: GraphicsOp2DKind,
		readonly opType: GraphicsOp2DType,
		readonly opProfile: GraphicsOpProfile,
		readonly commandIndex: number,
		readonly commandId: GraphicsCommandId,
		initialBodyWordCount: number,
	) {
		this._buffer = new ArrayBuffer((GraphicsOpInfoField.WordCount + initialBodyWordCount) * 4);
		this._float32 = new Float32Array(this._buffer);
		this._int32 = new Int32Array(this._buffer);
	}

	get buffer(): ArrayBuffer {
		return this._buffer;
	}

	get float32(): Float32Array {
		return this._float32;
	}

	get int32(): Int32Array {
		return this._int32;
	}

	get recordCount(): number {
		return this._int32[GraphicsOpInfoField.RecordCount] || 0;
	}

	set recordCount(value: number) {
		this._int32[GraphicsOpInfoField.RecordCount] = value | 0;
	}

	get texture(): GraphicsOp2DTextureHost | null {
		return this._texture;
	}

	set texture(value: GraphicsOp2DTextureHost | null) {
		value = value || null;
		if (this._texture === value)
			return;
		this._texture = value;
		this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		this._refreshOpRenderStateBuffer();
	}

	get subShader(): SubShader | null {
		return this._subShader;
	}

	set subShader(value: SubShader | null) {
		value = value || null;
		if (this._subShader === value)
			return;
		this._subShader = value;
		this.markDirty(GraphicsOp2DDirtyFlag.Material);
		this._refreshOpRenderStateBuffer();
	}

	get shaderData(): ShaderData | null {
		return this._shaderData;
	}

	set shaderData(value: ShaderData | null) {
		value = value || null;
		if (this._shaderData === value)
			return;
		this._shaderData = value;
		this.markDirty(GraphicsOp2DDirtyFlag.Material);
		this._refreshOpRenderStateBuffer();
	}

	canUpdate(commandId: GraphicsCommandId): boolean {
		return this.commandId === commandId;
	}

	resetRecords(): void {
	}

	getStructureKey(): string {
		return `${this.kind}:${this._int32[GraphicsOpInfoField.VertexCount]}:${this._int32[GraphicsOpInfoField.IndexCount]}:${this._int32[GraphicsOpInfoField.BodyWordCount]}`;
	}

	markDirty(flags: GraphicsOp2DDirtyFlag): void {
		this.dirtyFlags |= flags;
		if (this._int32)
			this._int32[GraphicsOpInfoField.ChangeMask] |= flags;
	}

	clearDirty(): void {
		this.dirtyFlags = GraphicsOp2DDirtyFlag.None;
		if (this._int32)
			this._int32[GraphicsOpInfoField.ChangeMask] = GraphicsOp2DDirtyFlag.None;
	}

	destroy(): void {
		this._texture = null;
		this._subShader = null;
		this._shaderData = null;
	}

	protected _reserveBufferWords(bodyWordCount: number): void {
		let requiredWordCount = GraphicsOpInfoField.WordCount + bodyWordCount;
		if (this._int32.length >= requiredWordCount)
			return;
		let nextWordCount = Math.max(requiredWordCount, this._int32.length * 2, GraphicsOpInfoField.WordCount + 1);
		let nextBuffer = new ArrayBuffer(nextWordCount * 4);
		new Uint8Array(nextBuffer).set(new Uint8Array(this._buffer));
		this._buffer = nextBuffer;
		this._float32 = new Float32Array(nextBuffer);
		this._int32 = new Int32Array(nextBuffer);
	}

	protected _writeOpInfoBuffer(changeMask: number, version: number,
		vertexCount: number, indexCount: number, stateKey: number, typeKey: number, textureKey: number,
		packedColor: number, localAlpha: number, bodyWordCount: number): void {
		this._reserveBufferWords(bodyWordCount);
		writeOpInfoBuffer(this, this.opProfile, changeMask, version, vertexCount, indexCount, stateKey, typeKey, textureKey, packedColor, localAlpha, bodyWordCount, this.recordCount);
	}

	protected _writeOpRenderStateBuffer(changeMask: number, version: number,
		vertexCount: number, indexCount: number, blendMode: number, texture: GraphicsOp2DTextureHost | null, fillTexture: boolean,
		packedColor: number, localAlpha: number, bodyWordCount: number): void {
		let renderState = GraphicsOpRenderStateHelper.getRenderState(texture, blendMode, fillTexture, this._shaderData != null, false, this._renderStateScratch);
		this._writeOpInfoBuffer(changeMask, version, vertexCount, indexCount, renderState.stateKey, renderState.typeKey, renderState.textureKey, packedColor, localAlpha, bodyWordCount);
	}

	protected _refreshOpRenderStateBuffer(fillTexture: boolean = this.kind === GraphicsOp2DKind.FillTexture): void {
		if (!this._int32 || this._int32[GraphicsOpInfoField.BodyWordCount] <= 0)
			return;
		let renderState = GraphicsOpRenderStateHelper.getRenderState(this._texture, this._int32[GraphicsOpInfoField.StateKey], fillTexture, this._shaderData != null, false, this._renderStateScratch);
		this._int32[GraphicsOpInfoField.StateKey] = renderState.stateKey;
		this._int32[GraphicsOpInfoField.TypeKey] = renderState.typeKey;
		this._int32[GraphicsOpInfoField.TextureKey] = renderState.textureKey;
	}

	protected get _bodyWordOffset(): number {
		return GraphicsOpInfoField.WordCount;
	}
}

/** @internal */
export class WebGraphicsTextureQuadOp2D extends WebGraphicsOp2D implements IGraphicsTextureQuadOp2D {
	textureLayerDirty: boolean = false;

	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "textureQuad", GraphicsOpProfile.TextureQuadPixel, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	writeRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let wasEmpty = this.recordCount <= 0;
		let wordOffset = this._bodyWordOffset;
		this._reserveBufferWords(GraphicsQuadPayloadWordCount);
		let textureChanged = (this.dirtyFlags & GraphicsOp2DDirtyFlag.Texture) !== 0;
		let nextLayer = textureLayer || 0;
		let nextHasMatrix = matrix ? 1 : 0;
		let nextMatrixA = matrix ? matrix.a : 1;
		let nextMatrixB = matrix ? matrix.b : 0;
		let nextMatrixC = matrix ? matrix.c : 0;
		let nextMatrixD = matrix ? matrix.d : 1;
		let nextMatrixTx = matrix ? matrix.tx : 0;
		let nextMatrixTy = matrix ? matrix.ty : 0;
		let previousLayer = this.int32[wordOffset + GraphicsQuadPayloadWordOffset.TextureLayer];
		let previousBlendMode = this.int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode];
		let previousColor = this.int32[wordOffset + GraphicsQuadPayloadWordOffset.PackedColor];
		let previousAlpha = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha];
		let previousX = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.X];
		let previousY = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.Y];
		let previousWidth = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.Width];
		let previousHeight = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.Height];
		let previousU0 = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.U0];
		let previousV0 = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.V0];
		let previousU1 = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.U1];
		let previousV1 = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.V1];
		let previousHasMatrix = this.int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix];
		let previousUVClipEnabled = this.int32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipEnabled];
		let previousUVClipX = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipX];
		let previousUVClipY = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipY];
		let previousUVClipWidth = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipWidth];
		let previousUVClipHeight = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipHeight];
		let previousMatrixA = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA];
		let previousMatrixB = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB];
		let previousMatrixC = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC];
		let previousMatrixD = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD];
		let previousMatrixTx = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx];
		let previousMatrixTy = this.float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy];
		writeQuadPayloadValues(this.float32, this.int32, wordOffset, x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, nextLayer, matrix, uvClip);
		this.recordCount = 1;
		let nextUVClipEnabled = uvClip ? 1 : 0;
		let nextUVClipX = uvClip ? uvClip[0] : 0;
		let nextUVClipY = uvClip ? uvClip[1] : 0;
		let nextUVClipWidth = uvClip ? uvClip[2] : 1;
		let nextUVClipHeight = uvClip ? uvClip[3] : 1;
		let changeMask = wasEmpty ? GraphicsOp2DDirtyFlag.All : GraphicsOp2DDirtyFlag.None;
		if (!wasEmpty) {
			if (textureChanged || previousLayer !== nextLayer)
				changeMask |= GraphicsOp2DDirtyFlag.Texture;
			if (previousX !== x || previousY !== y || previousWidth !== width || previousHeight !== height
				|| previousU0 !== u0 || previousV0 !== v0 || previousU1 !== u1 || previousV1 !== v1
				|| previousHasMatrix !== nextHasMatrix
				|| previousMatrixA !== nextMatrixA || previousMatrixB !== nextMatrixB
				|| previousMatrixC !== nextMatrixC || previousMatrixD !== nextMatrixD
				|| previousMatrixTx !== nextMatrixTx || previousMatrixTy !== nextMatrixTy
				|| previousUVClipEnabled !== nextUVClipEnabled
				|| previousUVClipX !== nextUVClipX || previousUVClipY !== nextUVClipY
				|| previousUVClipWidth !== nextUVClipWidth || previousUVClipHeight !== nextUVClipHeight)
				changeMask |= GraphicsOp2DDirtyFlag.Geometry;
			if (previousBlendMode !== blendMode)
				changeMask |= GraphicsOp2DDirtyFlag.State;
			if (previousColor !== packedColor || previousAlpha !== alpha)
				changeMask |= GraphicsOp2DDirtyFlag.State | GraphicsOp2DDirtyFlag.Geometry;
		}
		this.textureLayerDirty = previousLayer !== nextLayer;
		if (changeMask !== GraphicsOp2DDirtyFlag.None || wasEmpty) {
			this.markDirty(changeMask);
			this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, this.texture, false, packedColor, alpha, GraphicsQuadPayloadWordCount);
		}
	}
}

/** @internal */
export class WebGraphicsSolidQuadOp2D extends WebGraphicsOp2D implements IGraphicsSolidQuadOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "solidQuad", GraphicsOpProfile.SolidQuadPixel, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	writeRecord(x: number, y: number, width: number, height: number,
		packedColor: number, alpha: number, blendMode: number, matrix: Matrix | null): void {
		let changeMask = GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.State;
		writeQuadPayloadValues(this.float32, this.int32, this._bodyWordOffset, x, y, width, height, 0, 0, 0, 0, packedColor, alpha, blendMode, 0, matrix, null);
		this.recordCount = 1;
		this.markDirty(changeMask);
		this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, null, false, packedColor, alpha, GraphicsQuadPayloadWordCount);
	}
}

/** @internal */
export class WebGraphicsFillTextureOp2D extends WebGraphicsOp2D implements IGraphicsFillTextureOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "fillTexture", GraphicsOpProfile.FillTexture, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	writeRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		repeatX: number, repeatY: number, offsetX: number, offsetY: number,
		texRangeX: number, texRangeY: number, texRangeWidth: number, texRangeHeight: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let changeMask = GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State;
		writeFillTexturePayloadValues(this.float32, this.int32, this._bodyWordOffset,
			x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix,
			repeatX, repeatY, offsetX, offsetY, texRangeX, texRangeY, texRangeWidth, texRangeHeight, uvClip);
		this.recordCount = 1;
		this.markDirty(changeMask);
		this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, this.texture, true, packedColor, alpha, GraphicsQuadPayloadWordCount);
	}
}

/** @internal */
export class WebGraphicsMeshOp2D extends WebGraphicsOp2D implements IGraphicsMeshOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "mesh", GraphicsOpProfile.GenericMesh, commandIndex, commandId, GraphicsMeshPayloadWordCount);
	}

	writeMesh(
		x: number,
		y: number,
		vertices: ArrayLike<number>,
		vertexOffset: number,
		vertexCount: number,
		uvs: ArrayLike<number> | null,
		uvOffset: number,
		indices: ArrayLike<number>,
		indexOffset: number,
		indexCount: number,
		colors: ArrayLike<number> | null,
		colorOffset: number,
		packedColor: number,
		alpha: number,
		blendMode: number,
		textureLayer: number,
		matrix: Matrix | null,
		uvClip?: ArrayLike<number> | null
	): void {
		let vertexWordCount = vertexCount * 2;
		let uvWordCount = uvs ? vertexCount * 2 : 0;
		let indexWordCount = indexCount;
		let colorWordCount = colors ? vertexCount * 4 : 0;
		let vertexDataOffset = GraphicsMeshPayloadWordCount;
		let uvDataOffset = vertexDataOffset + vertexWordCount;
		let indexDataOffset = uvDataOffset + uvWordCount;
		let colorDataOffset = indexDataOffset + indexWordCount;
		let bodyWordCount = colorDataOffset + colorWordCount;
		let bodyOffset = this._bodyWordOffset;
		this._reserveBufferWords(bodyWordCount);
		writeMeshPayloadValues(this.float32, this.int32, bodyOffset,
			x, y, packedColor, alpha, blendMode, textureLayer, matrix,
			vertexCount, indexCount, !!uvs, !!colors,
			vertexDataOffset, uvs ? uvDataOffset : 0, indexDataOffset, colors ? colorDataOffset : 0, uvClip);
		this._copyNumberValues(vertices, vertexOffset, this.float32, bodyOffset + vertexDataOffset, vertexWordCount);
		if (uvs)
			this._copyNumberValues(uvs, uvOffset, this.float32, bodyOffset + uvDataOffset, uvWordCount);
		this._copyNumberValues(indices, indexOffset, this.int32, bodyOffset + indexDataOffset, indexWordCount);
		if (colors)
			this._copyNumberValues(colors, colorOffset, this.float32, bodyOffset + colorDataOffset, colorWordCount);
		this.recordCount = 1;
		let changeMask = GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State;
		this.markDirty(changeMask);
		this._writeOpRenderStateBuffer(changeMask, ++this._version, vertexCount, indexCount, blendMode, this.texture, false, packedColor, alpha, bodyWordCount);
	}

	private _copyNumberValues(source: ArrayLike<number>, sourceOffset: number, target: Float32Array | Int32Array, targetOffset: number, count: number): void {
		for (let i = 0; i < count; i++)
			target[targetOffset + i] = source[sourceOffset + i];
	}
}

/** @internal */
export class WebGraphicsMultiQuadOp2D extends WebGraphicsOp2D implements IGraphicsMultiQuadOp2D {
	textures: GraphicsOp2DTextureHost[] = [];
	private _textureGroupSignature: string = "";
	private _textureGroupStarts: number[] = [];
	private _textureGroupCounts: number[] = [];
	private _textureGroupTextures: GraphicsOp2DTextureHost[] = [];

	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId, opType: "multiQuad" | "text" = "multiQuad", opProfile: GraphicsOpProfile = GraphicsOpProfile.MultiQuad) {
		super(kind, opType, opProfile, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	setTextures(textures: ReadonlyArray<GraphicsOp2DTextureHost>, count: number = textures ? textures.length : 0): void {
		let changed = this.textures.length !== count;
		for (let i = 0; i < count; i++) {
			let texture = textures[i] || null;
			if (this.textures[i] !== texture)
				changed = true;
			this.textures[i] = texture;
		}
		this.textures.length = count;
		let firstTexture = count > 0 ? this.textures[0] : null;
		if (this.texture !== firstTexture)
			changed = true;
		this.texture = firstTexture;
		this._refreshOpRenderStateBuffer(false);
		let groupChanged = this._updateTextureGroupSignature();
		if (changed)
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		if (groupChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Structure);
	}

	addRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let recordIndex = this.recordCount++;
		let bodyWordCount = this.recordCount * GraphicsQuadPayloadWordCount;
		this._reserveBufferWords(bodyWordCount);
		writeQuadPayloadValues(this.float32, this.int32, this._bodyWordOffset + recordIndex * GraphicsQuadPayloadWordCount,
			x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
		let changeMask = GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.State;
		this.markDirty(changeMask);
		this._writeOpRenderStateBuffer(changeMask, ++this._version, this.recordCount * 4, this.recordCount * 6, blendMode, this.texture, false, packedColor, alpha, bodyWordCount);
	}

	private _updateTextureGroupSignature(): boolean {
		let groupIndex = 0;
		let start = 0;
		let currentTexture: GraphicsOp2DTextureHost = null;
		let changed = false;
		for (let i = 0, n = this.recordCount; i < n; i++) {
			let texture = this.textures[i] || null;
			if (i === 0) {
				currentTexture = texture;
				continue;
			}
			if (texture !== currentTexture) {
				if (this._textureGroupStarts[groupIndex] !== start || this._textureGroupCounts[groupIndex] !== i - start || this._textureGroupTextures[groupIndex] !== currentTexture)
					changed = true;
				this._textureGroupStarts[groupIndex] = start;
				this._textureGroupCounts[groupIndex] = i - start;
				this._textureGroupTextures[groupIndex] = currentTexture;
				groupIndex++;
				start = i;
				currentTexture = texture;
			}
		}
		if (this.recordCount > 0) {
			if (this._textureGroupStarts[groupIndex] !== start || this._textureGroupCounts[groupIndex] !== this.recordCount - start || this._textureGroupTextures[groupIndex] !== currentTexture)
				changed = true;
			this._textureGroupStarts[groupIndex] = start;
			this._textureGroupCounts[groupIndex] = this.recordCount - start;
			this._textureGroupTextures[groupIndex] = currentTexture;
			groupIndex++;
		}
		if (this._textureGroupStarts.length !== groupIndex)
			changed = true;
		this._textureGroupStarts.length = groupIndex;
		this._textureGroupCounts.length = groupIndex;
		this._textureGroupTextures.length = groupIndex;
		let signature = `${this.recordCount}:${groupIndex}`;
		if (this._textureGroupSignature !== signature) {
			this._textureGroupSignature = signature;
			changed = true;
		}
		return changed;
	}
}

/** @internal */
export class WebGraphicsTextOp2D extends WebGraphicsMultiQuadOp2D implements IGraphicsTextOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, commandIndex, commandId, "text", GraphicsOpProfile.Text);
	}
}
