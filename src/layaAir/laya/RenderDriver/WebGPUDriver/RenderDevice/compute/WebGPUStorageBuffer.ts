import { IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext.ts';
import { IStorageBuffer } from '../../../DriverDesign/RenderDevice/IStorageBuffer';
import { WebGPUBuffer } from '../WebGPUBuffer';
import { WebGPURenderEngine } from '../WebGPURenderEngine';
import { WebGPUVertexBuffer } from '../WebGPUVertexBuffer.js';

export class WebGPUStorageBuffer implements IStorageBuffer, IGPUBuffer {
    private _buffer: WebGPUBuffer;

    constructor() {
        this._buffer = new WebGPUBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
    }

    getNativeBuffer(): WebGPUBuffer {
        return this._buffer;
    }

    setData(buffer: ArrayBuffer, bufferOffset: number, dataStartIndex: number, dataCount: number): void {
        const needSubData: boolean = dataStartIndex !== 0 || dataCount !== Number.MAX_SAFE_INTEGER;
        if (needSubData) {
            this._buffer.setDataEx(buffer, dataStartIndex, dataCount, bufferOffset);
        } else {
            this._buffer.setData(buffer, bufferOffset);
        }
    }

    setDataLength(byteLength: number): void {
        this._buffer.setDataLength(byteLength);
    }

    copyToBuffer(buffer: WebGPUVertexBuffer | WebGPUStorageBuffer, sourceOffset: number, destoffset: number, bytelength: number): void {
        const device = WebGPURenderEngine._instance.getDevice();
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(
            this._buffer._source,
            sourceOffset,
            (buffer as IGPUBuffer).getNativeBuffer(),
            destoffset,
            bytelength
        );
        device.queue.submit([encoder.finish()]);
    }

    copyToTexture(): void {
        // 实现复制到纹理的逻辑
    }

    readData(dest: ArrayBuffer, destOffset: number, srcOffset: number, byteLength: number): Promise<void> {
        return this._buffer.readDataFromBuffer(dest, destOffset, srcOffset, byteLength);

    }

    destroy(): void {
        if (this._buffer) {
            this._buffer.release();
            this._buffer = null;
        }
    }
}