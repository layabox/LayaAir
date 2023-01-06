import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IVertex } from "../../graphics/IVertex"
/**
 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
 * @internal
 */
export class VertexTrail implements IVertex {
	/**@internal */
	static TRAIL_POSITION0: number = 0;
	/**@internal */
	static TRAIL_OFFSETVECTOR: number = 1;
	/**@internal */
	static TRAIL_TIME0: number = 2;
	/**@internal */
	static TRAIL_TEXTURECOORDINATE0Y: number = 3;
	/**@internal */
	static TRAIL_TEXTURECOORDINATE0X: number = 4;
	/**@internal */
	static TRAIL_COLOR: number = 5;

	/**@internal */
	private static _vertexDeclaration1: VertexDeclaration;
	/**@internal */
	private static _vertexDeclaration2: VertexDeclaration;

	/**
	 * @internal
	 */
	static get vertexDeclaration1(): VertexDeclaration {
		return VertexTrail._vertexDeclaration1;
	}

	/**
	 * @internal
	 */
	static get vertexDeclaration2(): VertexDeclaration {
		return VertexTrail._vertexDeclaration2;
	}

	get vertexDeclaration(): VertexDeclaration {
		return VertexTrail._vertexDeclaration1;
	}

	/**
	 * @internal
	 */
	static __init__(): void {
		VertexTrail._vertexDeclaration1 = new VertexDeclaration(32,
			[new VertexElement(0, VertexElementFormat.Vector3, VertexTrail.TRAIL_POSITION0),
			new VertexElement(12, VertexElementFormat.Vector3, VertexTrail.TRAIL_OFFSETVECTOR),
			new VertexElement(24, VertexElementFormat.Single, VertexTrail.TRAIL_TIME0),
			new VertexElement(28, VertexElementFormat.Single, VertexTrail.TRAIL_TEXTURECOORDINATE0Y)]);
		VertexTrail._vertexDeclaration2 = new VertexDeclaration(20,
			[new VertexElement(0, VertexElementFormat.Single, VertexTrail.TRAIL_TEXTURECOORDINATE0X),
			new VertexElement(4, VertexElementFormat.Color, VertexTrail.TRAIL_COLOR)]);
	}
}

