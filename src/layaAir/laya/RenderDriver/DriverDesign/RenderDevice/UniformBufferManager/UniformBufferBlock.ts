import { IUniformBufferUser } from "./IUniformBufferUser";
import { UniformBufferCluster } from "./UniformBufferCluster";

/**
 * Uniform内存块（小内存块）
 */
export class UniformBufferBlock {
    private static _idCounter: number = 0; //编号计数器
    private _destroyed: boolean = false; //该对象是否已经销

    /**
     * @internal
     */
    _id: number; //编号，UniformBufferBlock中唯一

    cluster: UniformBufferCluster; //大内存管理对象
    index: number; //在大内存中的序号
    offset: number; //在大内存中的偏移
    size: number; //实际尺寸

    protected _alignedSize: number; //字节对齐后的尺寸

    uploadNum: number; //上传次数
    moved: boolean; //是否已经完成移动
    user: IUniformBufferUser; //内存块使用者

    constructor(cluster: UniformBufferCluster, index: number, size: number, alignedSize: number, user: IUniformBufferUser) {
        this._id = UniformBufferBlock._idCounter++;
        this.cluster = cluster;
        this.index = index;
        this.size = size;
        this._alignedSize = alignedSize;
        this.offset = alignedSize * index;
        this.user = user;
        this.uploadNum = 0;
        this.moved = false;
    }

    /**
     * 标记块需要上传
     */
    needUpload() {
        this.cluster._addUploadBlock(this.index);
        if (!this.moved && this.uploadNum++ > this.cluster.manager.uploadThreshold)
            this.cluster.manager._addOptimizeBufferPos(this.cluster);
    }

    /**
     * 销毁
     */
    destroy() {
        if (!this._destroyed) {
            this._destroyed = true;
            this.cluster = null;
            this.user = null;
            return true;
        }
        console.warn('UniformBufferBlock: object alreay destroyed!');
        return false;
    }
}