import type { Matrix } from "../../../../maths/Matrix";
import { GraphicsOpInfoField, GraphicsOpProfile } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

export const enum GraphicsQuadPayloadWordOffset {
	X = 0,
	Y = 1,
	Width = 2,
	Height = 3,
	U0 = 4,
	V0 = 5,
	U1 = 6,
	V1 = 7,
	PackedColor = 8,
	Alpha = 9,
	BlendMode = 10,
	TextureLayer = 11,
	MatrixA = 12,
	MatrixB = 13,
	MatrixC = 14,
	MatrixD = 15,
	MatrixTx = 16,
	MatrixTy = 17,
	HasMatrix = 18,
	RepeatX = 19,
	RepeatY = 20,
	OffsetX = 21,
	OffsetY = 22,
	TexRangeX = 23,
	TexRangeY = 24,
	TexRangeWidth = 25,
	TexRangeHeight = 26,
	UVClipEnabled = 27,
	UVClipX = 28,
	UVClipY = 29,
	UVClipWidth = 30,
	UVClipHeight = 31,
}

export const GraphicsQuadPayloadWordCount = 32;

export const enum GraphicsMeshPayloadWordOffset {
	X = 0,
	Y = 1,
	PackedColor = 2,
	Alpha = 3,
	BlendMode = 4,
	TextureLayer = 5,
	MatrixA = 6,
	MatrixB = 7,
	MatrixC = 8,
	MatrixD = 9,
	MatrixTx = 10,
	MatrixTy = 11,
	HasMatrix = 12,
	VertexCount = 13,
	IndexCount = 14,
	HasUV = 15,
	HasColors = 16,
	VertexDataOffset = 17,
	UVDataOffset = 18,
	IndexDataOffset = 19,
	ColorDataOffset = 20,
	UVClipEnabled = 21,
	UVClipX = 22,
	UVClipY = 23,
	UVClipWidth = 24,
	UVClipHeight = 25,
}

export const GraphicsMeshPayloadWordCount = 26;

export type GraphicsOpBufferOwner = {
	buffer: ArrayBuffer;
	float32: Float32Array;
	int32: Int32Array;
};

export function writeQuadPayloadValues(float32: Float32Array, int32: Int32Array, wordOffset: number,
	x: number, y: number, width: number, height: number,
	u0: number, v0: number, u1: number, v1: number,
	packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null, uvClip?: ArrayLike<number> | null): void {
	float32[wordOffset + GraphicsQuadPayloadWordOffset.X] = x;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.Y] = y;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.Width] = width;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.Height] = height;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.U0] = u0;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.V0] = v0;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.U1] = u1;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.V1] = v1;
	int32[wordOffset + GraphicsQuadPayloadWordOffset.PackedColor] = packedColor;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.Alpha] = alpha;
	int32[wordOffset + GraphicsQuadPayloadWordOffset.BlendMode] = blendMode;
	int32[wordOffset + GraphicsQuadPayloadWordOffset.TextureLayer] = textureLayer || 0;
	if (matrix) {
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA] = matrix.a;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB] = matrix.b;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC] = matrix.c;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD] = matrix.d;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx] = matrix.tx;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy] = matrix.ty;
		int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix] = 1;
	}
	else {
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixA] = 1;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixB] = 0;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixC] = 0;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixD] = 1;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTx] = 0;
		float32[wordOffset + GraphicsQuadPayloadWordOffset.MatrixTy] = 0;
		int32[wordOffset + GraphicsQuadPayloadWordOffset.HasMatrix] = 0;
	}
	writeUVClipPayloadValues(float32, int32, wordOffset,
		GraphicsQuadPayloadWordOffset.UVClipEnabled, GraphicsQuadPayloadWordOffset.UVClipX, GraphicsQuadPayloadWordOffset.UVClipY,
		GraphicsQuadPayloadWordOffset.UVClipWidth, GraphicsQuadPayloadWordOffset.UVClipHeight, uvClip);
}

function writeUVClipPayloadValues(float32: Float32Array, int32: Int32Array, wordOffset: number,
	enabledOffset: number, xOffset: number, yOffset: number, widthOffset: number, heightOffset: number,
	uvClip?: ArrayLike<number> | null): void {
	if (uvClip) {
		int32[wordOffset + enabledOffset] = 1;
		float32[wordOffset + xOffset] = uvClip[0];
		float32[wordOffset + yOffset] = uvClip[1];
		float32[wordOffset + widthOffset] = uvClip[2];
		float32[wordOffset + heightOffset] = uvClip[3];
	}
	else {
		int32[wordOffset + enabledOffset] = 0;
		float32[wordOffset + xOffset] = 0;
		float32[wordOffset + yOffset] = 0;
		float32[wordOffset + widthOffset] = 1;
		float32[wordOffset + heightOffset] = 1;
	}
}

export function writeFillTexturePayloadValues(float32: Float32Array, int32: Int32Array, wordOffset: number,
	x: number, y: number, width: number, height: number,
	u0: number, v0: number, u1: number, v1: number,
	packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null,
	repeatX: number, repeatY: number, offsetX: number, offsetY: number,
	texRangeX: number, texRangeY: number, texRangeWidth: number, texRangeHeight: number, uvClip?: ArrayLike<number> | null): void {
	writeQuadPayloadValues(float32, int32, wordOffset, x, y, width, height, u0, v0, u1, v1, packedColor, alpha, blendMode, textureLayer, matrix, uvClip);
	float32[wordOffset + GraphicsQuadPayloadWordOffset.RepeatX] = repeatX;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.RepeatY] = repeatY;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.OffsetX] = offsetX;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.OffsetY] = offsetY;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeX] = texRangeX;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeY] = texRangeY;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeWidth] = texRangeWidth;
	float32[wordOffset + GraphicsQuadPayloadWordOffset.TexRangeHeight] = texRangeHeight;
}

export function writeOpInfoBuffer(owner: GraphicsOpBufferOwner, profile: GraphicsOpProfile, changeMask: number, version: number,
	vertexCount: number, indexCount: number, stateKey: number, typeKey: number, textureKey: number,
	packedColor: number, localAlpha: number, bodyWordCount: number, recordCount: number): void {
	let int32 = owner.int32;
	let float32 = owner.float32;
	int32[GraphicsOpInfoField.Profile] = profile;
	int32[GraphicsOpInfoField.ChangeMask] = changeMask;
	int32[GraphicsOpInfoField.Version] = version;
	int32[GraphicsOpInfoField.VertexCount] = vertexCount;
	int32[GraphicsOpInfoField.IndexCount] = indexCount;
	int32[GraphicsOpInfoField.StateKey] = stateKey;
	int32[GraphicsOpInfoField.TypeKey] = typeKey;
	int32[GraphicsOpInfoField.TextureKey] = textureKey;
	int32[GraphicsOpInfoField.PackedColor] = packedColor;
	float32[GraphicsOpInfoField.LocalAlpha] = localAlpha;
	int32[GraphicsOpInfoField.BodyWordOffset] = GraphicsOpInfoField.WordCount;
	int32[GraphicsOpInfoField.BodyWordCount] = bodyWordCount;
	int32[GraphicsOpInfoField.RecordCount] = recordCount;
}

export function writeMeshPayloadValues(float32: Float32Array, int32: Int32Array, wordOffset: number,
	x: number, y: number, packedColor: number, alpha: number, blendMode: number, textureLayer: number,
	matrix: Matrix | null, vertexCount: number, indexCount: number, hasUV: boolean, hasColors: boolean,
	vertexDataOffset: number, uvDataOffset: number, indexDataOffset: number, colorDataOffset: number, uvClip?: ArrayLike<number> | null): void {
	float32[wordOffset + GraphicsMeshPayloadWordOffset.X] = x;
	float32[wordOffset + GraphicsMeshPayloadWordOffset.Y] = y;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.PackedColor] = packedColor;
	float32[wordOffset + GraphicsMeshPayloadWordOffset.Alpha] = alpha;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.BlendMode] = blendMode;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.TextureLayer] = textureLayer || 0;
	if (matrix) {
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixA] = matrix.a;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixB] = matrix.b;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixC] = matrix.c;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixD] = matrix.d;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTx] = matrix.tx;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTy] = matrix.ty;
		int32[wordOffset + GraphicsMeshPayloadWordOffset.HasMatrix] = 1;
	}
	else {
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixA] = 1;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixB] = 0;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixC] = 0;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixD] = 1;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTx] = 0;
		float32[wordOffset + GraphicsMeshPayloadWordOffset.MatrixTy] = 0;
		int32[wordOffset + GraphicsMeshPayloadWordOffset.HasMatrix] = 0;
	}
	int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexCount] = vertexCount;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexCount] = indexCount;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.HasUV] = hasUV ? 1 : 0;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.HasColors] = hasColors ? 1 : 0;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.VertexDataOffset] = vertexDataOffset;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.UVDataOffset] = uvDataOffset;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.IndexDataOffset] = indexDataOffset;
	int32[wordOffset + GraphicsMeshPayloadWordOffset.ColorDataOffset] = colorDataOffset;
	writeUVClipPayloadValues(float32, int32, wordOffset,
		GraphicsMeshPayloadWordOffset.UVClipEnabled, GraphicsMeshPayloadWordOffset.UVClipX, GraphicsMeshPayloadWordOffset.UVClipY,
		GraphicsMeshPayloadWordOffset.UVClipWidth, GraphicsMeshPayloadWordOffset.UVClipHeight, uvClip);
}
