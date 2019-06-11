import { VertexDeclaration } from "../VertexDeclaration";
import { VertexElement } from "../VertexElement";
import { VertexElementFormat } from "../VertexElementFormat";
/**
 * <code>VertexPositionTerrain</code> 类用于创建位置、法线、纹理1、纹理2顶点结构。
 */
export class VertexPositionTerrain {
    constructor(position, normal, textureCoord0, textureCoord1) {
        this._position = position;
        this._normal = normal;
        this._textureCoord0 = textureCoord0;
        this._textureCoord1 = textureCoord1;
    }
    static get vertexDeclaration() {
        return VertexPositionTerrain._vertexDeclaration;
    }
    get position() {
        return this._position;
    }
    get normal() {
        return this._normal;
    }
    get textureCoord0() {
        return this._textureCoord0;
    }
    get textureCoord1() {
        return this._textureCoord1;
    }
    get vertexDeclaration() {
        return VertexPositionTerrain._vertexDeclaration;
    }
}
VertexPositionTerrain.TERRAIN_POSITION0 = 0;
VertexPositionTerrain.TERRAIN_NORMAL0 = 1;
VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE0 = 2;
VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE1 = 3;
VertexPositionTerrain._vertexDeclaration = new VertexDeclaration(40, [new VertexElement(0, VertexElementFormat.Vector3, VertexPositionTerrain.TERRAIN_POSITION0),
    new VertexElement(12, VertexElementFormat.Vector3, VertexPositionTerrain.TERRAIN_NORMAL0),
    new VertexElement(24, VertexElementFormat.Vector2, VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE0),
    new VertexElement(32, VertexElementFormat.Vector2, VertexPositionTerrain.TERRAIN_TEXTURECOORDINATE1)]);
