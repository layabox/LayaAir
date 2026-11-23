import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IIndexBuffer {
    destroy(): void;
    _setIndexDataLength(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    /**
     * 释放驱动缓冲区上保留的 CPU 副本（如有）。上传完成后不再需要 CPU 数据时调用，可立即释放 JS 堆内存。
     * @en Release the CPU copy retained on the device buffer (if any). Call after upload when the CPU data is no longer needed.
     */
    releaseCPUData?(): void;
    indexType: IndexFormat;
    indexCount: number;
}