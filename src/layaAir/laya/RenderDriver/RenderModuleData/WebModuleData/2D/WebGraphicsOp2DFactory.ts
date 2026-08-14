import type { IGraphicsOp2DFactory } from "../../Design/2D/IRender2DDataHandle";
import {
	WebGraphicsFillTextureOp2D,
	WebGraphicsMeshOp2D,
	WebGraphicsMultiQuadOp2D,
	WebGraphicsSolidQuadOp2D,
	WebGraphicsTextOp2D,
	WebGraphicsTextureQuadOp2D,
} from "./WebGraphicsOp2D";
import { GraphicsOp2DKind, type GraphicsCommandId } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

/** @internal */
export class WebGraphicsOp2DFactory implements IGraphicsOp2DFactory {
	createTextureQuadOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsTextureQuadOp2D {
		return new WebGraphicsTextureQuadOp2D(GraphicsOp2DKind.TextureQuad, commandIndex, commandId);
	}

	createFillTextureOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsFillTextureOp2D {
		return new WebGraphicsFillTextureOp2D(GraphicsOp2DKind.FillTexture, commandIndex, commandId);
	}

	createSolidQuadOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsSolidQuadOp2D {
		return new WebGraphicsSolidQuadOp2D(GraphicsOp2DKind.SolidQuad, commandIndex, commandId);
	}

	createMeshOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsMeshOp2D {
		return new WebGraphicsMeshOp2D(GraphicsOp2DKind.Mesh, commandIndex, commandId);
	}

	createMultiQuadOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsMultiQuadOp2D {
		return new WebGraphicsMultiQuadOp2D(GraphicsOp2DKind.MultiQuad, commandIndex, commandId);
	}

	createTextOp(commandIndex: number, commandId: GraphicsCommandId): WebGraphicsTextOp2D {
		return new WebGraphicsTextOp2D(GraphicsOp2DKind.Text, commandIndex, commandId);
	}
}
