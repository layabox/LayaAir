import { VertexElement } from "././VertexElement";
import { ShaderData } from "../shader/ShaderData";
/**
 * @private
 * <code>VertexDeclaration</code> 类用于生成顶点声明。
 */
export declare class VertexDeclaration {
    /**@private */
    private static _uniqueIDCounter;
    /**@private */
    private _id;
    /**@private */
    private _vertexStride;
    /**@private */
    private _vertexElementsDic;
    /**@private */
    _shaderValues: ShaderData;
    /**@private [只读]*/
    vertexElements: any[];
    /**
     * 获取唯一标识ID(通常用于优化或识别)。
     * @return 唯一标识ID
     */
    readonly id: number;
    /**
     * @private
     */
    readonly vertexStride: number;
    /**
     * 创建一个 <code>VertexDeclaration</code> 实例。
     * @param	vertexStride 顶点跨度。
     * @param	vertexElements 顶点元素集合。
     */
    constructor(vertexStride: number, vertexElements: any[]);
    /**
     * @private
     */
    getVertexElementByUsage(usage: number): VertexElement;
    /**
     * @private
     */
    unBinding(): void;
}
