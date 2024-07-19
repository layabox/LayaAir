import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { roundUp } from "../WebGPUCommon";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUBufferBlock } from "./WebGPUBufferBlock";
import { WebGPUBufferCluster } from "./WebGPUBufferCluster";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * GPU内存块管理
 */
export class WebGPUBufferManager {
    device: GPUDevice;
    renderContext: any;
    sizedBuffers: Map<number, WebGPUBufferCluster>; //按尺寸分组

    byteAlign: number = 256; //字节对齐
    snCounter: number = 0; //序号计数器
    uploadThreshold: number = 200; //判定为动态块的上传次数阈值

    uploadNum: number = 0; //每帧上传次数
    uploadByte: number = 0; //每帧上传字节数

    constructor(device: GPUDevice) {
        this.device = device;
        this.sizedBuffers = new Map();
    }

    /**
     * 设置渲染上下文
     * @param rc 
     */
    setRenderContext(rc: any) {
        this.renderContext = rc;
        this.sizedBuffers.forEach(buf => buf.setRenderContext(rc));
    }

    /**
     * 获取单独的GPUBuffer
     * @param size 
     * @param name 
     */
    getBufferAlone(size: number, name?: string) {
        const alignedSize = roundUp(size, this.byteAlign);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, alignedSize);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, alignedSize);
        return this.device.createBuffer({
            label: name,
            size: alignedSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }

    /**
     * 添加内存
     * @param size 
     * @param blockNum 
     */
    private _addBuffer(size: number, blockNum: number = 1) {
        const alignedSize = roundUp(size, this.byteAlign);
        let buffer = this.sizedBuffers.get(alignedSize);
        if (buffer) {
            console.warn(`sizedBuffer with size: ${alignedSize} already exist!`);
            return buffer;
        }
        buffer = new WebGPUBufferCluster(this.device, '', alignedSize, blockNum, this);
        buffer.setRenderContext(this.renderContext);
        this.sizedBuffers.set(alignedSize, buffer);
        return buffer;
    }

    /**
     * 删除内存
     * @param size 
     */
    removeBuffer(size: number) {
        const alignedSize = roundUp(size, this.byteAlign);
        this.sizedBuffers.delete(alignedSize);
    }

    /**
     * 获取内存块
     * @param size 
     * @param user 
     */
    getBlock(size: number, user: WebGPUUniformBuffer) {
        const alignedSize = roundUp(size, this.byteAlign);
        let buffer = this.sizedBuffers.get(alignedSize);
        if (!buffer)
            buffer = this._addBuffer(alignedSize);
        return buffer.getBlock(size, user);
    }

    /**
     * 释放内存块
     * @param size 
     * @param bb 
     */
    freeBlock(size: number, bb: WebGPUBufferBlock) {
        const alignedSize = roundUp(size, this.byteAlign);
        const buffer = this.sizedBuffers.get(alignedSize);
        if (buffer)
            return buffer.freeBlock(bb);
        return false;
    }

    /**
     * 上传数据
     */
    upload() {
        this.uploadNum = 0;
        this.uploadByte = 0;
        this.sizedBuffers.forEach(buf => { buf.upload(); buf.optimize(); });
        //console.log('uploadNum = ' + this.uploadNum + ', uploadByte = ' + this.uploadByte);
    }

    /**
     * 清理所有内存
     */
    clear() {
        this.sizedBuffers.forEach(buf => buf.clear());
    }

    /**
     * 销毁
     */
    destroy() {
        this.sizedBuffers.clear();
    }
}