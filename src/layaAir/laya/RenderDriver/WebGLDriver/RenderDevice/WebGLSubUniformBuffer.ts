import { IUniformLayout } from "../../DriverDesign/RenderDevice/UniformBufferManager/IUniformLayout";
import { UniformBufferBlock } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferBlock";
import { UniformBufferCluster } from "../../DriverDesign/RenderDevice/UniformBufferManager/UniformBufferCluster";
import { GLBuffer } from "./WebGLEngine/GLBuffer";
import { IWebGLUniformBuffer } from "./IWebGLUniformBuffer";

/**
 * 池化小块 + 写入器合体:本类即 UniformBufferBlock 子类,持 cluster 内 offset/size 与 setXxx 视图。
 * WebGL 无 bindGroup/observer,搬迁后只需重建 view。释放走基类,不 override destroy()。
 */
export class WebGLSubUniformBuffer extends UniformBufferBlock implements IWebGLUniformBuffer {

    constructor(cluster: UniformBufferCluster, index: number, size: number, alignedSize: number, descriptor: IUniformLayout) {
        super(cluster, index, size, alignedSize);
        this.descriptor = descriptor;
        this._rebuildViews();
        this.needUpload = true;
        this.markDirty();
    }

    /** view 绑到 cluster.data 上 u.offset + block.offset 处 */
    private _rebuildViews() {
        this.descriptor.uniforms.forEach(u => {
            let size = u.viewByteLength / u.dataView.BYTES_PER_ELEMENT;
            u.view = new u.dataView(this.cluster.data, u.offset + this.offset, size);
        });
    }

    bind(location: number): void {
        (this.cluster.buffer as GLBuffer).bindBufferRange(location, this.offset, this.size);
    }

    onRelocated(info?: string): void {
        super.onRelocated(info);
        this._rebuildViews();
        // 不变量:WebGL 只有 expand 是自愈的——新 buffer 已由 createGPUBuffer(data) 整体初始化、
        // 且块 offset 不变。任何改变 offset 的 relocate(如空洞压缩 moveBlock)都会把数据搬到
        // GPU 新位置,而新位置仍是旧内容,干净块也须重传,否则 GPU 读到脏数据。
        if (info !== 'expand') {
            this.needUpload = true;
            this.markDirty();
        }
    }

    upload(): void {
        this.needUpload && this.markDirty();
    }
}
