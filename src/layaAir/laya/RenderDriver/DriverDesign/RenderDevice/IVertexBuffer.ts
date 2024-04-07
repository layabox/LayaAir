import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";

export interface IVertexBuffer {
    vertexDeclaration: VertexDeclaration;//要的数据是_shaderValues
    instanceBuffer: boolean;
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    setDataLength(byteLength: number): void;
    destroy():void;
}