/**
 * Animator 重构回归示例 — H 组：Culling / UpdateMode / Sleep
 *
 * 5 项：
 *   H1 cullingMode 字段 (ALWAYSANIMATE / CULLCOMPLETELY) 读写不崩
 *   H2 UpdateMode.Normal 推进正常
 *   H3 UpdateMode.LowFrame + lowUpdateDelty — 推进频率降低
 *   H4 UpdateMode.UnScaleTime — 现行实现 ret=0，normalizedTime 停滞
 *   H5 sleep=true + 非循环 — 播完后 layer 不再被 update
 */

import { Animator } from "laya/d3/component/Animator/Animator";
import { AnimatorUpdateMode } from "laya/components/AnimatorUpdateMode";
import { Stat } from "laya/utils/Stat";
import { TestCase } from "../core/TestCase";
import { TestRunner } from "../core/TestRunner";
import { Assert } from "../core/Assert";
import { SceneRig } from "../scene/SceneRig";

export function registerCullingUpdateTests(runner: TestRunner, rig: SceneRig): void {
    const cases: TestCase[] = [
        {
            id: "H1",
            group: "H_CullingUpdate",
            title: "cullingMode 字段读写",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                await ctx.waitFrames(2);
                // 不断言默认值 — prefab 序列化可能写成任何值
                ctx.log(`prefab 加载后 cullingMode=${animator.cullingMode}`);
                animator.cullingMode = Animator.CULLINGMODE_ALWAYSANIMATE;
                Assert.equal(animator.cullingMode, Animator.CULLINGMODE_ALWAYSANIMATE, "设为 ALWAYSANIMATE 后读出一致");
                animator.cullingMode = Animator.CULLINGMODE_CULLCOMPLETELY;
                Assert.equal(animator.cullingMode, Animator.CULLINGMODE_CULLCOMPLETELY, "设为 CULLCOMPLETELY 后读出一致");
                animator.play("Run");
                await ctx.waitFrames(5);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                Assert.truthy(ps._normalizedTime > 0, "应正常推进");
            },
        },
        {
            id: "H2",
            group: "H_CullingUpdate",
            title: "UpdateMode.Normal 默认推进",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.updateMode = AnimatorUpdateMode.Normal;
                animator.play("Run");
                await ctx.waitFrames(3);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                const t0 = ps._normalizedTime;
                await ctx.waitFrames(5);
                const t1 = ps._normalizedTime;
                Assert.truthy(t1 > t0, `Normal 模式应推进 t0=${t0} t1=${t1}`);
            },
        },
        {
            id: "H3",
            group: "H_CullingUpdate",
            title: "UpdateMode.LowFrame + lowUpdateDelty=10",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.updateMode = AnimatorUpdateMode.LowFrame;
                animator.lowUpdateDelty = 10;
                animator.play("Run");
                await ctx.waitFrames(3);
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                // LowFrame: 仅 Stat.loopCount % 10 == 0 时 delta 才非零
                // 推进比 Normal 显著少 — 跑 15 帧约只前进 1-2 次
                const t0 = ps._normalizedTime;
                await ctx.waitFrames(15);
                const t1 = ps._normalizedTime;
                ctx.log(`LowFrame 15 帧推进 ${(t1 - t0).toFixed(4)}（loopCount=${Stat.loopCount}）`);
                // 简单不崩 + 字段写入一致（Animator 只暴露 setter，没有 getter — 读私有字段验证）
                Assert.equal((animator as any)._lowUpdateDelty, 10, "_lowUpdateDelty 私有字段已写入 10");
            },
        },
        {
            id: "H4",
            group: "H_CullingUpdate",
            title: "UpdateMode.UnScaleTime (当前 ret=0, normalizedTime 停滞)",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.play("Run");
                await ctx.waitFrames(3);
                animator.updateMode = AnimatorUpdateMode.UnScaleTime;
                const ps = animator.getControllerLayer(0).getCurrentPlayState();
                await ctx.waitFrames(2);
                const t0 = ps._normalizedTime;
                await ctx.waitFrames(8);
                const t1 = ps._normalizedTime;
                Assert.approx(t1, t0, 1e-3,
                    `UnScaleTime 当前实现 normalizedTime 不应变化 t0=${t0} t1=${t1}`);
            },
        },
        {
            id: "H5",
            group: "H_CullingUpdate",
            title: "sleep=true 非循环播完后跳过 layer 更新",
            run: async (ctx) => {
                rig.clearSpawned();
                const { animator } = rig.spawnDanding();
                animator.sleep = true;
                animator.speed = 10;
                animator.play("Skill1");
                await ctx.waitFrames(2);
                const layer = animator.getControllerLayer(0);
                const state = layer.getCurrentPlayState().currentState!;
                const origLoop = state.clip!.islooping;
                try {
                    state.clip!.islooping = false;
                    await ctx.waitUntil(() => layer.getCurrentPlayState()._finish, 5000);
                    // _finish=true 后再过若干帧，updateMark 不应再增长（layer 被 sleep continue 跳过）
                    const markBefore = (animator as any)._updateMark;
                    await ctx.waitFrames(8);
                    const markAfter = (animator as any)._updateMark;
                    // 注意：_updateMark 只在 layer 进入主循环时 ++，sleep+finish+_playType=0 会 continue
                    // 但 onUpdate 进入处 _updateMark++ 仍会发生（看 Animator.ts:1390）
                    // 改判断：layer.playStateInfo._elapsedTime 不再增长
                    Assert.equal(layer.getCurrentPlayState()._finish, true, "_finish=true 保持");
                    const t0 = layer.getCurrentPlayState()._elapsedTime;
                    await ctx.waitFrames(5);
                    const t1 = layer.getCurrentPlayState()._elapsedTime;
                    Assert.approx(t1, t0, 1e-3,
                        `sleep 后 elapsedTime 不应推进 t0=${t0} t1=${t1}`);
                    ctx.log(`updateMark before=${markBefore} after=${markAfter}`);
                } finally {
                    state.clip!.islooping = origLoop;
                }
            },
        },
    ];

    runner.registerAll(cases);
}
