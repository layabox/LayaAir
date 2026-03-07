import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";

export class LayaXIndexBuffer implements IIndexBuffer {
    _nativeObj: any;

    private _bufferRef: any = null;

    constructor(bufferUsageType: BufferUsage) {
        this._nativeObj = new (window as any).conchLayaXIndexBuffer(bufferUsageType);
    }

    public get indexType(): IndexFormat {
        return this._nativeObj._indexType;
    }

    public set indexType(value: IndexFormat) {
        this._nativeObj.setIndexType(value);
    }

    public get indexCount(): number {
        return this._nativeObj._indexCount;
    }

    public set indexCount(value: number) {
        this._nativeObj.setIndexCount(value);
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        this._bufferRef = buffer;
        this._nativeObj.setData(buffer, bufferOffset, dataStartIndex, dataCount);
    }

    _setIndexDataLength(data: number): void {
        this._nativeObj._setIndexDataLength(data);
    }

    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void {
        this._nativeObj._setIndexData(data, bufferOffset);
    }

    destroy(): void {
        this._nativeObj.destroy();
        this._bufferRef = null;
    }
}
