export interface IRenderBuffer {
    bindBuffer(): boolean;
    unbindBuffer(): void;
    setData(srcData?: number): void;
    setData(srcData: ArrayBuffer | ArrayBufferView): void;
    setData(srcData: ArrayBuffer | ArrayBufferView, offset: number, length: number): void;
    setData(srcData?: ArrayBuffer | ArrayBufferView | number, offset?: number, length?: number): void;
    bindBufferBase(glPointer: number): void;
    bindBufferRange(glPointer: number, offset: number, byteCount: number): void;
    resizeBuffer(dataLength: number): void;
    destroy(): void;
}