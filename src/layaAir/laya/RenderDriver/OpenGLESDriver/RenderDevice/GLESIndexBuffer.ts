import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";



export class GLESIndexBuffer implements IIndexBuffer {
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    _setIndexDataLength(data: number): void {
        throw new Error("Method not implemented.");
    }
    _setIndexData(data: Uint32Array | Uint16Array | Uint8Array, bufferOffset: number): void {
        throw new Error("Method not implemented.");
    }
    indexType: IndexFormat;
    indexCount: number;
    _nativeObj:any;
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage){
        
    }

}