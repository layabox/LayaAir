import { Laya } from "../../../../../Laya";
import { IUniformBufferUser } from "./IUniformBufferUser";
import { roundUp, UniformBufferManager } from "./UniformBufferManager";

/**
 * 单独的UniformBuffer
 */
export class UniformBufferAlone {
    private _destroyed: boolean = false; //该对象是否已经销毁
    private _manager: UniformBufferManager; //管理器

    buffer: any; //GPU内存
    data: ArrayBuffer;
    uploadNum: number = 0; //上传次数
    user: IUniformBufferUser; //内存块使用者

    protected _size: number; //尺寸
    protected _alignedSize: number; //字节对齐后的尺寸

    constructor(size: number, manager: UniformBufferManager, user: IUniformBufferUser) {
        this.data = new ArrayBuffer(size);
        this.buffer = manager.getBufferAlone(size);
        this._manager = manager;
        this._size = size;
        this._alignedSize = roundUp(size, manager.byteAlign);

        this.user = user;
        manager.aloneBuffers.push(this);
    }

    /**
     * 上传数据
     */
    upload() {
        let t: number;
        if (this._manager._enableStat)
            t = performance.now();
        this.uploadNum++;
        this._manager.writeBuffer(this.buffer, this.data, 0, this._size);
        if (this._manager._enableStat) {
            //记录上传次数，字节数
            this._manager.statisUpload(1, this._size);
            //记录时间，用于计算上传耗费的平均时间
            this._manager.statisTimeCostAvg(performance.now() - t);
        }
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this.data = null;
            if (this.buffer.destroy)
                this.buffer.destroy();
            this._manager.statisGPUMemory(-this._size);
            this._manager.aloneBuffers.splice(this._manager.aloneBuffers.indexOf(this), 1);
            this._destroyed = true;
            return true;
        }
        console.warn('UniformBufferAlone: object alreay destroyed!');
        return false;
    }
}