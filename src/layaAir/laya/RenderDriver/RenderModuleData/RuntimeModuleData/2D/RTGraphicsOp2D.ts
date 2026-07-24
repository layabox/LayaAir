import type { Matrix } from "../../../../maths/Matrix";
import type { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { GraphicsOpInfoField, GraphicsOpProfile } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOp2DDirtyFlag, GraphicsOp2DKind, type GraphicsCommandId, type GraphicsOp2DTextureHost, type GraphicsOp2DType } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import type { GraphicsOp2DRenderState } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsMeshPayloadWordCount, GraphicsMeshPayloadWordOffset, GraphicsQuadPayloadWordCount, GraphicsQuadPayloadWordOffset, writeFillTexturePayloadValues, writeMeshPayloadValues, writeOpInfoBuffer, writeQuadPayloadValues } from "./RTGraphicsOp2DBufferSchema";
import type { IGraphicsFillTextureOp2D, IGraphicsMeshOp2D, IGraphicsMultiQuadOp2D, IGraphicsOp2D, IGraphicsSolidQuadOp2D, IGraphicsTextOp2D, IGraphicsTextureQuadOp2D } from "../../Design/2D/IRender2DDataHandle";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";

type NativeHandle = unknown;

type NativeInternalTexture = InternalTexture & { _nativeObj?: NativeHandle };

type RTGraphicsNativeOp = {
	setPayload(buffer: ArrayBuffer): void;
	setTexture(texture: NativeHandle, textureId: number): void;
	setTextureArray(textures: NativeHandle[], textureIds: number[]): void;
	finalizePayloadAndTextures(buffer: ArrayBuffer, textures: NativeHandle[], textureIds: number[]): void;
	destroy(): void;
};

type RTGraphicsNativeCtor = new (owner: NativeHandle, commandIndex: number, payload: ArrayBuffer) => RTGraphicsNativeOp;

type RTGraphicsNativeWindow = Window & {
	conchRTTextureQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTSolidQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTFillTextureGraphicsOp?: RTGraphicsNativeCtor;
	conchRTMeshGraphicsOp?: RTGraphicsNativeCtor;
	conchRTMultiQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTTextGraphicsOp?: RTGraphicsNativeCtor;
};

function getNativeTexture(value: GraphicsOp2DTextureHost | null): NativeHandle {
	if (!value)
		return null;
	let texture = value._texture as NativeInternalTexture;
	return texture ? texture._nativeObj || null : null;
}

function getTextureId(value: GraphicsOp2DTextureHost | null): number {
	return value ? value.id : 0;
}

function getNativeWindow(): RTGraphicsNativeWindow {
	return window as RTGraphicsNativeWindow;
}

/** @internal */
export abstract class RTGraphicsOp2D implements IGraphicsOp2D {
	dirtyFlags: GraphicsOp2DDirtyFlag = GraphicsOp2DDirtyFlag.All;
	protected _nativeObj: RTGraphicsNativeOp | null = null;
	protected _version: number = 0;
	protected _retainedRecordCount: number = 0;
	private _texture: GraphicsOp2DTextureHost | null = null;
	protected _textureInternal: InternalTexture = null;
	private _buffer: ArrayBuffer;
	private _float32: Float32Array;
	private _int32: Int32Array;
	private _renderStateScratch: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null };
	protected _nativeTextureArray: NativeHandle[] = [];
	protected _nativeTextureIdArray: number[] = [];
	protected _nativePayloadBuffer: ArrayBuffer | null = null;
	private _nativeTexture: NativeHandle = null;
	private _nativeTextureId: number = 0;

	constructor(
		readonly kind: GraphicsOp2DKind,
		readonly opType: GraphicsOp2DType,
		readonly opProfile: GraphicsOpProfile,
		public commandIndex: number,
		readonly commandId: GraphicsCommandId,
		initialBodyWordCount: number,
	) {
		this._buffer = new ArrayBuffer((GraphicsOpInfoField.WordCount + initialBodyWordCount) * 4);
		this._float32 = new Float32Array(this._buffer);
		this._int32 = new Int32Array(this._buffer);
		// Native snapshots whether the payload has a header when the ArrayBuffer is bound.
		// Publish a valid empty header before constructing the native Op.
		this._int32[GraphicsOpInfoField.Profile] = opProfile;
		this._int32[GraphicsOpInfoField.BodyWordOffset] = GraphicsOpInfoField.WordCount;
		this._nativeObj = this._createNativeObject();
		if (this._nativeObj) {
			this._nativePayloadBuffer = this._buffer;
		}
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

	setCommandIndex(value: number): void {
		// Native Runtime consumes the final Op array order. commandIndex is retained
		// by the TS compiler/reconcile layer and can change after a command splice.
		this.commandIndex = value;
	}

	set recordCount(value: number) {
		this._int32[GraphicsOpInfoField.RecordCount] = value | 0;
	}

	get texture(): GraphicsOp2DTextureHost | null {
		return this._texture;
	}

	set texture(value: GraphicsOp2DTextureHost | null) {
		this._setTexture(value, true);
	}

	protected _setTexture(value: GraphicsOp2DTextureHost | null, syncNative: boolean): void {
		value = value || null;
		let internalTexture = value ? value._texture : null;
		let wrapperChanged = this._texture !== value || this._textureInternal !== internalTexture;
		this._texture = value;
		this._textureInternal = internalTexture;
		if (wrapperChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		if (syncNative && this._syncNativeTextureIfChanged())
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
	}

	canUpdate(commandId: GraphicsCommandId): boolean {
		return this.commandId === commandId;
	}

	resetRecords(): void {
		this._retainedRecordCount = this.recordCount;
		this.recordCount = 0;
	}

	writeStructureSignature(out: Int32Array, offset: number): void {
		out[offset] = this._int32[GraphicsOpInfoField.VertexCount];
		out[offset + 1] = this._int32[GraphicsOpInfoField.IndexCount];
		out[offset + 2] = this._int32[GraphicsOpInfoField.BodyWordCount];
		out[offset + 3] = 0;
	}

	matchesStructureSignature(source: Int32Array, offset: number): boolean {
		return this.int32[GraphicsOpInfoField.VertexCount] === source[offset]
			&& this.int32[GraphicsOpInfoField.IndexCount] === source[offset + 1]
			&& this.int32[GraphicsOpInfoField.BodyWordCount] === source[offset + 2]
			&& source[offset + 3] === 0;
	}

	clearStructureDirty(): void {
		this.dirtyFlags &= ~GraphicsOp2DDirtyFlag.Structure;
		this._int32[GraphicsOpInfoField.ChangeMask] &= ~GraphicsOp2DDirtyFlag.Structure;
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

	clearDirtyFlagsOnly(): void {
		this.dirtyFlags = GraphicsOp2DDirtyFlag.None;
	}

	destroy(): void {
		if (this._nativeObj)
			this._nativeObj.destroy();
		this._nativeObj = null;
		this._texture = null;
		this._textureInternal = null;
		this._nativeTextureArray.length = 0;
		this._nativeTextureIdArray.length = 0;
		this._nativePayloadBuffer = null;
		this._nativeTexture = null;
		this._nativeTextureId = 0;
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
		this._nativePayloadBuffer = null;
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
		changeMask |= this.dirtyFlags | this._int32[GraphicsOpInfoField.ChangeMask];
		if (this._int32[GraphicsOpInfoField.BodyWordCount] > 0 && (changeMask & GraphicsOp2DDirtyFlag.Texture) === 0) {
			let defineBits = this._int32[GraphicsOpInfoField.TypeKey] & ~((1 << ShaderDefines2D.TYPE_KEY_DEFINE_SHIFT) - 1);
			this._writeOpInfoBuffer(changeMask, version, vertexCount, indexCount, blendMode, defineBits | blendMode,
				this._int32[GraphicsOpInfoField.TextureKey], packedColor, localAlpha, bodyWordCount);
			return;
		}
		let renderState = GraphicsOpRenderStateHelper.getRenderState(texture, blendMode, fillTexture, false, false, this._renderStateScratch);
		this._writeOpInfoBuffer(changeMask, version, vertexCount, indexCount, renderState.stateKey, renderState.typeKey, renderState.textureKey, packedColor, localAlpha, bodyWordCount);
	}

	protected _refreshOpRenderStateBuffer(fillTexture: boolean = this.kind === GraphicsOp2DKind.FillTexture): void {
		if (!this._int32 || this._int32[GraphicsOpInfoField.BodyWordCount] <= 0)
			return;
		let renderState = GraphicsOpRenderStateHelper.getRenderState(this._texture, this._int32[GraphicsOpInfoField.StateKey], fillTexture, false, false, this._renderStateScratch);
		this._int32[GraphicsOpInfoField.StateKey] = renderState.stateKey;
		this._int32[GraphicsOpInfoField.TypeKey] = renderState.typeKey;
		this._int32[GraphicsOpInfoField.TextureKey] = renderState.textureKey;
	}

	protected _syncNativePayloadIfNeeded(): void {
		let nativeObj = this._nativeObj;
		if (!nativeObj || this._nativePayloadBuffer === this.buffer)
			return;
		nativeObj.setPayload(this.buffer);
		this._nativePayloadBuffer = this.buffer;
	}

	protected _syncNativeTextureIfChanged(): boolean {
		let nativeObj = this._nativeObj;
		if (!nativeObj)
			return false;
		let texture = getNativeTexture(this._texture);
		let textureId = getTextureId(this._texture);
		if (this._nativeTexture === texture && this._nativeTextureId === textureId)
			return false;
		this._nativeTexture = texture;
		this._nativeTextureId = textureId;
		nativeObj.setTexture(texture, textureId);
		return true;
	}

	protected get _bodyWordOffset(): number {
		return GraphicsOpInfoField.WordCount;
	}

	protected _getQuadPayloadChangeMask(recordIndex: number, wordOffset: number,
		x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number,
		matrix: Matrix | null, uvClip?: ArrayLike<number> | null,
		repeatX?: number, repeatY?: number, offsetX?: number, offsetY?: number,
		texRangeX?: number, texRangeY?: number, texRangeWidth?: number, texRangeHeight?: number): GraphicsOp2DDirtyFlag {
		let hadRecord = recordIndex < this._retainedRecordCount || recordIndex < this.recordCount;
		if (!hadRecord)
			return GraphicsOp2DDirtyFlag.All;
		let f32 = this._float32;
		let i32 = this._int32;
		let fround = Math.fround;
		let changeMask = this.dirtyFlags & GraphicsOp2DDirtyFlag.Texture;
		let nextHasMatrix = matrix ? 1 : 0;
		let nextUVClipEnabled = uvClip ? 1 : 0;
		if (f32[wordOffset + GraphicsQuadPayloadWordOffset.X] !== fround(x)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.Y] !== fround(y)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.Width] !== fround(width)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.Height] !== fround(height)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.U0] !== fround(u0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.V0] !== fround(v0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.U1] !== fround(u1)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.V1] !== fround(v1)
			|| i32[wordOffset + GraphicsQuadPayloadWordOffset.TextureLayer] !== (textureLayer || 0)
			|| i32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix] !== nextHasMatrix
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA] !== fround(matrix ? matrix.a : 1)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB] !== fround(matrix ? matrix.b : 0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC] !== fround(matrix ? matrix.c : 0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD] !== fround(matrix ? matrix.d : 1)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx] !== fround(matrix ? matrix.tx : 0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy] !== fround(matrix ? matrix.ty : 0)
			|| i32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipEnabled] !== nextUVClipEnabled
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipX] !== fround(uvClip ? uvClip[0] : 0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipY] !== fround(uvClip ? uvClip[1] : 0)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipWidth] !== fround(uvClip ? uvClip[2] : 1)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.UVClipHeight] !== fround(uvClip ? uvClip[3] : 1))
			changeMask |= GraphicsOp2DDirtyFlag.Geometry;
		if (repeatX != null && (f32[wordOffset + GraphicsQuadPayloadWordOffset.RepeatX] !== fround(repeatX)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.RepeatY] !== fround(repeatY)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.OffsetX] !== fround(offsetX)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.OffsetY] !== fround(offsetY)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX] !== fround(texRangeX)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY] !== fround(texRangeY)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeWidth] !== fround(texRangeWidth)
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeHeight] !== fround(texRangeHeight)))
			changeMask |= GraphicsOp2DDirtyFlag.Geometry;
		if (i32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode] !== blendMode)
			changeMask |= GraphicsOp2DDirtyFlag.State;
		if (i32[wordOffset + GraphicsQuadPayloadWordOffset.PackedColor] !== packedColor
			|| f32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] !== fround(alpha))
			changeMask |= GraphicsOp2DDirtyFlag.State | GraphicsOp2DDirtyFlag.Geometry;
		return changeMask;
	}

	private _createNativeObject(): RTGraphicsNativeOp | null {
		let ctor = this._getNativeConstructor();
		return ctor ? new ctor(null, this.commandIndex, this._buffer) : null;
	}

	private _getNativeConstructor(): RTGraphicsNativeCtor | null {
		let nativeWindow = getNativeWindow();
		switch (this.kind) {
			case GraphicsOp2DKind.TextureQuad:
				return nativeWindow.conchRTTextureQuadGraphicsOp || null;
			case GraphicsOp2DKind.FillTexture:
				return nativeWindow.conchRTFillTextureGraphicsOp || null;
			case GraphicsOp2DKind.SolidQuad:
				return nativeWindow.conchRTSolidQuadGraphicsOp || null;
			case GraphicsOp2DKind.Mesh:
				return nativeWindow.conchRTMeshGraphicsOp || null;
			case GraphicsOp2DKind.MultiQuad:
				return nativeWindow.conchRTMultiQuadGraphicsOp || null;
			case GraphicsOp2DKind.Text:
				return nativeWindow.conchRTTextGraphicsOp || null;
		}
		return null;
	}

}

/** @internal */
export class RTGraphicsTextureQuadOp2D extends RTGraphicsOp2D implements IGraphicsTextureQuadOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "textureQuad", GraphicsOpProfile.TextureQuadPixel, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	writeRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let changeMask = this._getQuadPayloadChangeMask(0, this._bodyWordOffset, x, y, width, height, u0, v0, u1, v1,
			packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
		this.recordCount = 1;
		if (changeMask !== GraphicsOp2DDirtyFlag.None) {
			writeQuadPayloadValues(this.float32, this.int32, this._bodyWordOffset, x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
			this.markDirty(changeMask);
			this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, this.texture, false, packedColor, alpha, GraphicsQuadPayloadWordCount);
		}
		this._syncNativePayloadIfNeeded();
	}
}

/** @internal */
export class RTGraphicsSolidQuadOp2D extends RTGraphicsOp2D implements IGraphicsSolidQuadOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "solidQuad", GraphicsOpProfile.SolidQuadPixel, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	writeRecord(x: number, y: number, width: number, height: number,
		packedColor: number, alpha: number, blendMode: number, matrix: Matrix | null): void {
		let changeMask = this._getQuadPayloadChangeMask(0, this._bodyWordOffset, x, y, width, height, 0, 0, 0, 0,
			packedColor, alpha, blendMode, 0, matrix, null);
		this.recordCount = 1;
		if (changeMask !== GraphicsOp2DDirtyFlag.None) {
			writeQuadPayloadValues(this.float32, this.int32, this._bodyWordOffset, x, y, width, height, 0, 0, 0, 0, packedColor, alpha, blendMode, 0, matrix, null);
			this.markDirty(changeMask);
			this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, null, false, packedColor, alpha, GraphicsQuadPayloadWordCount);
		}
		this._syncNativePayloadIfNeeded();
	}
}

/** @internal */
export class RTGraphicsFillTextureOp2D extends RTGraphicsOp2D implements IGraphicsFillTextureOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "fillTexture", GraphicsOpProfile.FillTexture, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	writeRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		repeatX: number, repeatY: number, offsetX: number, offsetY: number,
		texRangeX: number, texRangeY: number, texRangeWidth: number, texRangeHeight: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let changeMask = this._getQuadPayloadChangeMask(0, this._bodyWordOffset, x, y, width, height, u0, v0, u1, v1,
			packedColor, alpha, blendMode, textureLayer, matrix, uvClip,
			repeatX, repeatY, offsetX, offsetY, texRangeX, texRangeY, texRangeWidth, texRangeHeight);
		this.recordCount = 1;
		if (changeMask !== GraphicsOp2DDirtyFlag.None) {
			writeFillTexturePayloadValues(this.float32, this.int32, this._bodyWordOffset,
				x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix,
				repeatX, repeatY, offsetX, offsetY, texRangeX, texRangeY, texRangeWidth, texRangeHeight, uvClip);
			this.markDirty(changeMask);
			this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, this.texture, true, packedColor, alpha, GraphicsQuadPayloadWordCount);
		}
		this._syncNativePayloadIfNeeded();
	}
}

/** @internal */
export class RTGraphicsMeshOp2D extends RTGraphicsOp2D implements IGraphicsMeshOp2D {
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
		if (this._meshPayloadMatches(bodyOffset, bodyWordCount, x, y, vertices, vertexOffset, vertexCount, uvs, uvOffset,
			indices, indexOffset, indexCount, colors, colorOffset, packedColor, alpha, blendMode, textureLayer, matrix, uvClip)) {
			this.recordCount = 1;
			return;
		}
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
		this._syncNativePayloadIfNeeded();
	}

	private _meshPayloadMatches(bodyOffset: number, bodyWordCount: number,
		x: number, y: number, vertices: ArrayLike<number>, vertexOffset: number, vertexCount: number,
		uvs: ArrayLike<number> | null, uvOffset: number, indices: ArrayLike<number>, indexOffset: number, indexCount: number,
		colors: ArrayLike<number> | null, colorOffset: number, packedColor: number, alpha: number, blendMode: number,
		textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): boolean {
		if (this._retainedRecordCount <= 0 && this.recordCount <= 0
			|| this.dirtyFlags !== GraphicsOp2DDirtyFlag.None
			|| this.int32[GraphicsOpInfoField.BodyWordCount] !== bodyWordCount)
			return false;
		let f32 = this.float32;
		let i32 = this.int32;
		let fround = Math.fround;
		let vertexDataOffset = GraphicsMeshPayloadWordCount;
		let uvDataOffset = vertexDataOffset + vertexCount * 2;
		let indexDataOffset = uvDataOffset + (uvs ? vertexCount * 2 : 0);
		let colorDataOffset = indexDataOffset + indexCount;
		if (f32[bodyOffset + GraphicsMeshPayloadWordOffset.X] !== fround(x)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.Y] !== fround(y)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.PackedColor] !== packedColor
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.Alpha] !== fround(alpha)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.BlendMode] !== blendMode
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.TextureLayer] !== (textureLayer || 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.HasMatrix] !== (matrix ? 1 : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixA] !== fround(matrix ? matrix.a : 1)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixB] !== fround(matrix ? matrix.b : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixC] !== fround(matrix ? matrix.c : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixD] !== fround(matrix ? matrix.d : 1)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixTx] !== fround(matrix ? matrix.tx : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.MatrixTy] !== fround(matrix ? matrix.ty : 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.VertexCount] !== vertexCount
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.IndexCount] !== indexCount
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.HasUV] !== (uvs ? 1 : 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.HasColors] !== (colors ? 1 : 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.VertexDataOffset] !== vertexDataOffset
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.UVDataOffset] !== (uvs ? uvDataOffset : 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.IndexDataOffset] !== indexDataOffset
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.ColorDataOffset] !== (colors ? colorDataOffset : 0)
			|| i32[bodyOffset + GraphicsMeshPayloadWordOffset.UVClipEnabled] !== (uvClip ? 1 : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.UVClipX] !== fround(uvClip ? uvClip[0] : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.UVClipY] !== fround(uvClip ? uvClip[1] : 0)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.UVClipWidth] !== fround(uvClip ? uvClip[2] : 1)
			|| f32[bodyOffset + GraphicsMeshPayloadWordOffset.UVClipHeight] !== fround(uvClip ? uvClip[3] : 1))
			return false;
		for (let i = 0, count = vertexCount * 2; i < count; i++) {
			if (f32[bodyOffset + vertexDataOffset + i] !== fround(vertices[vertexOffset + i]))
				return false;
			if (uvs && f32[bodyOffset + uvDataOffset + i] !== fround(uvs[uvOffset + i]))
				return false;
		}
		for (let i = 0; i < indexCount; i++) {
			if (i32[bodyOffset + indexDataOffset + i] !== (indices[indexOffset + i] | 0))
				return false;
		}
		if (colors) {
			for (let i = 0, count = vertexCount * 4; i < count; i++) {
				if (f32[bodyOffset + colorDataOffset + i] !== fround(colors[colorOffset + i]))
					return false;
			}
		}
		return true;
	}

	private _copyNumberValues(source: ArrayLike<number>, sourceOffset: number, target: Float32Array | Int32Array, targetOffset: number, count: number): void {
		for (let i = 0; i < count; i++)
			target[targetOffset + i] = source[sourceOffset + i];
	}
}

/** @internal */
export class RTGraphicsMultiQuadOp2D extends RTGraphicsOp2D implements IGraphicsMultiQuadOp2D {
	textures: GraphicsOp2DTextureHost[] = [];
	private _textureGroupLayoutVersion: number = 0;
	private _nativeTextures: NativeHandle[] = [];
	private _nativeTextureIds: number[] = [];

	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId, opType: "multiQuad" | "text" = "multiQuad", opProfile: GraphicsOpProfile = GraphicsOpProfile.MultiQuad) {
		super(kind, opType, opProfile, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	writeStructureSignature(out: Int32Array, offset: number): void {
		super.writeStructureSignature(out, offset);
		out[offset + 3] = this._textureGroupLayoutVersion;
	}

	matchesStructureSignature(source: Int32Array, offset: number): boolean {
		return this.int32[GraphicsOpInfoField.VertexCount] === source[offset]
			&& this.int32[GraphicsOpInfoField.IndexCount] === source[offset + 1]
			&& this.int32[GraphicsOpInfoField.BodyWordCount] === source[offset + 2]
			&& this._textureGroupLayoutVersion === source[offset + 3];
	}

	setTextures(textures: ReadonlyArray<GraphicsOp2DTextureHost>, count: number = textures ? textures.length : 0): void {
		let previousCount = this.textures.length;
		let changed = previousCount !== count;
		let groupChanged = previousCount !== count;
		let nativeArrayChanged = this._nativeTextureArray.length !== count || this._nativeTextureIdArray.length !== count;
		let previousOldTexture: GraphicsOp2DTextureHost = null;
		let previousNewTexture: GraphicsOp2DTextureHost = null;
		this._nativeTextures.length = count;
		this._nativeTextureIds.length = count;
		for (let i = 0; i < count; i++) {
			let oldTexture = this.textures[i] || null;
			let texture = textures[i] || null;
			if (oldTexture !== texture)
				changed = true;
			if (i > 0 && (oldTexture !== previousOldTexture) !== (texture !== previousNewTexture))
				groupChanged = true;
			this.textures[i] = texture;
			previousOldTexture = oldTexture;
			previousNewTexture = texture;
			let nativeTexture = getNativeTexture(texture);
			let textureId = getTextureId(texture);
			this._nativeTextures[i] = nativeTexture;
			this._nativeTextureIds[i] = textureId;
			if (this._nativeTextureArray[i] !== nativeTexture || this._nativeTextureIdArray[i] !== textureId)
				nativeArrayChanged = true;
		}
		this.textures.length = count;
		let firstTexture = count > 0 ? this.textures[0] : null;
		let firstTextureChanged = this.texture !== firstTexture || this._textureInternal !== (firstTexture ? firstTexture._texture : null);
		if (firstTextureChanged)
			changed = true;
		this._setTexture(firstTexture, false);
		if (firstTextureChanged)
			this._refreshOpRenderStateBuffer(false);
		let payloadChanged = this._nativePayloadBuffer !== this.buffer;
		if (nativeArrayChanged) {
			if (this._nativeObj) {
				if (payloadChanged) {
					this._nativeObj.finalizePayloadAndTextures(this.buffer, this._nativeTextures, this._nativeTextureIds);
					this._nativePayloadBuffer = this.buffer;
				}
				else {
					this._nativeObj.setTextureArray(this._nativeTextures, this._nativeTextureIds);
				}
			}
			let previousNativeTextures = this._nativeTextureArray;
			let previousNativeTextureIds = this._nativeTextureIdArray;
			this._nativeTextureArray = this._nativeTextures;
			this._nativeTextureIdArray = this._nativeTextureIds;
			this._nativeTextures = previousNativeTextures;
			this._nativeTextureIds = previousNativeTextureIds;
		}
		if (changed || nativeArrayChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		if (groupChanged) {
			this._textureGroupLayoutVersion++;
			this.markDirty(GraphicsOp2DDirtyFlag.Structure);
		}
		if (!nativeArrayChanged || !payloadChanged)
			this._syncNativePayloadIfNeeded();
	}

	addRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let recordIndex = this.recordCount;
		let bodyWordCount = (this.recordCount + 1) * GraphicsQuadPayloadWordCount;
		this._reserveBufferWords(bodyWordCount);
		let wordOffset = this._bodyWordOffset + recordIndex * GraphicsQuadPayloadWordCount;
		let changeMask = this._getQuadPayloadChangeMask(recordIndex, wordOffset, x, y, width, height, u0, v0, u1, v1,
			packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
		if (changeMask !== GraphicsOp2DDirtyFlag.None)
			writeQuadPayloadValues(this.float32, this.int32, wordOffset,
				x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
		this.recordCount++;
		if (changeMask !== GraphicsOp2DDirtyFlag.None) {
			this.markDirty(changeMask);
			this._version++;
		}
		this._writeOpRenderStateBuffer(this.dirtyFlags, this._version, this.recordCount * 4, this.recordCount * 6, blendMode, this.texture, false, packedColor, alpha, bodyWordCount);
	}

}

/** @internal */
export class RTGraphicsTextOp2D extends RTGraphicsMultiQuadOp2D implements IGraphicsTextOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, commandIndex, commandId, "text", GraphicsOpProfile.Text);
	}
}
