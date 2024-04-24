import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../../renders/VertexElement";
import { VertexElementFormat } from "../../../renders/VertexElementFormat";
/**
 * @internal
 * @author 
 */
export class PixelLineVertex {
	private static _vertexDeclaration: VertexDeclaration;

	static get vertexDeclaration(): VertexDeclaration {
		return PixelLineVertex._vertexDeclaration;
	}

	/**
	 * @internal
	 */
	static __init__(): void {
		PixelLineVertex._vertexDeclaration = new VertexDeclaration(40,
			[new VertexElement(0, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0),
			new VertexElement(12, VertexElementFormat.Vector4, VertexMesh.MESH_COLOR0),
			new VertexElement(28, VertexElementFormat.Vector3, VertexMesh.MESH_NORMAL0)
			]);
	}

	get vertexDeclaration(): VertexDeclaration {
		return PixelLineVertex._vertexDeclaration;
	}

	constructor() {

	}

}


