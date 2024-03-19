import { WebGPUBufferBlock } from "./WebGPUBufferBlock";
import { WebGPUBufferCluster } from "./WebGPUBufferCluster";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * GPU内存块管理
 */
export class WebGPUBufferManager {
    device: GPUDevice;
    namedBuffers: Map<string, WebGPUBufferCluster>;

    static snCounter: number = 0;

    constructor(device: GPUDevice) {
        this.device = device;
        this.namedBuffers = new Map();
    }

    /**
     * 添加内存
     * @param name 
     * @param sliceSize 
     * @param sliceNum 
     * @param single 
     */
    addBuffer(name: string, sliceSize: number, sliceNum: number, single: boolean = false) {
        if (this.namedBuffers.has(name)) {
            console.warn(`namedBuffer with name: ${name} already exist!`);
            return false;
        }
        this.namedBuffers.set(name, new WebGPUBufferCluster(this.device, name, sliceSize, sliceNum, single));
        return true;
    }

    /**
     * 删除内存
     * @param name 
     */
    removeBuffer(name: string) {
        this.namedBuffers.delete(name);
    }

    /**
     * 获取内存块
     * @param name 
     */
    getBuffer(name: string) {
        return this.namedBuffers.get(name)?.buffer;
    }

    /**
     * 获取内存块
     * @param name 
     * @param size 
     * @param user 
     */
    getBlock(name: string, size: number, user: WebGPUUniformBuffer) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.getBlock(size, user);
        return null;
    }

    /**
     * 释放内存块
     * @param name 
     * @param bb 
     */
    freeBlock(name: string, bb: WebGPUBufferBlock) {
        const buffer = this.namedBuffers.get(name);
        if (buffer)
            return buffer.freeBlock(bb);
        return false;
    }

    /**
     * 清理内存
     * @param name 
     */
    clearBuffer(name: string) {
        this.namedBuffers.delete(name);
    }

    /**
     * 上传数据
     */
    upload() {
        this.namedBuffers.forEach(buf => buf.upload());
    }

    /**
     * 清理所有内存
     */
    clear() {
        this.namedBuffers.forEach(buf => buf.clear());
    }

    /**
     * 销毁
     */
    destroy() {
        this.namedBuffers.clear();
    }
}