import { UniformBufferCluster } from "./UniformBufferCluster";
import { UniformBufferWriter } from "./UniformBufferWriter";

/**
 * Uniform内存块（小内存块）
 * 既是 cluster 内的记账单元(offset/size/index),也是数据写入器(继承 UniformBufferWriter)。
 * 后端子类(WebGPUSubUniformBuffer / WebGLSubUniformBuffer)再补 bind / getBindGroupEntry / 视图重建。
 */
export class UniformBufferBlock extends UniformBufferWriter {
    private static _idCounter: number = 0; //编号计数器
    protected _destroyed: boolean = false; //该对象是否已经销毁

    /** @internal */
    _id: number; //编号，UniformBufferBlock中唯一

    cluster: UniformBufferCluster; //大内存管理对象
    index: number; //在大内存中的序号
    offset: number; //在大内存中的偏移
    size: number; //实际尺寸

    protected _alignedSize: number; //字节对齐后的尺寸

    constructor(cluster: UniformBufferCluster, index: number, size: number, alignedSize: number) {
        super();
        this._id = UniformBufferBlock._idCounter++;
        this.cluster = cluster;
        this.index = index;
        this.size = size;
        this._alignedSize = alignedSize;
        this.offset = alignedSize * index;
    }

    /**
     * 标记本块需要上传:置标志 + 登记 cluster 脏位,维持不变量 needUpload === cluster._needUpload[index]。
     * 绕过 setter 直接写 view 的调用方必须调用本方法。
     */
    markDirty() {
        this.needUpload = true;
        this.cluster._addUploadBlock(this.index);
    }

    /** 池化块:写完 view 即登记脏位;已脏则短路。两个后端叶类共用。 */
    protected _dirty(): void {
        if (this.needUpload) return;
        this.markDirty();
    }

    /** 上传完成回调，由 Cluster.upload() 调用 */
    updateOver() {
        this.needUpload = false;
    }

    /** 池内存扩容/移洞后由 Cluster 调:基类只纠正 offset,后端子类 override 再重建 view */
    onRelocated(info?: string) {
        this.offset = this._alignedSize * this.index;
    }

    /** 创建者发起释放:只委托 manager.freeBlock,绝不在此清空 cluster(否则 freeBlock 读不到 cluster→块不移除→泄漏) */
    destroy(): boolean {
        if (this._destroyed) return false;
        return this.cluster.manager.freeBlock(this);
    }

    /** @internal 仅允许 Cluster 在移除 slot 后调用,收尾清空 */
    _onFreed() {
        this._destroyed = true;
        this.cluster = null;
        this.descriptor = null;
    }
}
