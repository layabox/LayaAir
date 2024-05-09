import { roundDown, roundUp } from "./WebGPUCommon";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export enum WebGPUBufferUsage {
    MAP_READ = GPUBufferUsage.MAP_READ,
    MAP_WRITE = GPUBufferUsage.MAP_WRITE,
    COPY_SRC = GPUBufferUsage.COPY_SRC,
    COPY_DST = GPUBufferUsage.COPY_DST,
    INDEX = GPUBufferUsage.INDEX,
    VERTEX = GPUBufferUsage.VERTEX,
    UNIFORM = GPUBufferUsage.UNIFORM,
    STORAGE = GPUBufferUsage.STORAGE,
    INDIRECT = GPUBufferUsage.INDIRECT,
    QUERY_RESOLVE = GPUBufferUsage.QUERY_RESOLVE
}

export enum GPUMapModeFlag {
    READ = GPUMapMode.READ,
    Write = GPUMapMode.WRITE
}

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
    }

    setData(srcData: ArrayBuffer | ArrayBufferView, srcOffset: number) {
        let size = 0, offset = 0;
        if ((srcData as ArrayBufferView).buffer) { //@ts-ignore
            offset = srcData.byteOffset;
            size = roundDown(srcData.byteLength, 4); //这里需要进一步处理，目前是截断到4字节对齐，可能会导致数据不完整
            srcData = (srcData as ArrayBufferView).buffer;
        } else {
            offset = srcOffset;
            size = roundDown(srcData.byteLength - offset, 4); //这里需要进一步处理，目前是截断到4字节对齐，可能会导致数据不完整
        }
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, srcData, offset, size);
    }

    setDataEx(srcData: ArrayBuffer | ArrayBufferView, srcOffset: number, byteLength: number, dstOffset: number = 0) {
        // if ((srcData as ArrayBufferView).buffer)
        //     srcData = (srcData as ArrayBufferView).buffer;
        // const size = roundDown(byteLength, 4); //这里需要进一步处理，目前是截断到4字节对齐，可能会导致数据不完整
        let size = 0, offset = 0;
        if ((srcData as ArrayBufferView).buffer) { //@ts-ignore
            offset = srcData.byteOffset;
            size = roundDown(srcData.byteLength, 4); //这里需要进一步处理，目前是截断到4字节对齐，可能会导致数据不完整
            srcData = (srcData as ArrayBufferView).buffer;
        } else {
            offset = srcOffset;
            size = roundDown(byteLength, 4); //这里需要进一步处理，目前是截断到4字节对齐，可能会导致数据不完整
        }
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, srcData, offset, size);
    }

    readDataFromBuffer() {
        //TODO
        //mapAsync
        //getMappedRange
        //gpuBuffer.unmap();
    }

    release() {
        //好像需要延迟删除
        WebGPUGlobal.releaseId(this);
        this._source.destroy();
    }
}