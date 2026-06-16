import { LayaGL } from "../../layagl/LayaGL";
import { ITransform2DMemoryFactory } from "./ITransform2DMemory";
import { ITransform2DSweep } from "./ITransform2DSweep";
import { TreeChunk } from "./TreeChunk";
import {
    Channel, ChildrenStore, Chunk, Control, DirtyBitmap, LocalFlag, LocalTrs, SlotConst, SweepElem, WorldData, WorldFlag,
} from "./Transform2DLayout";

const DEG2RAD = Math.PI / 180;

// 模块级数学 scratch(无 per-call 分配)。全部 f32，与列存储一致(无 64 位)。
const _local6 = new Float32Array(6);
const _world6 = new Float32Array(6);
// 慢路径 ping-pong(每级自动按 f32 取整，与 fast path 存 f32 world 一致)。
const _accA = new Float32Array(6);
const _accB = new Float32Array(6);

/**
 * @zh 由 localTrs[base..] 的 9 个值合成局部 2x3 矩阵 → out6[a,b,c,d,tx,ty]。
 * 公式与 Laya `Matrix.setMatrix` 完全一致(rotation/skew 为度)。
 */
function composeLocal(trs: Float32Array, base: number, out: Float32Array): void {
    const x = trs[base + LocalTrs.X], y = trs[base + LocalTrs.Y];
    const sx = trs[base + LocalTrs.ScaleX], sy = trs[base + LocalTrs.ScaleY];
    const rot = trs[base + LocalTrs.Rotation] * DEG2RAD;
    const skx = trs[base + LocalTrs.SkewX] * DEG2RAD;
    const sky = trs[base + LocalTrs.SkewY] * DEG2RAD;
    const px = trs[base + LocalTrs.PivotX], py = trs[base + LocalTrs.PivotY];
    const cosr = Math.cos(rot), sinr = Math.sin(rot);
    const coskx = Math.cos(skx), sinkx = Math.sin(skx);
    const cosky = Math.cos(sky), sinky = Math.sin(sky);
    const a = (cosr * cosky - sinr * sinky) * sx;
    const b = (sinr * cosky + cosr * sinky) * sx;
    const c = (cosr * sinkx - sinr * coskx) * sy;
    const d = (sinr * sinkx + cosr * coskx) * sy;
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = x - a * px - c * py;
    out[5] = y - b * px - d * py;
}

/**
 * @zh out6 = local × parentWorld，与 Laya `Matrix.mul(m1=local, m2=parent)` 完全一致。
 */
function mulWorld(
    l: Float32Array,
    pa: number, pb: number, pc: number, pd: number, ptx: number, pty: number,
    out: Float32Array,
): void {
    const la = l[0], lb = l[1], lc = l[2], ld = l[3], ltx = l[4], lty = l[5];
    if (pb !== 0 || pc !== 0) {
        out[0] = la * pa + lb * pc;
        out[1] = la * pb + lb * pd;
        out[2] = lc * pa + ld * pc;
        out[3] = lc * pb + ld * pd;
        out[4] = pa * ltx + pc * lty + ptx;
        out[5] = pb * ltx + pd * lty + pty;
    } else {
        out[0] = la * pa;
        out[1] = lb * pd;
        out[2] = lc * pa;
        out[3] = ld * pd;
        out[4] = pa * ltx + ptx;
        out[5] = pd * lty + pty;
    }
}

/**
 * @zh 2D 节点树透传数据(worldMatrix / globalAlpha / culling)的 SoA 存储 + 批量更新池。
 *
 * 设计要点见同目录 `2D节点树SoA透传方案.md`：
 * - 写入只标自身 O(1)，帧末统一向上冒泡，单次 gating DFS 传播；
 * - Matrix / Alpha / Culling 三通道独立(各自频率，互不陪跑)；
 * - 分块存储(256/chunk)，扩容只追加，老 chunk 永不重分配；
 * - 内存来源可经 {@link memoryFactory} 切换(Web TypedArray / 未来 C++ FFI view)。
 */
export class Transform2DStore {
    /**
     * @zh sweep(节点树计算)下沉点 —— 唯一可下沉 native 的部分。null=JS sweep(本类内置);
     * RT 在 `Laya.addBeforeInitCallback` 里装上 native sweeper(读共享 buffer 的 local/parent/脏位、写 world、
     * 产出 changed),见 transform2d/runtime/RTTransform2DStore。chunk 创建 / alloc / setParent / 读写 buffer 仍全在本类(上层)。
     */
    static sweeper: ITransform2DSweep | null = null;

    private static _instance: Transform2DStore;

    /**
     * @zh 全局单例(所有 2D Sprite 共享一棵 SoA 森林)。accessor 全在此 JS 类;sweep 视 {@link sweeper} 走 JS / native。
     * 列 buffer 来源由当前 2D 渲染后端(`I2DRenderPassFactory.createTransform2DMemoryFactory`)给：
     * Web=JS TypedArray;GLES/LayaX=native 共享 view(数据创建下沉 native)。首次访问发生在首个 Sprite 创建时,
     * 此时 render2DRenderPassFactory 已由 driver 设好(与 createRenderStruct2D 同前置条件)。
     */
    static get instance(): Transform2DStore {
        return this._instance || (this._instance = new Transform2DStore(LayaGL.render2DRenderPassFactory.createTransform2DMemoryFactory()));
    }

    private readonly _mem: ITransform2DMemoryFactory;
    private readonly chunks: TreeChunk[] = [];
    private _count = 0;
    private readonly _freeList: number[] = [];

    /** children 溢出表(孩子数 > InlineCapacity)；下标即 inline[SpillIndexSlot] 存的值 */
    private readonly _spilled: (number[] | null)[] = [];
    private readonly _freeSpilledIdx: number[] = [];

    /** slot -> 业务对象(Sprite)。供 sweep 后 flush 把变化节点映射回 Sprite。store 不依赖 Sprite 类型，用 any。 */
    private readonly _owners: any[] = [];

    /**
     * @zh 全局控制 buffer(三通道 dirty 标志 + changed 计数,布局见 {@link Control})。上下层共享读写
     * (Web=JS Int32Array / RT=native 共享 view)：上层写入置 dirty、读 changed;native sweep 直接读/清/写这块内存。
     */
    private readonly _control: Int32Array;
    /** sweep 产出:world 真变的 slot 列 + 变化通道掩码列(共享 buffer,容量随总 slot 增长重建)。 */
    private _changedSlots: Int32Array;
    private _changedMasks: Int32Array;
    /** _changedSlots/_changedMasks 当前容量。 */
    private _changedCap: number;

    /** mark 阶段收集的脏子树根(各为 parent==None 的顶点) */
    private readonly _dirtyRoots: Set<number> = new Set();
    /** sweep 复用整数栈(近零分配) */
    private _stack: number[] = [];

    /** 本次 update 的帧号；sweep 在某通道 world 真正变化时盖到对应 *Frame 列 */
    private _curFrame = 0;

    constructor(mem: ITransform2DMemoryFactory) {
        this._mem = mem;
        this._control = mem.createControlBuffer(Control.Length);
        const cap = Chunk.Capacity; // 初始 1 个 chunk 的 slot 容量
        const cb = mem.createChangedBuffers(cap);
        this._changedSlots = cb.slots;
        this._changedMasks = cb.masks;
        this._changedCap = cap;
    }

    /** @zh 三通道全局脏标志(本帧该通道是否有人动过):读自共享控制 buffer。 */
    get dirtyM(): boolean { return this._control[Control.DirtyM] !== 0; }
    get dirtyA(): boolean { return this._control[Control.DirtyA] !== 0; }
    get dirtyC(): boolean { return this._control[Control.DirtyC] !== 0; }

    /** @zh sweep 产出:world 真变的 slot 列 / 变化通道掩码列 / 条数。共享 buffer,Stage flush 据此回写。 */
    get changedSlots(): Int32Array { return this._changedSlots; }
    get changedMasks(): Int32Array { return this._changedMasks; }
    get changedCount(): number { return this._control[Control.ChangedCount]; }

    // ───────────────────────────── slot 生命周期 ─────────────────────────────

    /** @zh 分配一个 slot(局部恒等变换、alpha=1、无父)，标记 All 脏让首帧计算 world。 */
    alloc(): number {
        let slot: number;
        if (this._freeList.length > 0) {
            slot = this._freeList.pop();
        } else {
            slot = this._count++;
            this._ensureChunk(slot);
        }
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        const tb = li * LocalTrs.Stride;
        c.localTrs[tb + LocalTrs.X] = 0;
        c.localTrs[tb + LocalTrs.Y] = 0;
        c.localTrs[tb + LocalTrs.ScaleX] = 1;
        c.localTrs[tb + LocalTrs.ScaleY] = 1;
        c.localTrs[tb + LocalTrs.Rotation] = 0;
        c.localTrs[tb + LocalTrs.SkewX] = 0;
        c.localTrs[tb + LocalTrs.SkewY] = 0;
        c.localTrs[tb + LocalTrs.PivotX] = 0;
        c.localTrs[tb + LocalTrs.PivotY] = 0;
        c.localAlpha[li] = 1;
        c.localFlags[li] = 0;
        const wb = li * WorldData.Stride;
        c.world[wb + WorldData.MatA] = 1;
        c.world[wb + WorldData.MatB] = 0;
        c.world[wb + WorldData.MatC] = 0;
        c.world[wb + WorldData.MatD] = 1;
        c.world[wb + WorldData.MatTx] = 0;
        c.world[wb + WorldData.MatTy] = 0;
        c.world[wb + WorldData.Alpha] = 1;
        c.world[wb + WorldData.Flags] = 0;
        c.parent[li] = SlotConst.None;
        c.childCount[li] = 0;
        this._mark(c, li, Channel.All);
        return slot;
    }

    /** @zh 释放 slot(从父的孩子列表摘除、清自身脏位、代数自增)。调用方需先释放/转移其子节点。 */
    free(slot: number): void {
        const old = this._parentOf(slot);
        if (old !== SlotConst.None) this._removeChild(old, slot);
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        c.parent[li] = SlotConst.None;
        c.childCount[li] = 0;
        const w = li >> DirtyBitmap.WordShift;
        const clr = ~(1 << (li & DirtyBitmap.BitMask));
        c.selfDirtyM[w] &= clr;
        c.selfDirtyA[w] &= clr;
        c.selfDirtyC[w] &= clr;
        c.slotGen[li] = (c.slotGen[li] + 1) & 0xffff;
        this._owners[slot] = null;
        this._freeList.push(slot);
    }

    /** @zh slot 的复用代数(用于 Sprite 句柄防 use-after-free 断言)。 */
    genOf(slot: number): number {
        return this.chunks[slot >> Chunk.Shift].slotGen[slot & Chunk.Mask];
    }

    /** @zh 绑定 slot 的业务对象(Sprite)，供 flush 映射回。 */
    setOwner(slot: number, owner: any): void {
        this._owners[slot] = owner;
    }

    /** @zh 取 slot 的业务对象。 */
    getOwner(slot: number): any {
        return this._owners[slot];
    }

    /** @zh 确保 slot 所在 chunk 已存在；扩容只追加新 chunk，老 chunk 的 buffer 永不搬家。 */
    private _ensureChunk(slot: number): void {
        const ci = slot >> Chunk.Shift;
        while (this.chunks.length <= ci) {
            this.chunks.push(new TreeChunk(this.chunks.length, this._mem));
        }
        // changed 输出容量随总 slot 容量增长(瞬态产出,重建无损;每 slot 一帧最多入列一次,故不会溢出)。
        const cap = this.chunks.length << Chunk.Shift;
        if (cap > this._changedCap) {
            const cb = this._mem.createChangedBuffers(cap);
            this._changedSlots = cb.slots;
            this._changedMasks = cb.masks;
            this._changedCap = cap;
        }
    }

    // ───────────────────────────── 层级 ─────────────────────────────

    getParent(slot: number): number {
        return this._parentOf(slot);
    }

    /** @zh 设父(同时维护双方孩子列表)，并标 All 脏 —— 子树由 sweep 的 parentChanged 自动重算。 */
    setParent(slot: number, newParent: number): void {
        const old = this._parentOf(slot);
        if (old === newParent) return;
        if (old !== SlotConst.None) this._removeChild(old, slot);
        this.chunks[slot >> Chunk.Shift].parent[slot & Chunk.Mask] = newParent;
        if (newParent !== SlotConst.None) this._addChild(newParent, slot);
        this.markDirty(slot, Channel.All);
    }

    /** @zh 读取 slot 的父 slot；根节点返回 SlotConst.None。 */
    private _parentOf(slot: number): number {
        return this.chunks[slot >> Chunk.Shift].parent[slot & Chunk.Mask];
    }

    /** @internal 调试：返回 slot 的孩子 slot 列表(按存储顺序)。 */
    debugChildrenOf(slot: number): number[] {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        const n = c.childCount[li];
        const base = li * ChildrenStore.Stride;
        const out: number[] = [];
        if (n <= ChildrenStore.InlineCapacity) {
            for (let i = 0; i < n; i++) out.push(c.childrenInline[base + i]);
        } else {
            const arr = this._spilled[c.childrenInline[base + ChildrenStore.SpillIndexSlot]];
            for (let i = 0; i < n; i++) out.push(arr[i]);
        }
        return out;
    }

    /** @zh 把 child 挂进 parent 的孩子表；前 8 个走 inline，第 9 个开始迁入 spilled 表。 */
    private _addChild(parent: number, child: number): void {
        const pc = this.chunks[parent >> Chunk.Shift];
        const pli = parent & Chunk.Mask;
        const n = pc.childCount[pli];
        const base = pli * ChildrenStore.Stride;
        if (n < ChildrenStore.InlineCapacity) {
            pc.childrenInline[base + n] = child;
        } else if (n === ChildrenStore.InlineCapacity) {
            const arr: number[] = new Array(ChildrenStore.InlineCapacity + 1);
            for (let i = 0; i < ChildrenStore.InlineCapacity; i++) arr[i] = pc.childrenInline[base + i];
            arr[ChildrenStore.InlineCapacity] = child;
            pc.childrenInline[base + ChildrenStore.SpillIndexSlot] = this._allocSpill(arr);
        } else {
            this._spilled[pc.childrenInline[base + ChildrenStore.SpillIndexSlot]].push(child);
        }
        pc.childCount[pli] = n + 1;
    }

    /** @zh 从 parent 的孩子表移除 child；用 swap-remove 保持 O(1)，孩子顺序不保证稳定。 */
    private _removeChild(parent: number, child: number): void {
        const pc = this.chunks[parent >> Chunk.Shift];
        const pli = parent & Chunk.Mask;
        const n = pc.childCount[pli];
        const base = pli * ChildrenStore.Stride;
        if (n <= ChildrenStore.InlineCapacity) {
            for (let i = 0; i < n; i++) {
                if (pc.childrenInline[base + i] === child) {
                    pc.childrenInline[base + i] = pc.childrenInline[base + n - 1];
                    break;
                }
            }
            pc.childCount[pli] = n - 1;
        } else {
            const idx = pc.childrenInline[base + ChildrenStore.SpillIndexSlot];
            const arr = this._spilled[idx];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === child) {
                    arr[i] = arr[arr.length - 1];
                    arr.pop();
                    break;
                }
            }
            const nn = n - 1;
            pc.childCount[pli] = nn;
            if (nn === ChildrenStore.InlineCapacity) {
                for (let i = 0; i < ChildrenStore.InlineCapacity; i++) pc.childrenInline[base + i] = arr[i];
                this._freeSpill(idx);
            }
        }
    }

    /** @zh 为大孩子表分配一个 spilled 表索引；优先复用 _freeSpilledIdx 回收的空位。 */
    private _allocSpill(arr: number[]): number {
        if (this._freeSpilledIdx.length > 0) {
            const idx = this._freeSpilledIdx.pop();
            this._spilled[idx] = arr;
            return idx;
        }
        this._spilled.push(arr);
        return this._spilled.length - 1;
    }

    /** @zh 回收 spilled 表索引；孩子数从 9 降回 8 时，数组搬回 inline 后调用。 */
    private _freeSpill(idx: number): void {
        this._spilled[idx] = null;
        this._freeSpilledIdx.push(idx);
    }

    // ───────────────────────────── 写入(O(1) 打勾) ─────────────────────────────

    /** @zh 写一个 TRS 字段(field = LocalTrs 偏移)，标 Matrix 脏。 */
    writeTRS(slot: number, field: number, value: number): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        c.localTrs[li * LocalTrs.Stride + field] = value;
        this._mark(c, li, Channel.Matrix);
    }

    /** @zh 批量写全部 TRS(用于 pos()/scale() 等组合 setter)，标 Matrix 脏。 */
    writeTRSAll(
        slot: number, x: number, y: number, sx: number, sy: number,
        rotation: number, skewX: number, skewY: number, pivotX: number, pivotY: number,
    ): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        const tb = li * LocalTrs.Stride;
        c.localTrs[tb + LocalTrs.X] = x;
        c.localTrs[tb + LocalTrs.Y] = y;
        c.localTrs[tb + LocalTrs.ScaleX] = sx;
        c.localTrs[tb + LocalTrs.ScaleY] = sy;
        c.localTrs[tb + LocalTrs.Rotation] = rotation;
        c.localTrs[tb + LocalTrs.SkewX] = skewX;
        c.localTrs[tb + LocalTrs.SkewY] = skewY;
        c.localTrs[tb + LocalTrs.PivotX] = pivotX;
        c.localTrs[tb + LocalTrs.PivotY] = pivotY;
        this._mark(c, li, Channel.Matrix);
    }

    readTRS(slot: number, field: number): number {
        const c = this.chunks[slot >> Chunk.Shift];
        return c.localTrs[(slot & Chunk.Mask) * LocalTrs.Stride + field];
    }

    writeAlpha(slot: number, value: number): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        c.localAlpha[li] = value;
        this._mark(c, li, Channel.Alpha);
    }

    readAlpha(slot: number): number {
        const c = this.chunks[slot >> Chunk.Shift];
        return c.localAlpha[slot & Chunk.Mask];
    }

    writeCulling(slot: number, value: boolean): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        if (value) c.localFlags[li] |= LocalFlag.EnableCulling;
        else c.localFlags[li] &= ~LocalFlag.EnableCulling;
        this._mark(c, li, Channel.Culling);
    }

    readCulling(slot: number): boolean {
        const c = this.chunks[slot >> Chunk.Shift];
        return (c.localFlags[slot & Chunk.Mask] & LocalFlag.EnableCulling) !== 0;
    }

    /** @zh 标脏(可组合多通道)，供 setParent / 集成层使用。 */
    markDirty(slot: number, ch: Channel): void {
        this._mark(this.chunks[slot >> Chunk.Shift], slot & Chunk.Mask, ch);
    }

    /** @zh 给 chunk 内局部 slot 打 selfDirty 位，并打开对应全局通道脏标志。 */
    private _mark(c: TreeChunk, li: number, ch: Channel): void {
        const w = li >> DirtyBitmap.WordShift;
        const m = 1 << (li & DirtyBitmap.BitMask);
        const ctrl = this._control;
        if (ch & Channel.Matrix) { c.selfDirtyM[w] |= m; ctrl[Control.DirtyM] = 1; }
        if (ch & Channel.Alpha) { c.selfDirtyA[w] |= m; ctrl[Control.DirtyA] = 1; }
        if (ch & Channel.Culling) { c.selfDirtyC[w] |= m; ctrl[Control.DirtyC] = 1; }
        c.anyDirty = true;
    }

    // ───────────────────────────── 帧末管线 ─────────────────────────────

    /**
     * @zh 帧末统一更新(节点树计算)。这是唯一可下沉 native 的部分：
     * 装了 {@link Transform2DStore.sweeper} 走 native(读共享 buffer、写 world、产出 changed)；否则走本类内置 JS sweep。
     * @param frameId 当前帧号。sweep 中某通道 world 真正变化时盖到该 slot 的 *Frame 列，渲染层据此判断是否重传。
     */
    update(frameId: number): void {
        this._curFrame = frameId;
        if (Transform2DStore.sweeper) Transform2DStore.sweeper.update(this, frameId);
        else this._MainSweep();
    }

    /** @zh JS sweep：三通道各自向上冒泡 + 单次 gating DFS 传播 + 清脏。RT 模式由 native 等价实现替代。 */
    private _MainSweep(): void {
        const ctrl = this._control;
        // 先清 changed 计数,保证无脏提前返回时 flush 读到 0(而非上一帧残留)。
        ctrl[Control.ChangedCount] = 0;
        if (!ctrl[Control.DirtyM] && !ctrl[Control.DirtyA] && !ctrl[Control.DirtyC]) return;
        this._dirtyRoots.clear();

        if (ctrl[Control.DirtyM]) this._markChannel(Channel.Matrix);
        if (ctrl[Control.DirtyA]) this._markChannel(Channel.Alpha);
        if (ctrl[Control.DirtyC]) this._markChannel(Channel.Culling);

        this._sweep();
        this._clearDirty();
        ctrl[Control.DirtyM] = ctrl[Control.DirtyA] = ctrl[Control.DirtyC] = 0;
    }

    /** @zh 单通道：扫自身脏位，逐个向祖先冒泡 treeDirty，收集脏子树根。 */
    private _markChannel(ch: Channel): void {
        const chunks = this.chunks;
        for (let ci = 0; ci < chunks.length; ci++) {
            const c = chunks[ci];
            if (!c.anyDirty) continue;
            const self = ch === Channel.Matrix ? c.selfDirtyM : ch === Channel.Alpha ? c.selfDirtyA : c.selfDirtyC;
            for (let w = 0; w < Chunk.DirtyWords; w++) {
                let bits = self[w];
                while (bits !== 0) {
                    const low = bits & -bits;
                    const b = 31 - Math.clz32(low);
                    bits &= bits - 1;
                    this._bubble(c.baseSlot + (w << DirtyBitmap.WordShift) + b, ch);
                }
            }
        }
    }

    /** @zh 从 slot 向上：给祖先链置 treeDirty(遇已置则剪枝)，到根则记录脏根。 */
    private _bubble(slot: number, ch: Channel): void {
        let cur = this._parentOf(slot);
        if (cur === SlotConst.None) {
            this._dirtyRoots.add(slot); // slot 自身即根
            return;
        }
        for (;;) {
            if (this._testTree(cur, ch)) return; // 祖先已标记，其根已被收集
            this._setTree(cur, ch);
            const p = this._parentOf(cur);
            if (p === SlotConst.None) {
                this._dirtyRoots.add(cur);
                return;
            }
            cur = p;
        }
    }

    /** @zh 检查 slot 的 treeDirty 位；冒泡时用于判断这条祖先链是否已经处理过。 */
    private _testTree(slot: number, ch: Channel): boolean {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        const w = li >> DirtyBitmap.WordShift;
        const m = 1 << (li & DirtyBitmap.BitMask);
        const tree = ch === Channel.Matrix ? c.treeDirtyM : ch === Channel.Alpha ? c.treeDirtyA : c.treeDirtyC;
        return (tree[w] & m) !== 0;
    }

    /** @zh 给祖先 slot 打 treeDirty 位，表示它的子树里有该通道的脏节点，sweep 不能跳过。 */
    private _setTree(slot: number, ch: Channel): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const li = slot & Chunk.Mask;
        const w = li >> DirtyBitmap.WordShift;
        const m = 1 << (li & DirtyBitmap.BitMask);
        if (ch === Channel.Matrix) c.treeDirtyM[w] |= m;
        else if (ch === Channel.Alpha) c.treeDirtyA[w] |= m;
        else c.treeDirtyC[w] |= m;
        // 关键：tree 脏所在的块也必须置 anyDirty，否则 _clearDirty 会跳过它，
        // treeDirty 位泄漏到后续帧，使 _bubble 误判"祖先已标记"而提前剪枝、漏掉脏根。
        c.anyDirty = true;
    }

    /** @zh 单次 DFS：每通道独立 gating，干净子树整体跳过，父先于子。 */
    private _sweep(): void {
        const stack = this._stack;
        let top = 0;
        for (const r of this._dirtyRoots) stack[top++] = r << SweepElem.SlotShift; // 根 parentChangedMask=0

        const chunks = this.chunks;
        while (top > 0) {
            const v = stack[--top];
            const slot = v >>> SweepElem.SlotShift;
            const pcm = v & SweepElem.ChannelMask;
            const c = chunks[slot >> Chunk.Shift];
            const li = slot & Chunk.Mask;
            const w = li >> DirtyBitmap.WordShift;
            const m = 1 << (li & DirtyBitmap.BitMask);

            const selfM = c.selfDirtyM[w] & m, treeM = c.treeDirtyM[w] & m;
            const selfA = c.selfDirtyA[w] & m, treeA = c.treeDirtyA[w] & m;
            const selfC = c.selfDirtyC[w] & m, treeC = c.treeDirtyC[w] & m;

            const mDirty = (pcm & Channel.Matrix) || selfM;
            const aDirty = (pcm & Channel.Alpha) || selfA;
            const cDirty = (pcm & Channel.Culling) || selfC;

            if (!mDirty && !aDirty && !cDirty && !treeM && !treeA && !treeC) continue;

            // 取父的 world / alpha / culling(无父则恒等)
            const p = c.parent[li];
            let pa = 1, pb = 0, pc2 = 0, pd = 1, ptx = 0, pty = 0, pAlpha = 1, pCull = 0;
            if (p !== SlotConst.None) {
                const pchunk = chunks[p >> Chunk.Shift];
                const pwb = (p & Chunk.Mask) * WorldData.Stride;
                pa = pchunk.world[pwb + WorldData.MatA];
                pb = pchunk.world[pwb + WorldData.MatB];
                pc2 = pchunk.world[pwb + WorldData.MatC];
                pd = pchunk.world[pwb + WorldData.MatD];
                ptx = pchunk.world[pwb + WorldData.MatTx];
                pty = pchunk.world[pwb + WorldData.MatTy];
                pAlpha = pchunk.world[pwb + WorldData.Alpha];
                pCull = (pchunk.world[pwb + WorldData.Flags] & WorldFlag.Culling) ? 1 : 0;
            }

            const wb = li * WorldData.Stride;
            const world = c.world;
            const frame = this._curFrame;
            let childMask = 0;

            if (mDirty) {
                composeLocal(c.localTrs, li * LocalTrs.Stride, _local6);
                mulWorld(_local6, pa, pb, pc2, pd, ptx, pty, _world6);
                if (world[wb + WorldData.MatA] !== _world6[0] || world[wb + WorldData.MatB] !== _world6[1]
                    || world[wb + WorldData.MatC] !== _world6[2] || world[wb + WorldData.MatD] !== _world6[3]
                    || world[wb + WorldData.MatTx] !== _world6[4] || world[wb + WorldData.MatTy] !== _world6[5]) {
                    world[wb + WorldData.MatA] = _world6[0];
                    world[wb + WorldData.MatB] = _world6[1];
                    world[wb + WorldData.MatC] = _world6[2];
                    world[wb + WorldData.MatD] = _world6[3];
                    world[wb + WorldData.MatTx] = _world6[4];
                    world[wb + WorldData.MatTy] = _world6[5];
                    c.matrixFrame[li] = frame; // ← world 矩阵真变才盖章
                    childMask |= Channel.Matrix;
                }
            }
            if (aDirty) {
                const nw = pAlpha * c.localAlpha[li];
                if (world[wb + WorldData.Alpha] !== nw) {
                    world[wb + WorldData.Alpha] = nw;
                    c.alphaFrame[li] = frame;
                    childMask |= Channel.Alpha;
                }
            }
            if (cDirty) {
                const nc = ((c.localFlags[li] & LocalFlag.EnableCulling) ? 1 : 0) | pCull;
                const cur = world[wb + WorldData.Flags];
                const nf = (cur & ~WorldFlag.Culling) | (nc ? WorldFlag.Culling : 0);
                if (cur !== nf) {
                    world[wb + WorldData.Flags] = nf;
                    c.cullingFrame[li] = frame;
                    childMask |= Channel.Culling;
                }
            }

            if (childMask !== 0) {
                const cc = this._control[Control.ChangedCount];
                this._changedSlots[cc] = slot;
                this._changedMasks[cc] = childMask;
                this._control[Control.ChangedCount] = cc + 1;
            }

            // 下探：有要传给孩子的变更，或更深处仍有脏
            if (childMask !== 0 || treeM || treeA || treeC) {
                const n = c.childCount[li];
                if (n > 0) {
                    const cbase = li * ChildrenStore.Stride;
                    if (n <= ChildrenStore.InlineCapacity) {
                        for (let i = 0; i < n; i++) {
                            stack[top++] = (c.childrenInline[cbase + i] << SweepElem.SlotShift) | childMask;
                        }
                    } else {
                        const arr = this._spilled[c.childrenInline[cbase + ChildrenStore.SpillIndexSlot]];
                        for (let i = 0; i < n; i++) {
                            stack[top++] = (arr[i] << SweepElem.SlotShift) | childMask;
                        }
                    }
                }
            }
        }
    }

    /** @zh 清各脏块的全部脏位图(只清 anyDirty 的块)。 */
    private _clearDirty(): void {
        const chunks = this.chunks;
        for (let ci = 0; ci < chunks.length; ci++) {
            const c = chunks[ci];
            if (!c.anyDirty) continue;
            c.selfDirtyM.fill(0); c.treeDirtyM.fill(0);
            c.selfDirtyA.fill(0); c.treeDirtyA.fill(0);
            c.selfDirtyC.fill(0); c.treeDirtyC.fill(0);
            c.anyDirty = false;
        }
    }

    // ───────────────────────────── 读取(快路径，已结账) ─────────────────────────────

    /** @zh 把 world 矩阵的 6 个分量拷进 out[0..5]。 */
    readWorldMatrix(slot: number, out: Float32Array | number[]): void {
        const c = this.chunks[slot >> Chunk.Shift];
        const wb = (slot & Chunk.Mask) * WorldData.Stride;
        const world = c.world;
        out[0] = world[wb + WorldData.MatA];
        out[1] = world[wb + WorldData.MatB];
        out[2] = world[wb + WorldData.MatC];
        out[3] = world[wb + WorldData.MatD];
        out[4] = world[wb + WorldData.MatTx];
        out[5] = world[wb + WorldData.MatTy];
    }

    getWorldAlpha(slot: number): number {
        const c = this.chunks[slot >> Chunk.Shift];
        return c.world[(slot & Chunk.Mask) * WorldData.Stride + WorldData.Alpha];
    }

    /**
     * @zh slot 相对祖先 base 的"相对 worldAlpha"(cacheAs/RT/mask 内容隔离)：slot→base(不含 base) 的 localAlpha 乘积。
     * 不能用 worldAlpha(slot)×(1/worldAlpha(base))：base 为 0(cacheRoot.alpha=0)时会塌成 0，内容 RT 渲透明、回升拿旧缓存。
     * base===slot 返回 1；base 非 slot 祖先时退化为 worldAlpha(slot)。
     * @param dirty true 或 base≈0 时沿父链现算乘积；否则用已结账 world 列做除法(O(1))。
     */
    getRelativeWorldAlpha(slot: number, base: number, dirty: boolean): number {
        if (base === slot) return 1;
        if (!dirty) {
            const wb = this.getWorldAlpha(base); // 非 0 直接除；为 0 落到链上乘积(相对 alpha 与 base alpha 无关)
            if (wb > 1e-6) return this.getWorldAlpha(slot) / wb;
        }
        let acc = 1;
        let cur = slot;
        while (cur !== SlotConst.None && cur !== base) {
            const c = this.chunks[cur >> Chunk.Shift];
            acc = Math.fround(acc * c.localAlpha[cur & Chunk.Mask]);
            cur = c.parent[cur & Chunk.Mask];
        }
        return acc;
    }

    getWorldCulling(slot: number): boolean {
        const c = this.chunks[slot >> Chunk.Shift];
        return (c.world[(slot & Chunk.Mask) * WorldData.Stride + WorldData.Flags] & WorldFlag.Culling) !== 0;
    }

    /**
     * @zh 各通道"world 真正变化"的帧号。渲染层用自己上次处理的帧号与之比较：不同(更大)则需重传。
     * 注意：只有 world 结果真变才更新，故 alpha 变不会触发 matrixFrame 变化，三通道互不误触。
     */
    // slot<0(未绑定 SoA 的临时 render struct，如 line/debug draw)兜底：返回 _curFrame(每帧递增)，
    // 既不会越界崩溃，又让这类结构每帧重传(与旧 trans.modifiedFrame=loopCount 行为一致)。
    getMatrixFrame(slot: number): number {
        return slot < 0 ? this._curFrame : this.chunks[slot >> Chunk.Shift].matrixFrame[slot & Chunk.Mask];
    }

    getAlphaFrame(slot: number): number {
        return slot < 0 ? this._curFrame : this.chunks[slot >> Chunk.Shift].alphaFrame[slot & Chunk.Mask];
    }

    getCullingFrame(slot: number): number {
        return slot < 0 ? this._curFrame : this.chunks[slot >> Chunk.Shift].cullingFrame[slot & Chunk.Mask];
    }

    // ───────────────────────────── 读取(慢路径，帧中未结账) ─────────────────────────────
    // 与 fast path 逐位一致(同公式、同 f32 取整)，仅现算不缓存。

    /** @zh 沿父链现算 world 矩阵 → out[0..5]。用于该通道仍 dirty 时的帧中读取。 */
    computeWorldMatrix(slot: number, out: Float32Array | number[]): void {
        // 收集到根的链
        const chain = this._chainScratch;
        chain.length = 0;
        let cur = slot;
        while (cur !== SlotConst.None) {
            chain.push(cur);
            cur = this._parentOf(cur);
        }
        // 从根往下逐级 local × parentWorld，用 Float32 累加器(每级按 f32 取整，与存储一致)
        let acc = _accA, other = _accB;
        // 根
        const rootSlot = chain[chain.length - 1];
        const rc = this.chunks[rootSlot >> Chunk.Shift];
        composeLocal(rc.localTrs, (rootSlot & Chunk.Mask) * LocalTrs.Stride, _local6);
        acc[0] = _local6[0]; acc[1] = _local6[1]; acc[2] = _local6[2];
        acc[3] = _local6[3]; acc[4] = _local6[4]; acc[5] = _local6[5];
        for (let i = chain.length - 2; i >= 0; i--) {
            const s = chain[i];
            const sc = this.chunks[s >> Chunk.Shift];
            composeLocal(sc.localTrs, (s & Chunk.Mask) * LocalTrs.Stride, _local6);
            mulWorld(_local6, acc[0], acc[1], acc[2], acc[3], acc[4], acc[5], _world6);
            other[0] = _world6[0]; other[1] = _world6[1]; other[2] = _world6[2];
            other[3] = _world6[3]; other[4] = _world6[4]; other[5] = _world6[5];
            const t = acc; acc = other; other = t;
        }
        out[0] = acc[0]; out[1] = acc[1]; out[2] = acc[2];
        out[3] = acc[3]; out[4] = acc[4]; out[5] = acc[5];
    }

    private readonly _chainScratch: number[] = [];

    /** @zh 沿父链现算 worldAlpha(每级按 f32 取整)。 */
    computeWorldAlpha(slot: number): number {
        let acc = 1;
        let cur = slot;
        // 自下而上乘积可交换，直接累乘
        while (cur !== SlotConst.None) {
            const c = this.chunks[cur >> Chunk.Shift];
            acc = Math.fround(acc * c.localAlpha[cur & Chunk.Mask]);
            cur = c.parent[cur & Chunk.Mask];
        }
        return acc;
    }


    /** @zh 沿父链现算 culling(OR)。 */
    computeWorldCulling(slot: number): boolean {
        let cur = slot;
        while (cur !== SlotConst.None) {
            const c = this.chunks[cur >> Chunk.Shift];
            const li = cur & Chunk.Mask;
            if (c.localFlags[li] & LocalFlag.EnableCulling) return true;
            cur = c.parent[li];
        }
        return false;
    }
}
