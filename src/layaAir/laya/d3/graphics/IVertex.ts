import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";

    /**
	 * @en The IVertex interface is used to create vertex declarations.
	 * @zh IVertex 接口用于实现创建顶点声明。
	 */
	export interface IVertex {
		/**
		 * @en The vertex declaration.
		 * @zh 顶点声明 
		 */
		vertexDeclaration:VertexDeclaration;
	}
