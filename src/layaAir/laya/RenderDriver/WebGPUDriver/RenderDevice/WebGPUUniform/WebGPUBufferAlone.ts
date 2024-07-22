import { UniformBufferAlone } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferAlone";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferManager } from "./WebGPUBufferManager";

/**
 * 单独的UniformBuffer
 */
export class WebGPUBufferAlone extends UniformBufferAlone {
    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(size: number, manager: WebGPUBufferManager) {
        super(size, manager);
        this.objectName = 'WebGPUBufferAlone';
        this.globalId = WebGPUGlobal.getId(this);
        WebGPUGlobal.action(this, 'allocMemory', this.alignedSize);
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy()) {
            WebGPUGlobal.action(this, 'releaseMemory | uniform', this.alignedSize);
            WebGPUGlobal.releaseId(this);
            return true;
        }
        return false;
    }
}