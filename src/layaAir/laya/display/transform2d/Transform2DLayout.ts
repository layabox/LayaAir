/**
 * @zh 2D 节点树透传数据(SoA)的全部布局常量。
 *
 * 约定：buffer 内每个槽位必须在此有名字，禁止匿名空位(无 pad)；
 * stride / 容量 / 位移 / 通道掩码等数字只允许出现在本文件。
 * `const enum` 在编译期内联为字面量，零运行时开销。
 *
 * 改布局(加字段、调顺序)只改这里一处，所有访问点自动跟随。
 */

/**
 * @zh localTrs 列：合成矩阵需要的 9 个值总是一起读 → 交错存(stride=9, 无填充位)。
 * rotation / skewX / skewY 以「度」存储(与 Matrix.setMatrix 一致，内部再转弧度)。
 */
export const enum LocalTrs {
    X = 0,
    Y = 1,
    ScaleX = 2,
    ScaleY = 3,
    Rotation = 4,
    SkewX = 5,
    SkewY = 6,
    PivotX = 7,
    PivotY = 8,
    Stride = 9,
}

/**
 * @zh world 输出列：传播结果，同时就是渲染消费格式。
 * [a, b, c, d, tx, ty, worldAlpha, flags]，flags 见 {@link WorldFlag}。
 */
export const enum WorldData {
    MatA = 0,
    MatB = 1,
    MatC = 2,
    MatD = 3,
    MatTx = 4,
    MatTy = 5,
    Alpha = 6,
    Flags = 7,
    Stride = 8,
}

/** @zh localFlags(Uint8) 位定义。 */
export const enum LocalFlag {
    /** 自身 enableCulling */
    EnableCulling = 1 << 0,
}

/** @zh world flags(打包进 world[Flags] 浮点槽，小整数在 f32 中精确) 位定义。 */
export const enum WorldFlag {
    /** 级联生效的 culling(自身 || 父) */
    Culling = 1 << 0,
}

/**
 * @zh 透传通道。三项相互独立(各自频率、各自脏标记、各自传播)：
 * Matrix 几乎每帧动、Alpha/Culling 很少动，解耦避免低频项陪跑高频项。
 */
export const enum Channel {
    Matrix = 1 << 0,
    Alpha = 1 << 1,
    Culling = 1 << 2,
    All = Matrix | Alpha | Culling,
}

/** @zh 脏位图：一个 u32 word 管 2^5 = 32 个 slot。 */
export const enum DirtyBitmap {
    WordShift = 5,
    BitMask = 31,
}

/**
 * @zh 分块：每 chunk 固定 2^8 = 256 个 slot(唯一旋钮 = Shift，规模大调 9/10)。
 * 扁平 slot = (chunkIndex << Shift) | slotInChunk。
 */
export const enum Chunk {
    Shift = 8,
    Capacity = 1 << Shift,
    Mask = Capacity - 1,
    /** 每 chunk 的脏 word 数 = 256/32 = 8 */
    DirtyWords = Capacity >> DirtyBitmap.WordShift,
}

/** @zh children 存储：≤ InlineCapacity 内联(一个缓存行)，超出整体搬入溢出表。 */
export const enum ChildrenStore {
    InlineCapacity = 8,
    /** 溢出后 inline 区 [0] 改存 spilled 表索引 */
    SpillIndexSlot = 0,
    Stride = 8,
}

/** @zh sweep 整数栈元素打包：slot 左移 3 位，低 3 位放父变更通道掩码(同义 {@link Channel})。 */
export const enum SweepElem {
    SlotShift = 3,
    ChannelMask = 0b111,
}

/** @zh 空 slot / 无父 哨兵值。 */
export const enum SlotConst {
    None = -1,
}

/**
 * @zh 全局控制 buffer(Int32Array)布局：三通道 dirty 标志 + changed 计数。上下层(JS/native)共享读写。
 * dirty：上层写入时置 1，sweep 后复位 0；native sweep 直接读/清这块共享内存。
 * changed 计数配合 changedSlots/changedMasks 两个共享列表(sweep 写、Stage flush 读)。
 */
export const enum Control {
    DirtyM = 0,
    DirtyA = 1,
    DirtyC = 2,
    ChangedCount = 3,
    Length = 4,
}
