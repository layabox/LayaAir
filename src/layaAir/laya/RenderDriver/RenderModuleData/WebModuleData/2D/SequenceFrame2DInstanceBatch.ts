import { BaseRender2DType } from "../../../../display/SpriteConst";
import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { BatchManager, IBatch2DProvider } from "./BatchManager";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { FastSinglelist } from "../../../../utils/SingletonList";
import type { SequenceFrame2DRender } from "../../../../display/Scene2DSpecial/SequenceFrame2D/SequenceFrame2DRender";
import { SequenceFrame2DShader } from "../../../../display/Scene2DSpecial/SequenceFrame2D/SequenceFrame2DShader";
type SequenceFrame2DElement = IRenderElement2D & {
    _sequenceFrame2DRender?: SequenceFrame2DRender;
};

type SequenceFrameOwner = {
    globalRenderData: unknown;
    getClipInfo?: () => unknown;
};

interface ISequenceFrame2DBatchInfo {
    element: IRenderElement2D;
    geometry: IRenderGeometryElement;
    state: IBufferState;
    runtimeVB: IVertexBuffer;
    configVB: IVertexBuffer;
    configHash: number;
    configValid: boolean;
}

/**
 * @en Batches SequenceFrame2DRender elements with GPU instancing.
 * @zh 使用 GPU Instance 合批渲染 SequenceFrame2DRender。
 */
export class SequenceFrame2DInstanceBatch implements IBatch2DProvider {
    /** @en Batch records waiting for recovery. @zh 待回收的合批信息。 */
    private _recoverList: FastSinglelist<ISequenceFrame2DBatchInfo> = new FastSinglelist<ISequenceFrame2DBatchInfo>();

    /**
     * @en Registers the 2D sequence-frame batch provider.
     * @zh 注册 2D 序列帧合批器。
     */
    static __init__(): void {
        if (BatchManager.registry[BaseRender2DType.sequenceFrame2D]) {
            return;
        }
        BatchManager.registerProvider(BaseRender2DType.sequenceFrame2D, SequenceFrame2DInstanceBatch);
    }

    batch(list: FastSinglelist<IRenderElement2D>, start: number, end: number, allowReorder?: boolean): void {
        if (start > end) {
            return;
        }

        const elementArray = list.elements;
        let batchStart = -1;
        let headElement: SequenceFrame2DElement = null;
        let instanceCount = 0;

        for (let i = start; i <= end; i++) {
            const element = elementArray[i] as SequenceFrame2DElement;
            const renderer = element._sequenceFrame2DRender;
            const count = renderer ? renderer.activeInstanceCount : 0;
            if (count <= 0) {
                continue;
            }

            if (batchStart < 0) {
                batchStart = i;
                headElement = element;
                instanceCount = count;
                continue;
            }

            if (!this.check(headElement, element) || instanceCount + count > SequenceFrame2DInstanceBatchTool.MaxInstanceCount) {
                this._batchInternal(list, batchStart, i - 1);
                batchStart = i;
                headElement = element;
                instanceCount = count;
            } else {
                instanceCount += count;
            }
        }

        if (batchStart >= 0) {
            this._batchInternal(list, batchStart, end);
        }
    }

    reset(): void {
        this.recover();
    }

    destroy(): void {
        this.recover();
        this._recoverList.length = 0;
    }

    check(left: SequenceFrame2DElement, right: SequenceFrame2DElement): boolean {
        const leftRenderer = left._sequenceFrame2DRender;
        const rightRenderer = right._sequenceFrame2DRender;
        if (!leftRenderer || !rightRenderer) {
            return false;
        }
        if (!leftRenderer._canBatchWith(rightRenderer)) {
            return false;
        }
        if (left.materialShaderData !== right.materialShaderData ||
            left.subShader !== right.subShader) {
            return false;
        }

        const leftOwner = left.owner as unknown as SequenceFrameOwner;
        const rightOwner = right.owner as unknown as SequenceFrameOwner;
        if (leftOwner.globalRenderData !== rightOwner.globalRenderData) {
            return false;
        }
        if (leftOwner.getClipInfo && rightOwner.getClipInfo && leftOwner.getClipInfo() !== rightOwner.getClipInfo()) {
            return false;
        }
        return true;
    }

    recover(): void {
        const recoverArray = this._recoverList.elements;
        for (let i = 0, n = this._recoverList.length; i < n; i++) {
            SequenceFrame2DInstanceBatchTool.recover(recoverArray[i]);
        }
        this._recoverList.length = 0;
    }

    /** @en Builds one instanced batch range. @zh 构建一个实例合批区间。 */
    private _batchInternal(list: FastSinglelist<IRenderElement2D>, start: number, end: number): void {
        const elementArray = list.elements;
        const activeElements: SequenceFrame2DElement[] = [];
        let totalInstanceCount = 0;

        for (let i = start; i <= end; i++) {
            const element = elementArray[i] as SequenceFrame2DElement;
            const renderer = element._sequenceFrame2DRender;
            const count = renderer ? renderer.activeInstanceCount : 0;
            if (count > 0) {
                activeElements.push(element);
                totalInstanceCount += count;
            }
        }

        if (totalInstanceCount <= 0) {
            return;
        }

        if (activeElements.length === 1) {
            list.add(activeElements[0]);
            return;
        }

        const info = SequenceFrame2DInstanceBatchTool.getBatchInfo();
        this._recoverList.add(info);

        const configHash = this._getConfigHash(activeElements, totalInstanceCount);
        const uploadConfig = !info.configValid || info.configHash !== configHash;
        const firstRenderer = activeElements[0]._sequenceFrame2DRender;

        // Enabled renderers own slots in SequenceFrame2DRender's shared SOA
        // buffers. If render order is also a contiguous ID range, upload that
        // shared range directly and skip the temporary gather buffer.
        if (this._isContiguousInstanceIDRange(activeElements)) {
            const firstID = firstRenderer.instanceID;
            firstRenderer._uploadRuntimeDataRange(info.runtimeVB, firstID, totalInstanceCount);
            if (uploadConfig) {
                firstRenderer._uploadConfigDataRange(info.configVB, firstID, totalInstanceCount);
                info.configHash = configHash;
                info.configValid = true;
            }
        } else {
            const runtimeStride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE;
            const configStride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;
            const runtimeData = SequenceFrame2DInstanceBatchTool._instanceBufferCreate(runtimeStride * SequenceFrame2DInstanceBatchTool.MaxInstanceCount);

            // Fallback still copies by contiguous ID runs, preserving render
            // order while avoiding one tiny copy per renderer when possible.
            this._copyRuntimeData(activeElements, runtimeData);
            info.runtimeVB.setData(runtimeData.buffer, 0, 0, totalInstanceCount * runtimeStride * 4);
            SequenceFrame2DInstanceBatchTool._instanceBufferRecover(runtimeData);

            if (uploadConfig) {
                const configData = SequenceFrame2DInstanceBatchTool._instanceBufferCreate(configStride * SequenceFrame2DInstanceBatchTool.MaxInstanceCount);
                this._copyConfigData(activeElements, configData);
                info.configVB.setData(configData.buffer, 0, 0, totalInstanceCount * configStride * 4);
                SequenceFrame2DInstanceBatchTool._instanceBufferRecover(configData);
                info.configHash = configHash;
                info.configValid = true;
            }
        }

        const first = activeElements[0];
        const geometry = info.geometry;
        geometry.instanceCount = totalInstanceCount;
        geometry.indexFormat = first.geometry.indexFormat;

        const batchElement = info.element;
        batchElement.materialShaderData = first.materialShaderData;
        batchElement.value2DShaderData = first.value2DShaderData;
        batchElement.globalShaderData = first.globalShaderData;
        batchElement.subShader = first.subShader;
        batchElement.renderStateIsBySprite = first.renderStateIsBySprite;
        batchElement.stencilClipState = first.stencilClipState;
        batchElement.nodeCommonMap = first.nodeCommonMap;
        batchElement.owner = first.owner;

        list.add(batchElement);
    }

    private _isContiguousInstanceIDRange(activeElements: SequenceFrame2DElement[]): boolean {
        let expectedID = -1;
        for (let i = 0, n = activeElements.length; i < n; i++) {
            const renderer = activeElements[i]._sequenceFrame2DRender;
            const id = renderer.instanceID;
            const count = renderer.activeInstanceCount;
            if (id < 0 || count <= 0)
                return false;
            if (expectedID >= 0 && id !== expectedID)
                return false;
            expectedID = id + count;
        }
        return true;
    }

    private _copyRuntimeData(activeElements: SequenceFrame2DElement[], target: Float32Array): void {
        const stride = SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE;
        this._copySharedDataRuns(activeElements, target, stride, (sourceRenderer, targetOffset, startID, count) => {
            sourceRenderer._copyRuntimeDataRange(target, targetOffset, startID, count);
        });
    }

    private _copyConfigData(activeElements: SequenceFrame2DElement[], target: Float32Array): void {
        const stride = SequenceFrame2DShader.CONFIG_FLOAT_STRIDE;
        this._copySharedDataRuns(activeElements, target, stride, (sourceRenderer, targetOffset, startID, count) => {
            sourceRenderer._copyConfigDataRange(target, targetOffset, startID, count);
        });
    }

    private _copySharedDataRuns(
        activeElements: SequenceFrame2DElement[],
        target: Float32Array,
        stride: number,
        copyRun: (sourceRenderer: SequenceFrame2DRender, targetOffset: number, startID: number, count: number) => void
    ): void {
        const sourceRenderer = activeElements[0]._sequenceFrame2DRender;
        let targetOffset = 0;
        let runStartID = -1;
        let runCount = 0;
        let expectedID = -1;

        const flush = () => {
            if (runCount <= 0)
                return;
            copyRun(sourceRenderer, targetOffset, runStartID, runCount);
            targetOffset += runCount * stride;
            runCount = 0;
        };

        for (let i = 0, n = activeElements.length; i < n; i++) {
            const renderer = activeElements[i]._sequenceFrame2DRender;
            const id = renderer.instanceID;
            const count = renderer.activeInstanceCount;
            if (id < 0 || count <= 0)
                continue;

            if (runCount > 0 && id === expectedID) {
                runCount += count;
                expectedID = id + count;
                continue;
            }

            flush();
            runStartID = id;
            runCount = count;
            expectedID = id + count;
        }

        flush();
    }

    /** @en Hashes config versions for upload reuse. @zh 计算配置版本哈希以复用上传。 */
    private _getConfigHash(activeElements: SequenceFrame2DElement[], totalInstanceCount: number): number {
        let hash = totalInstanceCount | 0;
        for (let i = 0, n = activeElements.length; i < n; i++) {
            const renderer = activeElements[i]._sequenceFrame2DRender;
            hash = Math.imul(hash ^ renderer.instanceID, 16777619);
            hash = Math.imul(hash ^ renderer.getRenderID(), 16777619);
            hash = Math.imul(hash ^ renderer.configVersion, 16777619);
            hash = Math.imul(hash ^ renderer.activeInstanceCount, 16777619);
        }
        return hash;
    }
}

/** @internal */
export class SequenceFrame2DInstanceBatchTool {
    /** @internal */
    static MaxInstanceCount: number = 4096;

    /** @en Pool of reusable batch records. @zh 可复用合批信息池。 */
    private static _batchInfoPool: ISequenceFrame2DBatchInfo[] = [];
    /** @en Float buffer pool keyed by length. @zh 按长度索引的浮点缓冲池。 */
    private static _bufferPool: Float32Array[][] = [];

    /**
     * @en Gets a pooled batch record.
     * @zh 获取合批信息缓存。
     */
    static getBatchInfo(): ISequenceFrame2DBatchInfo {
        return SequenceFrame2DInstanceBatchTool._batchInfoPool.pop() || SequenceFrame2DInstanceBatchTool.createBatchInfo();
    }

    /**
     * @en Creates a batch record with geometry and buffers.
     * @zh 创建合批信息与缓冲。
     */
    static createBatchInfo(): ISequenceFrame2DBatchInfo {
        const element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
        const geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementInstance);
        const state = LayaGL.renderDeviceFactory.createBufferState();
        const runtimeVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        const configVB = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);

        runtimeVB.vertexDeclaration = SequenceFrame2DShader.runtimeDeclaration;
        runtimeVB.instanceBuffer = true;
        runtimeVB.setDataLength(SequenceFrame2DInstanceBatchTool.MaxInstanceCount * SequenceFrame2DShader.RUNTIME_FLOAT_STRIDE * 4);

        configVB.vertexDeclaration = SequenceFrame2DShader.configDeclaration;
        configVB.instanceBuffer = true;
        configVB.setDataLength(SequenceFrame2DInstanceBatchTool.MaxInstanceCount * SequenceFrame2DShader.CONFIG_FLOAT_STRIDE * 4);

        geometry.bufferState = state;
        geometry.indexFormat = IndexFormat.UInt16;
        geometry.setDrawElemenParams(6, 0);
        geometry.instanceCount = 0;
        state.applyState([SequenceFrame2DShader._vbs, runtimeVB, configVB], SequenceFrame2DShader._ibs);

        element.geometry = geometry;
        element.renderStateIsBySprite = false;
        element.nodeCommonMap = ["BaseRender2D"];

        return {
            element,
            geometry,
            state,
            runtimeVB,
            configVB,
            configHash: -1,
            configValid: false,
        };
    }

    /**
     * @en Recycles a batch record.
     * @zh 回收合批信息。
     */
    static recover(info: ISequenceFrame2DBatchInfo): void {
        const element = info.element;
        element.materialShaderData = null;
        element.stencilClipState = null;
        element.value2DShaderData = null;
        element.globalShaderData = null;
        element.subShader = null;
        element.owner = null;
        element.nodeCommonMap = ["BaseRender2D"];

        info.geometry.clearRenderParams();
        info.geometry.setDrawElemenParams(6, 0);
        info.geometry.instanceCount = 0;

        SequenceFrame2DInstanceBatchTool._batchInfoPool.push(info);
    }

    /**
     * @en Gets a pooled instance buffer.
     * @zh 获取实例数据缓存。
     */
    static _instanceBufferCreate(length: number): Float32Array {
        let array = SequenceFrame2DInstanceBatchTool._bufferPool[length];
        if (!array) {
            array = SequenceFrame2DInstanceBatchTool._bufferPool[length] = [];
        }
        return array.pop() || new Float32Array(length);
    }

    /**
     * @en Recycles an instance buffer.
     * @zh 回收实例数据缓存。
     */
    static _instanceBufferRecover(float32: Float32Array): void {
        const length = float32.length;
        let array = SequenceFrame2DInstanceBatchTool._bufferPool[length];
        if (!array) {
            array = SequenceFrame2DInstanceBatchTool._bufferPool[length] = [];
        }
        array.push(float32);
    }
}

SequenceFrame2DInstanceBatch.__init__();
