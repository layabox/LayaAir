import type { Matrix } from "../../../../maths/Matrix";
import { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import { GraphicsOpInfoField, GraphicsOpProfile } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOp2DDirtyFlag, GraphicsOp2DKind, type GraphicsCommandId, type GraphicsOp2DTextureHost, type GraphicsOp2DType } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import type { GraphicsOp2DRenderState } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsMeshPayloadWordCount, GraphicsQuadPayloadWordCount, writeFillTexturePayloadValues, writeMeshPayloadValues, writeOpInfoBuffer, writeQuadPayloadValues } from "./RTGraphicsOp2DBufferSchema";
import type { IGraphicsFillTextureOp2D, IGraphicsMeshOp2D, IGraphicsMultiQuadOp2D, IGraphicsOp2D, IGraphicsSolidQuadOp2D, IGraphicsTextOp2D, IGraphicsTextureQuadOp2D } from "../../Design/2D/IRender2DDataHandle";

type NativeHandle = unknown;

type NativeTextureCarrier = {
	_texture?: NativeTextureCarrier;
	_textures?: NativeTextureCarrier[];
	_nativeObj?: NativeHandle;
};

type RTGraphicsNativeOp = {
	setPayload(buffer: ArrayBuffer): void;
	setTexture(texture: NativeHandle, textureId: number): void;
	setTextureArray(textures: NativeHandle[], textureIds: number[]): void;
	destroy(): void;
};

type RTGraphicsNativeCtor = new (owner: NativeHandle, commandIndex: number) => RTGraphicsNativeOp;

type RTGraphicsNativeWindow = Window & {
	conchRTTextureQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTSolidQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTFillTextureGraphicsOp?: RTGraphicsNativeCtor;
	conchRTMeshGraphicsOp?: RTGraphicsNativeCtor;
	conchRTMultiQuadGraphicsOp?: RTGraphicsNativeCtor;
	conchRTTextGraphicsOp?: RTGraphicsNativeCtor;
};

function getNativeTexture(value: GraphicsOp2DTextureHost | InternalTexture | null): NativeHandle {
	if (!value)
		return null;
	let textureSource = value as NativeTextureCarrier;
	let texture = textureSource._texture || textureSource;
	let colorTextures = texture._textures;
	if (colorTextures && colorTextures.length > 0)
		texture = colorTextures[0];
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
	private _texture: GraphicsOp2DTextureHost | null = null;
	private _buffer: ArrayBuffer;
	private _float32: Float32Array;
	private _int32: Int32Array;
	private _renderStateScratch: GraphicsOp2DRenderState = { stateKey: 0, typeKey: 0, textureKey: 0, texture: null };
	private _nativeTextureArray: NativeHandle[] = [];
	private _nativeTextureIdArray: number[] = [];
	private _nativePayloadBuffer: ArrayBuffer | null = null;
	private _nativeTexture: NativeHandle = undefined;
	private _nativeTextureId: number = -1;

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
		this._nativeObj = this._createNativeObject();
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
		this._setTexture(value, true);
	}

	protected _setTexture(value: GraphicsOp2DTextureHost | null, syncNative: boolean): void {
		value = value || null;
		let wrapperChanged = this._texture !== value;
		this._texture = value;
		if (wrapperChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		this._refreshOpRenderStateBuffer();
		if (syncNative)
			this._syncNativeTextureIfChanged();
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

	clearDirtyFlagsOnly(): void {
		this.dirtyFlags = GraphicsOp2DDirtyFlag.None;
	}

	destroy(): void {
		if (this._nativeObj)
			this._nativeObj.destroy();
		this._nativeObj = null;
		this._texture = null;
		this._nativeTextureArray.length = 0;
		this._nativeTextureIdArray.length = 0;
		this._nativePayloadBuffer = null;
		this._nativeTexture = undefined;
		this._nativeTextureId = -1;
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

	protected _syncNativeTextureIfChanged(): void {
		let nativeObj = this._nativeObj;
		if (!nativeObj)
			return;
		let texture = getNativeTexture(this._texture);
		let nativeChanged = this._nativeTexture !== texture;
		if (!nativeChanged)
			return;
		this._nativeTexture = texture;
		let textureId = getTextureId(this._texture);
		this._nativeTextureId = textureId;
		nativeObj.setTexture(texture, textureId);
	}

	protected _syncNativeTextureArrayIfChanged(textures: ReadonlyArray<NativeHandle>, textureIds: ReadonlyArray<number>): boolean {
		let last = this._nativeTextureArray;
		let texturesChanged = last.length !== textures.length;
		for (let i = 0, n = textures.length; i < n; i++) {
			if (last[i] !== textures[i])
				texturesChanged = true;
		}
		if (!texturesChanged)
			return false;
		if (texturesChanged) {
			last.length = textures.length;
			for (let i = 0, n = textures.length; i < n; i++)
				last[i] = textures[i];
		}

		let lastIds = this._nativeTextureIdArray;
		for (let i = 0, n = textureIds.length; i < n; i++)
			lastIds[i] = textureIds[i];

		this._nativeObj.setTextureArray(textures as NativeHandle[], textureIds as number[]);
		return texturesChanged;
	}

	protected get _bodyWordOffset(): number {
		return GraphicsOpInfoField.WordCount;
	}

	private _createNativeObject(): RTGraphicsNativeOp | null {
		let ctor = this._getNativeConstructor();
		return ctor ? new ctor(null, this.commandIndex) : null;
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

	protected _toNativeTextureArray(textures: ReadonlyArray<GraphicsOp2DTextureHost>, target: NativeHandle[] = []): NativeHandle[] {
		let nativeTextures = target;
		nativeTextures.length = textures.length;
		for (let i = 0, n = textures.length; i < n; i++)
			nativeTextures[i] = getNativeTexture(textures[i] || null);
		return nativeTextures;
	}

	protected _toNativeTextureIdArray(textures: ReadonlyArray<GraphicsOp2DTextureHost>, target: number[] = []): number[] {
		target.length = textures.length;
		for (let i = 0, n = textures.length; i < n; i++)
			target[i] = getTextureId(textures[i] || null);
		return target;
	}
}

/** @internal */
export class RTGraphicsTextureQuadOp2D extends RTGraphicsOp2D implements IGraphicsTextureQuadOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, "textureQuad", GraphicsOpProfile.TextureQuadPixel, commandIndex, commandId, GraphicsQuadPayloadWordCount);
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	writeRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
		let changeMask = GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State;
		writeQuadPayloadValues(this.float32, this.int32, this._bodyWordOffset, x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
		this.recordCount = 1;
		this.markDirty(changeMask);
		this._writeOpRenderStateBuffer(changeMask, ++this._version, 4, 6, blendMode, this.texture, false, packedColor, alpha, GraphicsQuadPayloadWordCount);
		this._syncNativePayloadIfNeeded();
	}
}

/** @internal */
export class RTGraphicsSolidQuadOp2D extends RTGraphicsOp2D implements IGraphicsSolidQuadOp2D {
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
		this._syncNativePayloadIfNeeded();
	}
}

/** @internal */
export class RTGraphicsFillTextureOp2D extends RTGraphicsOp2D implements IGraphicsFillTextureOp2D {
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

	private _copyNumberValues(source: ArrayLike<number>, sourceOffset: number, target: Float32Array | Int32Array, targetOffset: number, count: number): void {
		for (let i = 0; i < count; i++)
			target[targetOffset + i] = source[sourceOffset + i];
	}
}

/** @internal */
export class RTGraphicsMultiQuadOp2D extends RTGraphicsOp2D implements IGraphicsMultiQuadOp2D {
	textures: GraphicsOp2DTextureHost[] = [];
	private _textureGroupSignature: string = "";
	private _textureGroupStarts: number[] = [];
	private _textureGroupCounts: number[] = [];
	private _textureGroupTextures: GraphicsOp2DTextureHost[] = [];
	private _nativeTextures: NativeHandle[] = [];
	private _nativeTextureIds: number[] = [];

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
		this._setTexture(firstTexture, false);
		this._refreshOpRenderStateBuffer(false);
		let nativeArrayChanged = this._syncNativeTextureArrayIfChanged(
			this._toNativeTextureArray(this.textures, this._nativeTextures),
			this._toNativeTextureIdArray(this.textures, this._nativeTextureIds));
		let groupChanged = this._updateTextureGroupSignature();
		if (changed || nativeArrayChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Texture);
		if (groupChanged)
			this.markDirty(GraphicsOp2DDirtyFlag.Structure);
		this._syncNativePayloadIfNeeded();
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
		this._syncNativePayloadIfNeeded();
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
export class RTGraphicsTextOp2D extends RTGraphicsMultiQuadOp2D implements IGraphicsTextOp2D {
	constructor(kind: GraphicsOp2DKind, commandIndex: number, commandId: GraphicsCommandId) {
		super(kind, commandIndex, commandId, "text", GraphicsOpProfile.Text);
	}
}
