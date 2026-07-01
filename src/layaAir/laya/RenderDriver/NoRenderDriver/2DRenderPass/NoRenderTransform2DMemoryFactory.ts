import { ITransform2DChunkBuffers, ITransform2DMemoryFactory } from "../../../display/transform2d/ITransform2DMemory";
import { ChildrenStore, LocalTrs, WorldData } from "../../../display/transform2d/Transform2DLayout";

/**
 * @zh NoRender(headless / 空渲染)后端的 2D Transform 内存工厂。
 *
 * NoRender 运行在纯 JS、无 native 后端，但 2D Transform SoA 计算(世界矩阵等)仍需正常运行，
 * 因此每个 chunk 的列直接用 JS TypedArray 分配，与 Web 后端语义一致。
 * 独立于 WebModuleData，避免 NoRenderDriver 反向依赖 Web 模块。
 */
export class NoRenderTransform2DMemoryFactory implements ITransform2DMemoryFactory {
    createChunkBuffers(_chunkIndex: number, capacity: number, dirtyWords: number): ITransform2DChunkBuffers {
        const parent = new Int32Array(capacity);
        return {
            localTrs: new Float32Array(capacity * LocalTrs.Stride),
            localAlpha: new Float32Array(capacity),
            localFlags: new Uint8Array(capacity),
            world: new Float32Array(capacity * WorldData.Stride),
            parent,
            childCount: new Uint16Array(capacity),
            childrenInline: new Int32Array(capacity * ChildrenStore.Stride),
            selfDirtyM: new Uint32Array(dirtyWords),
            treeDirtyM: new Uint32Array(dirtyWords),
            selfDirtyA: new Uint32Array(dirtyWords),
            treeDirtyA: new Uint32Array(dirtyWords),
            selfDirtyC: new Uint32Array(dirtyWords),
            treeDirtyC: new Uint32Array(dirtyWords),
            slotGen: new Uint16Array(capacity),
            matrixFrame: new Uint32Array(capacity),
            alphaFrame: new Uint32Array(capacity),
            cullingFrame: new Uint32Array(capacity),
        };
    }

    createControlBuffer(length: number): Int32Array {
        return new Int32Array(length);
    }

    createChangedBuffers(capacity: number): { slots: Int32Array; masks: Int32Array } {
        return { slots: new Int32Array(capacity), masks: new Int32Array(capacity) };
    }
}
