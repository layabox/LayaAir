import { VertexMesh } from "./VertexMesh";
import { IVertex } from "../IVertex"
import { VertexDeclaration } from "../VertexDeclaration"
import { VertexElement } from "../VertexElement"
import { VertexElementFormat } from "../VertexElementFormat"
import { Vector2 } from "../../math/Vector2"
import { Vector3 } from "../../math/Vector3"

/**
 * @internal
 * <code>VertexPositionNormalTexture</code> 类用于创建位置、纹理顶点结构。
 */
export class VertexPositionTexture0 implements IVertex {

	private static _vertexDeclaration: VertexDeclaration;

	static get vertexDeclaration(): VertexDeclaration {
		return VertexPositionTexture0._vertexDeclaration;
	}

	/**
	 * @internal
	 */
	static __init__(): void {
		VertexPositionTexture0._vertexDeclaration = new VertexDeclaration(20, [new VertexElement(0, VertexElementFormat.Vector3, VertexMesh.MESH_POSITION0),
		new VertexElement(12, VertexElementFormat.Vector2, VertexMesh.MESH_TEXTURECOORDINATE0)]);
	}

	private _position: Vector3;
	private _textureCoordinate0: Vector2;

	get position(): Vector3 {
		return this._position;
	}

	get textureCoordinate0(): Vector2 {
		return this._textureCoordinate0;
	}

	get vertexDeclaration(): VertexDeclaration {
		return VertexPositionTexture0._vertexDeclaration;
	}

	constructor(position: Vector3, textureCoordinate0: Vector2) {
		this._position = position;
		this._textureCoordinate0 = textureCoordinate0;
	}

}


