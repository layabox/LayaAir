import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { SpineConst } from "../../../SpineConst";
import { SpineBufferView } from "./batch/SpineBufferDataView";
import { SpineWholeBuffer } from "./batch/SpineWholeBuffer";
import { IBufferState } from "../../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";

/**
 * @en Global mesh manager for Spine normal rendering.
 * Manages a pool of buffers with automatic allocation when exceeding uint16 vertex limit.
 * @zh Spine normal 渲染的全局 buffer 管理器。
 * 管理 buffer 池,超过 uint16 顶点限制时自动分配新的 buffer。
 */
export class SpineGlobalMeshManager {
    private static _instance: SpineGlobalMeshManager;

    private _buffers: SpineWholeBuffer[] = [];
    private static readonly MAX_VERTICES_PER_BUFFER = 65535;
    private static readonly INITIAL_VERTEX_CAPACITY = 1024 * SpineConst.VERTEX_TWOCOLOR; // In floats
    private static readonly INITIAL_INDEX_CAPACITY = 1024 * 3;

    static get instance(): SpineGlobalMeshManager {
        if (!this._instance) {
            this._instance = new SpineGlobalMeshManager();
        }
        return this._instance;
    }

    /**
     * @en Output fields to avoid GC
     * @zh 输出字段以避免 GC
     */
    outBufferIndex: number;
    outView: SpineBufferView;
    outBufferState: IBufferState;

    /**
     * @en Assign a view to an appropriate buffer
     * Results are stored in output fields: outBufferState, outBufferIndex
     * @param view The view to assign
     * @param vertexCount Number of vertices in the view
     * @zh 将 view 分配到合适的 buffer
     * 结果存储在输出字段中: outBufferState, outBufferIndex
     * @param view 要分配的 view
     * @param vertexCount view 中的顶点数
     */
    assignViewToBuffer(view: SpineBufferView, vertexCount: number): void {
        let targetBuffer = this._findOrCreateBuffer(vertexCount);

        // Add view to buffer (automatically updates currentVertexCount)
        targetBuffer.addDataView(view);

        // Set output fields
        this.outBufferState = targetBuffer.bufferState;
        this.outBufferIndex = this._buffers.indexOf(targetBuffer);
    }

    /**
     * @internal
     * @en Find existing buffer with available space or create new one
     * @param vertexCount Number of vertices needed
     * @zh 查找有可用空间的现有缓冲区或创建新缓冲区
     * @param vertexCount 需要的顶点数
     */
    private _findOrCreateBuffer(vertexCount: number): SpineWholeBuffer {
        // Find existing buffer with space
        for (let buffer of this._buffers) {
            if (buffer.canFit(vertexCount)) {
                return buffer;
            }
        }

        // Create new buffer
        let newBuffer = this._createBuffer();
        this._buffers.push(newBuffer);
        return newBuffer;
    }

    /**
     * @en Allocate a buffer view, automatically selecting or creating a suitable buffer.
     * Results are stored in output fields: outView, outBufferState, outBufferIndex
     * @param vertexCount Number of vertices needed (in vertices, not float count)
     * @param indexCount Number of indices needed
     * @zh 申请 buffer view,自动选择或创建合适的 buffer。
     * 结果存储在输出字段中: outView, outBufferState, outBufferIndex
     * @param vertexCount 需要的顶点数 (以顶点为单位,不是 float 数量)
     * @param indexCount 需要的索引数
     */
    allocateView(vertexCount: number, indexCount: number): void {
        // Find a buffer with available space
        let targetBuffer: SpineWholeBuffer = null;
        let bufferIndex = -1;

        for (let i = 0; i < this._buffers.length; i++) {
            let buffer = this._buffers[i];
            if (buffer.canFit(vertexCount)) {
                targetBuffer = buffer;
                bufferIndex = i;
                break;
            }
        }

        // No suitable buffer found, create a new one
        if (!targetBuffer) {
            targetBuffer = this._createBuffer();
            bufferIndex = this._buffers.length;
            this._buffers.push(targetBuffer);
        }

        // Calculate capacities
        let vertexFloats = vertexCount * SpineConst.VERTEX_TWOCOLOR;
        let allocVertexFloats = Math.max(SpineGlobalMeshManager.INITIAL_VERTEX_CAPACITY, vertexFloats);
        let allocIndexCount = Math.max(SpineGlobalMeshManager.INITIAL_INDEX_CAPACITY, indexCount);

        // Create view
        this.outView = new SpineBufferView(allocVertexFloats, allocIndexCount);
        targetBuffer.addDataView(this.outView);

        this.outBufferState = targetBuffer.bufferState;
        this.outBufferIndex = bufferIndex;
    }

    /**
     * @en Release a view (called during reset)
     * @param view The view to release
     * @zh 释放 view (重置时调用)
     * @param view 要释放的视图
     */
    releaseView(view: SpineBufferView): void {
        if (view && view.owner) {
            view.owner.removeDataView(view);
        }
    }

    /**
     * @internal
     * @en Create a new buffer with bufferState
     * @zh 创建新的 buffer 及其 bufferState
     */
    private _createBuffer(): SpineWholeBuffer {
        let vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vertexBuffer.vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;

        let indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);

        let wholeBuffer = new SpineWholeBuffer(vertexBuffer, indexBuffer);
        wholeBuffer.resetCapacity(
            SpineGlobalMeshManager.INITIAL_VERTEX_CAPACITY,
            SpineGlobalMeshManager.INITIAL_INDEX_CAPACITY
        );

        wholeBuffer.bufferState = LayaGL.renderDeviceFactory.createBufferState();
        wholeBuffer.bufferState.applyState([vertexBuffer as any], indexBuffer as any);

        return wholeBuffer;
    }

    /**
     * @en Clear all buffers (used for hot reload or resource cleanup)
     * @zh 清理所有 buffers (用于热重载或资源清理)
     */
    clear(): void {
        this._buffers.forEach(buffer => {
            buffer.destroy();
        });
        this._buffers = [];
    }
}
