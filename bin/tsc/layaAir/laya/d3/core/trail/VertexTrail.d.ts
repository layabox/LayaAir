import { IVertex } from "../../graphics/IVertex";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
/**
 * <code>VertexTrail</code> 类用于创建拖尾顶点结构。
 */
export declare class VertexTrail implements IVertex {
    static TRAIL_POSITION0: number;
    static TRAIL_OFFSETVECTOR: number;
    static TRAIL_TIME0: number;
    static TRAIL_TEXTURECOORDINATE0Y: number;
    static TRAIL_TEXTURECOORDINATE0X: number;
    static TRAIL_COLOR: number;
    private static _vertexDeclaration1;
    private static _vertexDeclaration2;
    static readonly vertexDeclaration1: VertexDeclaration;
    static readonly vertexDeclaration2: VertexDeclaration;
    readonly vertexDeclaration: VertexDeclaration;
    constructor();
}
