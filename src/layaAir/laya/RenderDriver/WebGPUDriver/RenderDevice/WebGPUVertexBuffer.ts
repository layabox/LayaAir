import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUVertexBuffer implements IVertexBuffer {
    source: WebGPUBuffer;
    vertexDeclaration: VertexDeclaration;
    instanceBuffer: boolean;

    globalId: number;
    objectName: string = 'WebGPUVertexBuffer';

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        const usage = WebGPUBufferUsage.VERTEX | WebGPUBufferUsage.COPY_DST;
        this.source = new WebGPUBuffer(usage, 0);
        this.globalId = WebGPUGlobal.getId(this);
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        const needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            const subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
            this.source.setData(subData, bufferOffset);
        } else this.source.setData(buffer, bufferOffset);
    }

    setDataLength(byteLength: number): void {
        this.source.setDataLength(byteLength);
    }

    destory(): void {
        WebGPUGlobal.releaseId(this);
        this.source.release();
        this.vertexDeclaration = null;
    }
}