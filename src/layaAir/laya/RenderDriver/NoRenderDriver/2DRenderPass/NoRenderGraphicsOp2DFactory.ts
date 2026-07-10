import type { Matrix } from "../../../maths/Matrix";
import type { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import type { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import {
	GraphicsOp2DDirtyFlag,
	GraphicsOp2DKind,
	type GraphicsCommandId,
	type GraphicsOp2DTextureHost,
	type GraphicsOp2DType,
} from "../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import { GraphicsOpProfile } from "../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";
import type {
	IGraphicsFillTextureOp2D,
	IGraphicsMeshOp2D,
	IGraphicsMultiQuadOp2D,
	IGraphicsOp2DFactory,
	IGraphicsSolidQuadOp2D,
	IGraphicsTextOp2D,
	IGraphicsTextureQuadOp2D,
} from "../../RenderModuleData/Design/2D/IRender2DDataHandle";

/** @internal */
class NoRenderGraphicsOp2D implements IGraphicsTextureQuadOp2D, IGraphicsSolidQuadOp2D, IGraphicsFillTextureOp2D, IGraphicsMeshOp2D, IGraphicsMultiQuadOp2D, IGraphicsTextOp2D {
	readonly buffer: ArrayBuffer = new ArrayBuffer(0);
	dirtyFlags: GraphicsOp2DDirtyFlag = GraphicsOp2DDirtyFlag.All;
	recordCount: number = 0;
	texture: GraphicsOp2DTextureHost | null = null;
	subShader: SubShader | null = null;
	shaderData: ShaderData | null = null;
	textures: GraphicsOp2DTextureHost[] = [];

	constructor(readonly kind: GraphicsOp2DKind, readonly commandIndex: number, readonly commandId: GraphicsCommandId) {
	}

	get opType(): GraphicsOp2DType {
		switch (this.kind) {
			case GraphicsOp2DKind.TextureQuad:
				return "textureQuad";
			case GraphicsOp2DKind.SolidQuad:
				return "solidQuad";
			case GraphicsOp2DKind.FillTexture:
				return "fillTexture";
			case GraphicsOp2DKind.Mesh:
				return "mesh";
			case GraphicsOp2DKind.Text:
				return "text";
			default:
				return "multiQuad";
		}
	}

	get opProfile(): GraphicsOpProfile {
		switch (this.kind) {
			case GraphicsOp2DKind.TextureQuad:
				return GraphicsOpProfile.TextureQuadPixel;
			case GraphicsOp2DKind.SolidQuad:
				return GraphicsOpProfile.SolidQuadPixel;
			case GraphicsOp2DKind.FillTexture:
				return GraphicsOpProfile.FillTexture;
			case GraphicsOp2DKind.Mesh:
				return GraphicsOpProfile.GenericMesh;
			case GraphicsOp2DKind.Text:
				return GraphicsOpProfile.Text;
			default:
				return GraphicsOpProfile.MultiQuad;
		}
	}

	canUpdate(commandId: GraphicsCommandId): boolean {
		return this.commandId === commandId;
	}

	resetRecords(): void {
		this.recordCount = 0;
	}

	getStructureKey(): string {
		return `${this.kind}:${this.recordCount}`;
	}

	markDirty(flags: GraphicsOp2DDirtyFlag): void {
		this.dirtyFlags |= flags;
	}

	clearDirty(): void {
		this.dirtyFlags = GraphicsOp2DDirtyFlag.None;
	}

	writeRecord(...args: any[]): void {
		this.recordCount = Math.max(1, this.recordCount + (this.kind === GraphicsOp2DKind.MultiQuad || this.kind === GraphicsOp2DKind.Text ? 1 : 0));
		this.markDirty(GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State);
	}

	setTextures(textures: ReadonlyArray<GraphicsOp2DTextureHost>, count: number = textures ? textures.length : 0): void {
		this.textures.length = count;
		for (let i = 0; i < count; i++)
			this.textures[i] = textures[i] || null;
		this.texture = count > 0 ? this.textures[0] : null;
		this.markDirty(GraphicsOp2DDirtyFlag.Texture);
	}

	addRecord(x: number, y: number, width: number, height: number,
		u0: number, v0: number, u1: number, v1: number,
		packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix): void {
		this.recordCount++;
		this.markDirty(GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.State);
	}

	writeMesh(x: number, y: number, vertices: ArrayLike<number>, vertexOffset: number, vertexCount: number, uvs: ArrayLike<number> | null, uvOffset: number, indices: ArrayLike<number>, indexOffset: number, indexCount: number, colors: ArrayLike<number> | null, colorOffset: number, packedColor: number, alpha: number, blendMode: number, textureLayer: number, matrix: Matrix | null): void {
		this.markDirty(GraphicsOp2DDirtyFlag.Geometry | GraphicsOp2DDirtyFlag.Texture | GraphicsOp2DDirtyFlag.State);
	}

	destroy(): void {
		this.texture = null;
		this.subShader = null;
		this.shaderData = null;
	}
}

/** @internal */
export class NoRenderGraphicsOp2DFactory implements IGraphicsOp2DFactory {
	createTextureQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsTextureQuadOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.TextureQuad, commandIndex, commandId);
	}

	createFillTextureOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsFillTextureOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.FillTexture, commandIndex, commandId);
	}

	createSolidQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsSolidQuadOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.SolidQuad, commandIndex, commandId);
	}

	createMeshOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsMeshOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.Mesh, commandIndex, commandId);
	}

	createMultiQuadOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsMultiQuadOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.MultiQuad, commandIndex, commandId);
	}

	createTextOp(commandIndex: number, commandId: GraphicsCommandId): IGraphicsTextOp2D {
		return new NoRenderGraphicsOp2D(GraphicsOp2DKind.Text, commandIndex, commandId);
	}
}
