import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";

export interface IIndexBuffer {
    destroy(): void;
    _setIndexDataLength(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    getData():Uint16Array|Uint32Array | Uint8Array;
    indexType: Readonly<IndexFormat>;
    indexCount: number;
    canRead:boolean;
}