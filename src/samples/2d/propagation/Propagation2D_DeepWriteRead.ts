import { Sprite } from "laya/display/Sprite";
import { Main } from "../../Main";
import { Propagation2DPerfBase } from "./Propagation2DPerfBase";

/**
 * @zh 深树：中层写入 + 叶子矩阵读取。本用例把"叶子读"做两次并分别计时，对比读时机：
 * - 计算后拿(readAfter)：在本帧写入之前读。此刻 dirtyM=false(上一帧 Stage.render 的 store.update 已结账)，
 *   getMatrix 走快路径 readWorldMatrix(直读 SoA 的 world 列)。读到的是上一帧算好的 world 矩阵。
 * - 计算前拿(readBefore)：在本帧写入之后读。此刻 dirtyM=true(本帧写入还没被 sweep 结账)，
 *   getMatrix 走慢路径 computeWorldMatrix(沿父链从 local 现算)。读到的是反映本帧最新写入的 world 矩阵。
 * 新架构下 readAfter 应远小于 readBefore，证明"在 SoA 计算之后读"是 O(1) 直读、很便宜。
 */
export class Propagation2D_DeepWriteRead extends Propagation2DPerfBase {
    private _mids: Sprite[];
    private _leaves: Sprite[];
    private _readBeforeSamples: number[] = []; // 计算前拿(dirtyM→现算/慢路径)
    private _readAfterSamples: number[] = [];  // 计算后拿(直读 world 列/快路径)

    constructor(maincls: typeof Main) {
        super(maincls, "deepWriteRead", "Deep mid-writes + leaf reads (before/after SoA update)", 4095, 8191);
    }

    protected buildScene(nodes: number): void {
        this._mids = [];
        this._leaves = [];
        this._buildDeep(nodes);
        for (let i = 0, n = this._sprites.length; i < n; i++) {
            const sp = this._sprites[i];
            const children = (sp as any)._children as Sprite[];
            if (children && children.length > 0) {
                if (i > 8) this._mids.push(sp);
            } else {
                this._leaves.push(sp);
            }
        }
    }

    protected runFrame(): void {
        const leaves = this._leaves;
        const n = leaves.length;
        const measuring = this._isMeasuring();
        let sink = this._sink;

        // ① 计算后拿：本帧写入之前读，dirtyM=false → 快路径(直读 world 列)。
        const tAfter = performance.now();
        for (let i = 0; i < n; i++) {
            const m = leaves[i].globalTrans.getMatrix();
            sink += m.tx * 0.001 + m.ty * 0.001;
        }
        if (measuring) this._readAfterSamples.push(performance.now() - tAfter);

        // ② 写中层 → dirtyM 变 true。
        const f = this._frame;
        for (let i = 0, mn = Math.min(96, this._mids.length); i < mn; i++) {
            const sp = this._mids[(i * 31 + f * 7) % this._mids.length];
            sp.x = 12 + ((f + i) & 7);
            sp.y = 7 + ((f + i * 3) & 5);
        }

        // ③ 计算前拿：本帧写入之后读，dirtyM=true → 慢路径(沿父链现算)。
        const tBefore = performance.now();
        for (let i = 0; i < n; i++) {
            const m = leaves[i].globalTrans.getMatrix();
            sink += m.tx * 0.001 + m.ty * 0.001;
        }
        if (measuring) this._readBeforeSamples.push(performance.now() - tBefore);

        this._sink = sink;
    }

    protected _extraResult(): { [k: string]: number } {
        return {
            readBeforeMedianMs: this._median(this._readBeforeSamples), // 计算前拿 慢路径
            readBeforeP95Ms: this._percentile(this._readBeforeSamples, 0.95),
            readAfterMedianMs: this._median(this._readAfterSamples),   // 计算后拿 快路径
            readAfterP95Ms: this._percentile(this._readAfterSamples, 0.95),
        };
    }
}
