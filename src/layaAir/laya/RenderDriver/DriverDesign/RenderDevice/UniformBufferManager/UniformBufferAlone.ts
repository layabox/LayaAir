import { roundUp, UniformBufferManager } from "./UniformBufferManager";

/**
 * 单独的UniformBuffer
 */
export class UniformBufferAlone {

    private _destroyed: boolean = false; //该对象是否已经销毁

    buffer: any; //GPU内存

    data: ArrayBuffer;

    size: number; //尺寸

    alignedSize: number; //字节对齐后的尺寸

    manager: UniformBufferManager; //管理器

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
        if (this.manager._enableStat) {
            this.manager._state.timeCostSum += performance.now() - t;
            this.manager._state.timeCostCount++;
            if (this.manager._state.timeCostCount > 100) {
                this.manager._state.timeCostAvg = (this.manager._state.timeCostSum / this.manager._state.timeCostCount) * 1000 | 0;
                this.manager._state.timeCostSum = 0;
                this.manager._state.timeCostCount = 0;
            }
            //记录上传次数，字节数
            this.manager._state.uploadNum++;
            this.manager._state.uploadByte += this.size;
            this.manager.statisUpload(1, this.size);
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this.data = null;
            this.buffer.destroy ?? this.buffer.destroy();
            this.manager.statisGPUMemory(-this.size);
            this._destroyed = true;
            return true;
        }
        console.warn('UniformBufferAlone: object alreay destroyed!');
        return false;
    }
}