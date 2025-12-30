import { IRenderGeometryElement } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { I2DGraphicBufferDataView } from "../../../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { SpineWholeBuffer } from "./SpineWholeBuffer";
import { WebRender2DPass } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRender2DPass";

/**
 * @en Unified Spine buffer view that holds its own vertex and index data
 * @zh 统一的 Spine 缓冲区视图，持有自己的顶点和索引数据
 */
export class SpineBufferView implements I2DGraphicBufferDataView {
    /**
     * @en Own vertex data buffer (no offset, direct write)
     * @zh 自己的顶点数据缓冲区（无偏移，直接写入）
     */
    vertexData: Float32Array;

    /**
     * @en Own index data buffer (no offset, direct write)
     * @zh 自己的索引数据缓冲区（无偏移，直接写入）
     */
    indexData: Uint16Array;

    /**
     * @en Vertex capacity in floats
     * @zh 顶点容量（float 数量）
     */
    vertexCapacity: number;

    /**
     * @en Index capacity
     * @zh 索引容量
     */
    indexCapacity: number;

    /**
     * @en Current used vertex count (actual number of vertices)
     * @zh 当前已使用的顶点个数（实际顶点数量）
     */
    vertexCount: number = 0;

    /**
     * @en Current used vertex buffer length in floats (vertexCount × stride)
     * @zh 当前已使用的顶点缓冲区长度（floats 数量 = vertexCount × stride）
     */
    vertexBufferLength: number = 0;

    /**
     * @en Current used index count (actual number of indices)
     * @zh 当前已使用的索引个数（实际索引数量）
     */
    indexCount: number = 0;

    /**
     * @en Current used index buffer length (same as indexCount for index data)
     * @zh 当前已使用的索引缓冲区长度（等于 indexCount）
     */
    indexBufferLength: number = 0;

    /**
     * @en Owner buffer that manages this view
     * @zh 管理此视图的所有者缓冲区
     */
    owner: SpineWholeBuffer;

    /**
     * @en Geometry element for rendering
     * @zh 用于渲染的几何元素
     */
    geometry: IRenderGeometryElement;

    /**
     * @en Mark this view as modified, needs upload
     * @zh 标记此视图已修改，需要上传
     */
    private _modified: boolean = false;

    /** @internal */
    _next: SpineBufferView;
    /** @internal */
    _prev: SpineBufferView;

    constructor(vertexCapacity: number, indexCapacity: number) {
        this.vertexCapacity = vertexCapacity;
        this.indexCapacity = indexCapacity;
        this.vertexData = new Float32Array(vertexCapacity);
        this.indexData = new Uint16Array(indexCapacity);
    }

    /**
     * @en Get direct access to vertex data for writing
     * @zh 获取顶点数据以供写入
     */
    getVertexData(): Float32Array {
        return this.vertexData;
    }

    /**
     * @en Get direct access to index data for writing
     * @zh 获取索引数据以供写入
     */
    getIndexData(): Uint16Array {
        return this.indexData;
    }

    /**
     * @en Mark this view as modified and register with render pass
     * @zh 标记此视图为已修改并注册到渲染通道
     */
    markModified(): void {
        this._modified = true;
        if (this.owner) {
            this.owner._modifyOneView(this);
            //@ts-ignore
            WebRender2DPass.setBuffer(this.owner);
        }
    }

    /**
     * @en Check if this view has been modified
     * @zh 检查此视图是否已被修改
     */
    isModified(): boolean {
        return this._modified;
    }

    /**
     * @en Clear the modified flag after upload
     * @zh 上传后清除修改标志
     */
    clearModified(): void {
        this._modified = false;
    }

    /**
     * @en Reset usage counters and remove from owner buffer for reuse
     * @zh 重置使用计数器并从所有者缓冲区移除以供重用
     */
    reset(): void {
        this.vertexCount = 0;
        this.vertexBufferLength = 0;
        this.indexCount = 0;
        this.indexBufferLength = 0;
        this._modified = false;

        // Remove from current owner buffer
        if (this.owner) {
            this.owner.removeDataView(this);
        }
    }

    /**
     * @en Transfer this view to a different buffer
     * @zh 将此视图转移到不同的缓冲区
     * @param targetBuffer The target buffer to transfer to
     */
    transferToBuffer(targetBuffer: SpineWholeBuffer): void {
        // Remove from current owner
        if (this.owner) {
            this.owner.removeDataView(this);
        }

        // Add to target buffer
        targetBuffer.addDataView(this);
    }

    /**
     * @en Ensure vertex capacity, expand if needed
     * @zh 确保顶点容量，必要时扩展
     */
    ensureVertexCapacity(requiredFloats: number): void {
        if (requiredFloats > this.vertexCapacity) {
            let newCapacity = Math.max(requiredFloats, this.vertexCapacity * 2);
            let newData = new Float32Array(newCapacity);
            newData.set(this.vertexData);
            this.vertexData = newData;
            this.vertexCapacity = newCapacity;
        }
    }

    /**
     * @en Ensure index capacity, expand if needed
     * @zh 确保索引容量，必要时扩展
     */
    ensureIndexCapacity(requiredIndices: number): void {
        if (requiredIndices > this.indexCapacity) {
            let newCapacity = Math.max(requiredIndices, this.indexCapacity * 2);
            let newData = new Uint16Array(newCapacity);
            newData.set(this.indexData);
            this.indexData = newData;
            this.indexCapacity = newCapacity;
        }
    }

    /**
     * @en Destroy this view and release resources
     * @zh 销毁此视图并释放资源
     */
    destroy(): void {
        this.vertexData = null;
        this.indexData = null;
        this.geometry = null;
        this.owner = null;
        this._next = null;
        this._prev = null;
    }

    // Legacy compatibility methods
    setData(_data: ArrayLike<number>): void {
        // Not used in new design
    }
}
