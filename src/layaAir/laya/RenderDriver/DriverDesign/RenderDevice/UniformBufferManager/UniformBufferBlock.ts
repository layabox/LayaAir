import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferCluster } from "./UniformBufferCluster";

/**
 * Uniform内存块（小内存块）
 */
export class UniformBufferBlock {

    private _destroyed: boolean = false; //该对象是否已经销
    /**@internal */
    _sn: number; //序列号

    cluster: UniformBufferCluster; //大内存管理对象

    index: number; //在大内存中的序号

    offset: number; //在大内存中的偏移

    size: number; //实际尺寸

    alignedSize: number; //字节对齐后的尺寸

    uploadNum: number; //上传次数

    moved: boolean; //是否已经完成移动

    user: IUniformBufferUser; //内存块使用者

    constructor(cluster: UniformBufferCluster, index: number, size: number, alignedSize: number, user: IUniformBufferUser) {
        this._sn = cluster.manager._snCounter++;
        this.cluster = cluster;
        this.index = index;
        this.size = size;
        this.alignedSize = alignedSize;
        this.offset = alignedSize * index;
        this.user = user;
        this.uploadNum = 0;
        this.moved = false;
    }

    /**
     * 标记块需要上传
     */
    needUpload() {
        if (this.user.needUpload) {
            this.cluster._addUploadBlock(this.index);
            if (!this.moved && this.uploadNum++ > this.cluster.manager.uploadThreshold) {
                this.cluster.manager._addoptimizeBufferPos(this.cluster);
            }
        }
    }



    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this.cluster = null;
            this.user = null;
            this._destroyed = true;
            return true;
        }
        console.warn('UniformBufferBlock: object alreay destroyed!');
        return false;
    }
}