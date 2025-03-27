import { UniformBufferManager } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferManager";
import { WebGPURenderEngine } from "../WebGPURenderEngine";

/**
 * Uniform内存块管理
 */
export class WebGPUBufferManager extends UniformBufferManager {
    constructor(engine: WebGPURenderEngine, useBigBuffer: boolean) {
        super(useBigBuffer);
        engine.on("endFrame", this, this.endFrame);
        engine.on("startFrame", this, this.startFrame);
    }

    /**
     * 销毁
     */
    destroy() {
        return false;
    }

    /**
     * 创建GPU内存对象
     * @param size 字节长度
     * @param name 名称
     */
    createGPUBuffer(size: number, name?: string) {
        return WebGPURenderEngine._instance.getDevice().createBuffer({
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
        WebGPURenderEngine._instance.getDevice().queue.writeBuffer(buffer, offset, data, offset, size);
    }

    /**
     * 统计GPU内存使用量
     * @param bytes 字节
     */
    statisGPUMemory(bytes: number) {
        super.statisGPUMemory(bytes);

    }

    /**
     * 统计上传次数
     * @param count 上传次数
     * @param bytes 上传字节
     */
    statisUpload(count: number, bytes: number) {
        super.statisUpload(count, bytes);

    }
}