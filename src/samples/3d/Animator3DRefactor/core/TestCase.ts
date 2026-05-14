/**
 * Animator 重构回归示例 — 测试 case 抽象
 *
 * 每个 case = 一个异步函数 + 元数据。
 * Auto 模式串行执行；Interactive 模式按按钮触发单个 case 的 run（不做断言收集）。
 */

import { Laya } from "Laya";

export type TestGroup =
    | "A_Playback"
    | "B_CrossFade"
    | "C_LayerBlend"
    | "D_AvatarMask"
    | "E_ControllerParams"
    | "F_EventScript"
    | "G_KeyframeType"
    | "H_CullingUpdate"
    | "I_BoneLink"
    | "J_Batch";

export type TestStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface TestContext {
    /** 等待 N 帧 */
    waitFrames(n: number): Promise<void>;
    /** 等待 ms 毫秒 */
    waitMs(ms: number): Promise<void>;
    /** 轮询条件，直到为真或超时（默认 5s） */
    waitUntil(cond: () => boolean, timeoutMs?: number): Promise<void>;
    /** 记录一行附加日志（仅 Auto 模式输出） */
    log(msg: string): void;
}

export interface TestCase {
    id: string;          // 形如 "A1"、"B2"
    group: TestGroup;
    title: string;       // 简短描述
    skip?: boolean;      // true 标记 SKIP
    skipReason?: string;
    setup?: (ctx: TestContext) => void | Promise<void>;
    run: (ctx: TestContext) => void | Promise<void>;
    teardown?: (ctx: TestContext) => void | Promise<void>;
}

export interface TestResult {
    case: TestCase;
    status: TestStatus;
    error?: Error;
    durationMs: number;
    extraLogs: string[];
}

export function createContext(): TestContext {
    const extraLogs: string[] = [];
    const ctx: TestContext & { _logs: string[] } = {
        _logs: extraLogs,
        waitFrames(n: number): Promise<void> {
            return new Promise(resolve => {
                let remaining = n;
                const onFrame = () => {
                    remaining--;
                    if (remaining <= 0) {
                        Laya.timer.clear(ctx, onFrame);
                        resolve();
                    }
                };
                Laya.timer.frameLoop(1, ctx, onFrame);
            });
        },
        waitMs(ms: number): Promise<void> {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        async waitUntil(cond: () => boolean, timeoutMs: number = 5000): Promise<void> {
            const start = performance.now();
            while (!cond()) {
                if (performance.now() - start > timeoutMs) {
                    throw new Error(`waitUntil timeout after ${timeoutMs}ms`);
                }
                await this.waitFrames(1);
            }
        },
        log(msg: string) {
            extraLogs.push(msg);
        },
    };
    return ctx;
}
