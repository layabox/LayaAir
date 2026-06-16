import { ITransform2DChunkBuffers, ITransform2DMemoryFactory } from "./ITransform2DMemory";
import { Chunk } from "./Transform2DLayout";

/**
 * @zh 一个 chunk = 固定 {@link Chunk.Capacity} 个 slot 的全部平行列。
 *
 * 列由 {@link ITransform2DMemoryFactory} 提供(Web 为 JS TypedArray，FFI 为 native view)。
 * chunk 之间互不相邻；扩容只追加新 chunk，已存在 chunk 的列永不重分配。
 *
 * 直接暴露列字段(非 getter)，让 store 的热路径(setter / sweep)零封装开销地访问。
 */
export class TreeChunk {
    /** 本 chunk 第一个 slot 的扁平下标 = chunkIndex << Chunk.Shift */
    readonly baseSlot: number;

    readonly localTrs: Float32Array;
    readonly localAlpha: Float32Array;
    readonly localFlags: Uint8Array;
    readonly world: Float32Array;
    readonly parent: Int32Array;
    readonly childCount: Uint16Array;
    readonly childrenInline: Int32Array;
    readonly selfDirtyM: Uint32Array;
    readonly treeDirtyM: Uint32Array;
    readonly selfDirtyA: Uint32Array;
    readonly treeDirtyA: Uint32Array;
    readonly selfDirtyC: Uint32Array;
    readonly treeDirtyC: Uint32Array;
    readonly slotGen: Uint16Array;
    readonly matrixFrame: Uint32Array;
    readonly alphaFrame: Uint32Array;
    readonly cullingFrame: Uint32Array;

    /** 块级粗跳过标志：整块任一通道无脏时，mark/clear 直接跳过本块 */
    anyDirty: boolean = false;

    constructor(chunkIndex: number, mem: ITransform2DMemoryFactory) {
        this.baseSlot = chunkIndex << Chunk.Shift;
        const b: ITransform2DChunkBuffers = mem.createChunkBuffers(chunkIndex, Chunk.Capacity, Chunk.DirtyWords);
        this.localTrs = b.localTrs;
        this.localAlpha = b.localAlpha;
        this.localFlags = b.localFlags;
        this.world = b.world;
        this.parent = b.parent;
        this.childCount = b.childCount;
        this.childrenInline = b.childrenInline;
        this.selfDirtyM = b.selfDirtyM;
        this.treeDirtyM = b.treeDirtyM;
        this.selfDirtyA = b.selfDirtyA;
        this.treeDirtyA = b.treeDirtyA;
        this.selfDirtyC = b.selfDirtyC;
        this.treeDirtyC = b.treeDirtyC;
        this.slotGen = b.slotGen;
        this.matrixFrame = b.matrixFrame;
        this.alphaFrame = b.alphaFrame;
        this.cullingFrame = b.cullingFrame;
    }
}
