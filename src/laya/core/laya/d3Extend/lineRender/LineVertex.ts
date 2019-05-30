import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration"
	import { VertexElement } from "laya/d3/graphics/VertexElement"
	import { VertexElementFormat } from "laya/d3/graphics/VertexElementFormat"
	/**
	 * @author 
	 * ...
	 */
	export class LineVertex 
	{
		private static _vertexDeclaration:VertexDeclaration = new VertexDeclaration(36, 
		[new VertexElement(0, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0), 
		new VertexElement(12, VertexElementFormat.Vector4, VertexMesh.MESH_COLOR0),
		new VertexElement(28, VertexElementFormat.Vector2, VertexMesh.MESH_TEXTURECOORDINATE0)]);
		
		 static get vertexDeclaration():VertexDeclaration
		{
			return LineVertex._vertexDeclaration;
		}
		
		 get vertexDeclaration():VertexDeclaration
		{
			return LineVertex._vertexDeclaration;
		}
		
		constructor(){
			
		}
	}


