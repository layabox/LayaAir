import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { roundUp } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPUBuffer {
    _source: GPUBuffer;
    _usage: GPUBufferUsageFlags;
    _size: number = 0;

    private _isCreate: boolean = false;
    private _mappedAtCreation = false;

    globalId: number;
    objectName: string = 'WebGPUBuffer';

    constructor(usage: GPUBufferUsageFlags, byteSize: number = 0, mappedAtCreation: boolean = false) {
        this._size = roundUp(byteSize, 4);
        this._usage = usage;
        this._mappedAtCreation = mappedAtCreation;
        this.globalId = WebGPUGlobal.getId(this);
        if (this._size > 0)
            this._create();
    }

    /**
     * @param length 
     */
    setDataLength(length: number): void {
        const size = roundUp(length, 4);
        if (!this._isCreate || this._size != size) {
            WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this._size);
            WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, -this._size);
            this._size = size;
            this._create();
        }
    }

    private _create() {
        this._source = WebGPURenderEngine._instance.getDevice().createBuffer({
            size: this._size,
            usage: this._usage,
            mappedAtCreation: this._mappedAtCreation
        });
        this._isCreate = true;
        WebGPUGlobal.action(this, 'allocMemory | buffer', this._size);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, this._size);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, this._size);
    }

    setData(srcData: ArrayBuffer | ArrayBufferView, srcOffset: number) {
        let size = 0, offset = 0;
        let buffer = (srcData as ArrayBufferView).buffer;
        if (buffer) {
            offset = (srcData as ArrayBufferView).byteOffset + srcOffset;
            size = roundUp(srcData.byteLength, 4);
            if (size > srcData.byteLength) {
                const buffer2 = new ArrayBuffer(size);
                new Uint8Array(buffer2).set(new Uint8Array(buffer, offset, srcData.byteLength));
                buffer = buffer2;
                offset = 0;
            }
            if (this._mappedAtCreation) {
                new Uint8Array(this._source.getMappedRange(0, size)).set(new Uint8Array(buffer, offset, size));
                this._mappedAtCreation = false;
                this._source.unmap();
            } else WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, buffer, offset, size);
        } else {
            offset = srcOffset;
            size = roundUp(srcData.byteLength - offset, 4);
            if (size > srcData.byteLength - offset) {
                const buffer2 = new ArrayBuffer(size);
                new Uint8Array(buffer2).set(new Uint8Array(srcData as ArrayBuffer, offset, srcData.byteLength - offset));
                srcData = buffer2;
                offset = 0;
            }
            if (this._mappedAtCreation) {
                new Uint8Array(this._source.getMappedRange(0, size)).set(new Uint8Array(srcData as ArrayBuffer, offset, size));
                this._mappedAtCreation = false;
                this._source.unmap();
            } else WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, srcData, offset, size);
        }
    }

    setDataEx(srcData: ArrayBuffer | ArrayBufferView, srcOffset: number, byteLength: number, dstOffset: number = 0) {
        let size = 0, offset = 0;
        let buffer = (srcData as ArrayBufferView).buffer;
        if (buffer) {
            offset = (srcData as ArrayBufferView).byteOffset + srcOffset;
            size = roundUp(srcData.byteLength, 4);
            if (size > srcData.byteLength) {
                const buffer2 = new ArrayBuffer(size);
                new Uint8Array(buffer2).set(new Uint8Array(buffer, offset, srcData.byteLength));
                buffer = buffer2;
                offset = 0;
            }
            if (this._mappedAtCreation) {
                new Uint8Array(this._source.getMappedRange(dstOffset, size)).set(new Uint8Array(buffer, offset, size));
                this._mappedAtCreation = false;
                this._source.unmap();
            } else WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, buffer, offset, size);
        } else {
            offset = srcOffset;
            size = roundUp(byteLength, 4);
            if (size > byteLength) {
                const buffer2 = new ArrayBuffer(size);
                new Uint8Array(buffer2).set(new Uint8Array(srcData as ArrayBuffer, offset, byteLength));
                srcData = buffer2;
                offset = 0;
            }
            if (this._mappedAtCreation) {
                new Uint8Array(this._source.getMappedRange(dstOffset, size)).set(new Uint8Array(srcData as ArrayBuffer, offset, size));
                this._mappedAtCreation = false;
                this._source.unmap();
            } else WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, srcData, offset, size);
        }
    }

    readDataFromBuffer(): Promise<Uint8Array> {
        //TODO
        //mapAsync
        //getMappedRange
        //gpuBuffer.unmap();
        return new Promise((resolve, reject) => {
            //映射 GPUBuffer 以供读取
            this._source.mapAsync(GPUMapMode.READ)
                .then(() => {
                    //成功映射后获取 ArrayBuffer
                    const arrayBuffer = this._source.getMappedRange();
                    const data = new Uint8Array(arrayBuffer).slice();
                    this._source.unmap();
                    //返回读取的数据
                    resolve(data);
                })
                .catch(error => { //处理映射失败的情况
                    this._source.unmap(); //确保即使出错也取消映射
                    reject(error);
                });
        });
    }

    async readFromBuffer(buffer: GPUBuffer, size: number) {
        await buffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = buffer.getMappedRange();
        const data = new Float32Array(arrayBuffer).slice(0, size / 4);  // size / 4 because Float32Array elements are 4 bytes.
        buffer.unmap();
        return data;
    }

    release() {
        //好像需要延迟删除
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this._size);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, -this._size);
        WebGPUGlobal.releaseId(this);
        //this._source.destroy(); //WebGPU会自动删除
    }
}