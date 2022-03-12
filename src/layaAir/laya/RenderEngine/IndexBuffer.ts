import { BufferStateBase } from "./BufferStateBase";
import { BufferTargetType, BufferUsage } from "./RenderEnum/BufferTargetType";
import { IndexFormat } from "./RenderEnum/IndexFormat";
import { Buffer } from "./Buffer";

export class IndexBuffer extends Buffer {
    /** @internal */
    protected _indexType: IndexFormat = IndexFormat.UInt16;
    /** @internal */
    protected _indexTypeByteCount: number;
    /** @internal */
    protected _indexCount: number;
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        super(targetType, bufferUsageType);
    }

    
    _setIndexData(data: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void;
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array | number, bufferOffset?: number): void {
        var curBufSta: BufferStateBase = BufferStateBase._curBindedBufferState;

        if (curBufSta) {
            if (curBufSta._bindedIndexBuffer === this) {
                this._glBuffer.setData();
            } else {
                curBufSta.unBind();//避免影响VAO
                this.bind();
                if (typeof data === "number")
                    this._glBuffer.setData(data);
                else
                    this._glBuffer.setData(data, bufferOffset);
                curBufSta.bind();
            }
        } else {
            this.bind();
            if (typeof data === "number")
                this._glBuffer.setData(data);
            else
                this._glBuffer.setData(data, bufferOffset)
        }
    }


}