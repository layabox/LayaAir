import type { IGraphicsOp2DFactory } from "../../RenderModuleData/Design/2D/IRender2DDataHandle";
import {
	RTGraphicsFillTextureOp2D,
	RTGraphicsMeshOp2D,
	RTGraphicsMultiQuadOp2D,
	RTGraphicsSolidQuadOp2D,
	RTGraphicsTextOp2D,
	RTGraphicsTextureQuadOp2D,
} from "../../RenderModuleData/RuntimeModuleData/2D/RTGraphicsOp2D";
import { GraphicsOp2DKind, type GraphicsCommandId } from "../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineTypes";

/** @internal */
export class LayaXGraphicsOp2DFactory implements IGraphicsOp2DFactory {
	createTextureQuadOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsTextureQuadOp2D {
		return new RTGraphicsTextureQuadOp2D(GraphicsOp2DKind.TextureQuad, commandIndex, commandId);
	}

	createFillTextureOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsFillTextureOp2D {
		return new RTGraphicsFillTextureOp2D(GraphicsOp2DKind.FillTexture, commandIndex, commandId);
	}

	createSolidQuadOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsSolidQuadOp2D {
		return new RTGraphicsSolidQuadOp2D(GraphicsOp2DKind.SolidQuad, commandIndex, commandId);
	}

	createMeshOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsMeshOp2D {
		return new RTGraphicsMeshOp2D(GraphicsOp2DKind.Mesh, commandIndex, commandId);
	}

	createMultiQuadOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsMultiQuadOp2D {
		return new RTGraphicsMultiQuadOp2D(GraphicsOp2DKind.MultiQuad, commandIndex, commandId);
	}

	createTextOp(commandIndex: number, commandId: GraphicsCommandId): RTGraphicsTextOp2D {
		return new RTGraphicsTextOp2D(GraphicsOp2DKind.Text, commandIndex, commandId);
	}
}
