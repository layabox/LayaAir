import { ITransform2DChunkBuffers, ITransform2DMemoryFactory } from "./ITransform2DMemory";
import { ChildrenStore, LocalTrs, WorldData } from "./Transform2DLayout";

/**
 * @zh Web 后端的内存工厂：每 chunk 的列直接用 JS TypedArray 分配。
 *
 * 由 Web 系 driver(WebGL/WebGPU/NoRender)的 `I2DRenderPassFactory.createTransform2DMemoryFactory()` 创建。
 * native(GLES/LayaX)则给 view over native ArrayBuffer 的 {@link "./runtime/RTTransform2DStore".RTTransform2DMemoryFactory}，算法层零改动。
 */
export class WebTransform2DMemoryFactory implements ITransform2DMemoryFactory {
    createChunkBuffers(_chunkIndex: number, capacity: number, dirtyWords: number): ITransform2DChunkBuffers {
        const parent = new Int32Array(capacity); // 由 store 在 alloc 时置 None，这里 0 即可被覆盖
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
