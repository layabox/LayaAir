import { WebGPURenderEngine } from "./WebGPURenderEngine";

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
    _size: number = 0;//bytelength

    private _isCreate: boolean = false;
    private _mappedAtCreation = false;

    constructor(usage: GPUBufferUsageFlags, byteSize: number = 0, mappedAtCreation: boolean = false) {
        this._size = byteSize;
        this._usage = usage;
        this._mappedAtCreation = mappedAtCreation;
        if (this._size > 0) {
            this._create();
        }
    }

    /**
     * 
     * @param srcData 
     */
    setDataLength(srcData: number): void {
        this._size = srcData;
        this._create();
    }


    private _create() {
        if (this._isCreate) {
            console.error("Buffer is Created");
            return;
        }
        this._source = WebGPURenderEngine._instance.getDevice().createBuffer({
            size: this._size,
            usage: this._usage,
            mappedAtCreation: this._mappedAtCreation
        });
        this._isCreate = true;
    }

    private _alignedLength(bytelength: number) {
        return (bytelength + 3) & ~3;// 4 bytes alignments (because of the upload which requires this)
    }


    private _memorychange(bytelength: number) {
        // this._engine._addStatisticsInfo(RenderStatisticsInfoMemory, bytelength);
        // this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, bytelength);
    }


    setData(srcData: ArrayBuffer | ArrayBufferView, offset: number) {
        if ((srcData as ArrayBufferView).buffer) {
            srcData = (srcData as ArrayBufferView).buffer;
        }
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, 0, srcData, offset, srcData.byteLength);
    }

    setDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, bytelength: number, dstOffset: number = 0) {
        if ((srcData as ArrayBufferView).buffer) {
            srcData = (srcData as ArrayBufferView).buffer;
        }
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, srcData, offset, bytelength);
    }

    setSubDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, bytelength: number, dstOffset: number = 0) {
        if ((srcData as ArrayBufferView).buffer) {
            srcData = (srcData as ArrayBufferView).buffer;
        }
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(this._source, dstOffset, srcData, offset, bytelength);
    }

    //TODO
    readDataFromBuffer() {
        //TODO
        //mapAsync
        //getMappedRange
        //gpuBuffer.unmap();
    }



    release() {
        //好像需要延迟删除
        this._source.destroy();
    }

}