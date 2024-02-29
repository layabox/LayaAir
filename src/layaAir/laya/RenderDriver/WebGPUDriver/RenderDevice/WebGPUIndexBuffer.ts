import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";

export class WebGPUIndexBuffer implements IIndexBuffer {
    _source: WebGPUBuffer;
    indexType: IndexFormat;
    indexCount: number;
    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = WebGPUBufferUsage.INDEX | WebGPUBufferUsage.COPY_DST;
        this._source = new WebGPUBuffer(usage, 0);
    }

    destroy(): void {
        this._source.release();
    }

    _setIndexDataLength(data: number): void {
        this._source.setDataLength(data);
    }
    
    _setIndexData(data: Uint8Array | Uint16Array | Uint32Array, bufferOffset: number): void {
        this._source.setData(data, bufferOffset);

    }


}