import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IDeviceBuffer } from "./IDeviceBuffer";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IVertexBuffer {
    vertexDeclaration: VertexDeclaration;//要的数据是_shaderValues
    instanceBuffer: boolean;
    setData(buffer: ArrayBufferLike, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    setDataLength(byteLength: number): void;
    getStorageBuffer(): IDeviceBuffer;
    destroy(): void;
}
