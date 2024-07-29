import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { UniformBufferManager } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUStatis } from "../WebGPUStatis/WebGPUStatis";

/**
 * Uniform内存块管理
 */
export class WebGPUBufferManager extends UniformBufferManager {
    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(useBigBuffer: boolean) {
        super(useBigBuffer);
        this.objectName = 'WebGPUBufferManager';
        this.globalId = WebGPUGlobal.getId(this);
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy())
            return true;
        return false;
    }

    /**
     * 创建GPU内存对象
     * @param size 字节长度
     * @param name 名称
     */
    createGPUBuffer(size: number, name?: string) {
        return this.renderContext.device.createBuffer({
            label: name,
            size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
    }
    
    /**
     * 将数据写入GPU内存
     * @param buffer GPU内存对象
     * @param data CPU数据对象
     * @param offset 数据在大内存中的偏移量（字节）
     * @param size 写入的数据长度（字节）
     */
    writeBuffer(buffer: any, data: ArrayBuffer, offset: number, size: number) {
        this.renderContext.device.queue.writeBuffer(buffer, offset, data, offset, size);
    }

    /**
     * 统计GPU内存使用量
     * @param bytes 字节
     */
    statisGPUMemory(bytes: number) {
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, bytes);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, bytes);
        WebGPUGlobal.action(this, 'expandMemory | uniform', bytes);
    }

    /**
     * 统计上传次数
     * @param count 上传次数
     * @param bytes 上传字节
     */
    statisUpload(count: number, bytes: number) {
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_UniformBufferUploadCount, count);
        WebGPUStatis.addUploadNum(count);
        WebGPUStatis.addUploadBytes(bytes);
    }
}