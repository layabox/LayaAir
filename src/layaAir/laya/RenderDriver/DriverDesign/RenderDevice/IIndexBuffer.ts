import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IIndexBuffer {
    destroy(): void;
    _setIndexDataLength(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void;
    indexType: IndexFormat;
    indexCount: number;
}