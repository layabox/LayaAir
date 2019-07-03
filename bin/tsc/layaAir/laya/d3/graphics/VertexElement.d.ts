/**
* <code>VertexElement</code> 类用于创建顶点结构分配。
*/
export declare class VertexElement {
    readonly offset: number;
    readonly elementFormat: string;
    readonly elementUsage: number;
    constructor(offset: number, elementFormat: string, elementUsage: number);
}
