import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { IGPUBuffer } from "../../DriverDesign/RenderDevice/ComputeShader/IComputeContext";
import { IIndexBuffer } from "../../DriverDesign/RenderDevice/IIndexBuffer";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUIndexBuffer implements IIndexBuffer, IGPUBuffer {
    source: WebGPUBuffer;
    indexType: IndexFormat;
    indexCount: number;

    globalId: number;
    objectName: string = 'WebGPUIndexBuffer';

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
        this.source = new WebGPUBuffer(usage, 0);
        this.globalId = WebGPUGlobal.getId(this);
    }

    getNativeBuffer() {
        return this.source;
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