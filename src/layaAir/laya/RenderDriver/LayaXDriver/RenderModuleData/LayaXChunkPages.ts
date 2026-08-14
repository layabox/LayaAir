/**
 * LayaXChunkPages —— JS 供页注册表（stable_row_chunk_design.md §7.1）。
 *
 * ECS chunk 页内存由 JS 分配（1MB = 64 chunk）并注册给 Rust 当 chunk 内存：
 * chunk 数据因此住在 JS 自己的 ArrayBuffer 里，零拷贝视图是自家 buffer 上的
 * 普通 TypedArray——V8 沙箱（Android）/OHOS JSVM 无 external ArrayBuffer 的
 * 缺口全消失，全平台统一。
 *
 * 规则：
 *   - 注册表持强引用防 GC（INV-7）；页归 JS 所有，跨 device 重建存活。
 *   - register 返回 0xFFFFFFFF（provider 未启用/失败）则永久停供，
 *     回退 Rust 堆页（行为不变，仅丢沙箱零拷贝）。
 */
export class LayaXChunkPages {
    /** 页大小：1MB = 64 chunk */
    private static readonly PAGE_BYTES = 1 << 20;
    /** 储备页水位：空闲页低于该值即补 */
    private static readonly WATERMARK = 8;
    private static readonly ENTITY_CREATE_RESERVE = 16;
    private static readonly MAX_REGISTER_PER_ENSURE = 128;

    /** 已注册页（下标 = Rust 侧 page_id，注册顺序一致；强引用防 GC） */
    private static _pages: ArrayBuffer[] = [];
    private static _dead: boolean = false;

    /**
     * 实体创建是页消耗的唯一来源：每次创建前补足储备页（稳态零成本，一次跨界查询）。
     */
    static ensure(nativeObj: any, minFree: number = LayaXChunkPages.WATERMARK): boolean {
        if (LayaXChunkPages._dead) return false;
        let freeCount = nativeObj.chunkPagesFreeCount();
        let registeredThisCall = 0;
        while (freeCount < minFree) {
            if (registeredThisCall >= LayaXChunkPages.MAX_REGISTER_PER_ENSURE) {
                LayaXChunkPages._dead = true;
                console.warn("[LayaXChunkPages] reserve limit reached, falling back to native pages");
                return false;
            }
            const buf = new ArrayBuffer(LayaXChunkPages.PAGE_BYTES);
            const id: number = nativeObj.chunkPagesRegister(buf);
            if (id === 0xFFFFFFFF) {
                LayaXChunkPages._dead = true;
                console.warn("[LayaXChunkPages] register failed, falling back to native pages");
                return false;
            }
            LayaXChunkPages._pages.push(buf);
            registeredThisCall++;
            freeCount = nativeObj.chunkPagesFreeCount();
        }
        return true;
    }

    static ensureForEntityCreate(nativeObj: any): boolean {
        return LayaXChunkPages.ensure(nativeObj, LayaXChunkPages.ENTITY_CREATE_RESERVE);
    }

    /** 按 page_id 取已注册页（视图定位用；未注册返回 undefined） */
    static page(pageId: number): ArrayBuffer {
        return LayaXChunkPages._pages[pageId];
    }
}
