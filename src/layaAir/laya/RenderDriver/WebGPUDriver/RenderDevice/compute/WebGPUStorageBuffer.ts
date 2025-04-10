import { IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext.ts';
import { IStorageBuffer } from '../../../DriverDesign/RenderDevice/IStorageBuffer';
import { WebGPUBuffer } from '../WebGPUBuffer';
import { WebGPURenderEngine } from '../WebGPURenderEngine';
import { WebGPUShaderData } from '../WebGPUShaderData.js';
import { WebGPUVertexBuffer } from '../WebGPUVertexBuffer.js';

export interface IStorageBufferCacheData {
    gpudata: WebGPUShaderData;
    propertyID: number;
}

export class WebGPUStorageBuffer implements IStorageBuffer, IGPUBuffer {
    private _buffer: WebGPUBuffer;
    private _GPUBindGroupEntry: GPUBindGroupEntry;
    private _cacheShaderData: Map<WebGPUShaderData, number> = new Map();
    _destroyed: boolean = false;
    constructor(type: number) {
        if(type == 0){
            this._buffer = new WebGPUBuffer(GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST);
        }else{
            this._buffer = new WebGPUBuffer(GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST);
        }
        

    }



    private _reSetBindGroupEntry() {
        this._GPUBindGroupEntry = {
            binding: 0,//后续自己改
            resource: {
                buffer: this._buffer._source,
                offset: 0,
                size: this._buffer._size,
            }
        }
        for (const [key, value] of this._cacheShaderData) {
            key._notifyBindGroupMask(value);
        }
    }

    _addCacheShaderData(shaderData: WebGPUShaderData, propertyID: number) {
        if (!this._cacheShaderData.has(shaderData)) {
            this._cacheShaderData.set(shaderData, propertyID);
        }
    }

    _removeCacheShaderData(shaderData: WebGPUShaderData) {
        if (this._cacheShaderData.has(shaderData)) {
            this._cacheShaderData.delete(shaderData);
        }
    }

    getNativeBuffer(): WebGPUBuffer {
        return this._buffer;
    }

    getBindGroupEntry(binding: number) {
        this._GPUBindGroupEntry.binding = binding;
        return this._GPUBindGroupEntry;
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
        if (byteLength != this._buffer._size) {
            this._buffer.setDataLength(byteLength);
            this._reSetBindGroupEntry();
        }

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
        this._cacheShaderData = null;
        this._destroyed = true;
    }
}