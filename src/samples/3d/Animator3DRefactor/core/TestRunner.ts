/**
 * Animator 重构回归示例 — 测试调度器
 *
 * Auto 模式：串行执行所有 case，捕获异常 → 标记 FAIL，继续下一个。
 * Interactive 模式：暴露 runOne 给 UI 单独触发，不汇总结果。
 */

import { TestCase, TestResult, createContext } from "./TestCase";
import { AutoLog } from "./AutoLog";

export class TestRunner {
    private _cases: TestCase[] = [];
    private _results: TestResult[] = [];
    private _log: AutoLog | null = null;

    register(c: TestCase): void {
        this._cases.push(c);
    }

    registerAll(cs: TestCase[]): void {
        for (const c of cs) this.register(c);
    }

    setLog(log: AutoLog): void {
        this._log = log;
    }

    get cases(): ReadonlyArray<TestCase> {
        return this._cases;
    }

    casesByGroup(): Map<string, TestCase[]> {
        const m = new Map<string, TestCase[]>();
        for (const c of this._cases) {
            if (!m.has(c.group)) m.set(c.group, []);
            m.get(c.group)!.push(c);
        }
        return m;
    }

    /** Auto 模式：串行跑所有 case，最后输出汇总 */
    async runAll(): Promise<void> {
        this._results.length = 0;
        for (let i = 0; i < this._cases.length; i++) {
            const c = this._cases[i];
            this._log?.setHeader(`Running ${i + 1}/${this._cases.length} — [${c.id}] ${c.title}`);
            const r = await this._runOne(c);
            this._results.push(r);
            this._log?.onCaseEnd(r);
        }
        this._log?.onFinish(this.summary());
    }

    /** Interactive 模式：单跑一个 case，不进汇总 */
    async runOne(c: TestCase): Promise<TestResult> {
        const r = await this._runOne(c);
        this._log?.onCaseEnd(r);
        return r;
    }

    private async _runOne(c: TestCase): Promise<TestResult> {
        const ctx = createContext();
        const start = performance.now();
        this._log?.onCaseStart(c);

        if (c.skip) {
            return {
                case: c,
                status: "skipped",
                durationMs: 0,
                extraLogs: (ctx as any)._logs,
            };
        }

        try {
            if (c.setup) await c.setup(ctx);
            await c.run(ctx);
            return {
                case: c,
                status: "passed",
                durationMs: performance.now() - start,
                extraLogs: (ctx as any)._logs,
            };
        } catch (err: any) {
            return {
                case: c,
                status: "failed",
                error: err instanceof Error ? err : new Error(String(err)),
                durationMs: performance.now() - start,
                extraLogs: (ctx as any)._logs,
            };
        } finally {
            try {
                if (c.teardown) await c.teardown(ctx);
            } catch (err) {
                console.warn(`[${c.id}] teardown failed:`, err);
            }
        }
    }

    summary() {
        const total = this._results.length;
        let passed = 0, failed = 0, skipped = 0;
        const failedIds: string[] = [];
        for (const r of this._results) {
            if (r.status === "passed") passed++;
            else if (r.status === "failed") { failed++; failedIds.push(r.case.id); }
            else if (r.status === "skipped") skipped++;
        }
        return { total, passed, failed, skipped, failedIds };
    }

    get results(): ReadonlyArray<TestResult> {
        return this._results;
    }
}
