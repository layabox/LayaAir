import { IGPUBuffer } from '../../../DriverDesign/RenderDevice/ComputeShader/IComputeContext';
import { EDeviceBufferUsage, IDeviceBuffer } from '../../../DriverDesign/RenderDevice/IDeviceBuffer';
import { WebGPUBuffer } from '../WebGPUBuffer';
import { WebGPURenderEngine } from '../WebGPURenderEngine';
import { WebGPUShaderData } from '../WebGPUShaderData';
import { WebGPUGlobal } from '../WebGPUStatis/WebGPUGlobal';
import { WebGPUVertexBuffer } from '../WebGPUVertexBuffer';

export interface IDeviceBufferCacheData {
    gpudata: WebGPUShaderData;
    propertyID: number;
}

export class WebGPUDeviceBuffer implements IDeviceBuffer, IGPUBuffer {
    private _buffer: WebGPUBuffer;
    private _GPUBindGroupEntry: GPUBindGroupEntry;
    private _cacheShaderData: Map<WebGPUShaderData, number> = new Map();
    _destroyed: boolean = false;

    objectName: string = "WebGPUDeviceBuffer";

    globalId: number;

    constructor(type: EDeviceBufferUsage) {
        let usage = 0;
        usage |= (type & EDeviceBufferUsage.MAP_READ) ? GPUBufferUsage.MAP_READ : 0;
        usage |= (type & EDeviceBufferUsage.MAP_WRITE) ? GPUBufferUsage.MAP_WRITE : 0;
        usage |= (type & EDeviceBufferUsage.COPY_SRC) ? GPUBufferUsage.COPY_SRC : 0;
        usage |= (type & EDeviceBufferUsage.COPY_DST) ? GPUBufferUsage.COPY_DST : 0;
        usage |= (type & EDeviceBufferUsage.STORAGE) ? GPUBufferUsage.STORAGE : 0;
        usage |= (type & EDeviceBufferUsage.INDIRECT) ? GPUBufferUsage.INDIRECT : 0;
        this._buffer = new WebGPUBuffer(usage);

        this.globalId = WebGPUGlobal.getId(this);
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

    copyToBuffer(buffer: WebGPUVertexBuffer | WebGPUDeviceBuffer, sourceOffset: number, destoffset: number, bytelength: number): void {
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