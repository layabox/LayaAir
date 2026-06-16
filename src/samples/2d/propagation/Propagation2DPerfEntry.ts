import { Laya } from "Laya";
import { Main } from "../../Main";
import { Propagation2D_FlatWrite } from "./Propagation2D_FlatWrite";
import { Propagation2D_FlatRoot } from "./Propagation2D_FlatRoot";
import { Propagation2D_DeepRoot } from "./Propagation2D_DeepRoot";
import { Propagation2D_ClipParent } from "./Propagation2D_ClipParent";
import { Propagation2D_PoolRecycle } from "./Propagation2D_PoolRecycle";
import { Propagation2D_Mixed } from "./Propagation2D_Mixed";
import { Propagation2D_CombinedHeavy } from "./Propagation2D_CombinedHeavy";
import { Propagation2D_GlobalRead } from "./Propagation2D_GlobalRead";
import { Propagation2D_DeepWriteRead } from "./Propagation2D_DeepWriteRead";
import { Propagation2D_NestedClip } from "./Propagation2D_NestedClip";
import { Propagation2D_CacheAlpha } from "./Propagation2D_CacheAlpha";

interface Disposable { dispose(): void; }

const CASES: { [name: string]: new (m: typeof Main) => Disposable } = {
    flatWrite: Propagation2D_FlatWrite,
    flatRoot: Propagation2D_FlatRoot,
    deepRoot: Propagation2D_DeepRoot,
    clipParent: Propagation2D_ClipParent,
    poolRecycle: Propagation2D_PoolRecycle,
    mixed: Propagation2D_Mixed,
    combinedHeavy: Propagation2D_CombinedHeavy,
    globalRead: Propagation2D_GlobalRead,
    deepWriteRead: Propagation2D_DeepWriteRead,
    nestedClip: Propagation2D_NestedClip,
    cacheAlpha: Propagation2D_CacheAlpha,
};

/**
 * @en Unified entry for the Propagation2D perf cases. Runs ALL cases sequentially and auto-advances
 * to the next when one finishes (listens to the `Propagation2DPerfDone` event), disposing the
 * previous case in between. No URL params — always runs the full set in order.
 * @zh Propagation2D 性能用例统一入口：直接 all 模式，串行跑全部用例、跑完自动切下一个(监听
 * Propagation2DPerfDone 事件，切换时 dispose 上一个)。不读 URL 参数。
 */
export class Propagation2DPerfEntry {
    private readonly _maincls: typeof Main;
    private readonly _queue: string[];
    /** 用例间隔 ms（让结果 HUD 可见、清干净调用栈）。 */
    private readonly _gap: number = 600;
    private _current: Disposable | null = null;

    constructor(maincls: typeof Main) {
        this._maincls = maincls;

        // 直接跑全部用例（all 模式），不依赖 URL 参数。
        this._queue = Object.keys(CASES);

        console.log("[Propagation2DPerfEntry] queue:", this._queue.join(" -> "));

        // 跨平台：用全局回调列表订阅用例完成（native conch 无 CustomEvent/DOM 事件）。
        const g = window as any;
        (g.__Propagation2DPerfDoneCbs || (g.__Propagation2DPerfDoneCbs = [])).push(this._onDone);
        this._runNext();
    }

    private _onDone = (): void => {
        // 当前用例完成 → 延迟 gap(让 done 的 HUD/结果可见、清干净调用栈) 再 dispose 并切下一个。
        Laya.timer.once(this._gap, this, this._advance);
    };

    private _advance = (): void => {
        if (this._current) {
            this._current.dispose();
            this._current = null;
        }
        this._runNext();
    };

    private _runNext(): void {
        if (this._queue.length === 0) {
            const cbs: Function[] = (window as any).__Propagation2DPerfDoneCbs;
            if (cbs) { const i = cbs.indexOf(this._onDone); if (i >= 0) cbs.splice(i, 1); }
            const results = (window as any).__Propagation2DPerfResults || [];
            console.log("[Propagation2DPerfEntry] ===== ALL DONE =====\n" + JSON.stringify(results, null, 2));
            return;
        }
        const name = this._queue.shift();
        console.log("[Propagation2DPerfEntry] >>> start:", name, "(" + this._queue.length + " remaining)");
        this._current = new CASES[name](this._maincls);
    }
}
