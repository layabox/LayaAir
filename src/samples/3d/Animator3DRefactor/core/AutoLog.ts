/**
 * Animator 重构回归示例 — Auto 模式日志输出
 *
 * 双通道：
 *   1) console 彩色 PASS/FAIL/SKIP（CI/开发工具可读）
 *   2) 屏幕左上角浮层（运行过程可视）
 */

import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Text } from "laya/display/Text";
import { TestResult, TestStatus } from "./TestCase";

const COLOR: Record<TestStatus, string> = {
    pending: "#9aa0a6",
    running: "#fbbc04",
    passed: "#34a853",
    failed: "#ea4335",
    skipped: "#fbbc04",
};

const CONSOLE_STYLE: Record<TestStatus, string> = {
    pending: "color:#888",
    running: "color:#f9a825",
    passed: "color:#43a047;font-weight:bold",
    failed: "color:#e53935;font-weight:bold",
    skipped: "color:#fb8c00",
};

export class AutoLog {
    private _overlay: Sprite;
    private _statusText: Text;
    private _lineCount = 0;
    private _lineTexts: Text[] = [];
    private _maxLines = 30;

    constructor() {
        this._overlay = new Sprite();
        this._overlay.zOrder = 9999;
        this._overlay.mouseEnabled = false;
        this._overlay.mouseThrough = true;
        Laya.stage.addChild(this._overlay);

        this._statusText = this._makeText(0, 0, 18, "#ffffff");
        this._statusText.bgColor = "#202124";
        this._statusText.padding = [4, 8, 4, 8];
        this._statusText.text = "Animator3DRefactor Auto Mode — waiting...";
        this._overlay.addChild(this._statusText);
    }

    setHeader(text: string): void {
        this._statusText.text = text;
    }

    onCaseStart(c: { id: string; title: string }): void {
        this._appendLine(`▶ [${c.id}] ${c.title}`, "running");
        // console
        console.log(`%c[${c.id}] ${c.title} ...`, CONSOLE_STYLE.running);
    }

    onCaseEnd(r: TestResult): void {
        const tag = r.status === "passed" ? "PASS"
                  : r.status === "failed" ? "FAIL"
                  : r.status === "skipped" ? "SKIP"
                  : r.status.toUpperCase();
        const detail = r.status === "failed" && r.error
            ? ` — ${r.error.message}`
            : r.status === "skipped" && (r.case as any).skipReason
                ? ` — ${(r.case as any).skipReason}`
                : "";
        const text = `${tag} [${r.case.id}] ${r.case.title}${detail} (${r.durationMs.toFixed(0)}ms)`;
        this._replaceLastLine(text, r.status);
        console.log(`%c${text}`, CONSOLE_STYLE[r.status]);
        for (const extra of r.extraLogs) {
            console.log(`%c    ↳ ${extra}`, "color:#888");
        }
    }

    onFinish(summary: { total: number; passed: number; failed: number; skipped: number; failedIds: string[] }): void {
        const ok = summary.failed === 0;
        const text = ok
            ? `✔ ALL PASS — ${summary.passed}/${summary.total} (skipped ${summary.skipped})`
            : `✘ ${summary.failed} FAILED — ${summary.passed}/${summary.total} passed [${summary.failedIds.join(", ")}]`;
        this.setHeader(text);
        console.log(`%c================================`, "color:#666");
        console.log(`%c${text}`, ok ? CONSOLE_STYLE.passed : CONSOLE_STYLE.failed);
        console.log(`%c================================`, "color:#666");
    }

    private _appendLine(text: string, status: TestStatus): void {
        const t = this._makeText(0, 28 + this._lineCount * 18, 14, COLOR[status]);
        t.text = text;
        this._overlay.addChild(t);
        this._lineTexts.push(t);
        this._lineCount++;

        if (this._lineCount > this._maxLines) {
            const removed = this._lineTexts.shift();
            removed && removed.removeSelf();
            this._lineTexts.forEach((line, idx) => {
                line.y = 28 + idx * 18;
            });
            this._lineCount = this._lineTexts.length;
        }
    }

    private _replaceLastLine(text: string, status: TestStatus): void {
        const last = this._lineTexts[this._lineTexts.length - 1];
        if (last) {
            last.text = text;
            last.color = COLOR[status];
        }
    }

    private _makeText(x: number, y: number, size: number, color: string): Text {
        const t = new Text();
        t.x = x;
        t.y = y;
        t.fontSize = size;
        t.color = color;
        t.font = "Consolas, monospace";
        return t;
    }
}
