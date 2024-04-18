import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUIndexBuffer implements IIndexBuffer {
    source: WebGPUBuffer;
    indexType: IndexFormat;
    indexCount: number;

    globalId: number;
    objectName: string = 'WebGPUIndexBuffer';

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = WebGPUBufferUsage.INDEX | WebGPUBufferUsage.COPY_DST;
        this.source = new WebGPUBuffer(usage, 0);
        this.globalId = WebGPUGlobal.getId(this);
    }

    _setIndexDataLength(length: number): void {
        this.source.setDataLength(length);
    }

    _setIndexData(data: Uint8Array | Uint16Array | Uint32Array, bufferOffset: number): void {
        this.source.setData(data, bufferOffset);
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        this.source.release();
    }
}