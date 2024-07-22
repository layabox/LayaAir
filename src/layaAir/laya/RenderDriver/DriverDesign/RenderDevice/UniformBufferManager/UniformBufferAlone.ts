import { roundUp, UniformBufferManager } from "./UniformBufferManager";

/**
 * 单独的UniformBuffer
 */
export class UniformBufferAlone {
    buffer: any; //GPU内存
    data: ArrayBuffer;
    size: number; //尺寸
    alignedSize: number; //字节对齐后的尺寸
    manager: UniformBufferManager; //管理器
    destroyed: boolean = false; //该对象是否已经销毁

    constructor(size: number, manager: UniformBufferManager) {
        this.data = new ArrayBuffer(size);
        this.buffer = manager.getBufferAlone(size);
        this.manager = manager;
        this.size = size;
        this.alignedSize = roundUp(size, manager.byteAlign);
    }

    /**
     * 上传数据
     */
    upload() {
        //上传数据
        const t = performance.now();
        this.manager.writeBuffer(this.buffer, this.data, 0, this.size);
        this.manager.timeCostSum += performance.now() - t;
        this.manager.timeCostCount++;
        if (this.manager.timeCostCount > 100) {
            this.manager.timeCostAvg = (this.manager.timeCostSum / this.manager.timeCostCount) * 1000 | 0;
            this.manager.timeCostSum = 0;
            this.manager.timeCostCount = 0;
        }

        //记录上传次数，字节数
        this.manager.uploadNum++;
        this.manager.uploadByte += this.size;
        this.manager.statisUpload(1, this.size);
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this.destroyed) {
            this.data = null;
            this.buffer.destroy ?? this.buffer.destroy();
            this.manager.statisGPUMemory(-this.size);
            this.destroyed = true;
            return true;
        }
        console.warn('UniformBufferAlone: object alreay destroyed!');
        return false;
    }
}