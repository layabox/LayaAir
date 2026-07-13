import { IRenderGeometryElement } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { SpineWholeBuffer } from "./SpineWholeBuffer";
import { WebRender2DPass } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRender2DPass";
import { SpineConst } from "../../../../SpineConst";
import { Matrix } from "../../../../../maths/Matrix";

/**
 * @en Unified Spine buffer view that holds its own vertex and index data
 * @zh 统一的 Spine 缓冲区视图，持有自己的顶点和索引数据
 */
export class SpineBufferView {

    /**
     * @en Step size for growing vertex array (in floats)
     * @zh 顶点数组增长的步长（float 数量）
     */
    private static readonly ARRAY_GROWTH_STEP_VERTEX = SpineConst.NORMAL_VERTEX_LENGTH * SpineConst.VERTEX_TWOCOLOR; // floats

    /**
     * @en Step size for growing index array (in indices)
     * @zh 索引数组增长的步长（索引数量）
     */
    private static readonly ARRAY_GROWTH_STEP_INDEX = SpineConst.NORMAL_VERTEX_LENGTH * 3; // indices
    
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
     * @en Cached raw vertex data (before matrix transformation)
     * @zh 缓存的原始顶点数据（矩阵变换前）
     */
    cacheVertex: Float32Array = null;

    /**
     * @en Cached raw index data
     * @zh 缓存的原始索引数据
     */
    cacheIndex: Uint16Array = null;

    /**
     * @en Transformation matrix for this view
     * @zh 此视图的变换矩阵
     */
    matrix: Matrix = null;

    /**
     * @en X offset for transformation
     * @zh X 轴偏移
     */
    offsetX: number = 0;

    /**
     * @en Y offset for transformation
     * @zh Y 轴偏移
     */
    offsetY: number = 0;

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
        // this._modified = true;
        if (this.owner) {
            this.owner._modifyOneView(this);
            //@ts-ignore
            WebRender2DPass.setBuffer(this.owner);
        }
    }

    /**
     * @en Reset usage counters and remove from owner buffer for reuse
     * @zh 重置使用计数器并从所有者缓冲区移除以供重用
     */
    reset(): void {
        if (this.owner) {
            this.owner.removeDataView(this);
        }

        this.vertexCount = 0;
        this.vertexBufferLength = 0;
        this.indexCount = 0;
        this.indexBufferLength = 0;

        // 清理缓存数据
        this.cacheVertex = null;
        this.cacheIndex = null;
        this.matrix = null;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * @en Transfer this view to a different buffer
     * @zh 将此视图转移到不同的缓冲区
     * @param targetBuffer The target buffer to transfer to
     */
    transferToBuffer(targetBuffer: SpineWholeBuffer): void {
        if (this.owner) {
            this.owner.removeDataView(this);
        }

        targetBuffer.addDataView(this);
    }

    /**
     * @en Ensure vertex capacity, expand if needed with fixed step size
     * @zh 确保顶点容量，必要时按固定步长扩展
     */
    ensureVertexCapacity(requiredFloats: number): void {
        if (requiredFloats > this.vertexCapacity) {
            const newSize = Math.ceil(requiredFloats / SpineBufferView.ARRAY_GROWTH_STEP_VERTEX) * SpineBufferView.ARRAY_GROWTH_STEP_VERTEX;
            let newData = new Float32Array(newSize);
            newData.set(this.vertexData);
            this.vertexData = newData;
            this.vertexCapacity = newSize;
        }
    }

    /**
     * @en Ensure index capacity, expand if needed with fixed step size
     * @zh 确保索引容量，必要时按固定步长扩展
     */
    ensureIndexCapacity(requiredIndices: number): void {
        if (requiredIndices > this.indexCapacity) {
            const newSize = Math.ceil(requiredIndices / SpineBufferView.ARRAY_GROWTH_STEP_INDEX) * SpineBufferView.ARRAY_GROWTH_STEP_INDEX;
            let newData = new Uint16Array(newSize);
            newData.set(this.indexData);
            this.indexData = newData;
            this.indexCapacity = newSize;
        }
    }

    /**
     * @en Destroy this view and release resources
     * @zh 销毁此视图并释放资源
     */
    destroy(): void {
        this.vertexData = null;
        this.indexData = null;
        this.cacheVertex = null;
        this.cacheIndex = null;
        this.matrix = null;
        this.geometry = null;
        this.owner = null;
        this._next = null;
        this._prev = null;
    }

}
