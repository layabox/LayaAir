import { VertexMesh } from "../../graphics/Vertex/VertexMesh"
	import { VertexDeclaration } from "../../graphics/VertexDeclaration"
	import { VertexElement } from "../../graphics/VertexElement"
	import { VertexElementFormat } from "../../graphics/VertexElementFormat"
	/**
	 * ...
	 * @author 
	 */
	export class PixelLineVertex 
	{
		private static _vertexDeclaration:VertexDeclaration = new VertexDeclaration(28, 
		[new VertexElement(0, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0), 
		new VertexElement(12, VertexElementFormat.Vector4, VertexMesh.MESH_COLOR0)]);
		
		 static get vertexDeclaration():VertexDeclaration
		{
			return PixelLineVertex._vertexDeclaration;
		}
		
		 get vertexDeclaration():VertexDeclaration
		{
			return PixelLineVertex._vertexDeclaration;
		}
		
		constructor(){
			
		}
		
	}


