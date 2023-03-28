export interface IRenderBuffer {
    bindBuffer(): boolean;
    unbindBuffer(): void;
    setDataLength(srcData: number): void;
    setData(srcData: ArrayBuffer | ArrayBufferView, offset: number): void;
    setDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, length: number): void;
    bindBufferBase(glPointer: number): void;
    bindBufferRange(glPointer: number, offset: number, byteCount: number): void;
    destroy(): void;
}