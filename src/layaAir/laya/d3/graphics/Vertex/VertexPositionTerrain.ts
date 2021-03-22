import { IVertex } from "../IVertex"
import { VertexDeclaration } from "../VertexDeclaration"
import { VertexElement } from "../VertexElement"
import { VertexElementFormat } from "../VertexElementFormat"
import { Vector2 } from "../../math/Vector2"
import { Vector3 } from "../../math/Vector3"

/**
 * @internal
 * <code>VertexPositionTerrain</code> 类用于创建位置、法线、纹理1、纹理2顶点结构。
 */
export class VertexPositionTerrain implements IVertex {
	static TERRAIN_POSITION0: number = 0;
	static TERRAIN_NORMAL0: number = 1;
	static TERRAIN_TEXTURECOORDINATE0: number = 2;
	static TERRAIN_TEXTURECOORDINATE1: number = 3;

	private static _vertexDeclaration: VertexDeclaration;

	/**
	 * @internal
	 */
	static __init__(): void {
		VertexPositionTerrain._vertexDeclaration = new VertexDeclaration(40, [new VertexElement(0, VertexElementFormat.Vector3, VertexPositionTerrain.TERRAIN_POSITION0),
		new VertexElement(12, VertexElementFormat.Vector3, VertexPositionTerrain.TERRAIN_NORMAL0),
		new VertexElement(24, VertexElementFormat.Vector2, VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE0),
		new VertexElement(32, VertexElementFormat.Vector2, VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE1)]);
	}

	static get vertexDeclaration(): VertexDeclaration {
		return VertexPositionTerrain._vertexDeclaration;
	}

	private _position: Vector3;
	private _normal: Vector3;
	private _textureCoord0: Vector2;
	private _textureCoord1: Vector2;

	get position(): Vector3 {
		return this._position;
	}

	get normal(): Vector3 {
		return this._normal;
	}

	get textureCoord0(): Vector2 {
		return this._textureCoord0;
	}

	get textureCoord1(): Vector2 {
		return this._textureCoord1;
	}

	get vertexDeclaration(): VertexDeclaration {
		return VertexPositionTerrain._vertexDeclaration;
	}

	constructor(position: Vector3, normal: Vector3, textureCoord0: Vector2, textureCoord1: Vector2) {
		this._position = position;
		this._normal = normal;
		this._textureCoord0 = textureCoord0;
		this._textureCoord1 = textureCoord1;
	}

}


