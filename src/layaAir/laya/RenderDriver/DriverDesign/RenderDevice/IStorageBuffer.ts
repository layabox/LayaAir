import { IVertexBuffer } from "./IVertexBuffer";

/**
 * 存储缓冲区接口
 * 用于在GPU上存储和访问大量数据，主要用于计算着色器
 */
export interface IStorageBuffer {
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    setDataLength(byteLength: number): void;
    copyToBuffer(buffer: IVertexBuffer | IStorageBuffer, sourceOffset: number, destoffset: number, bytelength: number): void;
    copyToTexture(): void;//TODO
    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void>;
    destroy(): void;
}
