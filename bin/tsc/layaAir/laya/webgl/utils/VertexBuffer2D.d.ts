import { Buffer2D } from "./Buffer2D";
export declare class VertexBuffer2D extends Buffer2D {
    static create: Function;
    _floatArray32: Float32Array;
    _uint32Array: Uint32Array;
    private _vertexStride;
    readonly vertexStride: number;
    constructor(vertexStride: number, bufferUsage: number);
    getFloat32Array(): Float32Array;
    /**
     * 在当前位置插入float数组。
     * @param	data
     * @param	pos
     */
    appendArray(data: any[]): void;
    protected _checkArrayUse(): void;
    deleteBuffer(): void;
    /**
     * @inheritDoc
     */
    _bindForVAO(): void;
    /**
     * @inheritDoc
     */
    bind(): boolean;
    destroy(): void;
}
