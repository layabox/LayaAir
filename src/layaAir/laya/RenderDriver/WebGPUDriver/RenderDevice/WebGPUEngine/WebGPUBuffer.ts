import { WebGPUEngine } from "./WebGPUEngine";
import { WebGPUObject } from "./WebGPUObject";

/**
 */
export enum GPUBUfferUsage {
    MAP_READ = 0x0001,//can call mapAsync,only be combined with COPY_DST
    MAP_WRITE = 0x0002,//can call mapAsync,only be combined with COPY_SRC
    COPY_SRC = 0x0004,//copyBufferToBuffer() or copyBufferToTexture() 
    COPY_DST = 0x0008, //copyBufferToBuffer() or copyTextureToBuffer() call,writeBuffer() call
    INDEX = 0x0010,
    VERTEX = 0x0020,
    UNIFORM = 0x0040,
    STORAGE = 0x0080,
    INDIRECT = 0x0100,
    QUERY_RESOLVE = 0x0200
}

enum GPUMapModeFlag {
    READ = 1,
    Write = 2
}

export class WebGPUBuffer extends WebGPUObject {
    _gpuBuffer: GPUBuffer;
    _gpuUsage: GPUBufferUsageFlags;
    _size: number = 0;//bytelength

    private _isCreate: boolean = false;
    private _mappedAtCreation = false;

    constructor(engine: WebGPUEngine, usage: GPUBufferUsageFlags, byteSize: number = 0, mappedAtCreation: boolean = false) {
        super(engine);
        this._gpuUsage = usage;
        this._size = byteSize;
        this._gpuUsage = usage;
        this._mappedAtCreation = mappedAtCreation;
        if (this._size > 0) {
            this._create();
        }
    }
    bindBuffer(): boolean {
        // TODO
        return false;
    }
    unbindBuffer(): void {
        //TODO
    }
    bindBufferBase(glPointer: number): void {
        //TODO
    }
    bindBufferRange(glPointer: number, offset: number, byteCount: number): void {
        //TODO
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
        this._gpuBuffer = this._engine._device.createBuffer({
            size: this._size,
            usage: this._gpuUsage,
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
        if((srcData as ArrayBufferView).buffer){
            srcData = (srcData as ArrayBufferView).buffer;
        }
        this._engine._device.queue.writeBuffer(this._gpuBuffer, 0, srcData, offset, srcData.byteLength);
    }

    setDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, bytelength: number, dstOffset: number = 0) {
        if((srcData as ArrayBufferView).buffer){
            srcData = (srcData as ArrayBufferView).buffer;
        }
        this._engine._device.queue.writeBuffer(this._gpuBuffer, dstOffset, srcData, offset, bytelength);
    }

    setSubDataEx(srcData: ArrayBuffer | ArrayBufferView, offset: number, bytelength: number, dstOffset: number = 0) {
        if((srcData as ArrayBufferView).buffer){
            srcData = (srcData as ArrayBufferView).buffer;
        }
        this._engine._device.queue.writeBuffer(this._gpuBuffer, dstOffset, srcData, offset, bytelength);
    }

    //TODO
    readDataFromBuffer() {
        //TODO
        //mapAsync
        //getMappedRange
        //gpuBuffer.unmap();
    }

    destroy() {
        let defferdArray = this._engine._deferredDestroyBuffers;
        if (defferdArray.indexOf(this) == -1)
            defferdArray.push(this);
    }

    release() {
        if (!this.destroyed) {
            this._gpuBuffer.destroy();
            super.destroy();
        }
    }

}