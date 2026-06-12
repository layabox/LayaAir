/**
 * Animator 重构回归示例 — 断言工具
 *
 * 轻量断言：等价 / 近似 / 真值 / 调用次数 / 异步条件等待。
 * 失败抛 AssertionError，TestRunner 捕获后标记 FAIL。
 */

export class AssertionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AssertionError";
    }
}

const EPS = 1e-4;

export class Assert {
    static equal<T>(actual: T, expected: T, hint?: string): void {
        if (actual !== expected) {
            throw new AssertionError(`${hint ?? "equal"}: expected ${String(expected)}, got ${String(actual)}`);
        }
    }

    static notEqual<T>(actual: T, unexpected: T, hint?: string): void {
        if (actual === unexpected) {
            throw new AssertionError(`${hint ?? "notEqual"}: should not be ${String(unexpected)}`);
        }
    }

    static approx(actual: number, expected: number, eps: number = EPS, hint?: string): void {
        if (Math.abs(actual - expected) > eps) {
            throw new AssertionError(`${hint ?? "approx"}: expected ${expected}±${eps}, got ${actual}`);
        }
    }

    static between(actual: number, min: number, max: number, hint?: string): void {
        if (actual < min || actual > max) {
            throw new AssertionError(`${hint ?? "between"}: expected [${min}, ${max}], got ${actual}`);
        }
    }

    static truthy(actual: any, hint?: string): void {
        if (!actual) {
            throw new AssertionError(`${hint ?? "truthy"}: got falsy value ${String(actual)}`);
        }
    }

    static falsy(actual: any, hint?: string): void {
        if (actual) {
            throw new AssertionError(`${hint ?? "falsy"}: got truthy value ${String(actual)}`);
        }
    }

    static called(counter: { count: number }, expected: number, hint?: string): void {
        if (counter.count !== expected) {
            throw new AssertionError(`${hint ?? "called"}: expected ${expected} calls, got ${counter.count}`);
        }
    }

    static calledAtLeast(counter: { count: number }, min: number, hint?: string): void {
        if (counter.count < min) {
            throw new AssertionError(`${hint ?? "calledAtLeast"}: expected >= ${min} calls, got ${counter.count}`);
        }
    }
}

/**
 * 简易调用计数器，用于断言事件/脚本回调发生次数。
 */
export function createCounter() {
    return {
        count: 0,
        history: [] as any[],
        inc(payload?: any) {
            this.count++;
            if (payload !== undefined) this.history.push(payload);
        },
        reset() {
            this.count = 0;
            this.history.length = 0;
        },
    };
}
