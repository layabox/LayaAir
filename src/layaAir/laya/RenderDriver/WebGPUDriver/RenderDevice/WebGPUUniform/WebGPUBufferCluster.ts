import { UniformBufferCluster } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferCluster";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferBlock } from "./WebGPUBufferBlock";
import { WebGPUBufferManager } from "./WebGPUBufferManager";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * Uniform内存块（大内存块）
 */
export class WebGPUBufferCluster extends UniformBufferCluster {
    globalId: number; //全局id
    objectName: string; //本对象名称

    declare manager: WebGPUBufferManager;

    constructor(blockSize: number, blockNum: number, manager: WebGPUBufferManager) {
        super(blockSize, blockNum, manager);
        this.objectName = 'WebGPUBufferCluster';
        this.globalId = WebGPUGlobal.getId(this);
        WebGPUGlobal.action(this, 'allocMemory', this._totalSize);
    }

    /**
     * 创建小内存块对象
     * @param index 
     * @param size 
     * @param alignedSize 
     * @param user 
     */
    protected _createBufferBlock(index: number, size: number, alignedSize: number, user: WebGPUUniformBuffer) {
        return new WebGPUBufferBlock(this, index, size, alignedSize, user);
    }

    /**
     * 扩展GPU缓冲区
     */
    protected _expandBuffer() {
        const ret = super._expandBuffer();
        // if (ret)
        //     this.manager.renderContext.notifyGPUBufferChange();
        return ret;
    }

    /**
     * 移动小内存块，后面的块向前移动，填补指定的内存空洞
     * @param index 
     */
    protected _moveBlock(index: number) {
        const ret = super._moveBlock(index);
        // if (ret)
        //     this.manager.renderContext.notifyGPUBufferChange();
        return ret;
    }

    /**
     * 优化小内存块顺序，上传频繁的块放前面
     */
    optimize() {
        const ret = super.optimize();
        // if (ret)
        //     this.manager.renderContext.notifyGPUBufferChange();
        return ret;
    }

    /**
     * 移除空洞，使小内存块连续
     */
    removeHole() {
        const ret = super.removeHole();
        // if (ret)
        //     this.manager.renderContext.notifyGPUBufferChange();
        return ret;
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy()) {
            WebGPUGlobal.action(this, 'releaseMemory | uniform', this._totalSize);
            WebGPUGlobal.releaseId(this);
            return true;
        }
        return false;
    }
}