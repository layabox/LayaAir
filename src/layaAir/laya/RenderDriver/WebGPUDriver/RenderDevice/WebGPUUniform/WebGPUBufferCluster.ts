import { UniformBufferCluster } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferCluster";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferManager } from "./WebGPUBufferManager";

/**
 * Uniform内存块（大内存块）
 */
export class WebGPUBufferCluster extends UniformBufferCluster {
    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(blockSize: number, blockNum: number, manager: WebGPUBufferManager) {
        super(blockSize, blockNum, manager);
        this.objectName = 'WebGPUBufferCluster';
        this.globalId = WebGPUGlobal.getId(this);
        WebGPUGlobal.action(this, 'allocMemory', this.totalSize);
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy()) {
            WebGPUGlobal.action(this, 'releaseMemory | uniform', this.totalSize);
            WebGPUGlobal.releaseId(this);
            return true;
        }
        return false;
    }
}