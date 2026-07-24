import type { BaseTexture } from "../../../resource/BaseTexture";
import { GraphicsDefines } from "../../../webgl/shader/d2/GraphicsDefines";
import type { BlendMode } from "../../../webgl/canvas/BlendMode";

/** @internal Product-level Graphics renderer mode selected without compiling commands. */
export const enum GraphicsRenderMode {
	Empty = 0,
	SingleQuad = 1,
	CommandStream = 2,
}

/** @internal Fixed SingleQuad payload kind shared by Web and Native. */
export const enum GraphicsSingleQuadKind {
	TextureQuad = 1,
	FillTexture = 2,
	SolidQuad = 3,
}

/** @internal Composable flags stored in GraphicsSingleQuadPayloadField.Flags. */
export const enum GraphicsSingleQuadFlag {
	None = 0,
	Percent = 1,
	HasLocalMatrix = 1 << 1,
	RepeatX = 1 << 2,
	RepeatY = 1 << 3,
}

/** @internal Fixed 32-word / 128-byte SingleQuad numeric ABI. */
export const enum GraphicsSingleQuadPayloadField {
	Kind = 0,
	Flags = 1,
	PackedColor = 2,
	BlendMode = 3,
	TextureLayer = 4,
	LocalAlpha = 5,
	X = 6,
	Y = 7,
	Width = 8,
	Height = 9,
	U0 = 10,
	V0 = 11,
	U1 = 12,
	V1 = 13,
	U2 = 14,
	V2 = 15,
	U3 = 16,
	V3 = 17,
	MatrixA = 18,
	MatrixB = 19,
	MatrixC = 20,
	MatrixD = 21,
	MatrixTx = 22,
	MatrixTy = 23,
	Aux0 = 24,
	Aux1 = 25,
	Aux2 = 26,
	Aux3 = 27,
	Aux4 = 28,
	Aux5 = 29,
	Aux6 = 30,
	Aux7 = 31,
	WordCount = 32,
}

/** @internal */
export const enum GraphicsCommandDependency {
	None = 0,
	SizePayload = 1,
	ScaleTessellation = 1 << 1,
}

/** @internal */
export const enum GraphicsCommandLayoutRefresh {
	None = 0,
	MarkDirty = 1,
	RerunCommand = 2,
	Structural = 3,
}

/** @internal */
export interface GraphicsCommandInfo {
	dependency: GraphicsCommandDependency;
	layoutRefresh: GraphicsCommandLayoutRefresh;
	scaleTessellationKey: number;
	isStateCommand: boolean;
}

/** @internal */
export const enum GraphicsRefreshAction {
	NoEffect = 0,
	LocalRefresh = 1,
	StructuralRefresh = 2,
}

/** @internal Result of an immediate retained command patch. */
export const enum GraphicsCommandPatchResult {
	Failed = -1,
	NoChange = 0,
	Changed = 1,
}

/** @internal */
export enum GraphicsOwnerTransformDependency {
	None = 0,
	SizeLayout = 1,
	ScaleTessellation = 1 << 1,
	SpriteTextureSize = 1 << 2,
}

/** @internal */
export type GraphicsCommandRangeRecord = {
	cmdIndex: number;
	start: number;
	count: number;
	active: boolean;
};

/** @internal */
export const enum GraphicsInfoDirtyFlag {
	None = 0,
	Structure = 1,
	Transform = 1 << 1,
	Alpha = 1 << 2,
	Layout = 1 << 3,
	Texture = 1 << 4,
	Clip = 1 << 5,
	Rebatch = 1 << 6,
	Payload = 1 << 7,
	Ref = Texture,
	State = Rebatch,
	ClipOrRebatch = Clip | Rebatch,
	All = Structure | Transform | Alpha | Layout | Texture | Clip | Rebatch | Payload,
}

/** @internal */
export const GRAPHICS_INFO_DEFAULT_QUAD_INDICES: readonly number[] = [0, 2, 1, 0, 3, 2];
/** @internal */
export const GRAPHICS_INFO_VERTEX_BLOCK_SIZE = 4;
/** @internal */
export const GRAPHICS_INFO_VERTEX_STRIDE = GraphicsDefines.stride || 16;
/** @internal */
export const GRAPHICS_INFO_VERTEX_BYTE_STRIDE = GRAPHICS_INFO_VERTEX_STRIDE * 4;
/** @internal */
export const GRAPHICS_INFO_MAX_VERTEX = GraphicsDefines.GRAPHICS_MAX_VERTEX;
/** @internal */
export const GRAPHICS_INFO_INDEX_BLOCK_SIZE = 1024;
/** @internal */
export const GRAPHICS_INFO_VERTEX_FLAG_ENABLED = 0xff;
/** @internal */
export const GRAPHICS_INFO_VERTEX_FLAG_DISABLED = 0;

/** @internal */
export const enum GraphicsHandleUpdateField {
	UpdateVersion = 0,
	HandledVersion = 1,

	DirtyFlags = 2,
	DirtyOpStart = 3,
	DirtyOpCount = 4,

	OwnerWidth = 5,
	OwnerHeight = 6,
	/** Shared-buffer publish version for the fixed SingleQuad payload. */
	SingleQuadVersion = 7,
	/** Command-stream Op identity/order/structure version. */
	TopologyVersion = 8,
	/** Last topology version reconciled by the render runtime. */
	HandledTopologyVersion = 9,

	WordCount = 10,
}

/** @internal */
export const enum GraphicsHandleDirtyFlag {
	None = 0,
	OwnerSize = 1 << 0,
	OpPayload = 1 << 1,
	OpResource = 1 << 2,
	OpState = 1 << 3,
}

/** @internal */
export const enum GraphicsOpInfoField {
	Profile = 0,
	ChangeMask = 1,
	Version = 2,

	VertexCount = 3,
	IndexCount = 4,

	StateKey = 5,
	TypeKey = 6,
	TextureKey = 7,

	PackedColor = 8,
	LocalAlpha = 9,

	BodyWordOffset = 10,
	BodyWordCount = 11,
	RecordCount = 12,

	WordCount = 16,
}

/** @internal */
export const enum GraphicsOpProfile {
	TextureQuadPixel = 1,
	TextureQuadPercent = 2,
	SolidQuadPixel = 3,
	SolidQuadPercent = 4,
	FillTexture = 5,
	MultiQuad = 6,
	Text = 7,
	GenericMesh = 8,
}

/** @internal */
export const enum GraphicsOp2DKind {
	TextureQuad = 1,
	SolidQuad = 2,
	FillTexture = 3,
	Mesh = 4,
	MultiQuad = 5,
	Text = 6,
}

/** @internal */
export type GraphicsOp2DType =
	| "textureQuad"
	| "solidQuad"
	| "fillTexture"
	| "mesh"
	| "multiQuad"
	| "text";

/** @internal */
export type GraphicsCommandId = string;

/** @internal */
export const enum GraphicsOp2DDirtyFlag {
	None = 0,
	Structure = 1 << 0,
	Geometry = 1 << 1,
	Texture = 1 << 2,
	// Bit 3 is reserved for the removed per-op material flag to preserve the TS/C++ buffer ABI.
	State = 1 << 4,
	All = Structure | Geometry | Texture | State,
}

/** @internal */
export type GraphicsOp2DTextureHost = BaseTexture;

/** @internal */
export interface GraphicsOp2DPatchResult {
	success: boolean;
	opIndex: number;
	dirtyFlags: GraphicsOp2DDirtyFlag;
}

/** @internal */
export interface GraphicsOp2DRenderState {
	stateKey: number;
	typeKey: number;
	textureKey: number;
	texture: BaseTexture | null;
}

/** @internal */
export type GraphicsColorInput = string | number | null | undefined;

/** @internal */
export type GraphicsBlendModeInput = BlendMode | string | null | undefined;

/** @internal */
export type GraphicsDrawPathSegment =
	| readonly ["moveTo", number, number]
	| readonly ["lineTo", number, number]
	| readonly ["arcTo", number, number, number, number, number]
	| readonly ["closePath"];
