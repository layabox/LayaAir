import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { Stage } from "laya/display/Stage";
import { Rectangle } from "laya/maths/Rectangle";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Laya } from "Laya";
import { Main } from "../../Main";
import { PseudoRandom } from "../../3d/common/PseudoRandom";

export type Propagation2DCaseName =
    "flatWrite"
    | "flatRoot"
    | "deepRoot"
    | "clipParent"
    | "poolRecycle"
    | "mixed"
    | "combinedHeavy"
    | "globalRead"
    | "deepWriteRead"
    | "nestedClip"
    | "cacheAlpha";

interface CaseResult {
    caseName: Propagation2DCaseName;
    nodes: number;
    frames: number;
    scriptMedianMs: number;
    scriptP95Ms: number;
    frameMedianMs: number;
    frameP95Ms: number;
    avgFps: number;
    seed: number;
    sceneHash: string;
}

export abstract class Propagation2DPerfBase {
    Main: typeof Main = null;

    protected _root: Sprite;
    protected _hud: Text;
    protected _sprites: Sprite[] = [];
    protected _hosts: Sprite[] = [];
    protected _pool: Sprite[] = [];
    protected _frame = 0;
    protected _rng: PseudoRandom;
    protected _clipRect = new Rectangle(0, 0, 300, 220);
    protected _sink = 0;

    private _scriptSamples: number[] = [];
    private _frameSamples: number[] = [];
    private _lastTick = 0;
    private _nodes: number;
    private _frames: number;
    private _warmup: number;
    private _seed: number;
    private _done = false;
    private _profile: boolean;
    private _profileName: string;

    protected constructor(
        maincls: typeof Main,
        protected readonly _caseName: Propagation2DCaseName,
        protected readonly _title: string,
        defaultNodes = 4000,
        maxNodes = 8000,
    ) {
        this.Main = maincls;
        this._nodes = Math.min(this._readInt("nodes", defaultNodes), maxNodes);
        this._frames = this._readInt("frames", 240);
        this._warmup = this._readInt("warmup", 60);
        this._seed = this._readInt("seed", 1234);
        this._profile = this._readInt("profile", 0) > 0;
        this._profileName = "Propagation2DPerf:" + this._caseName;
        this._rng = new PseudoRandom(this._seed);

        Laya.stage.scaleMode = Stage.SCALE_FIXED_AUTO;
        Laya.stage.bgColor = "#1f2329";
        Stat.show();

        this._root = new Sprite();
        this.Main.box2D.addChild(this._root);

        this._hud = new Text();
        this._hud.font = "Arial";
        this._hud.fontSize = 18;
        this._hud.color = "#ffffff";
        this._hud.leading = 4;
        this._hud.width = 760;
        this._hud.zOrder = 100000;
        this._hud.pos(12, 12);
        this.Main.box2D.addChild(this._hud);

        this.buildScene(this._nodes);
        this._mark("created");
        this._updateHud("warming");
        Laya.timer.frameLoop(1, this, this._tick);
    }

    protected abstract buildScene(nodes: number): void;

    protected abstract runFrame(): void;

    /** @zh 是否处于采样窗口(已过 warmup)。供子类决定是否记录自定义采样。 */
    protected _isMeasuring(): boolean {
        return this._frame >= this._warmup;
    }

    /** @zh 子类可覆盖以向结果追加自定义指标(会并入输出 JSON / HUD)。 */
    protected _extraResult(): { [k: string]: number } {
        return {};
    }

    protected _buildFlat(count: number): void {
        const cols = Math.ceil(Math.sqrt(count));
        for (let i = 0; i < count; i++) {
            const sp = this._makeTile(i);
            sp.pos((i % cols) * 9, Math.floor(i / cols) * 9);
            this._root.addChild(sp);
            this._sprites.push(sp);
            if (i % 64 === 0) this._hosts.push(sp);
        }
    }

    protected _buildDeep(target: number): void {
        const queue: Sprite[] = [this._root];
        let made = 1;
        while (queue.length > 0 && made < target) {
            const parent = queue.shift();
            for (let i = 0; i < 2 && made < target; i++) {
                const sp = this._makeTile(made);
                sp.pos(14 + i * 12, 8);
                parent.addChild(sp);
                this._sprites.push(sp);
                this._hosts.push(parent);
                queue.push(sp);
                made++;
            }
        }
    }

    protected _buildClipTree(target: number): void {
        const clipHost = new Sprite();
        clipHost.scrollRect = this._clipRect.clone();
        clipHost.graphics.drawRect(0, 0, 300, 220, null, "#66ccff", 2);
        clipHost.pos(160, 90);
        this._root.addChild(clipHost);
        this._hosts.push(clipHost);

        const cols = Math.ceil(Math.sqrt(target));
        for (let i = 0; i < target; i++) {
            const sp = this._makeTile(i);
            sp.pos((i % cols) * 10 - 40, Math.floor(i / cols) * 10 - 30);
            clipHost.addChild(sp);
            this._sprites.push(sp);
        }
    }

    protected _buildPoolHosts(count: number): void {
        const hostCount = Math.max(8, Math.min(64, Math.floor(count / 32)));
        for (let i = 0; i < hostCount; i++) {
            const host = new Sprite();
            host.pos(60 + (i % 8) * 90, 80 + Math.floor(i / 8) * 70);
            host.graphics.drawRect(0, 0, 60, 36, null, "#78828f", 1);
            this._root.addChild(host);
            this._hosts.push(host);
        }
    }

    protected _makeTile(i: number): Sprite {
        const sp = new Sprite();
        const hue = (i * 47) & 255;
        const color = "#" + hue.toString(16).padStart(2, "0") + "9bd6";
        sp.graphics.drawRect(0, 0, 6, 6, color, null);
        return sp;
    }

    protected _runRootPan(): void {
        const f = this._frame;
        this._root.x = 80 + Math.sin(f * 0.05) * 48;
        this._root.y = 80 + Math.cos(f * 0.04) * 36;
    }

    private _tick(): void {
        const now = performance.now();
        if (this._lastTick > 0 && this._frame >= this._warmup) {
            this._frameSamples.push(now - this._lastTick);
        }
        this._lastTick = now;

        if (this._frame === this._warmup) {
            this._mark("measureStart");
            if (this._profile && (console as any).profile) {
                (console as any).profile(this._profileName);
            }
        }

        const t0 = performance.now();
        this.runFrame();
        const scriptMs = performance.now() - t0;

        if (this._frame >= this._warmup) {
            this._scriptSamples.push(scriptMs);
        }
        this._frame++;

        if ((this._frame & 15) === 0) this._updateHud("running");
        if (!this._done && this._frame >= this._frames + this._warmup) this._finish();
    }

    private _finish(): void {
        this._done = true;
        Laya.timer.clear(this, this._tick);
        const result: CaseResult = {
            caseName: this._caseName,
            nodes: this._nodes,
            frames: this._frames,
            scriptMedianMs: this._median(this._scriptSamples),
            scriptP95Ms: this._percentile(this._scriptSamples, 0.95),
            frameMedianMs: this._median(this._frameSamples),
            frameP95Ms: this._percentile(this._frameSamples, 0.95),
            avgFps: this._averageFps(this._frameSamples),
            seed: this._seed,
            sceneHash: this._computeSceneHash(),
        };
        Object.assign(result, this._extraResult()); // 并入子类自定义指标
        console.log("[Propagation2DPerf]", JSON.stringify(result));
        this._mark("measureEnd");
        this._measure("measure", "measureStart", "measureEnd");
        if (this._profile && (console as any).profileEnd) {
            (console as any).profileEnd(this._profileName);
        }
        const g = window as any;
        const results = g.__Propagation2DPerfResults || (g.__Propagation2DPerfResults = []);
        results.push(result);
        g.__Propagation2DPerfLastResult = result;
        // 跨平台通知：用全局回调列表，不用 DOM CustomEvent/dispatchEvent（native conch 无 CustomEvent）。
        const doneCbs: ((r: any) => void)[] = g.__Propagation2DPerfDoneCbs;
        if (doneCbs) for (let i = 0, n = doneCbs.length; i < n; i++) doneCbs[i](result);
        this._hud.text = [
            "Propagation2DPerf done",
            this._title,
            `nodes=${this._nodes} frames=${this._frames} seed=${this._seed}`,
            `sceneHash=${result.sceneHash}`,
            `script median=${result.scriptMedianMs.toFixed(2)}ms p95=${result.scriptP95Ms.toFixed(2)}ms`,
            `frame median=${result.frameMedianMs.toFixed(2)}ms p95=${result.frameP95Ms.toFixed(2)}ms fps=${result.avgFps.toFixed(1)}`,
        ].join("\n");
    }

    private _mark(name: string): void {
        if (!performance.mark) return;
        performance.mark(this._profileName + ":" + name);
    }

    private _measure(name: string, start: string, end: string): void {
        if (!performance.measure) return;
        try {
            performance.measure(
                this._profileName + ":" + name,
                this._profileName + ":" + start,
                this._profileName + ":" + end,
            );
        } catch (e) {
            // Browsers can throw if a mark was cleared by DevTools.
        }
    }

    private _updateHud(state: string): void {
        this._hud.text = [
            "Propagation2DPerf " + state,
            this._title,
            `nodes=${this._nodes} seed=${this._seed} frame=${Math.max(0, this._frame - this._warmup)}/${this._frames}`,
        ].join("\n");
    }

    private _readInt(key: string, fallback: number): number {
        const raw = Browser.getQueryString(key);
        const value = raw ? parseInt(raw) : fallback;
        return isNaN(value) || value <= 0 ? fallback : value;
    }

    protected _median(values: number[]): number {
        return this._percentile(values, 0.5);
    }

    protected _percentile(values: number[], p: number): number {
        if (values.length === 0) return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
        return sorted[index];
    }

    private _averageFps(samples: number[]): number {
        if (samples.length === 0) return 0;
        let total = 0;
        for (const v of samples) total += v;
        return 1000 / (total / samples.length);
    }

    private _computeSceneHash(): string {
        let hash = 2166136261;
        let count = 0;
        const mix = (value: number): void => {
            hash ^= value | 0;
            hash = Math.imul(hash, 16777619) >>> 0;
        };
        const mixFloat = (value: number): void => {
            mix(Math.round(value * 1000));
        };
        const visit = (sp: Sprite): void => {
            count++;
            mixFloat(sp.x);
            mixFloat(sp.y);
            mixFloat(sp.alpha);
            const rect = sp.scrollRect;
            if (rect) {
                mix(1);
                mixFloat(rect.x);
                mixFloat(rect.y);
                mixFloat(rect.width);
                mixFloat(rect.height);
            } else {
                mix(0);
            }
            const children = (sp as any)._children as Sprite[];
            mix(children ? children.length : 0);
            if (!children) return;
            for (let i = 0, n = children.length; i < n; i++) {
                visit(children[i]);
            }
        };
        visit(this._root);
        mix(count);
        return hash.toString(16).padStart(8, "0");
    }

    dispose(): void {
        Laya.timer.clear(this, this._tick);
        this._root.destroy();
        this._hud.destroy();
        this._sprites.length = 0;
        this._hosts.length = 0;
        this._pool.length = 0;
    }
}
