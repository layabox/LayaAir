import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";

export interface IIndexBuffer {
    destroy(): void;
    _setIndexData(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    indexType: IndexFormat;
    indexCount: number;
}