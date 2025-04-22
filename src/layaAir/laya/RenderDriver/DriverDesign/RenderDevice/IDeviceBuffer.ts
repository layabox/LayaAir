import { IVertexBuffer } from "./IVertexBuffer";
export enum EDeviceBufferUsage {
    MAP_READ = 1 << 0,
    MAP_WRITE = 1 << 1,
    COPY_SRC = 1 << 2,
    COPY_DST = 1 << 3,
    STORAGE = 1 << 4,
    INDIRECT = 1 << 5,
}

/**
 * 存储缓冲区接口,在GPU中创建各种各样的Buffer
 * 用于在GPU上存储和访问大量数据，主要用于计算着色器,间接渲染数据
 * 间接渲染数据中如果是drawIndirect  参数分别为vertexCount,instanceCount,firstVertex,firstInstance
 *  间接渲染数据中如果是drawIndexIndirect indexCount，instanceCount，firstIndex
 */
export interface IDeviceBuffer {
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    setDataLength(byteLength: number): void;
    copyToBuffer(buffer: IVertexBuffer | IDeviceBuffer, sourceOffset: number, destoffset: number, bytelength: number): void;
    copyToTexture(): void;//TODO
    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void>;
    destroy(): void;
}
