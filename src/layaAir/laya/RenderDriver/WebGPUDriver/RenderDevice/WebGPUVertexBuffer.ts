import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";

export class WebGPUVertexBuffer implements IVertexBuffer {
    _source: WebGPUBuffer;
    vertexDeclaration: VertexDeclaration;
    instanceBuffer: boolean;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = WebGPUBufferUsage.VERTEX | WebGPUBufferUsage.COPY_DST;
        this._source = new WebGPUBuffer(usage, 0);
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        var needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            var subData: Uint8Array = new Uint8Array(buffer, dataStartIndex, dataCount);
            this._source.setData(subData, bufferOffset);
        } else {
            this._source.setData(buffer, bufferOffset);
        }
    }
    
    setDataLength(byteLength: number): void {
        this._source.setDataLength(byteLength);
    }
    destory(): void {
        this._source.release();
        this.vertexDeclaration = null
    }
}