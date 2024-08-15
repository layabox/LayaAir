import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";

export interface IVertexBuffer {
    canRead:boolean;
    vertexDeclaration: VertexDeclaration;//要的数据是_shaderValues
    instanceBuffer: boolean;
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    getData():ArrayBuffer;
    setDataLength(byteLength: number): void;
    destroy():void;
}