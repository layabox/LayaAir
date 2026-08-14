import { Laya } from "../../../../../Laya";
import { ITransform2DChunkBuffers, ITransform2DMemoryFactory } from "../../../../display/transform2d/ITransform2DMemory";
import { ITransform2DSweep } from "../../../../display/transform2d/ITransform2DSweep";
import { ChildrenStore, LocalTrs, WorldData } from "../../../../display/transform2d/Transform2DLayout";
import { Transform2DStore } from "../../../../display/transform2d/Transform2DStore";
import { NativeMemory } from "../NativeMemory";

/**
 * @zh 共享 native transformStore 句柄。SoA 的列 buffer / 控制 buffer / changed buffer 都由 **JS 用 NativeMemory 分配**
 * (native 共享块),再把 `_buffer` 传下去给它**绑定**;sweep 也在它身上跑 —— memory factory 与 sweeper 共用同一个
 * native 对象,保证"绑定的 buffer 就是被 sweep 的 buffer"。
 */
let _nativeStore: any = null;
function rtNativeStore(): any {
    return _nativeStore || (_nativeStore = new (window as any).conchRTTransform2DStore());
}

/**
 * @zh Transform2D SoA 数据创建的 native 下沉。**JS 侧分配**:每个 chunk(及 control / changed)用 {@link NativeMemory}
 * 申请一块 native 共享内存,在其上按布局铺各列的 TypedArray 视图,**再把底层 ArrayBuffer 传下去让 native 绑定**
 * (同 3D `new conchLayaXTransform(mem._buffer)`)。上层 JS 与下层 native 读写**同一份内存**;native 按相同布局跑 sweep。
 * 由 GLES/LayaX 的 `I2DRenderPassFactory.createTransform2DMemoryFactory()` 创建。
 */
export class RTTransform2DMemoryFactory implements ITransform2DMemoryFactory {
    private _native = rtNativeStore();

    createChunkBuffers(chunkIndex: number, capacity: number, dirtyWords: number): ITransform2DChunkBuffers {
        const cap = capacity, dw = dirtyWords;
        // 一块 NativeMemory 放整 chunk 的所有列：4字节列在前 → 2字节列 → 1字节列,自然对齐无填充。
        const cnt4 = cap * LocalTrs.Stride + cap + cap * WorldData.Stride + cap + cap * ChildrenStore.Stride + 6 * dw + 3 * cap;
        const bytes = cnt4 * 4 + (cap + cap) * 2 + cap;
        const mem = new NativeMemory(bytes, false);
        const buf = mem._buffer;
        let o = 0; // 运行字节偏移
        const f32 = (n: number) => { const v = new Float32Array(buf, o, n); o += n * 4; return v; };
        const i32 = (n: number) => { const v = new Int32Array(buf, o, n); o += n * 4; return v; };
        const u32 = (n: number) => { const v = new Uint32Array(buf, o, n); o += n * 4; return v; };
        const u16 = (n: number) => { const v = new Uint16Array(buf, o, n); o += n * 2; return v; };
        const u8 = (n: number) => { const v = new Uint8Array(buf, o, n); o += n; return v; };
        // ↓ 属性求值按源码顺序:必须 4字节列全部在前、再 2字节、再 1字节(与上面字节布局一致)。
        const cb: ITransform2DChunkBuffers = {
            localTrs: f32(cap * LocalTrs.Stride),
            localAlpha: f32(cap),
            world: f32(cap * WorldData.Stride),
            parent: i32(cap),
            childrenInline: i32(cap * ChildrenStore.Stride),
            selfDirtyM: u32(dw), treeDirtyM: u32(dw),
            selfDirtyA: u32(dw), treeDirtyA: u32(dw),
            selfDirtyC: u32(dw), treeDirtyC: u32(dw),
            matrixFrame: u32(cap), alphaFrame: u32(cap), cullingFrame: u32(cap),
            childCount: u16(cap), slotGen: u16(cap),
            localFlags: u8(cap),
        };
        // 把这块 NativeBuffer 传下去,让 native 绑定到同一份共享内存(按相同布局跑 sweep)。
        this._native.bindChunkBuffer(chunkIndex, buf, cap, dw);
        return cb;
    }

    createControlBuffer(length: number): Int32Array {
        const mem = new NativeMemory(length * 4, false);
        this._native.bindControlBuffer(mem._buffer, length);
        return new Int32Array(mem._buffer, 0, length);
    }

    createChangedBuffers(capacity: number): { slots: Int32Array; masks: Int32Array } {
        const slotsMem = new NativeMemory(capacity * 4, false);
        const masksMem = new NativeMemory(capacity * 4, false);
        this._native.bindChangedBuffers(slotsMem._buffer, masksMem._buffer, capacity);
        return {
            slots: new Int32Array(slotsMem._buffer, 0, capacity),
            masks: new Int32Array(masksMem._buffer, 0, capacity),
        };
    }
}

/**
 * @zh 节点树计算(sweep)的 native 下沉。与 {@link RTTransform2DMemoryFactory} 共用同一 native store：
 * native 在已绑定的共享 buffer 上读 dirty+local+parent → 写 world、写 changed+计数、复位 dirty。dirty/changed 都在共享
 * control/changed buffer,JS 直接读(changedCount/dirtyM…),**零回传同步**。
 */
export class RTTransform2DSweep implements ITransform2DSweep {
    private _native = rtNativeStore();

    update(_store: Transform2DStore, frameId: number): void {
        this._native.update(frameId);
    }
}

// sweep 下沉注册:仅当 native 提供 conchRTTransform2DStore 时装上(否则保持 JS sweep)。
// memory factory 由 I2DRenderPassFactory 创建;本文件被 RT 进程(GLES/LayaX)import 即触发本回调。
Laya.addBeforeInitCallback(() => {
    if ((window as any).conchRTTransform2DStore) {
        Transform2DStore.sweeper = new RTTransform2DSweep();
    }
});
