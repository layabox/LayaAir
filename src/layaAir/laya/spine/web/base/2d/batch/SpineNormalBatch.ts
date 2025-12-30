import { LayaGL } from "../../../../../layagl/LayaGL";
import { IRenderElement2D } from "../../../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { IBatch2DProvider } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { FastSinglelist } from "../../../../../utils/SingletonList";
import { WebRenderStruct2D } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";
import { WebSpineRenderDataHandle } from "../../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { SpineConst } from "../../../../SpineConst";
import { BufferUsage } from "../../../../../RenderEngine/RenderEnum/BufferTargetType";
import { SpineShaderInit } from "../../../../shader/SpineShaderInit";
import { ShaderData } from "../../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { IPool, Pool } from "../../../../../utils/Pool";
import { DrawType } from "../../../../../RenderEngine/RenderEnum/DrawType";
import { MeshTopology } from "../../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IndexFormat } from "../../../../../RenderEngine/RenderEnum/IndexFormat";
import { SpineBufferView } from "./SpineBufferDataView";
import { SpineWholeBuffer } from "./SpineWholeBuffer";
import { Spine2DNormalRenderUpdater } from "../Spine2DNormalRenderUpdater";

/**
 * @en Spine batch context to track batch state and avoid GC
 * @zh Spine 批次上下文，用于跟踪批次状态并避免 GC
 */
class SpineBatchContext {
    element: IRenderElement2D = null;
    materialShaderData: ShaderData = null;
    ownerStruct: WebRenderStruct2D = null;
    subShader: any = null;

    /**
     * @en Initialize context from first element
     * @zh 从第一个元素初始化上下文
     */
    setHead(element: IRenderElement2D): boolean {
        this.element = element;
        this.ownerStruct = element.owner as WebRenderStruct2D;
        this.materialShaderData = element.materialShaderData;
        this.subShader = element.subShader;
        return true;
    }

    /**
     * @en Check if element is compatible for batching (reuse context to avoid GC)
     * @zh 检查元素是否可以合批（重用上下文避免 GC）
     */
    isCompatible(element: IRenderElement2D): boolean {
        if (element.subShader !== this.subShader) {
            return false;
        }

        if (element.materialShaderData !== this.materialShaderData) {
            return false;
        }

        return true;
    }

    /**
     * @en Get view from element's geometry (updates context fields to avoid GC)
     * @zh 从元素的 geometry 获取视图（更新上下文字段避免 GC）
     */
    getViewFromGeometry(element: IRenderElement2D): SpineBufferView | undefined {
        this.element = element;
        this.ownerStruct = element.owner as WebRenderStruct2D;
        this.materialShaderData = element.materialShaderData;

        let handle = this.ownerStruct.renderDataHandler as WebSpineRenderDataHandle;
        let normalUpdater = handle.normalUpdater as Spine2DNormalRenderUpdater;

        // Get the view associated with this element's geometry (1:1 relationship)
        return normalUpdater.getViewForGeometry(element.geometry);
    }
}

/**
 * @en Batch buffer for merging multiple views
 * @zh 用于合并多个视图的批次缓冲区
 */
interface BatchBuffer {
    wholeBuffer: SpineWholeBuffer;
    bufferState: any;  // Use bufferState instead of Mesh2D (lower-level concept)
    views: SpineBufferView[];
}

/**
 * @en SpineNormalBatch - Refactored to use Context pattern to avoid GC.
 * Uses View's dual-buffer architecture for efficient batching.
 * Process:
 * 1. RenderUpdate stage: Views are allocated to original buffers
 * 2. Batch stage: Compatible views are transferred to batch buffers with calculated offsets
 * 3. Upload stage: Both original and batch buffers upload their views
 * @zh SpineNormalBatch - 重构使用 Context 模式避免 GC。
 * 使用 View 的双缓冲区架构实现高效合批。
 * 流程：
 * 1. RenderUpdate 阶段：Views 分配到原始 buffers
 * 2. Batch 阶段：兼容的 views 转移到批次 buffers 并计算偏移
 * 3. Upload 阶段：原始和批次 buffers 都上传各自的 views
 */
export class SpineNormalBatch implements IBatch2DProvider {
    /**
     * @en Maximum vertices per batch (Uint16 index limit)
     * @zh 每个批次的最大顶点数（Uint16 索引限制）
     */
    private static readonly MAX_VERTICES_PER_BATCH = 65535;

    /**
     * @en Static pool for reusable batch elements (like WebGraphicsBatch._pool)
     * @zh 静态对象池，用于复用批次元素（类似 WebGraphicsBatch._pool）
     */
    private static readonly _pool: IPool<IRenderElement2D> = Pool.createPool2<IRenderElement2D>(
        () => { // create
            let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = IndexFormat.UInt16;
            element.nodeCommonMap = ["Sprite2D"];
            element.renderStateIsBySprite = false;
            return element;
        },
        null,
        element => { // reset
            element.geometry.clearRenderParams();
            element.geometry.bufferState = null;
            element.materialShaderData = null;
            element.value2DShaderData = null;
            element.subShader = null;
            element.owner = null;
            element.renderStateIsBySprite = false;
        }
    );

    /**
     * @en Pool of batch buffers for reuse
     * @zh 批次缓冲区池，用于重用
     */
    private _batchBufferPool: BatchBuffer[] = [];

    /**
     * @en Active batch buffers in current frame
     * @zh 当前帧中活跃的批次缓冲区
     */
    private _activeBatchBuffers: BatchBuffer[] = [];

    /**
     * @en Batch context to avoid GC from temporary objects
     * @zh 批次上下文，避免临时对象产生的 GC
     */
    private _context: SpineBatchContext = new SpineBatchContext();

    /**
     * @en Merged elements in current frame (to be recovered in reset)
     * @zh 当前帧中合并的元素（在 reset 时回收）
     */
    private _merged: IRenderElement2D[] = [];

    /**
     * @en Batch render elements according to IBatch2DProvider interface
     * @zh 根据 IBatch2DProvider 接口批量渲染元素
     */
    batch(list: FastSinglelist<IRenderElement2D>, start: number, end: number, _allowReorder?: boolean): void {
        if (start > end) {
            return;
        }

        let elementArray = list.elements;
        let ctx = this._context;

        // Initialize with first element
        let firstElement = elementArray[start];
        if (!ctx.setHead(firstElement)) {
            list.add(firstElement);
            if (start === end) return;
            start++;
            firstElement = elementArray[start];
            if (!ctx.setHead(firstElement)) {
                list.add(firstElement);
                return;
            }
        }

        let batchStart = start;
        let batchEnd = start;

        // Get single view from first element (1:1 relationship)
        let view = ctx.getViewFromGeometry(firstElement);
        if (!view) {
            list.add(firstElement);
            if (start === end) return;
            start++;
            firstElement = elementArray[start];
            if (!ctx.setHead(firstElement)) {
                list.add(firstElement);
                return;
            }
            view = ctx.getViewFromGeometry(firstElement);
            if (!view) {
                list.add(firstElement);
                return;
            }
        }

        let currentVertexCount = view.vertexCount;

        for (let i = start + 1; i <= end; i++) {
            let element = elementArray[i];

            if (ctx.isCompatible(element)) {
                let view = ctx.getViewFromGeometry(element);
                if (!view) continue;

                let viewVertexCount = view.vertexCount;

                if (currentVertexCount + viewVertexCount <= SpineNormalBatch.MAX_VERTICES_PER_BATCH) {
                    batchEnd = i;
                    currentVertexCount += viewVertexCount;
                    continue;
                } else {
                    if (batchEnd > batchStart) {
                        this._createBatchedElement(list, elementArray, batchStart, batchEnd);
                    } else {
                        list.add(elementArray[batchStart]);
                    }

                    batchStart = i;
                    batchEnd = i;
                    currentVertexCount = viewVertexCount;
                    continue;
                }
            }

            if (batchEnd > batchStart) {
                this._createBatchedElement(list, elementArray, batchStart, batchEnd);
            } else if (batchStart >= 0) {
                list.add(elementArray[batchStart]);
            }

            if (ctx.setHead(element)) {
                let view = ctx.getViewFromGeometry(element);
                batchStart = i;
                batchEnd = i;
                currentVertexCount = view ? view.vertexCount : 0;
            } else {
                list.add(element);
                batchStart = -1;
                currentVertexCount = 0;
            }
        }

        if (batchStart >= 0) {
            if (batchEnd > batchStart) {
                this._createBatchedElement(list, elementArray, batchStart, batchEnd);
            } else {
                list.add(elementArray[batchStart]);
            }
        }
    }

    /**
     * @en Create a batched element from element range (simplified for 1:1 view-geometry)
     * @zh 从元素范围创建批次元素（简化为 1:1 view-geometry 关系）
     */
    private _createBatchedElement(
        list: FastSinglelist<IRenderElement2D>,
        elementArray: IRenderElement2D[],
        batchStart: number,
        batchEnd: number
    ): void {
        let batchBuffer = this._getBatchBuffer();

        let totalVertexFloats = 0;
        let totalIndices = 0;

        // Calculate total size by collecting single view from each element (1:1 relationship)
        for (let i = batchStart; i <= batchEnd; i++) {
            let element = elementArray[i];
            let handle = (element.owner as WebRenderStruct2D).renderDataHandler as WebSpineRenderDataHandle;
            let normalUpdater = handle.normalUpdater as Spine2DNormalRenderUpdater;

            let view = normalUpdater.getViewForGeometry(element.geometry);
            if (view) {
                totalVertexFloats += view.vertexBufferLength;
                totalIndices += view.indexBufferLength;
            }
        }

        batchBuffer.wholeBuffer.resetCapacity(totalVertexFloats, totalIndices);

        // Transfer single view from each element to the batch buffer
        for (let i = batchStart; i <= batchEnd; i++) {
            let element = elementArray[i];
            let handle = (element.owner as WebRenderStruct2D).renderDataHandler as WebSpineRenderDataHandle;
            let normalUpdater = handle.normalUpdater as Spine2DNormalRenderUpdater;

            let view = normalUpdater.getViewForGeometry(element.geometry);
            if (!view) continue;

            view.transferToBuffer(batchBuffer.wholeBuffer);
            batchBuffer.views.push(view);
        }

        let firstElement = elementArray[batchStart];

        let batchElement = SpineNormalBatch._pool.take();
        this._merged.push(batchElement);

        let geometry = batchElement.geometry;
        geometry.bufferState = batchBuffer.bufferState;
        geometry.setDrawElemenParams(totalIndices, 0);
        geometry.indexFormat = firstElement.geometry.indexFormat;

        batchElement.subShader = firstElement.subShader;
        batchElement.materialShaderData = firstElement.materialShaderData;
        batchElement.value2DShaderData = firstElement.value2DShaderData;
        batchElement.renderStateIsBySprite = firstElement.renderStateIsBySprite;
        batchElement.nodeCommonMap = firstElement.nodeCommonMap;

        list.add(batchElement);
    }

    /**
     * @en Get or create a batch buffer
     * @zh 获取或创建批次缓冲区
     */
    private _getBatchBuffer(): BatchBuffer {
        let batchBuffer = this._batchBufferPool.pop();

        if (!batchBuffer) {
            // Create new batch buffer with bufferState only (lower-level concept)
            let vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            vertexBuffer.vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;

            let indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);

            let wholeBuffer = new SpineWholeBuffer(vertexBuffer, indexBuffer);
            wholeBuffer.resetCapacity(4096 * SpineConst.VERTEX_TWOCOLOR, 4096 * 3);

            // Create bufferState directly without Mesh2D
            let bufferState = LayaGL.renderDeviceFactory.createBufferState();
            bufferState.applyState([vertexBuffer], indexBuffer);

            batchBuffer = {
                wholeBuffer,
                bufferState,
                views: []
            };
        }

        this._activeBatchBuffers.push(batchBuffer);
        return batchBuffer;
    }

    /**
     * @en Reset batch state for new frame
     * @zh 为新帧重置批次状态
     */
    reset(): void {
        // Recycle batch buffers
        for (let batchBuffer of this._activeBatchBuffers) {
            batchBuffer.views.length = 0;
            this._batchBufferPool.push(batchBuffer);
        }
        this._activeBatchBuffers.length = 0;

        // Recycle merged elements to static pool (like WebGraphicsBatch)
        SpineNormalBatch._pool.recover(this._merged);
    }

    /**
     * @en Destroy batch provider and clean up resources
     * @zh 销毁批处理提供者并清理资源
     */
    destroy(): void {
        for (let batchBuffer of this._batchBufferPool) {
            batchBuffer.wholeBuffer.destroy();
            batchBuffer.bufferState.destroy();
        }

        for (let batchBuffer of this._activeBatchBuffers) {
            batchBuffer.wholeBuffer.destroy();
            batchBuffer.bufferState.destroy();
        }

        this._batchBufferPool = [];
        this._activeBatchBuffers = [];

        // Recycle merged elements before clearing
        SpineNormalBatch._pool.recover(this._merged);
    }
}
