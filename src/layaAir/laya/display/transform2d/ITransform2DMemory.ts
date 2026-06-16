/**
 * @zh 一个 chunk 的全部列 buffer。
 *
 * 关键点：无论内存是 JS 分配还是从 C++ FFI 层来，在 JS 侧都表现为
 * `Float32Array` / `Uint32Array` 等 TypedArray —— FFI 情况只是 view over
 * native ArrayBuffer。因此 chunk 结构、accessor、mark/sweep 算法完全共享，
 * 唯一可变的是这些 TypedArray 的「来源」，即由 {@link ITransform2DMemoryFactory} 提供。
 *
 * 各列长度(以 capacity = Chunk.Capacity, dirtyWords = Chunk.DirtyWords 计)：
 * - localTrs:       capacity * LocalTrs.Stride
 * - localAlpha:     capacity
 * - localFlags:     capacity
 * - world:          capacity * WorldData.Stride
 * - parent:         capacity
 * - childCount:     capacity
 * - childrenInline: capacity * ChildrenStore.Stride
 * - selfDirtyX / treeDirtyX: dirtyWords
 * - slotGen:        capacity
 */
export interface ITransform2DChunkBuffers {
    /** local 输入：交错的 TRS(x,y,sx,sy,rot,skewX,skewY,pivotX,pivotY) */
    readonly localTrs: Float32Array;
    /** local 输入：自身 alpha */
    readonly localAlpha: Float32Array;
    /** local 输入：LocalFlag 位集(自身 culling 等) */
    readonly localFlags: Uint8Array;

    /** world 输出：交错的 [a,b,c,d,tx,ty,worldAlpha,flags]，即渲染消费格式 */
    readonly world: Float32Array;

    /** 层级：父 slot(SlotConst.None=根) */
    readonly parent: Int32Array;
    /** 层级：孩子数 */
    readonly childCount: Uint16Array;
    /** 层级：inline-8 孩子槽；count>8 时 [0] 改存溢出表索引 */
    readonly childrenInline: Int32Array;

    /** 脏：Matrix 通道(自身 / 子树) */
    readonly selfDirtyM: Uint32Array;
    readonly treeDirtyM: Uint32Array;
    /** 脏：Alpha 通道 */
    readonly selfDirtyA: Uint32Array;
    readonly treeDirtyA: Uint32Array;
    /** 脏：Culling 通道 */
    readonly selfDirtyC: Uint32Array;
    readonly treeDirtyC: Uint32Array;

    /** slot 复用代数(free 时 ++)，防 use-after-free */
    readonly slotGen: Uint16Array;

    /** 每通道"world 真正变化"的帧号(sweep 里仅在结果与旧值不同时盖章)。渲染层据此判断是否需重传。 */
    readonly matrixFrame: Uint32Array;
    readonly alphaFrame: Uint32Array;
    readonly cullingFrame: Uint32Array;
}

/**
 * @zh 2D Transform SoA 的「内存工厂」—— 整个系统唯一可切换后端的边界。
 *
 * 由当前 2D 渲染后端的 `I2DRenderPassFactory.createTransform2DMemoryFactory()` 提供(各 driver 分别给)：
 * - Web 系(WebGL/WebGPU/NoRender)：{@link "./WebTransform2DMemoryFactory"} 直接 `new Float32Array(...)`(只 JS 读写)。
 * - native(GLES/LayaX)：{@link "./runtime/RTTransform2DStore".RTTransform2DMemoryFactory} 返回 view over native ArrayBuffer
 *   (上下层共享读写,数据创建下沉 native),算法层零改动。
 *
 * 约定：同一个 chunkIndex 的多次调用必须返回稳定(地址不变)的 buffer；
 * 扩容只追加新 chunk，已存在 chunk 的 buffer 永不重分配 —— 保证零拷贝视图永久有效。
 */
export interface ITransform2DMemoryFactory {
    /**
     * @zh 为第 chunkIndex 个 chunk 创建/获取全部列 buffer。
     * @param chunkIndex 第几个 chunk
     * @param capacity   每 chunk 的 slot 容量(= Chunk.Capacity)
     * @param dirtyWords 每 chunk 的脏 word 数(= Chunk.DirtyWords)
     */
    createChunkBuffers(chunkIndex: number, capacity: number, dirtyWords: number): ITransform2DChunkBuffers;

    /**
     * @zh 全局控制 buffer(dirty 标志 + changed 计数，布局见 {@link "./Transform2DLayout".Control})。
     * 上下层共享读写：上层写入时置 dirty、Stage flush 读 changed 计数；native sweep 直接读/清这块共享内存。
     * 创建一次(store 构造时)。
     * @param length 槽位数(= Control.Length)
     */
    createControlBuffer(length: number): Int32Array;

    /**
     * @zh changed 输出列表(slot 列 + channelMask 列)，上下共享读写：sweep 写、Stage flush 读。
     * 容量随 store 的总 slot 容量增长重建(内容是每帧重写的瞬态产出，重建无损)。
     * @param capacity slot 容量(= chunks 数 × Chunk.Capacity)
     */
    createChangedBuffers(capacity: number): { slots: Int32Array; masks: Int32Array };

    /**
     * @zh 释放第 chunkIndex 个 chunk(可选；Web 实现可不做，等 GC)。
     */
    freeChunkBuffers?(chunkIndex: number): void;
}
