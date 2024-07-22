import { UniformBufferBlock } from "../../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferCluster } from "./WebGPUBufferCluster";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * Uniform内存块（小内存块）
 */
export class WebGPUBufferBlock extends UniformBufferBlock {
    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(sn: number, buffer: WebGPUBufferCluster, index: number, size: number, alignedSize: number, user: WebGPUUniformBuffer) {
        super(sn, buffer, index, size, alignedSize, user);
        this.objectName = 'WebGPUBufferBlock';
        this.globalId = WebGPUGlobal.getId(this);
        WebGPUGlobal.action(this, 'getMemory', this.alignedSize);
    }

    /**
     * 销毁
     */
    destroy() {
        if (super.destroy()) {
            WebGPUGlobal.action(this, 'returnMemory | uniform', this.alignedSize);
            WebGPUGlobal.releaseId(this);
            return true;
        }
        return false;
    }
}