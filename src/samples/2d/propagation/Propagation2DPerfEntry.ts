import { Browser } from "laya/utils/Browser";
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
import { Propagation2DCaseName } from "./Propagation2DPerfBase";

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

/** @zh 命名分组：?case=<组名> 一次跑一组。alpha = 写/验 GlobalAlpha 的三个用例。 */
const GROUPS: { [name: string]: Propagation2DCaseName[] } = {
    alpha: ["mixed", "combinedHeavy", "cacheAlpha"],
};

/**
 * @en Unified entry for the Propagation2D perf cases. Runs cases sequentially and auto-advances
 * to the next when one finishes (listens to the `Propagation2DPerfDone` event), disposing the
 * previous case in between.
 * - no `?case=` or `?case=all`: run all cases in order
 * - `?case=alpha`: run a named group (alpha = mixed, combinedHeavy, cacheAlpha)
 * - `?case=a,b,c`: run the listed cases/groups (group names expand, deduped)
 * - `?case=x`: run a single case
 * - `?gap=600`: ms to wait between cases (so the result HUD is visible); other params (nodes/frames/
 *   warmup/seed/profile) are read by each case, see README.
 * @zh Propagation2D 性能用例统一入口：串行跑、跑完自动切下一个(监听 Propagation2DPerfDone 事件，
 * 切换时 dispose 上一个)。`?case=` 不填或 all 跑全部；alpha 跑 GlobalAlpha 组(mixed/combinedHeavy/cacheAlpha)；
 * 逗号分隔跑多个(可混组名，去重)；单个名跑单个；`?gap=` 控制间隔 ms。
 */
export class Propagation2DPerfEntry {
    private readonly _maincls: typeof Main;
    private readonly _queue: string[];
    private readonly _gap: number;
    private _current: Disposable | null = null;

    constructor(maincls: typeof Main) {
        this._maincls = maincls;

        const raw = (Browser.getQueryString("case") || "all").trim();
        if (raw === "all" || raw === "") {
            this._queue = Object.keys(CASES);
        } else {
            // 逗号分隔的 token，可为组名(展开)或用例名；按 CASES 过滤并去重。
            const queue: string[] = [];
            const add = (name: string) => {
                if (CASES[name] && queue.indexOf(name) < 0) queue.push(name);
            };
            for (const tok of raw.split(",")) {
                const name = tok.trim();
                const group = GROUPS[name];
                group ? group.forEach(add) : add(name);
            }
            this._queue = queue.length > 0 ? queue : ["flatRoot"];
        }
        const gapRaw = Browser.getQueryString("gap");
        const gap = gapRaw ? parseInt(gapRaw) : 600;
        this._gap = isNaN(gap) || gap < 0 ? 600 : gap;

        console.log("[Propagation2DPerfEntry] queue:", this._queue.join(" -> "),
            "\n  params: case(all|alpha|a,b,c|x), gap, nodes, frames, warmup, seed, profile");

        window.addEventListener("Propagation2DPerfDone", this._onDone);
        this._runNext();
    }

    private _onDone = (): void => {
        // 当前用例完成 → 延迟 gap(让 done 的 HUD/结果可见、清干净调用栈) 再 dispose 并切下一个。
        window.setTimeout(this._advance, this._gap);
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
            window.removeEventListener("Propagation2DPerfDone", this._onDone);
            const results = (window as any).__Propagation2DPerfResults || [];
            console.log("[Propagation2DPerfEntry] ===== ALL DONE =====\n" + JSON.stringify(results, null, 2));
            return;
        }
        const name = this._queue.shift();
        console.log("[Propagation2DPerfEntry] >>> start:", name, "(" + this._queue.length + " remaining)");
        this._current = new CASES[name](this._maincls);
    }
}
