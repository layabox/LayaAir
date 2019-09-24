import { IVertex } from "../../graphics/IVertex"
import { VertexDeclaration } from "../../graphics/VertexDeclaration"
import { VertexElement } from "../../graphics/VertexElement"
import { VertexElementFormat } from "../../graphics/VertexElementFormat"
/**
 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
 */
export class VertexTrail implements IVertex {
	static TRAIL_POSITION0: number = 0;
	static TRAIL_OFFSETVECTOR: number = 1;
	static TRAIL_TIME0: number = 2;
	static TRAIL_TEXTURECOORDINATE0Y: number = 3;
	static TRAIL_TEXTURECOORDINATE0X: number = 4;
	static TRAIL_COLOR: number = 5;

	/**@internal */
	private static _vertexDeclaration1: VertexDeclaration;
	/**@internal */
	private static _vertexDeclaration2: VertexDeclaration;

	static get vertexDeclaration1(): VertexDeclaration {
		return VertexTrail._vertexDeclaration1;
	}

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

