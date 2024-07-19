import { WebGPUGlobal } from "../WebGPUStatis/WebGPUGlobal";
import { WebGPUBufferCluster } from "./WebGPUBufferCluster";
import { WebGPUUniformBuffer } from "./WebGPUUniformBuffer";

/**
 * GPU内存块（小内存块）
 */
export class WebGPUBufferBlock {
    sn: number; //序列号
    buffer: WebGPUBufferCluster; //大内存管理对象
    index: number; //在大内存中的序号
    offset: number; //在大内存中的偏移
    size: number; //实际尺寸
    alignedSize: number; //256字节对齐后的尺寸
    user: WebGPUUniformBuffer; //内存块使用者
    destroyed: boolean; //该内存块是否已经销毁

    globalId: number; //全局id
    objectName: string; //本对象名称

    constructor(sn: number, buffer: WebGPUBufferCluster, index: number, size: number, alignedSize: number, user: WebGPUUniformBuffer) {
        this.sn = sn;
        this.buffer = buffer;
        this.index = index;
        this.size = size;
        this.alignedSize = alignedSize;
        this.offset = alignedSize * index;
        this.user = user;
        this.destroyed = false;

        this.objectName = 'WebGPUBufferBlock | ' + buffer.name;
        this.globalId = WebGPUGlobal.getId(this);
        //WebGPUGlobal.action(this, 'getMemory', alignedSize);
    }

    needUpload() {
        this.buffer.needUpload[this.index] = true;
    }

    destroy() {
        if (!this.destroyed) {
            //WebGPUGlobal.action(this, 'returnMemory | uniform', this.alignedSize);
            WebGPUGlobal.releaseId(this);
            this.destroyed = true;
        }
    }
}