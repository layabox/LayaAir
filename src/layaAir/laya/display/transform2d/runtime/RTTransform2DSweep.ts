import { Laya } from "../../../../Laya";
import { ITransform2DSweep } from "../ITransform2DSweep";
import { Transform2DStore } from "../Transform2DStore";

/**
 * @zh 节点树计算(sweep)的 native 下沉 stub —— 委托 native 的 transformStore(`conchRTTransform2DStore`)。
 *
 * 上层逻辑全留 JS({@link Transform2DStore}：创建 chunk、alloc/free、setParent、写 local、读 world);
 * 这里只把唯一重的"遍历树算 world"交给 native。native 在 RT memoryFactory 给的**共享 buffer**上读 local/parent/脏位、
 * 写回 world+frame 列、清脏、产出 changed —— "拿和回写数据"全在同一份内存,JS 与 native 都读写。
 *
 * 当前为占位骨架：能编译、不影响 Web(仅在 native 提供 conch 对象时装上)。后续扩展(native 端)：
 * - native 实现 2D SoA 节点树 sweep(可参照 3D 的 LayaXPoolView 列存 + LayaXTransform 的共享 buffer)。
 * - changed/dirty 回 JS 建议走共享 ArrayBuffer 零拷贝(native 写、JS 直接 view),避免每帧跨边界拷贝。
 */
export class RTTransform2DSweep implements ITransform2DSweep {
    /** @zh native 对端 transformStore(持有/共享列 buffer,执行 sweep)。 */
    private _native: any;

    constructor() {
        this._native = new (window as any).conchRTTransform2DStore();
    }

    update(_store: Transform2DStore, frameId: number): void {
        // native 在共享 buffer 上跑 sweep:读 control 的 dirty + local/parent/脏位 → 写 world+frame 列 →
        // 写 changedSlots/Masks + control 的 changed 计数 → 复位 control 的 dirty。
        // dirty 与 changed 都在共享 control/changed buffer 上,JS 直接读(changedCount/dirtyM…),**无需任何回传同步**。
        this._native.update(frameId);
    }
}

// ── 注册入口 ──
// 仅当 native 提供 conchRTTransform2DStore 时把 sweep 下沉;否则保持 JS sweep(Web 零影响,native 半成品也能兜底)。
Laya.addBeforeInitCallback(() => {
    if ((window as any).conchRTTransform2DStore) {
        Transform2DStore.sweeper = new RTTransform2DSweep();
    }
});
