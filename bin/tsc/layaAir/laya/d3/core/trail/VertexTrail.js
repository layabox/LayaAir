import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { VertexElement } from "../../graphics/VertexElement";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
/**
 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
 */
export class VertexTrail {
    constructor() {
    }
    static get vertexDeclaration1() {
        return VertexTrail._vertexDeclaration1;
    }
    static get vertexDeclaration2() {
        return VertexTrail._vertexDeclaration2;
    }
    get vertexDeclaration() {
        return VertexTrail._vertexDeclaration1;
    }
}
VertexTrail.TRAIL_POSITION0 = 0;
VertexTrail.TRAIL_OFFSETVECTOR = 1;
VertexTrail.TRAIL_TIME0 = 2;
VertexTrail.TRAIL_TEXTURECOORDINATE0Y = 3;
VertexTrail.TRAIL_TEXTURECOORDINATE0X = 4;
VertexTrail.TRAIL_COLOR = 5;
VertexTrail._vertexDeclaration1 = new VertexDeclaration(32, [new VertexElement(0, VertexElementFormat.Vector3, VertexTrail.TRAIL_POSITION0),
    new VertexElement(12, VertexElementFormat.Vector3, VertexTrail.TRAIL_OFFSETVECTOR),
    new VertexElement(24, VertexElementFormat.Single, VertexTrail.TRAIL_TIME0),
    new VertexElement(28, VertexElementFormat.Single, VertexTrail.TRAIL_TEXTURECOORDINATE0Y)]);
VertexTrail._vertexDeclaration2 = new VertexDeclaration(20, [new VertexElement(0, VertexElementFormat.Single, VertexTrail.TRAIL_TEXTURECOORDINATE0X),
    new VertexElement(4, VertexElementFormat.Color, VertexTrail.TRAIL_COLOR)]);
