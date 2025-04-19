import { IVertexBuffer } from "./IVertexBuffer";


/**
 * 存储缓冲区接口,在GPU中创建各种各样的Buffer
 * 用于在GPU上存储和访问大量数据，主要用于计算着色器,间接渲染数据
 * 间接渲染数据中如果是drawIndirect  参数分别为vertexCount,instanceCount,firstVertex,firstInstance
 *  间接渲染数据中如果是drawIndirect 
 */
export interface IDeviceBuffer {
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    setDataLength(byteLength: number): void;
    copyToBuffer(buffer: IVertexBuffer | IDeviceBuffer, sourceOffset: number, destoffset: number, bytelength: number): void;
    copyToTexture(): void;//TODO
    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void>;
    destroy(): void;
}
