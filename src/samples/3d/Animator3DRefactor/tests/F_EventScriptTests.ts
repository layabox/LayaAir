/**
 * Animator 重构回归示例 — F 组：事件 / 脚本
 *
 * 3 项：
 *   F1 AnimatorStateScript 5 个生命周期回调
 *   F2 AnimationEvent 程序化注入到 clip + Script 接收
 *   F3 state.on(EVENT_OnState*) EventDispatcher 订阅
 */

import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert, createCounter } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";
import { injectAnimationEvent } from "../factories/ProgrammaticAssets";
import { AnimatorStateScript } from "laya/d3/animation/AnimatorStateScript";
import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";
import { Script } from "laya/components/Script";

// 模块级 counter 桶 — AnimatorStateScript 是通过 class type 实例化的，无法捕获闭包，
// 因此用全局桶 + 测试间 reset 来回收事件。
const F1Counters = {
    enter: createCounter(),
    update: createCounter(),
    exit: createCounter(),
    loop: createCounter(),
    switch: createCounter(),
};

class F1ProbeScript extends AnimatorStateScript {
    onStateEnter(): void { F1Counters.enter.inc(); }
    onStateUpdate(t: number): void { F1Counters.update.inc(t); }
    onStateExit(): void { F1Counters.exit.inc(); }
    onStateLoop(): void { F1Counters.loop.inc(); }
    onStateSwitch(s: AnimatorState): void { F1Counters.switch.inc(s?.name); }
}

const F2Counter = createCounter();

class F2EventReceiver extends Script {
    onF2AnimEvent(payload: number): void {
        F2Counter.inc(payload);
    }
}

export function registerEventScriptTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "F1",
            group: "F_EventScript",
            title: "AnimatorStateScript 生命周期回调",
            run: async (ctx) => {
                Object.values(F1Counters).forEach(c => c.reset());
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const stand = layer.getAnimatorState("Stand")!;
                stand.addScript(F1ProbeScript as any);
                animator.play("Stand");
                await ctx.waitFrames(5);
                Assert.calledAtLeast(F1Counters.enter, 1, "onStateEnter 应被触发");
                Assert.calledAtLeast(F1Counters.update, 3, "onStateUpdate 多次");
                // play 切走时触发 onStateSwitch（不是 onStateExit — 后者仅 _finish=true 触发）
                animator.play("Run");
                await ctx.waitFrames(3);
                Assert.calledAtLeast(F1Counters.switch, 1, "play() 切走时 onStateSwitch 应被触发");

                // 测 onStateExit：用 islooping=false 等动画自然播完
                F1Counters.exit.reset();
                animator.speed = 10;
                animator.play("Stand");
                await ctx.waitFrames(2);
                const clip = stand.clip!;
                const origLoop = clip.islooping;
                try {
                    clip.islooping = false;
                    await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 5000);
                    await ctx.waitFrames(2);
                    Assert.calledAtLeast(F1Counters.exit, 1,
                        "_finish=true 时 onStateExit 应被触发");
                } finally {
                    clip.islooping = origLoop;
                }
            },
        },
        {
            id: "F2",
            group: "F_EventScript",
            title: "AnimationEvent 程序化注入触发 Script 方法",
            run: async (ctx) => {
                F2Counter.reset();
                rig.clearSpawned();
                const { animator, sprite } = rig.spawnDanding();
                sprite.addComponent(F2EventReceiver);
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const run = layer.getAnimatorState("Run")!;
                const clip = run.clip!;
                // 在 clip 早期注入事件
                injectAnimationEvent(clip, 0.05, "onF2AnimEvent", [42]);
                animator.speed = 5;
                animator.play("Run");
                await ctx.waitUntil(() => F2Counter.count > 0, 5000);
                Assert.equal(F2Counter.history[0], 42, "事件参数 42 传递");
                // 清理：移除注入的事件，避免污染后续 case 用同一 clip
                const events: any[] = (clip as any)._animationEvents;
                const idx = events.findIndex(e => e.eventName === "onF2AnimEvent");
                if (idx >= 0) events.splice(idx, 1);
            },
        },
        {
            id: "F3",
            group: "F_EventScript",
            title: "state.on(EVENT_OnStateEnter/Switch/Exit) 订阅",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const stand = layer.getAnimatorState("Stand")!;
                const enter = createCounter();
                const switched = createCounter();
                const exit = createCounter();
                stand.on(AnimatorState.EVENT_OnStateEnter, null, () => enter.inc());
                stand.on(AnimatorState.EVENT_OnStateSwitch, null, () => switched.inc());
                stand.on(AnimatorState.EVENT_OnStateExit, null, () => exit.inc());
                animator.play("Stand");
                await ctx.waitFrames(3);
                Assert.calledAtLeast(enter, 1, "EventDispatcher enter 订阅触发");
                // play 切走只触发 OnStateSwitch（OnStateExit 只在 _finish=true 时触发）
                animator.play("Run");
                await ctx.waitFrames(3);
                Assert.calledAtLeast(switched, 1, "EventDispatcher switch 订阅触发");
                // 测 exit：islooping=false 让动画播完
                exit.reset();
                animator.speed = 10;
                animator.play("Stand");
                await ctx.waitFrames(2);
                const clip = stand.clip!;
                const origLoop = clip.islooping;
                try {
                    clip.islooping = false;
                    await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 5000);
                    await ctx.waitFrames(2);
                    Assert.calledAtLeast(exit, 1, "_finish=true 时 EventDispatcher exit 订阅触发");
                } finally {
                    clip.islooping = origLoop;
                }
            },
        },
    ];

    runner.registerAll(cases);
}
