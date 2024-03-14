import { BufferTargetType, BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { IVertexBuffer } from "../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebGPUBuffer, WebGPUBufferUsage } from "./WebGPUBuffer";

export class WebGPUVertexBuffer implements IVertexBuffer {
    source: WebGPUBuffer;
    vertexDeclaration: VertexDeclaration;
    instanceBuffer: boolean;
    private _id: number;
    static _idCounter: number = 0;

    constructor(targetType: BufferTargetType, bufferUsageType: BufferUsage) {
        let usage = WebGPUBufferUsage.VERTEX | WebGPUBufferUsage.COPY_DST;
        this.source = new WebGPUBuffer(usage, 0);
        this._id = WebGPUVertexBuffer._idCounter++;
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
        this.source.release();
        this.vertexDeclaration = null
    }
}