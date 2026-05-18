/**
 * Animator 重构回归示例 — A 组：基础播放
 *
 * 9 项：playOnWake / play(name) / play(null) / play 带 normalizedTime /
 *      暂停恢复 / islooping / clipStart-End / state.speed / cycleOffset
 *
 * 全部使用 danding（已绑 AnimationControllerAll.controller，含 7 个 state）。
 */

import { Vector3 } from "laya/maths/Vector3";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";

export function registerPlaybackTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "A1",
            group: "A_Playback",
            title: "playOnWake 默认播放",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(3);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                Assert.truthy(ps.currentState, "currentState 应已就绪");
                ctx.log(`default state = ${ps.currentState!.name}`);
                // controller 进入态 → Stun（id=7）
                Assert.equal(ps.currentState!.name, "Stun", "默认状态名");
            },
        },
        {
            id: "A2",
            group: "A_Playback",
            title: "play(name) 切换状态",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                animator.play("Run");
                await ctx.waitFrames(2);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                Assert.equal(ps.currentState!.name, "Run", "play('Run') 后状态名");
            },
        },
        {
            id: "A3",
            group: "A_Playback",
            title: "play(null) 回默认状态",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                animator.play("Attack");
                await ctx.waitFrames(2);
                animator.play(null);
                await ctx.waitFrames(2);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                Assert.equal(ps.currentState!.name, "Stun", "play(null) 应回到 default");
            },
        },
        {
            id: "A4",
            group: "A_Playback",
            title: "play 带 normalizedTime 起始位置",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.speed = 0; // 冻结，避免 normalizedTime 飘
                await ctx.waitFrames(2);
                animator.play("Skill1", 0, 0.5);
                await ctx.waitFrames(2);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                Assert.equal(ps.currentState!.name, "Skill1", "状态名");
                // _normalizedPlayTime 应在 0.5 附近（speed=0 不前进，但首次 update 会算）
                Assert.between(ps._normalizedPlayTime, 0.4, 0.6, "起始 normalizedPlayTime");
            },
        },
        {
            id: "A5",
            group: "A_Playback",
            title: "speed=0 暂停 / speed=1 恢复",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Run");
                await ctx.waitFrames(3);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                animator.speed = 0;
                await ctx.waitFrames(2);
                const t1 = ps._normalizedTime;
                await ctx.waitFrames(5);
                const t2 = ps._normalizedTime;
                Assert.approx(t2, t1, 1e-3, "speed=0 时 normalizedTime 不应变化");
                animator.speed = 1;
                await ctx.waitFrames(5);
                const t3 = ps._normalizedTime;
                Assert.truthy(t3 > t2, `speed=1 恢复后应前进, t2=${t2} t3=${t3}`);
            },
        },
        {
            id: "A6",
            group: "A_Playback",
            title: "islooping 循环 / 一次播放",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.speed = 10;
                animator.play("Skill1");
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const state = layer.getCurrentPlayState().currentState!;
                const clip = state.clip!;
                const originalLoop = clip.islooping;
                try {
                    // 非循环：等 _finish 变 true
                    clip.islooping = false;
                    await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 5000);
                    Assert.truthy(layer.getCurrentPlayState()._finish, "非循环播完应 _finish=true");
                } finally {
                    clip.islooping = originalLoop;
                }
            },
        },
        {
            id: "A7",
            group: "A_Playback",
            title: "clipStart / clipEnd 区间裁剪",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                // speed=1 跑起来 — _duration 字段仅在 _updatePlayer 内被赋值，
                // speed=0 会让 onUpdate 早期 return，导致 _duration 残留前一 state 的值。
                animator.play("Run", 0, 0);
                await ctx.waitFrames(3);
                const layer = animator.getControllerLayer(0);
                const state = layer.getCurrentPlayState().currentState!;
                const origStart = state.clipStart;
                const origEnd = state.clipEnd;
                try {
                    state.clipStart = 0.2;
                    state.clipEnd = 0.8;
                    animator.play("Run", 0, 0);
                    await ctx.waitFrames(3);
                    const ps = layer.getCurrentPlayState();
                    // _duration = clip._duration * (clipEnd - clipStart)
                    const expectedDuration = state.clip!._duration * (state.clipEnd - state.clipStart);
                    Assert.approx(ps._duration, expectedDuration, 1e-2,
                        `_duration 应反映区间裁剪 expected=${expectedDuration}`);
                } finally {
                    state.clipStart = origStart;
                    state.clipEnd = origEnd;
                }
            },
        },
        {
            id: "A8",
            group: "A_Playback",
            title: "state.speed 局部播放速度",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.speed = 1;
                animator.play("Run");
                await ctx.waitFrames(3);
                const layer = animator.getControllerLayer(0);
                const state = layer.getCurrentPlayState().currentState!;
                const origSpeed = state.speed;
                try {
                    state.speed = 1;
                    animator.play("Run");
                    await ctx.waitFrames(2);
                    const ps = layer.getCurrentPlayState();
                    const tStart = ps._normalizedTime;
                    await ctx.waitFrames(5);
                    const t1 = ps._normalizedTime;
                    const adv1 = t1 - tStart;

                    state.speed = 3;
                    await ctx.waitFrames(2);
                    const tBase = ps._normalizedTime;
                    await ctx.waitFrames(5);
                    const t2 = ps._normalizedTime;
                    const adv2 = t2 - tBase;

                    Assert.truthy(adv2 > adv1 * 1.5,
                        `speed=3 推进量应明显大于 speed=1: adv1=${adv1.toFixed(4)} adv2=${adv2.toFixed(4)}`);
                } finally {
                    state.speed = origSpeed;
                }
            },
        },
        {
            id: "A9",
            group: "A_Playback",
            title: "cycleOffset 起始偏移",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.speed = 0;
                const layer = animator.getControllerLayer(0);
                // 先等就绪，再设 cycleOffset，再 play
                await ctx.waitFrames(2);
                const state = layer.getAnimatorState("Run")!;
                const origCycle = state.cycleOffset;
                try {
                    state.cycleOffset = 0.4;
                    // 触发 playOnWake 路径走 _onEnable → play 默认用 cycleOffset
                    // 但因为 spawnDanding 已经触发过 _onEnable，这里手动 play(null, 0, cycleOffset)
                    animator.play("Run", 0, state.cycleOffset);
                    await ctx.waitFrames(2);
                    const ps = layer.getCurrentPlayState();
                    Assert.between(ps._normalizedPlayTime, 0.3, 0.5,
                        `cycleOffset=0.4 时 normalizedPlayTime 应在 0.3~0.5: 实际 ${ps._normalizedPlayTime}`);
                } finally {
                    state.cycleOffset = origCycle;
                }
            },
        },
    ];

    runner.registerAll(cases);
}
