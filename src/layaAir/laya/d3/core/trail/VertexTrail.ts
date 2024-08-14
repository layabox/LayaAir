import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
import { IVertex } from "../../graphics/IVertex"
/**
 * @internal
 * @en The `VertexTrail` class is used to create the vertex structure for a trail.
 * @zh `VertexTrail` 类用于创建拖尾的顶点结构。
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
     * @en The vertex declaration for the first set of vertex elements.
     * @zh 第一组顶点元素的顶点声明。
     */
	static get vertexDeclaration1(): VertexDeclaration {
		return VertexTrail._vertexDeclaration1;
	}

    /**
	 * @internal
     * @en The vertex declaration for the second set of vertex elements.
     * @zh 第二组顶点元素的顶点声明。
     */
	static get vertexDeclaration2(): VertexDeclaration {
		return VertexTrail._vertexDeclaration2;
	}

    /**
     * @en The vertex declaration for this vertex structure.
     * @zh 此顶点结构的顶点声明。
     */
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

