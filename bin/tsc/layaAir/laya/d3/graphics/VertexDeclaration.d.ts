import { VertexElement } from "./VertexElement";
/**
 * <code>VertexDeclaration</code> 类用于生成顶点声明。
 */
export declare class VertexDeclaration {
    /**
     * 获取唯一标识ID(通常用于优化或识别)。
     * @return 唯一标识ID
     */
    readonly id: number;
    /**
     * 顶点跨度，以字节为单位。
     */
    readonly vertexStride: number;
    /**
     * 顶点元素的数量。
     */
    readonly vertexElementCount: number;
    /**
     * 创建一个 <code>VertexDeclaration</code> 实例。
     * @param	vertexStride 顶点跨度。
     * @param	vertexElements 顶点元素集合。
     */
    constructor(vertexStride: number, vertexElements: Array<VertexElement>);
    /**
     * 通过索引获取顶点元素。
     * @param index 索引。
     */
    getVertexElementByIndex(index: number): VertexElement;
}
