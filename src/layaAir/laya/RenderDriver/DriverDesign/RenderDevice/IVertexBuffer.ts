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
    /**
     * 释放驱动缓冲区上保留的 CPU 副本（如有）。上传完成后不再需要 CPU 数据时调用，可立即释放 JS 堆内存。
     * @en Release the CPU copy retained on the device buffer (if any). Call after upload when the CPU data is no longer needed.
     */
    releaseCPUData?(): void;
    destroy(): void;
}
