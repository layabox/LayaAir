import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";

export class WebGPUIndexBuffer implements IIndexBuffer {
    source: WebGPUBuffer;
    indexType: IndexFormat;
    indexCount: number;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = WebGPUBufferUsage.INDEX | WebGPUBufferUsage.COPY_DST;
        this.source = new WebGPUBuffer(usage, 0);
    }

    destroy(): void {
        this.source.release();
    }

    _setIndexDataLength(length: number): void {
        this.source.setDataLength(length);
    }

    _setIndexData(data: Uint8Array | Uint16Array | Uint32Array, bufferOffset: number): void {
        this.source.setData(data, bufferOffset);
    }
}