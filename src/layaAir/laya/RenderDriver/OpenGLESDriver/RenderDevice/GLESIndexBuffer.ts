import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";



export class GLESIndexBuffer implements IIndexBuffer {
    destroy(): void {
        this._nativeObj.destroy();
    }
    _setIndexDataLength(data: number): void {
        this._nativeObj._setIndexDataLength(data);
    }
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void {
        this._nativeObj._setIndexData(data, bufferOffset);
    }
    public get indexType(): IndexFormat {
        return this._nativeObj._indexType;
    }

    public set indexType(value: IndexFormat) {
        this._nativeObj._indexType = value;
    }
    public get indexCount(): number {
        return this._nativeObj._indexCount;
    }

    public set indexCount(value: number) {
        this._nativeObj._indexCount = value;
    }
    _nativeObj:any;
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage){
        this._nativeObj = new (window as any).conchGLESIndexBuffer(targetType, bufferUsageType);
    }

}