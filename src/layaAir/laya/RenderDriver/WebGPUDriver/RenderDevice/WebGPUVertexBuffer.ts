import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUVertexBuffer implements IVertexBuffer {
    source: WebGPUBuffer;
    vertexDeclaration: VertexDeclaration;
    instanceBuffer: boolean;

    buffer: ArrayBuffer;

    globalId: number;
    objectName: string = 'WebGPUVertexBuffer';

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        this.source = new WebGPUBuffer(usage, 0);
        this.globalId = WebGPUGlobal.getId(this);
    }

    setData(buffer: ArrayBuffer, bufferOffset: number = 0, dataStartIndex: number = 0, dataCount: number = Number.MAX_SAFE_INTEGER): void {
        const needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            this.source.setDataEx(buffer, dataStartIndex, dataCount, bufferOffset);
            this.buffer = buffer;
        } else {
            this.source.setData(buffer, bufferOffset);
            this.buffer = buffer;
        }
    }

    setDataLength(byteLength: number): void {
        this.source.setDataLength(byteLength);
    }

    destroy(): void {
        WebGPUGlobal.releaseId(this);
        this.source.release();
        this.vertexDeclaration = null;
    }
}