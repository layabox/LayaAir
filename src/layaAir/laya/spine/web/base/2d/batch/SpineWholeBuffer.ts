import { IIndexBuffer } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IIndexBuffer";
import { IVertexBuffer } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IVertexBuffer";
import { I2DGraphicWholeBuffer } from "../../../../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { WebRender2DPass } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRender2DPass";
import { SpineBufferView } from "./SpineBufferDataView";
import { IBufferState } from "../../../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { SpineConst } from "../../../../SpineConst";

/**
 * @en Unified Spine whole buffer that manages both vertex and index buffers
 * @zh 统一的 Spine 完整缓冲区，管理顶点和索引缓冲区
 */
export class SpineWholeBuffer implements I2DGraphicWholeBuffer {
    /**
     * @en Maximum vertices allowed per buffer
     * @zh 每个缓冲区允许的最大顶点数
     */
    private static readonly MAX_VERTICES = 65535;

    /**
     * @en Step size for growing global temporary arrays (in floats for vertex, in indices for index)
     * @zh 全局临时数组增长的步长（顶点以 float 为单位，索引以索引为单位）
     */
    private static readonly ARRAY_GROWTH_STEP_VERTEX = SpineConst.NORMAL_VERTEX_LENGTH * SpineConst.VERTEX_TWOCOLOR; // floats
    private static readonly ARRAY_GROWTH_STEP_INDEX = SpineConst.NORMAL_VERTEX_LENGTH * 3; // indices

    /**
     * @en Global temporary vertex data array shared by all instances (grows as needed)
     * @zh 所有实例共享的全局临时顶点数据数组（按需增长）
     */
    private static _globalTempVertexData: Float32Array = new Float32Array(SpineWholeBuffer.ARRAY_GROWTH_STEP_VERTEX);

    /**
     * @en Global temporary index data array shared by all instances (grows as needed)
     * @zh 所有实例共享的全局临时索引数据数组（按需增长）
     */
    private static _globalTempIndexData: Uint16Array = new Uint16Array(SpineWholeBuffer.ARRAY_GROWTH_STEP_INDEX);

     /**
     * @en Grow global arrays dynamically during traversal if needed
     * @zh 在遍历过程中如果需要则动态增长全局数组
     */
    private static _growGlobalArraysIfNeeded(requiredVertexFloats: number, requiredIndexCount: number): boolean {
        let result = false;
        if (requiredVertexFloats > SpineWholeBuffer._globalTempVertexData.length) {
            const newSize = Math.ceil(requiredVertexFloats / SpineWholeBuffer.ARRAY_GROWTH_STEP_VERTEX) * SpineWholeBuffer.ARRAY_GROWTH_STEP_VERTEX;
            SpineWholeBuffer._globalTempVertexData = new Float32Array(newSize);
            result = true;
        }

        if (requiredIndexCount > SpineWholeBuffer._globalTempIndexData.length) {
            const newSize = Math.ceil(requiredIndexCount / SpineWholeBuffer.ARRAY_GROWTH_STEP_INDEX) * SpineWholeBuffer.ARRAY_GROWTH_STEP_INDEX;
            SpineWholeBuffer._globalTempIndexData = new Uint16Array(newSize);
            result = true;
        }

        return result;
    }

    /**
     * @en Vertex buffer on GPU (also serves as the main buffer for I2DGraphicWholeBuffer interface)
     * @zh GPU 上的顶点缓冲区（同时作为 I2DGraphicWholeBuffer 接口的主缓冲区）
     */
    vertexBuffer: IVertexBuffer;

    /**
     * @en Index buffer on GPU
     * @zh GPU 上的索引缓冲区
     */
    indexBuffer: IIndexBuffer;

    /**
     * @en Buffer state for rendering (replaces Mesh2D wrapper)
     * @zh 用于渲染的缓冲区状态（替代 Mesh2D 包装）
     */
    bufferState: IBufferState;

    /**
     * @en Current vertex count for 65535 limit tracking
     * @zh 当前顶点数，用于 65535 限制跟踪
     */
    currentVertexCount: number = 0;

    /**
     * @en Compatibility property for I2DGraphicWholeBuffer interface
     * @zh I2DGraphicWholeBuffer 接口的兼容属性
     */
    get buffer(): IVertexBuffer | IIndexBuffer {
        return this.vertexBuffer;
    }

    /**
     * @en Current allocated vertex capacity in floats
     * @zh 当前分配的顶点容量（float 数量）
     */
    private _vertexCapacity: number = 0;

    /**
     * @en Current allocated index capacity
     * @zh 当前分配的索引容量
     */
    private _indexCapacity: number = 0;

    /**
     * @en Flag indicating if buffer needs to be reuploaded
     * @zh 标志指示缓冲区是否需要重新上传
     */
    _needResetData: boolean = false;

    /**
     * @en Flag indicating if currently in render pass
     * @zh 标志指示当前是否在渲染通道中
     */
    _inPass: boolean = false;

    /**
     * @en Number of views managed by this buffer
     * @zh 此缓冲区管理的视图数量
     */
    private _num: number = 0;

    /** @internal */
    _first: SpineBufferView;
    /** @internal */
    _last: SpineBufferView;

    constructor(vertexBuffer: IVertexBuffer, indexBuffer: IIndexBuffer) {
        this.vertexBuffer = vertexBuffer;
        this.indexBuffer = indexBuffer;
    }
   
    /**
     * @en Reset buffer capacity
     * @zh 重置缓冲区容量
     */
    resetCapacity(vertexFloats: number, indexCount: number): void {
        if (vertexFloats > this._vertexCapacity) {
            this._vertexCapacity = vertexFloats;
            this.vertexBuffer.setDataLength(vertexFloats * 4); // bytes
        }

        if (indexCount > this._indexCapacity) {
            this._indexCapacity = indexCount;
            this.indexBuffer._setIndexDataLength(indexCount * 2); // bytes
        }

        this._needResetData = true;
    }

    /**
     * @en Compatibility method for I2DGraphicWholeBuffer interface
     * @zh I2DGraphicWholeBuffer 接口的兼容方法
     */
    resetData(byteLength: number): void {
        let floatLength = byteLength / 4;
        this.resetCapacity(floatLength, this._indexCapacity);
    }

    /**
     * @en Add a view to the linked list
     * @zh 将视图添加到链表中
     */
    addDataView(view: SpineBufferView): void {
        view._next = null;
        view._prev = null;

        if (!this._first) {
            this._first = view;
        }

        if (this._last) {
            this._last._next = view;
            view._prev = this._last;
        }

        view.owner = this;
        this._last = view;
        this._num++;

        this.currentVertexCount += view.vertexCount;

        this._needResetData = true;
        //@ts-ignore
        WebRender2DPass.setBuffer(this);
    }

    /**
     * @en Remove a view from the linked list
     * @zh 从链表中移除视图
     */
    removeDataView(view: SpineBufferView): void {
        view.owner = null;

        if (view._prev) {
            view._prev._next = view._next;
        }
        if (view._next) {
            view._next._prev = view._prev;
        }
        if (view == this._first) {
            this._first = view._next;
        }
        if (view == this._last) {
            this._last = view._prev;
        }

        view._next = null;
        view._prev = null;
        this._num--;

        this.currentVertexCount -= view.vertexCount;

        this._needResetData = true;
        //@ts-ignore
        WebRender2DPass.setBuffer(this);
    }

    /**
     * @en Check if buffer has space for more vertices
     * @zh 检查缓冲区是否有空间容纳更多顶点
     * @param vertexCount Number of vertices to add
     */
    canFit(vertexCount: number): boolean {
        return this.currentVertexCount + vertexCount <= SpineWholeBuffer.MAX_VERTICES;
    }

    /**
     * @en Mark a view as modified
     * @zh 标记视图为已修改
     */
    _modifyOneView(_view: SpineBufferView): void {
        this._needResetData = true;
    }

    /**
     * @en Upload data to GPU by reassembling all views with proper offsets
     * @zh 通过重组所有视图并应用正确的偏移将数据上传到 GPU
     * Optimized: single pass through linked list, using global shared arrays with dynamic growth
     */
    _upload(): void {
        if (!this._needResetData) return;
        if (!this._first) return;

        let totalVertexFloats = 0;
        let totalIndices = 0;
        let vertexOffset = 0;
        let indexOffset = 0;
        let currentVertexIndex = 0; 
        let view = this._first;

        let requiredVertexFloats = 0;
        let requiredIndexCount = 0;
        let vertexData = SpineWholeBuffer._globalTempVertexData;
        let indexData = SpineWholeBuffer._globalTempIndexData;
        const vertexStride = 12; // VERTEX_TWOCOLOR
        while (view) {
            if (view.vertexBufferLength > 0) {
                requiredVertexFloats = vertexOffset + view.vertexBufferLength;
                requiredIndexCount = indexOffset + view.indexBufferLength;

                if (SpineWholeBuffer._growGlobalArraysIfNeeded(requiredVertexFloats, requiredIndexCount)) {
                    vertexData = SpineWholeBuffer._globalTempVertexData;
                    indexData = SpineWholeBuffer._globalTempIndexData;
                }

                if (view.cacheVertex) {
                    let cacheVertex = view.cacheVertex;
                    vertexData.set(
                        cacheVertex.subarray(0, view.vertexBufferLength),
                        vertexOffset
                    );

                    if (view.matrix) {
                        let a = view.matrix.a;
                        let b = view.matrix.b;
                        let c = view.matrix.c;
                        let d = view.matrix.d;
                        let tx = view.matrix.tx;
                        let ty = view.matrix.ty;
                        let offsetX = view.offsetX;
                        let offsetY = view.offsetY;

                        for (let i = 0; i < view.vertexBufferLength; i += vertexStride) {
                            let index = vertexOffset + i;
                           
                            let x = cacheVertex[i + 6] + offsetX;
                            let y = cacheVertex[i + 7] + offsetY;
                            vertexData[index + 6] = a * x + c * y + tx;
                            vertexData[index + 7] = -b * x - d * y + ty;
                        }
                    }

                    for (let i = 0; i < view.indexCount; i++) {
                        indexData[indexOffset + i] = view.cacheIndex[i] + currentVertexIndex;
                    }
                } else {
                    vertexData.set(
                        view.vertexData.subarray(0, view.vertexBufferLength),
                        vertexOffset
                    );

                    for (let i = 0; i < view.indexCount; i++) {
                        indexData[indexOffset + i] = view.indexData[i] + currentVertexIndex;
                    }
                }

                if (view.geometry) {
                    view.geometry.clearRenderParams();
                    view.geometry.setDrawElemenParams(view.indexCount, indexOffset * 2);
                }

                totalVertexFloats = requiredVertexFloats;
                totalIndices = requiredIndexCount;
                vertexOffset += view.vertexBufferLength;
                indexOffset += view.indexBufferLength;
                currentVertexIndex += view.vertexCount;
            }

            view = view._next;
        }

        if (totalVertexFloats === 0 || totalIndices === 0) {
            this._needResetData = false;
            return;
        }

        if (totalVertexFloats > this._vertexCapacity || totalIndices > this._indexCapacity) {
            this.resetCapacity(
                Math.max(totalVertexFloats, this._vertexCapacity * 2),
                Math.max(totalIndices, this._indexCapacity * 2)
            );
        }

        this.vertexBuffer.setData(
            SpineWholeBuffer._globalTempVertexData.buffer as ArrayBuffer,
            0,
            0,
            totalVertexFloats * 4
        );

        this.indexBuffer.setData(
            SpineWholeBuffer._globalTempIndexData.buffer as ArrayBuffer,
            0,
            0,
            totalIndices * 2
        );

        this._needResetData = false;
    }

    /**
     * @en Destroy this buffer and release resources
     * @zh 销毁此缓冲区并释放资源
     */
    destroy(): void {
        this._first = null;
        this._last = null;
        this.vertexBuffer = null;
        this.indexBuffer = null;
    }
}
