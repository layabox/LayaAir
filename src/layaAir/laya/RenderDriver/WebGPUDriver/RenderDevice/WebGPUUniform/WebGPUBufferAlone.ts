import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPUStatis } from "../WebGPUStatis/WebGPUStatis";

/**
 * 单独的GPUBuffer
 */
export class WebGPUBufferAlone {
    queue: GPUQueue;
    buffer: GPUBuffer;
    data: ArrayBuffer;
    size: number;

    constructor(buffer: GPUBuffer, size: number) {
        this.queue = WebGPURenderEngine._instance.getDevice().queue;
        this.data = new ArrayBuffer(size);
        this.buffer = buffer;
        this.size = size;
    }

    upload() {
        this.queue.writeBuffer(this.buffer, 0, this.data);
        WebGPUStatis.addUploadNum(1);
        WebGPUStatis.addUploadBytes(this.size);

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_UniformBufferUploadCount, 1);
    }

    destroy() {
        this.buffer.destroy();
        this.queue = null;
        this.data = null;

        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this.size);
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUBuffer, -this.size);
    }
}